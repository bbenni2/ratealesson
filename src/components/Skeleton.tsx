export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />
}

/** Platzhalter, der wie eine Stunden-Karte aussieht. */
export function LessonCardSkeleton() {
  return (
    <div className="card flex items-center gap-3 p-4">
      <Skeleton className="h-11 w-11 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-8 w-12 rounded-lg" />
    </div>
  )
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <LessonCardSkeleton key={i} />
      ))}
    </div>
  )
}
