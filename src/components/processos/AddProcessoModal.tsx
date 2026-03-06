import { useState } from "react";
import { TRIBUNAIS } from "@/data/constants";
import { X, Search, Upload, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useProcessos } from "@/hooks/useProcessos";

import { lfTable } from "@/integrations/supabase/lf_types";

interface AddProcessoModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddProcessoModal({ onClose, onSuccess }: AddProcessoModalProps) {
  const { user } = useAuth();
  const { addProcesso } = useProcessos();
  const [tab, setTab] = useState<"manual" | "csv">("manual");
  const [numero, setNumero] = useState("");
  const [tribunal, setTribunal] = useState("");
  const [tribunalSigla, setTribunalSigla] = useState("");
  const [assunto, setAssunto] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [autor, setAutor] = useState("");
  const [reu, setReu] = useState("");
  const [uf, setUf] = useState("");
  const [movimentacoes, setMovimentacoes] = useState<any[]>([]);
  const [dataUltimoMovimento, setDataUltimoMovimento] = useState("");
  const [searching, setSearching] = useState(false);
  const [found, setFound] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleBuscarDataJud = async () => {
    if (!numero) return;
    setSearching(true);
    setFound(false);
    setSearchError("");

    try {
      const { data, error } = await supabase.functions.invoke("consulta-datajud", {
        body: { numero_cnj: numero },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setTribunal(data.tribunal || "");
      setTribunalSigla(data.tribunal_sigla || "");
      setAssunto(data.assunto || "");
      setAutor(data.autor || "");
      setReu(data.reu || "");
      setUf(data.uf || "");
      setMovimentacoes(data.movimentacoes || []);
      setDataUltimoMovimento(data.data_ultimo_movimento || "");
      setFound(true);
    } catch (err: any) {
      setSearchError(err.message || "Erro ao consultar DataJud");
    } finally {
      setSearching(false);
    }
  };

  const handleSalvar = async () => {
    if (!user || !numero || !tribunalSigla) {
      toast({ title: "Preencha ao menos o número e tribunal", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      // 1. Insert processo and get the new ID
      const { data: newProc, error } = await (supabase
        .from(lfTable("processos") as any)
        .insert({
          numero,
          tribunal: tribunal || tribunalSigla,
          tribunal_sigla: tribunalSigla || tribunal,
          assunto: assunto || null,
          autor: autor || null,
          reu: reu || null,
          responsavel: responsavel || null,
          uf: uf || null,
          partes: [autor, reu].filter(Boolean).join(" × ") || null,
          data_ultimo_movimento: dataUltimoMovimento || null,
          user_id: user.id,
        })
        .select("id")
        .single() as any);

      if (error) throw error;

      // 2. Save movimentações from DataJud if available
      if (newProc?.id && movimentacoes.length > 0) {
        const movsToInsert = movimentacoes.map((m) => ({
          processo_id: newProc.id,
          data: m.data,
          descricao: m.descricao,
          tipo: m.tipo || "outro",
        }));
        const { error: movError } = await (supabase
          .from(lfTable("movimentacoes") as any)
          .insert(movsToInsert) as any);

        if (movError) {
          console.error("Erro ao salvar movimentações:", movError);
          // Don't throw — processo was already saved successfully
        }
      }

      toast({ title: "Processo adicionado com sucesso!" });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-card-lg animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-foreground">Novo Processo</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Busque pelo CNJ no DataJud ou preencha manualmente</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {[
            { key: "manual", label: "Manual / DataJud" },
            { key: "csv", label: "Importar CSV/Excel" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={cn(
                "flex-1 px-4 py-3 text-xs font-semibold transition-colors",
                tab === t.key ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-4">
          {tab === "manual" ? (
            <>
              {/* Número + DataJud */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Número do Processo (CNJ)</label>
                <div className="flex gap-2">
                  <input
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    placeholder="0000000-00.0000.0.00.0000"
                    className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors"
                  />
                  <button
                    onClick={handleBuscarDataJud}
                    disabled={searching || !numero}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors whitespace-nowrap"
                  >
                    {searching ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Search className="h-3.5 w-3.5" />
                    )}
                    {searching ? "Consultando..." : "DataJud"}
                  </button>
                </div>
                {found && (
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-saudavel">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Dados encontrados no DataJud — campos preenchidos automaticamente
                  </div>
                )}
                {searchError && (
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-destructive">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {searchError}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Tribunal</label>
                  <select
                    value={tribunalSigla || tribunal}
                    onChange={(e) => { setTribunalSigla(e.target.value); setTribunal(e.target.value); }}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  >
                    <option value="">Selecionar...</option>
                    {TRIBUNAIS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Responsável</label>
                  <input
                    value={responsavel}
                    onChange={(e) => setResponsavel(e.target.value)}
                    placeholder="Dr. / Dra. ..."
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Assunto Jurídico</label>
                <input
                  value={assunto}
                  onChange={(e) => setAssunto(e.target.value)}
                  placeholder="Ação Cível – Cobrança..."
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Autor</label>
                  <input
                    value={autor}
                    onChange={(e) => setAutor(e.target.value)}
                    placeholder="Nome do autor..."
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Réu</label>
                  <input
                    value={reu}
                    onChange={(e) => setReu(e.target.value)}
                    placeholder="Nome do réu..."
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-border rounded-xl gap-4">
              <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Arraste seu arquivo aqui</p>
                <p className="text-xs text-muted-foreground mt-1">CSV, XLSX ou XLS — até 10MB</p>
              </div>
              <button className="px-4 py-2 rounded-lg bg-secondary border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors">
                Selecionar arquivo
              </button>
              <div className="flex items-start gap-2 max-w-xs text-left bg-atencao-bg border border-atencao/20 rounded-lg px-3 py-2">
                <AlertCircle className="h-3.5 w-3.5 text-atencao shrink-0 mt-0.5" />
                <p className="text-[11px] text-atencao">
                  O arquivo deve conter colunas: <strong>numero, tribunal, autor, reu, assunto</strong>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            disabled={saving || !numero}
            className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-glow-primary flex items-center gap-1.5"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Adicionar Processo
          </button>
        </div>
      </div>
    </div>
  );
}
