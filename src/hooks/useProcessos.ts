import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Processo, Movimentacao } from "@/types";
import { lf_processos, lf_movimentacoes, lfTable } from "@/integrations/supabase/lf_types";

export function useProcessos() {
  const { user } = useAuth();
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProcessos = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data: procs, error: procErr } = await (supabase
        .from(lfTable("processos") as any)
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false }) as any);

      if (procErr) throw procErr;
      const procsTyped = (procs as lf_processos[]) || [];

      if (procsTyped.length === 0) {
        setProcessos([]);
        setLoading(false);
        return;
      }

      // Fetch movimentacoes for all processos
      const procIds = procsTyped.map((p) => p.id);
      const { data: movs } = await (supabase
        .from(lfTable("movimentacoes") as any)
        .select("*")
        .in("processo_id", procIds)
        .order("data", { ascending: false }) as any);

      const movsTyped = (movs as lf_movimentacoes[]) || [];
      const movsByProc: Record<string, Movimentacao[]> = {};

      movsTyped.forEach((m) => {
        if (!movsByProc[m.processo_id]) movsByProc[m.processo_id] = [];
        movsByProc[m.processo_id].push({
          data: m.data,
          descricao: m.descricao,
          tipo: (m.tipo as Movimentacao["tipo"]) || "outro",
          prazo_dias: m.prazo_dias,
          prazo_final: m.prazo_final,
        });
      });

      const mapped: Processo[] = procsTyped.map((p) => ({
        id: p.id,
        numero: p.numero,
        tribunal: p.tribunal,
        tribunal_sigla: p.tribunal_sigla,
        partes: p.partes || "",
        autor: p.autor || "",
        reu: p.reu || "",
        assunto: p.assunto || "Sem assunto",
        responsavel: p.responsavel || "Não atribuído",
        data_ultimo_movimento: p.data_ultimo_movimento || "",
        proxima_data_critica: p.proxima_data_critica,
        dias_para_prazo: p.dias_para_prazo,
        status_prazo: (p.status_prazo as Processo["status_prazo"]) || "saudavel",
        status: (p.status as Processo["status"]) || "ativo",
        movimentacoes: movsByProc[p.id] || [],
        uf: p.uf || "",
      }));

      setProcessos(mapped);
    } catch (err: any) {
      setError(err.message || "Erro ao buscar processos");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProcessos();
  }, [fetchProcessos]);

  const addProcesso = useCallback(
    async (processoData: {
      numero: string;
      tribunal: string;
      tribunal_sigla: string;
      assunto?: string;
      autor?: string;
      reu?: string;
      responsavel?: string;
      uf?: string;
      movimentacoes?: any[];
    }) => {
      if (!user) throw new Error("Não autenticado");

      // Verificar se já existe (usando maybeSingle para evitar erro se não encontrar)
      const { data: existing, error: checkError } = await (supabase
        .from(lfTable("processos") as any)
        .select("id")
        .eq("user_id", user.id)
        .eq("numero", processoData.numero)
        .is("deleted_at", null)
        .maybeSingle() as any);

      if (checkError) {
        console.warn("Erro ao verificar processo existente:", checkError);
      }

      if (existing) {
        console.log("Processo já cadastrado:", existing.id);
        return existing;
      }

      const { data: newProc, error } = await (supabase
        .from(lfTable("processos") as any)
        .insert({
          numero: processoData.numero,
          tribunal: processoData.tribunal,
          tribunal_sigla: processoData.tribunal_sigla,
          assunto: processoData.assunto || null,
          autor: processoData.autor || null,
          reu: processoData.reu || null,
          responsavel: processoData.responsavel || "Não atribuído",
          uf: processoData.uf || null,
          user_id: user.id,
          partes: [processoData.autor, processoData.reu].filter(Boolean).join(" × ") || "Partes não informadas",
        })
        .select()
        .single() as any);

      if (error) throw error;

      if (newProc && processoData.movimentacoes && processoData.movimentacoes.length > 0) {
        const movsToInsert = processoData.movimentacoes.map(m => ({
          processo_id: newProc.id,
          data: m.data,
          descricao: m.descricao,
          tipo: m.tipo || "outro"
        }));
        await (supabase.from(lfTable("movimentacoes") as any).insert(movsToInsert) as any);
      }

      await fetchProcessos();
      return newProc;
    },
    [user, fetchProcessos]
  );

  const updateProcessoStatus = useCallback(
    async (id: string, status_prazo: string) => {
      const { error } = await (supabase
        .from(lfTable("processos") as any)
        .update({ status_prazo })
        .eq("id", id) as any);
      if (error) throw error;
      setProcessos((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status_prazo: status_prazo as Processo["status_prazo"] } : p
        )
      );
    },
    []
  );

  return { processos, loading, error, fetchProcessos, addProcesso, updateProcessoStatus };
}
