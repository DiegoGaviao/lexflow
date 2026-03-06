import { useState, useRef } from "react";
import { useProcessos } from "@/hooks/useProcessos";
import { TRIBUNAIS } from "@/data/constants";
import { StatusBadge } from "@/components/StatusBadge";
import { Processo, StatusPrazo } from "@/types";
import {
  Search, Plus, Download, LayoutGrid, List, LayoutDashboard,
  FileSpreadsheet, GripVertical, Inbox, Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { AddProcessoModal } from "@/components/processos/AddProcessoModal";
import { toast } from "@/hooks/use-toast";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProcessoCardSkeleton } from "@/components/dashboard/ProcessoCardSkeleton";

type ViewMode = "list" | "grid" | "kanban";

const STATUS_FILTERS: { label: string; value: StatusPrazo | "todos" }[] = [
  { label: "Todos", value: "todos" },
  { label: "🔴 Urgente", value: "urgente" },
  { label: "🟡 Atenção", value: "atencao" },
  { label: "🟢 Saudável", value: "saudavel" },
  { label: "⛔ Vencido", value: "vencido" },
];

const KANBAN_COLS: { key: StatusPrazo; label: string; colorClass: string; dotClass: string }[] = [
  { key: "urgente", label: "Urgente", colorClass: "border-urgente/40 bg-urgente/5", dotClass: "bg-urgente" },
  { key: "atencao", label: "Atenção", colorClass: "border-atencao/40 bg-atencao/5", dotClass: "bg-atencao" },
  { key: "saudavel", label: "Saudável", colorClass: "border-saudavel/40 bg-saudavel/5", dotClass: "bg-saudavel" },
  { key: "vencido", label: "Vencido", colorClass: "border-border bg-secondary/20", dotClass: "bg-muted-foreground" },
];

