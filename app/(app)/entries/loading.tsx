export default function EntriesLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-9 w-72 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-9 w-28 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 border-b border-zinc-100 px-4 py-4 last:border-0 dark:border-zinc-800">
            <div className="h-4 flex-1 rounded bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-4 w-24 rounded bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-5 w-14 rounded-full bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-4 w-20 rounded bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-4 w-12 rounded bg-zinc-100 dark:bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  )
}
