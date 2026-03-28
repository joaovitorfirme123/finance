"use client"

import { useState } from "react"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { CategoryBreakdown } from "@/src/db/schema"
import { formatCurrency, cn } from "@/lib/utils"
import { ChevronDown, ChevronUp } from "lucide-react"

type Report = {
  id: string
  month: number
  year: number
  status: "partial" | "final"
  totalIncome: number
  totalExpenses: number
  netBalance: number
  monthLabel: string
  expensesByCategory: CategoryBreakdown[]
  incomesByCategory: CategoryBreakdown[]
}

export function HistoryClient({ reports }: { reports: Report[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(reports[0]?.id ?? null)

  // Group by year, descending
  const byYear = reports.reduce<Record<number, Report[]>>((acc, r) => {
    ;(acc[r.year] ??= []).push(r)
    return acc
  }, {})
  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a)

  return (
    <div className="flex flex-col gap-8">
      {years.map((year) => (
        <div key={year} className="flex flex-col gap-3">
          <h3 className="text-sm font-medium text-zinc-400">{year}</h3>
          {byYear[year].map((report) => {
            const isOpen = expandedId === report.id
            return (
          <div key={report.id} className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            {/* Header */}
            <button
              className="flex w-full items-center justify-between px-6 py-4"
              onClick={() => setExpandedId(isOpen ? null : report.id)}
            >
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium capitalize text-zinc-900 dark:text-zinc-50">
                  {report.monthLabel}
                </span>
                <span className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  report.status === "final"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                )}>
                  {report.status === "final" ? "Final" : "Parcial"}
                </span>
              </div>
              <div className="flex items-center gap-6">
                <div className="hidden text-right sm:block">
                  <p className="text-xs text-zinc-400">Saldo</p>
                  <p className={cn("text-sm font-semibold tabular-nums", report.netBalance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500")}>
                    {formatCurrency(report.netBalance)}
                  </p>
                </div>
                {isOpen ? <ChevronUp className="size-4 text-zinc-400" /> : <ChevronDown className="size-4 text-zinc-400" />}
              </div>
            </button>

            {/* Expanded */}
            {isOpen && (
              <div className="border-t border-zinc-100 px-6 pb-6 pt-4 dark:border-zinc-800">
                {/* Totais */}
                <div className="mb-6 grid grid-cols-3 gap-4">
                  <MiniStat label="Receitas" value={report.totalIncome} color="text-emerald-600 dark:text-emerald-400" />
                  <MiniStat label="Gastos" value={report.totalExpenses} color="text-red-500 dark:text-red-400" />
                  <MiniStat label="Saldo" value={report.netBalance} color={report.netBalance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"} />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {report.expensesByCategory.length > 0 && (
                    <MiniChart title="Gastos" data={report.expensesByCategory} />
                  )}
                  {report.incomesByCategory.length > 0 && (
                    <MiniChart title="Receitas" data={report.incomesByCategory} />
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
        </div>
      ))}
    </div>
  )
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <p className="text-xs text-zinc-400">{label}</p>
      <p className={cn("mt-1 text-sm font-semibold tabular-nums", color)}>{formatCurrency(value)}</p>
    </div>
  )
}

function MiniChart({ title, data }: { title: string; data: CategoryBreakdown[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-zinc-500">{title} por categoria</p>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie data={data} dataKey="total" nameKey="categoryName" cx="50%" cy="50%" outerRadius={60} label={false}>
            {data.map((entry) => (
              <Cell key={entry.categoryId} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
          <Legend formatter={(v) => <span className="text-xs text-zinc-500">{v}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
