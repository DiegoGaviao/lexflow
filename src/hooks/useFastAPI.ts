import { useState, useEffect, useCallback } from "react";
import { Processo } from "@/types";

const API_BASE = "http://localhost:8000/api";

export function useFastAPIProcessos() {
  const [processes, setProcesses] = useState<Processo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProcesses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/processos/`);
      const data = await res.json();
      if (res.ok) {
        const mapped: Processo[] = (data.data || []).map((p: any) => ({
          id: p.id,
          numero: p.numero_cnj,
          tribunal: p.tribunal || "Tribunal não informado",
          tribunal_sigla: (p.tribunal || "").split(" ")[0] || "TJ",
          partes: p.titulo || "Desconhecido",
          autor: (p.titulo || "").split(" vs ")[0] || "Autor",
          reu: (p.titulo || "").split(" vs ")[1] || "Réu",
          assunto: p.assunto || "Geral",
          responsavel: p.responsavel || "Admin",
          data_ultimo_movimento: p.data_ultima_movimentacao || new Date().toISOString(),
          proxima_data_critica: null,
          dias_para_prazo: null,
          status_prazo: (p.ultima_analise_ia || "").includes("ALERTA") ? "urgente" :
            (p.ultima_analise_ia || "").includes("PRAZO") ? "atencao" : "saudavel",
          status: p.status || "ativo",
          movimentacoes: [],
          uf: "SP"
        }));
        setProcesses(mapped);
      } else {
        setError(data.detail || "Erro ao buscar processos");
      }
    } catch {
      setError("Servidor indisponível.");
    } finally {
      setLoading(false);
    }
  }, []);

  const syncProcess = useCallback(async (numero: string) => {
    const res = await fetch(`${API_BASE}/processos/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numero, responsavel: "Admin" }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Erro ao sincronizar");
    await fetchProcesses();
    return data;
  }, [fetchProcesses]);

  const searchDataJud = useCallback(async (numero: string) => {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data, error } = await supabase.functions.invoke("consulta-datajud", {
      body: { numero_cnj: numero },
    });

    if (error) throw new Error(error.message || "Erro ao consultar DataJud");
    return data;
  }, []);

  useEffect(() => { fetchProcesses(); }, [fetchProcesses]);

  return { processes, loading, error, fetchProcesses, syncProcess, searchDataJud };
}

export interface FastAPITask {
  id: string;
  title: string;
  process: string;
  deadline: string;
  responsible: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "doing" | "done";
}

export function useFastAPITasks() {
  const [tasks, setTasks] = useState<FastAPITask[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/movimentacoes/`);
      const data = await res.json();
      if (res.ok) setTasks(data.data || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  return { tasks, loading, fetchTasks };
}

export function useFastAPIAdmin() {
  const [history, setHistory] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/historico`);
      const data = await res.json();
      if (res.ok) setHistory(data.data || []);
    } catch { }
  }, []);

  const fetchFolders = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/pastas`);
      const data = await res.json();
      if (res.ok) setFolders(data.data || []);
    } catch { }
  }, []);

  const fetchTeam = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/equipe`);
      const data = await res.json();
      if (res.ok) setTeam(data.data || []);
    } catch { } finally {
      setLoading(false);
    }
  }, []);

  const inviteMember = useCallback(async (email: string, role: string) => {
    const res = await fetch(`${API_BASE}/admin/equipe/convidar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    return res.json();
  }, []);

  useEffect(() => {
    fetchHistory();
    fetchFolders();
    fetchTeam();
  }, [fetchHistory, fetchFolders, fetchTeam]);

  return { history, folders, team, loading, fetchHistory, fetchFolders, fetchTeam, inviteMember };
}
