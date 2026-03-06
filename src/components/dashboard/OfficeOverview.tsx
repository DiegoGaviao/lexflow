import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

interface LawyerWorkload {
  name: string;
  initials: string;
  total: number;
  urgente: number;
  saudavel: number;
}

interface OfficeOverviewProps {
  lawyers: LawyerWorkload[];
  activeLawyer?: string | null;
  onLawyerClick?: (name: string) => void;
}

export function OfficeOverview({ lawyers, activeLawyer, onLawyerClick }: OfficeOverviewProps) {
  const maxTotal = Math.max(...lawyers.map((l) => l.total), 1);

  return (
    <div className="bg-card border border-border rounded-lg p-5 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
        <h3 className="text-sm font-semibold text-foreground">Office Overview</h3>
      </div>
      <div className="space-y-3">
        {lawyers.map((lawyer) => {
          const urgenteWidth = (lawyer.urgente / maxTotal) * 100;
          const saudavelWidth = ((lawyer.total - lawyer.urgente) / maxTotal) * 100;
          const isActive = activeLawyer === lawyer.name;

          return (
            <button
              key={lawyer.name}
              onClick={() => onLawyerClick?.(lawyer.name)}
              className={cn(
                "w-full text-left space-y-1.5 p-2 -mx-2 rounded-md transition-colors",
                isActive
                  ? "bg-primary/10 ring-1 ring-primary/20"
                  : "hover:bg-secondary/60"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center border transition-colors",
                    isActive
                      ? "bg-primary/25 border-primary/40"
                      : "bg-primary/15 border-primary/20"
                  )}>
                    <span className="text-2xs font-bold text-primary">{lawyer.initials}</span>
                  </div>
                  <span className="text-[13px] font-medium text-foreground">{lawyer.name}</span>
                </div>
                <div className="flex items-center gap-2 text-2xs text-muted-foreground">
                  <span>{lawyer.total} proc.</span>
                  {lawyer.urgente > 0 && (
                    <span className="text-urgente font-medium">{lawyer.urgente} urg.</span>
                  )}
                </div>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex">
                {lawyer.urgente > 0 && (
                  <div
                    className="h-full bg-urgente rounded-full transition-all duration-500"
                    style={{ width: `${urgenteWidth}%` }}
                  />
                )}
                <div
                  className="h-full bg-saudavel rounded-full transition-all duration-500"
                  style={{ width: `${saudavelWidth}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
