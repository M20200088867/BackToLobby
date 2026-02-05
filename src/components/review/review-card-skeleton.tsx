export function ReviewCardSkeleton() {
  return (
    <div className="glass p-5 rounded-2xl space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-white/10" />
        <div className="space-y-1.5 flex-1">
          <div className="h-4 w-28 rounded bg-white/10" />
          <div className="h-3 w-20 rounded bg-white/5" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-white/5" />
        <div className="h-3 w-3/4 rounded bg-white/5" />
      </div>
    </div>
  );
}