export default function Processos() {
  const { processos, loading, updateProcessoStatus } = useProcessos();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<StatusPrazo | "todos">("todos");
  const [filterTribunal, setFilterTribunal] = useState("todos");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showModal, setShowModal] = useState(false);
  const [dragOver, setDragOver] = useState<StatusPrazo | null>(null);
  const dragId = useRef<string | null>(null);
  const [exportingExcel, setExportingExcel] = useState(false);

  const filtered = processos.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      p.numero.includes(search) ||
      p.autor.toLowerCase().includes(q) ||
      p.reu.toLowerCase().includes(q) ||
      p.assunto.toLowerCase().includes(q) ||
      p.tribunal_sigla.toLowerCase().includes(q) ||
      (p.responsavel?.toLowerCase().includes(q) ?? false);
    const matchStatus = filterStatus === "todos" || p.status_prazo === filterStatus;
    const matchTribunal = filterTribunal === "todos" || p.tribunal_sigla === filterTribunal;
    return matchSearch && matchStatus && matchTribunal;
  });

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return format(new Date(d), "dd/MM/yyyy", { locale: ptBR });
  };

  const handleDragStart = (id: string) => { dragId.current = id; };

  const handleDrop = async (targetStatus: StatusPrazo) => {
    const id = dragId.current;
    if (!id) return;
    const processo = processos.find((p) => p.id === id);
    if (!processo || processo.status_prazo === targetStatus) {
      setDragOver(null);
      dragId.current = null;
      return;
    }
    try {
      await updateProcessoStatus(id, targetStatus);
      toast({ title: "Status atualizado!", description: `Processo movido para "${targetStatus}"` });
    } catch {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    }
    setDragOver(null);
    dragId.current = null;
  };

  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      const XLSX = await import("xlsx");
      const data = filtered.map((p) => ({
        "Número": p.numero, "Tribunal": p.tribunal_sigla, "UF": p.uf,
        "Assunto": p.assunto, "Autor": p.autor, "Réu": p.reu,
        "Responsável": p.responsavel, "Status Prazo": p.status_prazo,
        "Dias Restantes": p.dias_para_prazo ?? "—",
        "Próxima Data Crítica": p.proxima_data_critica ?? "—", "Status": p.status,
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      ws["!cols"] = [
        { wch: 28 }, { wch: 8 }, { wch: 5 }, { wch: 30 }, { wch: 20 },
        { wch: 20 }, { wch: 18 }, { wch: 12 }, { wch: 14 }, { wch: 20 }, { wch: 10 },
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Processos");
      XLSX.writeFile(wb, "lexflow-processos.xlsx");
      toast({ title: "Excel exportado!", description: `${filtered.length} processos exportados.` });
    } catch {
      toast({ title: "Erro ao exportar", variant: "destructive" });
    }
    setExportingExcel(false);
  };

  return (
    <TooltipProvider>
      <div className="p-6 space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Processos</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filtered.length} de {processos.length} processos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              disabled={exportingExcel}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              {exportingExcel ? "Exportando..." : "Exportar"}
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-glow-primary"
            >
              <Plus className="h-3.5 w-3.5" />
              Novo Processo
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Número, cliente, tribunal, assunto..."
              className="w-full bg-secondary border border-border rounded-lg pl-8 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <Tooltip key={f.value}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setFilterStatus(f.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                      filterStatus === f.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground border border-border hover:text-foreground"
                    )}
                  >
                    {f.label}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {f.value === "urgente" && "Prazo em menos de 5 dias"}
                  {f.value === "atencao" && "Prazo entre 5 e 10 dias"}
                  {f.value === "saudavel" && "Prazo acima de 10 dias"}
                  {f.value === "vencido" && "Prazo já encerrado"}
                  {f.value === "todos" && "Exibir todos os processos"}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
          <select
            value={filterTribunal}
            onChange={(e) => setFilterTribunal(e.target.value)}
            className="bg-secondary border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary/50 transition-colors"
          >
            <option value="todos">Todos os tribunais</option>
            {TRIBUNAIS.slice(0, 10).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            {([
              { mode: "list" as const, icon: List, title: "Lista" },
              { mode: "grid" as const, icon: LayoutGrid, title: "Grade" },
              { mode: "kanban" as const, icon: LayoutDashboard, title: "Kanban" },
            ]).map(({ mode, icon: Icon, title }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn("p-2 transition-colors", viewMode === mode ? "bg-secondary" : "hover:bg-secondary/50")}
                title={title}
              >
                <Icon className={cn("h-3.5 w-3.5", viewMode === mode ? "text-foreground" : "text-muted-foreground")} />
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <ProcessoCardSkeleton key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && processos.length === 0 && (
          <div className="py-20 flex flex-col items-center gap-3 text-center">
            <Inbox className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">Nenhum processo cadastrado</p>
            <p className="text-xs text-muted-foreground/60">Clique em "Novo Processo" para começar</p>
          </div>
        )}

        {/* LIST VIEW */}
        {!loading && viewMode === "list" && processos.length > 0 && (
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
            <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_1fr_auto] gap-4 px-4 py-3 border-b border-border bg-secondary/30">
              {["Processo / Assunto", "Tribunal", "Partes", "Responsável", "Próx. Prazo", "Status"].map((h) => (
                <p key={h} className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{h}</p>
              ))}
            </div>
            <div className="divide-y divide-border">
              {filtered.length === 0 ? (
                <EmptyState message="Nenhum processo encontrado com os filtros atuais." />
              ) : (
                filtered.map((p) => <ProcessoRow key={p.id} processo={p} formatDate={formatDate} />)
              )}
            </div>
          </div>
        )}

        {/* GRID VIEW */}
        {!loading && viewMode === "grid" && processos.length > 0 && (
          <>
            {filtered.length === 0 ? (
              <EmptyState message="Nenhum processo encontrado com os filtros atuais." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((p) => (
                  <div key={p.id} className="bg-card border border-border rounded-xl p-4 card-hover shadow-card">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-muted-foreground">{p.tribunal_sigla}</p>
                        <p className="text-xs font-semibold text-foreground mt-1 line-clamp-1">{p.assunto}</p>
                      </div>
                      <StatusBadge status={p.status_prazo} dias={p.dias_para_prazo} size="sm" />
                    </div>
                    <p className="text-[11px] text-muted-foreground font-mono mb-2">{p.numero}</p>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">{p.partes}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <span className="text-[11px] text-muted-foreground">{p.responsavel}</span>
                      <span className="text-[11px] text-muted-foreground">{formatDate(p.proxima_data_critica)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* KANBAN VIEW */}
        {!loading && viewMode === "kanban" && processos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {KANBAN_COLS.map((col) => {
              const colProcessos = filtered.filter((p) => p.status_prazo === col.key);
              const isOver = dragOver === col.key;
              return (
                <div
                  key={col.key}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(col.key); }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={() => handleDrop(col.key)}
                  className={cn(
                    "rounded-xl border p-3 min-h-[500px] transition-all duration-200",
                    col.colorClass, isOver && "ring-2 ring-primary/50 scale-[1.01]"
                  )}
                >
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <span className={cn("h-2 w-2 rounded-full", col.dotClass)} />
                      <p className="text-xs font-semibold text-foreground">{col.label}</p>
                    </div>
                    <span className="h-5 min-w-[20px] px-1 rounded-full bg-card border border-border flex items-center justify-center text-[10px] font-bold text-foreground">
                      {colProcessos.length}
                    </span>
                  </div>
                  {isOver && (
                    <div className="mb-2 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 py-3 text-center text-[11px] text-primary font-medium">
                      Soltar aqui
                    </div>
                  )}
                  <div className="space-y-2">
                    {colProcessos.length === 0 && !isOver ? (
                      <p className="text-[11px] text-muted-foreground text-center py-8 opacity-60">Sem processos</p>
                    ) : (
                      colProcessos.map((p) => (
                        <KanbanCard key={p.id} processo={p} formatDate={formatDate} onDragStart={() => handleDragStart(p.id)} />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showModal && <AddProcessoModal onClose={() => setShowModal(false)} />}
      </div>
    </TooltipProvider>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-16 flex flex-col items-center gap-3 text-center">
      <Search className="h-10 w-10 text-muted-foreground/30" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function ProcessoRow({ processo: p, formatDate }: { processo: Processo; formatDate: (d: string | null) => string }) {
  return (
    <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_1fr_auto] gap-4 px-4 py-3.5 hover:bg-secondary/30 transition-colors cursor-pointer items-center">
      <div className="min-w-0">
        <p className="text-xs font-mono text-muted-foreground truncate">{p.numero}</p>
        <p className="text-xs font-medium text-foreground mt-0.5 truncate">{p.assunto}</p>
      </div>
      <div>
        <span className="text-xs font-bold text-muted-foreground">{p.tribunal_sigla}</span>
        <p className="text-[10px] text-muted-foreground/60 mt-0.5">{p.uf}</p>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-foreground truncate">{p.autor}</p>
        <p className="text-[10px] text-muted-foreground truncate">× {p.reu}</p>
      </div>
      <p className="text-xs text-muted-foreground truncate">{p.responsavel}</p>
      <div>
        <p className="text-xs text-foreground">{formatDate(p.proxima_data_critica)}</p>
        {p.dias_para_prazo !== null && (
          <p className={cn(
            "text-[10px] font-semibold mt-0.5",
            p.status_prazo === "urgente" && "text-urgente",
            p.status_prazo === "atencao" && "text-atencao",
            p.status_prazo === "saudavel" && "text-saudavel"
          )}>
            {p.dias_para_prazo}d restantes
          </p>
        )}
      </div>
      <StatusBadge status={p.status_prazo} size="sm" />
    </div>
  );
}

function KanbanCard({ processo: p, formatDate, onDragStart }: { processo: Processo; formatDate: (d: string | null) => string; onDragStart: () => void }) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="bg-card border border-border rounded-lg p-3 shadow-card hover:border-primary/30 hover:shadow-glow-primary transition-all cursor-grab active:cursor-grabbing active:scale-95 active:opacity-80 group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-muted-foreground">{p.tribunal_sigla}</p>
          <p className="text-xs font-semibold text-foreground mt-0.5 line-clamp-2">{p.assunto}</p>
        </div>
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <p className="text-[10px] font-mono text-muted-foreground/70 mb-1">{p.numero.slice(0, 20)}...</p>
      <p className="text-[11px] text-muted-foreground line-clamp-1 mb-2">{p.partes}</p>
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <span className="text-[10px] text-muted-foreground">{p.responsavel?.split(" ").slice(0, 2).join(" ")}</span>
        <span className="text-[10px] text-muted-foreground">{formatDate(p.proxima_data_critica)}</span>
      </div>
    </div>
  );
}
