export function GameCardSkeleton() {
  return (
    <div className="glass aspect-[3/4] rounded-2xl animate-pulse">
      <div className="flex h-full flex-col justify-end p-3 space-y-2">
        <div className="h-4 w-3/4 rounded bg-white/10" />
        <div className="flex gap-2">
          <div className="h-3 w-10 rounded bg-white/5" />
          <div className="h-3 w-14 rounded-full bg-white/5" />
        </div>
      </div>
    </div>
  );
}
