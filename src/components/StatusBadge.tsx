import { cn } from "@/lib/utils";
import { StatusPrazo } from "@/types";
import { AlertTriangle, Clock, CheckCircle, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: StatusPrazo;
  dias?: number | null;
  size?: "sm" | "md";
}

const STATUS_CONFIG = {
  urgente: {
    label: "URGENTE",
    className: "badge-urgente pulse-urgente",
    icon: AlertTriangle,
    emoji: "🔴",
  },
  atencao: {
    label: "ATENÇÃO",
    className: "badge-atencao",
    icon: Clock,
    emoji: "🟡",
  },
  saudavel: {
    label: "SAUDÁVEL",
    className: "badge-saudavel",
    icon: CheckCircle,
    emoji: "🟢",
  },
  vencido: {
    label: "VENCIDO",
    className: "badge-vencido",
    icon: XCircle,
    emoji: "⛔",
  },
};

export function StatusBadge({ status, dias, size = "md" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md font-semibold tracking-wide",
        config.className,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        status === "urgente" && "pulse-urgente"
      )}
    >
      <Icon className={cn(size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
      {config.label}
      {dias !== null && dias !== undefined && (
        <span className="opacity-80">
          {" "}
          {dias === 0 ? "— HOJE" : dias < 0 ? `${Math.abs(dias)}d atrás` : `${dias}d`}
        </span>
      )}
    </span>
  );
}
