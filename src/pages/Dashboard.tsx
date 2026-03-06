import { useProcessos } from "@/hooks/useProcessos";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { PrazoChart } from "@/components/dashboard/PrazoChart";
import { ProcessoCard } from "@/components/dashboard/ProcessoCard";
import { ProcessoCardSkeleton } from "@/components/dashboard/ProcessoCardSkeleton";
import { OfficeOverview } from "@/components/dashboard/OfficeOverview";
import { DashboardStats } from "@/types";
import { RefreshCw, ChevronRight, CheckCircle2, Loader2, Inbox } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";

export default function Dashboard() {
  const today = format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const [syncing, setSyncing] = useState(false);
  const [filterByLawyer, setFilterByLawyer] = useState<string | null>(null);
  const { processos, loading, error, fetchProcessos } = useProcessos();

  const stats: DashboardStats = useMemo(() => ({
    total: processos.length,
    urgente: processos.filter((p) => p.status_prazo === "urgente").length,
    atencao: processos.filter((p) => p.status_prazo === "atencao").length,
    saudavel: processos.filter((p) => p.status_prazo === "saudavel").length,
    vencido: processos.filter((p) => p.status_prazo === "vencido").length,
  }), [processos]);

  const urgentes = processos.filter((p) => p.status_prazo === "urgente" || p.status_prazo === "atencao");

  const displayedProcessos = useMemo(() => {
    if (!filterByLawyer) return processos;
    return processos.filter((p) => p.responsavel === filterByLawyer);
  }, [processos, filterByLawyer]);

  const lawyerWorkloads = useMemo(() => {
    const map: Record<string, { total: number; urgente: number }> = {};
    processos.forEach((p) => {
      const name = p.responsavel || "Sem responsável";
      if (!map[name]) map[name] = { total: 0, urgente: 0 };
      map[name].total++;
      if (p.status_prazo === "urgente" || p.status_prazo === "vencido") map[name].urgente++;
    });
    return Object.entries(map).map(([name, data]) => ({
      name,
      initials: name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase(),
      total: data.total,
      urgente: data.urgente,
      saudavel: data.total - data.urgente,
    })).sort((a, b) => b.total - a.total);
  }, [processos]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fetchProcessos();
      toast({ title: "Sincronização concluída!", description: `${processos.length} processos atualizados.` });
    } catch {
      toast({ title: "Erro na sincronização", description: "Não foi possível conectar ao servidor.", variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  const handleLawyerClick = (lawyerName: string) => {
    setFilterByLawyer((prev) => (prev === lawyerName ? null : lawyerName));
  };

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-0.5 capitalize">{today}</p>
        </div>
        <div className="flex items-center gap-2">
          {error && (
            <span className="text-2xs text-atencao bg-atencao-bg border border-atencao/20 px-2 py-1 rounded-md">
              Erro ao carregar
            </span>
          )}
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary border border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            {syncing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span className="hidden sm:inline">Consultando DataJud...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sincronizar</span>
              </>
            )}
          </button>
        </div>
      </div>

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="md:col-span-2 lg:col-span-3">
          <PrazoChart />
        </div>
        <div className="md:col-span-1 lg:col-span-1">
          <OfficeOverview
            lawyers={lawyerWorkloads}
            activeLawyer={filterByLawyer}
            onLawyerClick={handleLawyerClick}
          />
        </div>
        <div className="md:col-span-1 lg:col-span-2 bg-card border border-border rounded-lg p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Ação Imediata</h3>
            <span className="badge-urgente px-2 py-0.5 rounded text-2xs font-bold">
              {urgentes.length}
            </span>
          </div>
          <div className="space-y-2">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 bg-secondary/50 rounded-md animate-pulse" />
              ))
            ) : urgentes.length === 0 ? (
              <div className="py-8 flex flex-col items-center gap-2 text-center">
                <CheckCircle2 className="h-6 w-6 text-saudavel/40" />
                <p className="text-xs text-muted-foreground">Nenhum processo urgente</p>
              </div>
            ) : urgentes.slice(0, 5).map((p, index) => (
              <div
                key={p.id}
                style={{ animationDelay: `${index * 60}ms` }}
                className={`flex items-center justify-between gap-3 p-2.5 rounded-md bg-secondary/50 border border-border hover:border-primary/20 transition-all cursor-pointer group animate-fade-in ${
                  p.status_prazo === "urgente" ? "shadow-glow-urgente" : ""
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${p.status_prazo === "urgente" ? "bg-urgente" : "bg-atencao"}`} />
                    <span className="text-2xs font-mono text-muted-foreground truncate">{p.numero.slice(0, 20)}...</span>
                  </div>
                  <p className="text-xs font-medium text-foreground truncate">{p.assunto}</p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className={`text-sm font-bold ${p.status_prazo === "urgente" ? "text-urgente" : "text-atencao"}`}>
                    {p.dias_para_prazo}d
                  </span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">
              {filterByLawyer ? `Processos — ${filterByLawyer}` : "Todos os Processos"}
            </h2>
            {filterByLawyer && (
              <button onClick={() => setFilterByLawyer(null)} className="text-2xs text-primary hover:underline font-medium">
                Limpar filtro
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <ProcessoCardSkeleton key={i} />)
          ) : displayedProcessos.length === 0 ? (
            <div className="col-span-full py-16 flex flex-col items-center gap-3 text-center">
              <Inbox className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Nenhum processo cadastrado</p>
              <p className="text-xs text-muted-foreground/60">Adicione processos na aba "Processos"</p>
            </div>
          ) : (
            displayedProcessos.map((processo, index) => (
              <ProcessoCard key={processo.id} processo={processo} index={index} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
