import { StatusBadge } from "@/components/StatusBadge";
import { Bell, CheckCheck, BellOff, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useNotificacoes } from "@/hooks/useNotificacoes";

export default function Notificacoes() {
  const { notificacoes, loading, unreadCount, markAsRead, markAllRead } = useNotificacoes();

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Notificações</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {unreadCount > 0 ? `${unreadCount} não lidas` : "Tudo em dia ✓"}
          </p>
        </div>
        <button
          onClick={markAllRead}
          disabled={unreadCount === 0}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <CheckCheck className="h-3.5 w-3.5" />
          Marcar todas como lidas
        </button>
      </div>

      {notificacoes.length === 0 ? (
        <div className="bg-card border border-border rounded-xl py-20 flex flex-col items-center gap-3 shadow-card">
          <BellOff className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">Sem notificações</p>
          <p className="text-xs text-muted-foreground/60">Você está em dia com seus prazos!</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card divide-y divide-border">
          {notificacoes.map((n) => (
            <div
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className={cn("flex items-start gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors cursor-pointer", !n.lida && "bg-primary/5")}
            >
              <div className="mt-1.5 shrink-0">
                {!n.lida ? <span className="h-2 w-2 rounded-full bg-primary block" /> : <span className="h-2 w-2 rounded-full bg-transparent block" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <p className={cn("text-sm font-semibold", !n.lida ? "text-foreground" : "text-muted-foreground")}>{n.titulo}</p>
                  {n.tipo !== "info" && <StatusBadge status={n.tipo as any} size="sm" />}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{n.descricao}</p>
                <p className="text-[11px] text-muted-foreground/50 mt-1.5">
                  {formatDistanceToNow(new Date(n.data), { addSuffix: true, locale: ptBR })}
                </p>
              </div>
              {!n.lida && (
                <button
                  onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                  className="text-[10px] text-primary hover:underline shrink-0 mt-0.5"
                >
                  Marcar como lida
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
