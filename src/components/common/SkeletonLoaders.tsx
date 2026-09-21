export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 bg-muted rounded-md" />
        <div className="h-5 w-16 bg-muted rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="h-6 w-3/4 bg-muted rounded-md" />
        <div className="h-4 w-full bg-muted rounded-md" />
        <div className="h-4 w-2/3 bg-muted rounded-md" />
      </div>
      <div className="pt-2 border-t border-border/50 flex items-center justify-between">
        <div className="h-4 w-20 bg-muted rounded-md" />
        <div className="h-8 w-24 bg-muted rounded-md" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      <div className="space-y-3">
        <div className="h-4 w-32 bg-muted rounded-md" />
        <div className="h-8 w-2/3 bg-muted rounded-md" />
        <div className="h-4 w-full max-w-2xl bg-muted rounded-md" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64 bg-muted rounded-xl" />
          <div className="space-y-3">
            <div className="h-6 w-48 bg-muted rounded-md" />
            <div className="h-4 w-full bg-muted rounded-md" />
            <div className="h-4 w-full bg-muted rounded-md" />
            <div className="h-4 w-4/5 bg-muted rounded-md" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-48 bg-muted rounded-xl" />
          <div className="h-32 bg-muted rounded-xl" />
        </div>
      </div>
    </div>
  );
}
