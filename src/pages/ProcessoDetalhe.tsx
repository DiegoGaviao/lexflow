import { useParams, useNavigate } from "react-router-dom";
import { useProcessos } from "@/hooks/useProcessos";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowLeft, User, Building2, CalendarDays, FileText, Scale, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const TIPO_ICONS: Record<string, string> = {
  peticao: "📄", sentenca: "⚖️", despacho: "📋", agravo: "⚡",
  citacao: "📬", autuacao: "🔖", outro: "📁",
};

export default function ProcessoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { processos, loading } = useProcessos();
  const processo = processos.find((p) => p.id === id);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!processo) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <p className="text-muted-foreground">Processo não encontrado.</p>
      </div>
    );
  }

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return format(new Date(d), "dd/MM/yyyy", { locale: ptBR });
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-4xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar para Processos
      </button>

      <div className="bg-card border border-border rounded-xl p-6 shadow-card">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary">{processo.tribunal_sigla}</span>
              <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded border", processo.status === "ativo" ? "bg-saudavel-bg border-saudavel/20 text-saudavel" : "bg-muted border-border text-muted-foreground")}>
                {processo.status.toUpperCase()}
              </span>
            </div>
            <h1 className="text-lg font-bold text-foreground">{processo.assunto}</h1>
            <p className="font-mono text-sm text-muted-foreground mt-1">{processo.numero}</p>
            <p className="text-xs text-muted-foreground mt-1">{processo.tribunal}</p>
          </div>
          <StatusBadge status={processo.status_prazo} dias={processo.dias_para_prazo} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { icon: User, label: "Autor", value: processo.autor },
            { icon: Scale, label: "Réu", value: processo.reu },
            { icon: User, label: "Responsável", value: processo.responsavel },
            { icon: CalendarDays, label: "Próx. Prazo", value: formatDate(processo.proxima_data_critica) },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="bg-secondary/50 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="h-3 w-3 text-muted-foreground" />
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{item.label}</p>
                </div>
                <p className="text-xs font-medium text-foreground">{item.value || "—"}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-card">
        <h2 className="text-sm font-bold text-foreground mb-5 flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" /> Timeline de Movimentações
        </h2>

        {processo.movimentacoes.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">Nenhuma movimentação registrada</p>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />
            <div className="space-y-6">
              {processo.movimentacoes.map((m, i) => (
                <div key={i} className="flex gap-4 relative">
                  <div className={cn("h-8 w-8 rounded-full border-2 flex items-center justify-center shrink-0 z-10 text-sm", i === 0 ? "bg-primary/20 border-primary" : "bg-secondary border-border")}>
                    {TIPO_ICONS[m.tipo] || "📁"}
                  </div>
                  <div className="flex-1 bg-secondary/40 rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="text-xs font-semibold text-foreground">{m.descricao}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <p className="text-[11px] text-muted-foreground">{formatDate(m.data)}</p>
                          <span className="text-muted-foreground/30">·</span>
                          <span className="text-[10px] font-medium uppercase text-muted-foreground/70">{m.tipo}</span>
                        </div>
                      </div>
                      {m.prazo_dias && (
                        <div className="bg-atencao-bg border border-atencao/20 rounded-lg px-2.5 py-1.5 text-right">
                          <p className="text-[10px] text-atencao/70 font-medium">Prazo</p>
                          <p className="text-sm font-bold text-atencao">{m.prazo_dias}d</p>
                          {m.prazo_final && <p className="text-[9px] text-atencao/70">{formatDate(m.prazo_final)}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
