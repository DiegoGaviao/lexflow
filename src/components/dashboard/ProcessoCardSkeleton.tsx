import { Skeleton } from "@/components/ui/skeleton";

export function ProcessoCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-card space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-4 w-10 rounded" />
            <Skeleton className="h-3 w-36 rounded" />
          </div>
          <Skeleton className="h-3.5 w-3/4 rounded" />
        </div>
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="h-3 w-2/3 rounded" />
      <div className="grid grid-cols-2 gap-1.5">
        <Skeleton className="h-3 w-24 rounded" />
        <Skeleton className="h-3 w-20 rounded" />
      </div>
      <div className="border-t border-border pt-2.5 mt-2.5">
        <Skeleton className="h-3 w-full rounded" />
      </div>
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-5 w-24 rounded" />
        <Skeleton className="h-3.5 w-3.5 rounded" />
      </div>
    </div>
  );
}
