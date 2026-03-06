import { DashboardStats } from "@/types";
import { AlertTriangle, Clock, CheckCircle, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: "Total Ativo",
      value: stats.total,
      icon: Briefcase,
      iconClass: "text-primary",
      iconBg: "bg-primary/10",
      borderClass: "border-border",
      subtext: "processos monitorados",
    },
    {
      label: "Urgente",
      value: stats.urgente,
      icon: AlertTriangle,
      iconClass: "text-urgente",
      iconBg: "bg-urgente-bg",
      borderClass: stats.urgente > 0 ? "border-urgente/20" : "border-border",
      subtext: "< 5 dias para prazo",
      highlight: stats.urgente > 0,
    },
    {
      label: "Atenção",
      value: stats.atencao,
      icon: Clock,
      iconClass: "text-atencao",
      iconBg: "bg-atencao-bg",
      borderClass: stats.atencao > 0 ? "border-atencao/20" : "border-border",
      subtext: "5–10 dias para prazo",
    },
    {
      label: "Saudável",
      value: stats.saudavel,
      icon: CheckCircle,
      iconClass: "text-saudavel",
      iconBg: "bg-saudavel-bg",
      borderClass: "border-saudavel/15",
      subtext: "> 10 dias para prazo",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={cn(
              "bg-card border rounded-lg p-4 card-hover shadow-card flex flex-col gap-2.5",
              card.borderClass,
              card.highlight && "ring-1 ring-urgente/15"
            )}
          >
            <div className="flex items-start justify-between">
              <div className={cn("h-8 w-8 rounded-md flex items-center justify-center", card.iconBg)}>
                <Icon className={cn("h-4 w-4", card.iconClass)} strokeWidth={1.75} />
              </div>
              {card.highlight && (
                <span className="badge-urgente px-1.5 py-0.5 rounded text-2xs font-bold pulse-urgente">
                  ⚠ AGIR
                </span>
              )}
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground tracking-tight">{card.value}</p>
              <p className="text-xs font-medium text-muted-foreground mt-0.5">{card.label}</p>
              <p className="text-2xs text-muted-foreground/50 mt-0.5">{card.subtext}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
