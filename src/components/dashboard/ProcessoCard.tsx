import { Processo } from "@/types";
import { StatusBadge } from "@/components/StatusBadge";
import { CalendarDays, User, ArrowRight, FolderPlus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

interface ProcessoCardProps {
  processo: Processo;
  index?: number;
}

const TRIBUNAL_COLORS: Record<string, string> = {
  TJSP: "bg-primary/10 text-primary border-primary/20",
  TJRJ: "bg-saudavel/10 text-saudavel border-saudavel/20",
  TJMG: "bg-list-vip/10 text-list-vip border-list-vip/20",
  STJ: "bg-atencao/10 text-atencao border-atencao/20",
  TRF3: "bg-primary/10 text-primary border-primary/20",
};

const LISTS = [
  { name: "VIP", color: "bg-list-vip" },
  { name: "Trabalhista", color: "bg-list-trabalhista" },
  { name: "Urgente", color: "bg-list-urgente" },
];

export function ProcessoCard({ processo, index = 0 }: ProcessoCardProps) {
  const navigate = useNavigate();
  const tribunalClass = TRIBUNAL_COLORS[processo.tribunal_sigla] || "bg-muted text-muted-foreground border-border";

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return format(new Date(d), "dd/MM/yyyy", { locale: ptBR });
  };

  const handleMoveToList = (e: React.MouseEvent, listName: string) => {
    e.stopPropagation();
    toast({ title: `Movido para "${listName}"`, description: `Processo ${processo.numero.slice(0, 20)}...` });
  };

  const isUrgente = processo.status_prazo === "urgente";

  return (
    <div
      onClick={() => navigate(`/processos/${processo.id}`)}
      style={{ animationDelay: `${index * 50}ms` }}
      className={cn(
        "bg-card border border-border rounded-lg p-4 card-hover shadow-card cursor-pointer group animate-fade-in",
        isUrgente && "border-urgente/25 shadow-glow-urgente"
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={cn("text-2xs font-semibold px-1.5 py-0.5 rounded border", tribunalClass)}>
              {processo.tribunal_sigla}
            </span>
            <code className="text-2xs text-muted-foreground font-mono truncate">
              {processo.numero}
            </code>
          </div>
          <p className="text-xs font-medium text-foreground mt-1.5 line-clamp-1">{processo.assunto}</p>
        </div>
        <StatusBadge status={processo.status_prazo} dias={processo.dias_para_prazo} size="sm" />
      </div>

      {/* Partes */}
      <p className="text-2xs text-muted-foreground mb-2.5 line-clamp-1">
        {processo.partes}
      </p>

      {/* Details */}
      <div className="grid grid-cols-2 gap-1.5">
        <div className="flex items-center gap-1.5 text-2xs text-muted-foreground">
          <User className="h-3 w-3 shrink-0" strokeWidth={1.75} />
          <span className="truncate">{processo.responsavel}</span>
        </div>
        <div className="flex items-center gap-1.5 text-2xs text-muted-foreground">
          <CalendarDays className="h-3 w-3 shrink-0" strokeWidth={1.75} />
          <span>
            {processo.proxima_data_critica ? formatDate(processo.proxima_data_critica) : "Sem prazo"}
          </span>
        </div>
      </div>

      {/* Last movimentação */}
      {processo.movimentacoes[0] && (
        <div className="mt-2.5 pt-2.5 border-t border-border">
          <p className="text-2xs text-muted-foreground/60 uppercase tracking-wider font-medium mb-0.5">Última mov.</p>
          <p className="text-2xs text-muted-foreground line-clamp-1">{processo.movimentacoes[0].descricao}</p>
        </div>
      )}

      {/* Footer actions */}
      <div className="mt-2.5 flex items-center justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <button className="flex items-center gap-1 text-2xs text-muted-foreground hover:text-foreground transition-colors px-1.5 py-1 rounded-md hover:bg-secondary">
              <FolderPlus className="h-3 w-3" strokeWidth={1.75} />
              <span>Mover para Lista</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40">
            {LISTS.map((list) => (
              <DropdownMenuItem key={list.name} onClick={(e) => handleMoveToList(e, list.name)}>
                <span className={cn("list-dot mr-2", list.color)} />
                {list.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
      </div>
    </div>
  );
}
