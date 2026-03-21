export default function ClientsLoading() {
    return (
        <div className="space-y-6 p-6 animate-pulse">
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <div className="h-7 w-24 bg-muted rounded-lg" />
                    <div className="h-4 w-48 bg-muted/60 rounded-full" />
                </div>
                <div className="h-8 w-28 bg-muted rounded-lg" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-card border border-border rounded-xl" />)}
            </div>
            <div className="h-10 w-64 bg-muted rounded-xl" />
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="h-10 bg-muted/30 border-b border-border" />
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-border last:border-0">
                        <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
                        <div className="flex-1 space-y-1.5">
                            <div className="h-3.5 w-32 bg-muted rounded-full" />
                            <div className="h-3 w-48 bg-muted/60 rounded-full" />
                        </div>
                        <div className="h-4 w-16 bg-muted rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}