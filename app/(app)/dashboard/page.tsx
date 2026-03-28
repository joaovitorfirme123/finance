import { auth } from "@/src/auth"
import { redirect } from "next/navigation"
import { db } from "@/src/db"
import { fixedEntries, occasionalEntries } from "@/src/db/schema"
import { and, eq, gte, isNull, lte, or } from "drizzle-orm"
import { formatCurrency, cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import { ArrowRight, LayoutList, BarChart2 } from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const today = now.getDate()
  const monthStr = `${year}-${String(month).padStart(2, "0")}`
  const monthLabel = format(now, "MMMM 'de' yyyy", { locale: ptBR })

  const [fixed, occasional] = await Promise.all([
    db
      .select({ type: fixedEntries.type, amount: fixedEntries.amount })
      .from(fixedEntries)
      .where(
        and(
          eq(fixedEntries.userId, session.user.id),
          eq(fixedEntries.isActive, true),
          lte(fixedEntries.startMonth, monthStr),
          or(isNull(fixedEntries.endMonth), gte(fixedEntries.endMonth, monthStr)),
          lte(fixedEntries.dayOfMonth, today),
        ),
      ),
    db
      .select({ type: occasionalEntries.type, amount: occasionalEntries.amount })
      .from(occasionalEntries)
      .where(
        and(
          eq(occasionalEntries.userId, session.user.id),
          gte(occasionalEntries.date, new Date(year, month - 1, 1)),
          lte(occasionalEntries.date, new Date(year, month - 1, today, 23, 59, 59)),
        ),
      ),
  ])

  let totalIncome = 0
  let totalExpenses = 0
  for (const e of [...fixed, ...occasional]) {
    const a = parseFloat(e.amount)
    if (e.type === "income") totalIncome += a
    else totalExpenses += a
  }
  const netBalance = totalIncome - totalExpenses

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-xl font-semibold capitalize text-zinc-900 dark:text-zinc-50">
          {monthLabel}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">Resumo parcial até o dia {today}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard label="Receitas" value={totalIncome} variant="income" />
        <SummaryCard label="Gastos" value={totalExpenses} variant="expense" />
        <SummaryCard label="Saldo" value={netBalance} variant={netBalance >= 0 ? "positive" : "negative"} />
      </div>

      {/* Barra de progresso gastos vs receitas */}
      {totalIncome > 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Gastos vs Receitas</span>
            <span className="text-xs text-zinc-400">
              {Math.min(100, Math.round((totalExpenses / totalIncome) * 100))}% comprometido
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                totalExpenses / totalIncome > 0.9
                  ? "bg-red-500"
                  : totalExpenses / totalIncome > 0.7
                    ? "bg-amber-400"
                    : "bg-emerald-500",
              )}
              style={{ width: `${Math.min(100, (totalExpenses / totalIncome) * 100)}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-zinc-400">
            <span>{formatCurrency(totalExpenses)} gastos</span>
            <span>{formatCurrency(totalIncome)} de receita</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <QuickLink href="/entries" label="Gerenciar lançamentos" description="Fixos e ocasionais" icon={LayoutList} />
        <QuickLink href="/report" label="Ver relatório parcial" description="Com gráficos por categoria" icon={BarChart2} />
      </div>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  variant,
}: {
  label: string
  value: number
  variant: "income" | "expense" | "positive" | "negative"
}) {
  const colorMap = {
    income: "text-emerald-600 dark:text-emerald-400",
    expense: "text-red-500 dark:text-red-400",
    positive: "text-emerald-600 dark:text-emerald-400",
    negative: "text-red-500 dark:text-red-400",
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className={cn("mt-2 text-2xl font-semibold tabular-nums", colorMap[variant])}>
        {formatCurrency(value)}
      </p>
    </div>
  )
}

function QuickLink({
  href,
  label,
  description,
  icon: Icon,
}: {
  href: string
  label: string
  description: string
  icon: React.ElementType
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
    >
      <div className="flex items-center gap-4">
        <div className="flex size-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
          <Icon className="size-5 text-zinc-600 dark:text-zinc-400" />
        </div>
        <div>
          <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-50">{label}</span>
          <span className="text-sm text-zinc-500">{description}</span>
        </div>
      </div>
      <ArrowRight className="size-4 text-zinc-300 transition-transform group-hover:translate-x-1 dark:text-zinc-600" />
    </Link>
  )
}

