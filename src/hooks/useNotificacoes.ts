import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { NotificacaoItem } from "@/types";
import { lf_notificacoes, lfTable } from "@/integrations/supabase/lf_types";

export function useNotificacoes() {
  const { user } = useAuth();
  const [notificacoes, setNotificacoes] = useState<NotificacaoItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotificacoes = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await (supabase
      .from(lfTable("notificacoes") as any)
      .select("*")
      .eq("user_id", user.id)
      .order("data", { ascending: false }) as any);

    if (!error && data) {
      const typedData = (data as lf_notificacoes[]) || [];
      setNotificacoes(
        typedData.map((n) => ({
          id: n.id,
          tipo: (n.tipo as NotificacaoItem["tipo"]) || "info",
          titulo: n.titulo,
          descricao: n.descricao || "",
          data: n.data || new Date().toISOString(),
          lida: n.lida || false,
          processo_id: n.processo_id || undefined,
        }))
      );
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchNotificacoes();
  }, [fetchNotificacoes]);

  const markAsRead = useCallback(async (id: string) => {
    await (supabase.from(lfTable("notificacoes") as any).update({ lida: true }).eq("id", id) as any);
    setNotificacoes((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)));
  }, []);

  const markAllRead = useCallback(async () => {
    if (!user) return;
    await (supabase
      .from(lfTable("notificacoes") as any)
      .update({ lida: true })
      .eq("user_id", user.id)
      .eq("lida", false) as any);
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
  }, [user]);

  const unreadCount = notificacoes.filter((n) => !n.lida).length;

  return { notificacoes, loading, unreadCount, fetchNotificacoes, markAsRead, markAllRead };
}
