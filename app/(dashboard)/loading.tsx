

export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-7 w-28 bg-muted rounded-lg" />
          <div className="h-4 w-56 bg-muted/60 rounded-full" />
        </div>
        <div className="h-8 w-20 bg-muted rounded-lg" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2.5">
                <div className="h-3 w-24 bg-muted rounded-full" />
                <div className="h-8 w-28 bg-muted rounded-lg" />
                <div className="h-3 w-32 bg-muted/60 rounded-full" />
              </div>
              <div className="h-10 w-10 rounded-xl bg-muted" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid gap-4 lg:grid-cols-7">
        <div className="lg:col-span-4 rounded-xl border border-border bg-card p-5">
          <div className="space-y-3">
            <div className="h-5 w-36 bg-muted rounded-full" />
            <div className="h-70 bg-muted/40 rounded-xl" />
          </div>
        </div>
        <div className="lg:col-span-3 rounded-xl border border-border bg-card p-5">
          <div className="space-y-3">
            <div className="h-5 w-40 bg-muted rounded-full" />
            <div className="h-70 bg-muted/40 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Bottom row skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5">
            <div className="space-y-4">
              <div className="h-5 w-36 bg-muted rounded-full" />
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full bg-muted shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-full bg-muted rounded-full" />
                    <div className="h-3 w-2/3 bg-muted/60 rounded-full" />
                  </div>
                  <div className="h-4 w-16 bg-muted rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
