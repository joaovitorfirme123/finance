"use client"

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { CategoryBreakdown } from "@/src/db/schema"
import { formatCurrency } from "@/lib/utils"

interface Props {
  expensesByCategory: CategoryBreakdown[]
  incomesByCategory: CategoryBreakdown[]
}

export function ReportCharts({ expensesByCategory, incomesByCategory }: Props) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {expensesByCategory.length > 0 && (
        <ChartCard title="Gastos por categoria" data={expensesByCategory} />
      )}
      {incomesByCategory.length > 0 && (
        <ChartCard title="Receitas por categoria" data={incomesByCategory} />
      )}
    </div>
  )
}

function ChartCard({ title, data }: { title: string; data: CategoryBreakdown[] }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-4 text-sm font-medium text-zinc-900 dark:text-zinc-50">{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} dataKey="total" nameKey="categoryName" cx="50%" cy="50%" outerRadius={80} label={false}>
            {data.map((entry) => (
              <Cell key={entry.categoryId} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            contentStyle={{ borderRadius: 8, fontSize: 13 }}
          />
          <Legend
            formatter={(value) => <span className="text-xs text-zinc-600 dark:text-zinc-400">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Breakdown list */}
      <div className="mt-4 flex flex-col gap-2">
        {data.map((item) => (
          <div key={item.categoryId} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
              <span className="size-2.5 rounded-full" style={{ background: item.color }} />
              {item.categoryName}
            </span>
            <span className="tabular-nums text-zinc-900 dark:text-zinc-50">
              {formatCurrency(item.total)}{" "}
              <span className="text-xs text-zinc-400">({item.percentage}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
