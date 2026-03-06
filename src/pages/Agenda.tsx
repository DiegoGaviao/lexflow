import { useProcessos } from "@/hooks/useProcessos";
import { StatusBadge } from "@/components/StatusBadge";
import { CalendarDays, ChevronLeft, ChevronRight, Loader2, Inbox } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { processos, loading } = useProcessos();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getProcessosForDay = (day: Date) =>
    processos.filter((p) => p.proxima_data_critica && isSameDay(new Date(p.proxima_data_critica), day));

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const firstDayOfWeek = monthStart.getDay();
  const paddingDays = Array.from({ length: firstDayOfWeek });
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Agenda de Prazos</h1>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-foreground capitalize px-2">{format(currentDate, "MMMM yyyy", { locale: ptBR })}</span>
          <button onClick={nextMonth} className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {processos.length === 0 ? (
        <div className="py-20 flex flex-col items-center gap-3">
          <Inbox className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">Nenhum processo para exibir na agenda</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
          <div className="grid grid-cols-7 border-b border-border">
            {weekDays.map((d) => (
              <div key={d} className="py-3 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {paddingDays.map((_, i) => (
              <div key={`pad-${i}`} className="h-24 border-b border-r border-border bg-secondary/10" />
            ))}
            {days.map((day) => {
              const procs = getProcessosForDay(day);
              const isCurrentDay = isToday(day);
              return (
                <div key={day.toISOString()} className={cn("h-24 border-b border-r border-border p-2 overflow-hidden", isCurrentDay && "bg-primary/5")}>
                  <p className={cn("text-xs font-semibold mb-1 h-5 w-5 flex items-center justify-center rounded-full", isCurrentDay ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
                    {format(day, "d")}
                  </p>
                  <div className="space-y-0.5">
                    {procs.slice(0, 2).map((p) => (
                      <div key={p.id} className={cn("text-[9px] font-medium px-1 py-0.5 rounded truncate",
                        p.status_prazo === "urgente" && "bg-urgente-bg text-urgente",
                        p.status_prazo === "atencao" && "bg-atencao-bg text-atencao",
                        p.status_prazo === "saudavel" && "bg-saudavel-bg text-saudavel"
                      )}>
                        {p.tribunal_sigla} – {p.assunto.slice(0, 16)}...
                      </div>
                    ))}
                    {procs.length > 2 && <p className="text-[9px] text-muted-foreground">+{procs.length - 2} mais</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 text-xs">
        {[
          { label: "Urgente", className: "bg-urgente-bg text-urgente border-urgente/20" },
          { label: "Atenção", className: "bg-atencao-bg text-atencao border-atencao/20" },
          { label: "Saudável", className: "bg-saudavel-bg text-saudavel border-saudavel/20" },
        ].map((l) => (
          <span key={l.label} className={cn("px-2 py-0.5 rounded border font-medium text-[11px]", l.className)}>{l.label}</span>
        ))}
      </div>
    </div>
  );
}
