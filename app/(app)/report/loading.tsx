export default function ReportLoading() {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      <div className="flex flex-col gap-1">
        <div className="h-6 w-64 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-48 rounded bg-zinc-100 dark:bg-zinc-800/60" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="h-4 w-16 rounded bg-zinc-100 dark:bg-zinc-800" />
            <div className="mt-3 h-7 w-28 rounded bg-zinc-200 dark:bg-zinc-700" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 h-4 w-24 rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="mx-auto h-48 w-48 rounded-full bg-zinc-100 dark:bg-zinc-800" />
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 h-4 w-24 rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="mx-auto h-48 w-48 rounded-full bg-zinc-100 dark:bg-zinc-800" />
        </div>
      </div>
    </div>
  )
}
