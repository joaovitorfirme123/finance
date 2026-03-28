export default function HistoryLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="flex flex-col gap-1">
        <div className="h-6 w-28 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-48 rounded bg-zinc-100 dark:bg-zinc-800/60" />
      </div>
      <div className="flex flex-col gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
                <div className="h-5 w-14 rounded-full bg-zinc-100 dark:bg-zinc-800" />
              </div>
              <div className="h-4 w-20 rounded bg-zinc-100 dark:bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
