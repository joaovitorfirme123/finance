import { auth } from "@/src/auth"
import { redirect } from "next/navigation"
import { listReportsAction, finalizePastReportsAction } from "@/src/actions/reports"
import { formatCurrency } from "@/lib/utils"
import type { CategoryBreakdown } from "@/src/db/schema"
import { HistoryClient } from "./_components/history-client"

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

export default async function HistoryPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  // Finaliza automaticamente qualquer relatório parcial de meses anteriores
  await finalizePastReportsAction()

  const { data: rawReports } = await listReportsAction()

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  // Exclui o mês atual (está no /report)
  const reports = (rawReports ?? [])
    .filter((r) => !(r.year === currentYear && r.month === currentMonth))
    .reverse()
    .map((r) => ({
      id: r.id,
      month: r.month,
      year: r.year,
      status: r.status,
      totalIncome: parseFloat(r.totalIncome),
      totalExpenses: parseFloat(r.totalExpenses),
      netBalance: parseFloat(r.netBalance),
      monthLabel: `${MONTH_NAMES[r.month - 1]} ${r.year}`,
      expensesByCategory: JSON.parse(r.expensesByCategory) as CategoryBreakdown[],
      incomesByCategory: JSON.parse(r.incomesByCategory) as CategoryBreakdown[],
    }))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Histórico</h2>
        <p className="mt-1 text-sm text-zinc-500">Relatórios mensais anteriores</p>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500">Nenhum relatório anterior encontrado.</p>
        </div>
      ) : (
        <HistoryClient reports={reports} />
      )}
    </div>
  )
}

