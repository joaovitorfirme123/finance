import { auth } from "@/src/auth"
import { redirect } from "next/navigation"
import { generatePartialReportAction, listReportsAction } from "@/src/actions/reports"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { CategoryBreakdown } from "@/src/db/schema"
import { ReportCharts } from "./_components/report-charts"

export default async function ReportPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  // Gera/atualiza o relatório parcial antes de exibir
  await generatePartialReportAction(year, month)

  const { data: reports } = await listReportsAction()
  const report = reports?.find((r) => r.year === year && r.month === month)

  const monthLabel = format(now, "MMMM 'de' yyyy", { locale: ptBR })

  const expensesByCategory: CategoryBreakdown[] = report
    ? JSON.parse(report.expensesByCategory)
    : []
  const incomesByCategory: CategoryBreakdown[] = report
    ? JSON.parse(report.incomesByCategory)
    : []

  const totalIncome = parseFloat(report?.totalIncome ?? "0")
  const totalExpenses = parseFloat(report?.totalExpenses ?? "0")
  const netBalance = parseFloat(report?.netBalance ?? "0")

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-xl font-semibold capitalize text-zinc-900 dark:text-zinc-50">
          Relatório parcial — {monthLabel}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Atualizado em {format(now, "dd/MM/yyyy 'às' HH:mm")}
        </p>
      </div>

      {/* Totais */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Receitas" value={totalIncome} color="text-emerald-600 dark:text-emerald-400" />
        <StatCard label="Gastos" value={totalExpenses} color="text-red-500 dark:text-red-400" />
        <StatCard
          label="Saldo"
          value={netBalance}
          color={netBalance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}
        />
      </div>

      {/* Gráficos */}
      {(expensesByCategory.length > 0 || incomesByCategory.length > 0) ? (
        <ReportCharts
          expensesByCategory={expensesByCategory}
          incomesByCategory={incomesByCategory}
        />
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500">Nenhum lançamento encontrado para este mês.</p>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className={`mt-2 text-2xl font-semibold tabular-nums ${color}`}>
        {formatCurrency(value)}
      </p>
    </div>
  )
}

