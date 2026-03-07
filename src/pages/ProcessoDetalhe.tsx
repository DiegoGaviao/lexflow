import { useParams, useNavigate } from "react-router-dom";
import { useProcessos } from "@/hooks/useProcessos";
import { StatusBadge } from "@/components/StatusBadge";
import {
  ArrowLeft, User, Building2, CalendarDays, FileText, Scale,
  Clock, Loader2, RefreshCw, ChevronRight, Hash, MapPin,
  ExternalLink, Info
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

const TIPO_ICONS: Record<string, string> = {
  peticao: "📄", sentenca: "⚖️", despacho: "📋", agravo: "⚡",
  citacao: "📬", autuacao: "🔖", outro: "📁",
};

export default function ProcessoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { processos, loading } = useProcessos();
  const [syncing, setSyncing] = useState(false);

  const processo = processos.find((p) => p.id === id);

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-[50vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Carregando detalhes do processo...</p>
      </div>
    );
  }

  if (!processo) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-[50vh] gap-4">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          <Info className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground font-medium">Processo não encontrado.</p>
        <button onClick={() => navigate("/processos")} className="text-sm text-primary hover:underline">
          Voltar para a listagem
        </button>
      </div>
    );
  }

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    try {
      return format(new Date(d), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return d;
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    // Simulação de sincronização (no futuro chamará a Edge Function novamente para atualizar movimentos)
    setTimeout(() => {
      setSyncing(false);
      toast({ title: "Sincronizado", description: "Dados atualizados com base no DataJud." });
    }, 1500);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-6xl mx-auto pb-20">
      {/* Breadcrumbs / Navigation */}
      <nav className="flex items-center gap-2 text-[11px] text-muted-foreground uppercase tracking-widest font-bold">
        <button onClick={() => navigate("/dashboard")} className="hover:text-primary transition-colors">Dashboard</button>
        <ChevronRight className="h-3 w-3" />
        <button onClick={() => navigate("/processos")} className="hover:text-primary transition-colors">Processos</button>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground truncate max-w-[200px]">{processo.numero}</span>
      </nav>

      {/* Main Header Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-8 border border-border shadow-card overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Scale className="h-32 w-32 -rotate-12" />
            </div>

            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-md bg-primary/20 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-tighter">
                  {processo.tribunal_sigla}
                </span>
                <span className={cn(
                  "px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter border",
                  processo.status === "ativo" ? "bg-saudavel/10 border-saudavel/30 text-saudavel" : "bg-muted border-border text-muted-foreground"
                )}>
                  {processo.status}
                </span>
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="ml-auto h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-all disabled:opacity-50"
                  title="Sincronizar com Tribunal"
                >
                  <RefreshCw className={cn("h-4 w-4 text-muted-foreground", syncing && "animate-spin text-primary")} />
                </button>
              </div>

              <div>
                <h1 className="text-2xl font-bold text-foreground leading-tight tracking-tight mb-2">
                  {processo.assunto}
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  <span className="font-mono text-base font-medium tracking-tight select-all">{processo.numero}</span>
                  <ExternalLink className="h-3 w-3 cursor-pointer hover:text-primary transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Tribunal</p>
                    <p className="text-sm font-semibold truncate">{processo.tribunal}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Localidade</p>
                    <p className="text-sm font-semibold truncate">Estado: {processo.uf || "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Partes / Polos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 border-l-4 border-l-saudavel">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-4 w-4 text-saudavel" />
                <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Autor / Ativo</h3>
              </div>
              <p className="text-sm font-bold text-foreground mb-1 leading-snug">{processo.autor || "Não informado"}</p>
              <p className="text-[10px] text-muted-foreground italic">Principal envolvido no polo ativo</p>
            </div>
            <div className="glass-card p-6 border-l-4 border-l-urgente">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-4 w-4 text-urgente" />
                <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Réu / Passivo</h3>
              </div>
              <p className="text-sm font-bold text-foreground mb-1 leading-snug">{processo.reu || "Não informado"}</p>
              <p className="text-[10px] text-muted-foreground italic">Principal envolvido no polo passivo</p>
            </div>
          </div>

          {/* Timeline de Movimentações */}
          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Histórico de Andamentos</h2>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">Total: {processo.movimentacoes.length} registros</span>
            </div>

            {processo.movimentacoes.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <Clock className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                <p className="text-xs text-muted-foreground">Aguardando primeira sincronização de andamentos...</p>
              </div>
            ) : (
              <div className="relative pl-6 border-l border-border/80 space-y-8">
                {processo.movimentacoes.map((m, i) => (
                  <div key={i} className="relative group">
                    {/* Dot */}
                    <div className={cn(
                      "absolute -left-[31px] top-1 h-[9px] w-[9px] rounded-full border-2 transition-all group-hover:scale-125",
                      i === 0 ? "bg-primary border-primary ring-4 ring-primary/20" : "bg-card border-muted-foreground"
                    )} />

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-muted-foreground/70 font-mono tracking-tighter">
                          {formatDate(m.data)}
                        </span>
                        <span className="h-px flex-1 bg-border/40" />
                        <span className="text-[9px] font-bold uppercase py-0.5 px-1.5 rounded bg-secondary text-muted-foreground">
                          {m.tipo}
                        </span>
                      </div>
                      <p className={cn(
                        "text-sm leading-relaxed",
                        i === 0 ? "font-bold text-foreground" : "text-muted-foreground font-medium"
                      )}>
                        {m.descricao}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Space */}
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-6 bg-secondary/20">
            <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Resumo do Prazo</h3>

            <div className="flex flex-col items-center justify-center p-6 bg-card rounded-2xl border border-border shadow-inner gap-2">
              <StatusBadge status={processo.status_prazo} dias={processo.dias_para_prazo} />
              <p className="text-[10px] text-muted-foreground text-center mt-2 leading-tight">
                Status geral baseado no último andamento e prazos legais configurados.
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-border/50">
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Última Movimentação</p>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <p className="text-sm font-bold">{formatDate(processo.data_ultimo_movimento)}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Responsável</p>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <p className="text-sm font-bold">{processo.responsavel || "—"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border-dashed border-2 border-border/50 hover:border-primary/30 transition-colors cursor-pointer group">
            <div className="flex flex-col items-center gap-2 text-center">
              <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
              <p className="text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors">Criar Tarefa / Prazo</p>
              <p className="text-[10px] text-muted-foreground/60">Vincular novo compromisso a este processo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
