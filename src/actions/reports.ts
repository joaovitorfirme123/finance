"use server"

import { auth } from "@/src/auth"
import { db } from "@/src/db"
import { categories, fixedEntries, monthlyReports, occasionalEntries } from "@/src/db/schema"
import type { CategoryBreakdown } from "@/src/db/schema"
import { and, eq, gte, isNull, lte, ne, or } from "drizzle-orm"

// ─── List ─────────────────────────────────────────────────────────────────────

export async function listReportsAction() {
  const session = await auth()
  if (!session?.user?.id) return { error: "Não autenticado." }

  const data = await db
    .select()
    .from(monthlyReports)
    .where(eq(monthlyReports.userId, session.user.id))
    .orderBy(monthlyReports.year, monthlyReports.month)

  return { data }
}

// ─── Generate (partial or final) ─────────────────────────────────────────────

export async function generatePartialReportAction(year: number, month: number) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Não autenticado." }
  return generateReport(session.user.id, year, month, "partial")
}

export async function generateFinalReportAction(year: number, month: number) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Não autenticado." }
  return generateReport(session.user.id, year, month, "final")
}

// Finaliza todos os relatórios parciais de meses passados do usuário autenticado
export async function finalizePastReportsAction() {
  const session = await auth()
  if (!session?.user?.id) return { error: "Não autenticado." }
  return finalizePastReportsForUser(session.user.id)
}

// Finaliza relatórios parciais de meses passados para um userId específico (uso interno/cron)
export async function finalizePastReportsForUser(userId: string) {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const partialReports = await db
    .select({ year: monthlyReports.year, month: monthlyReports.month })
    .from(monthlyReports)
    .where(
      and(
        eq(monthlyReports.userId, userId),
        ne(monthlyReports.status, "final"),
      ),
    )

  const pastPartial = partialReports.filter(
    (r) => r.year < currentYear || (r.year === currentYear && r.month < currentMonth),
  )

  for (const { year, month } of pastPartial) {
    await generateReport(userId, year, month, "final")
  }

  return { finalized: pastPartial.length }
}

// ─── Core logic ───────────────────────────────────────────────────────────────

async function generateReport(
  userId: string,
  year: number,
  month: number,
  status: "partial" | "final",
) {
  // YYYY-MM usado para comparar com startMonth/endMonth (funciona lexicograficamente)
  const monthStr = `${year}-${String(month).padStart(2, "0")}`

  // Para parcial: considera só até o dia atual; para final: até o último dia do mês
  const lastDayOfMonth = new Date(year, month, 0).getDate()
  const cutoffDay = status === "partial" ? new Date().getDate() : lastDayOfMonth

  const referenceStartDate = new Date(year, month - 1, 1)
  const referenceEndDate = new Date(year, month - 1, cutoffDay, 23, 59, 59)

  // ── Lançamentos fixos ativos para este mês ──────────────────────────────────
  const fixed = await db
    .select({
      type: fixedEntries.type,
      amount: fixedEntries.amount,
      categoryId: fixedEntries.categoryId,
      categoryName: categories.name,
      color: categories.color,
    })
    .from(fixedEntries)
    .innerJoin(categories, eq(fixedEntries.categoryId, categories.id))
    .where(
      and(
        eq(fixedEntries.userId, userId),
        eq(fixedEntries.isActive, true),
        lte(fixedEntries.startMonth, monthStr),
        or(isNull(fixedEntries.endMonth), gte(fixedEntries.endMonth, monthStr)),
        lte(fixedEntries.dayOfMonth, cutoffDay),
      ),
    )

  // ── Lançamentos ocasionais do período ──────────────────────────────────────
  const occasional = await db
    .select({
      type: occasionalEntries.type,
      amount: occasionalEntries.amount,
      categoryId: occasionalEntries.categoryId,
      categoryName: categories.name,
      color: categories.color,
    })
    .from(occasionalEntries)
    .innerJoin(categories, eq(occasionalEntries.categoryId, categories.id))
    .where(
      and(
        eq(occasionalEntries.userId, userId),
        gte(occasionalEntries.date, referenceStartDate),
        lte(occasionalEntries.date, referenceEndDate),
      ),
    )

  // ── Agregação ──────────────────────────────────────────────────────────────
  const allEntries = [...fixed, ...occasional]
  let totalIncome = 0
  let totalExpenses = 0

  const expMap: Record<string, { name: string; color: string; total: number }> = {}
  const incMap: Record<string, { name: string; color: string; total: number }> = {}

  for (const entry of allEntries) {
    const amount = parseFloat(entry.amount)

    if (entry.type === "income") {
      totalIncome += amount
      incMap[entry.categoryId] ??= { name: entry.categoryName, color: entry.color, total: 0 }
      incMap[entry.categoryId].total += amount
    } else {
      totalExpenses += amount
      expMap[entry.categoryId] ??= { name: entry.categoryName, color: entry.color, total: 0 }
      expMap[entry.categoryId].total += amount
    }
  }

  const netBalance = totalIncome - totalExpenses

  const toBreakdown = (
    map: Record<string, { name: string; color: string; total: number }>,
    grandTotal: number,
  ): CategoryBreakdown[] =>
    Object.entries(map).map(([categoryId, { name, color, total }]) => ({
      categoryId,
      categoryName: name,
      color,
      total,
      percentage: grandTotal > 0 ? Math.round((total / grandTotal) * 10000) / 100 : 0,
    }))

  const expBreakdown = toBreakdown(expMap, totalExpenses)
  const incBreakdown = toBreakdown(incMap, totalIncome)

  // ── Upsert ─────────────────────────────────────────────────────────────────
  const [existing] = await db
    .select({ id: monthlyReports.id })
    .from(monthlyReports)
    .where(
      and(
        eq(monthlyReports.userId, userId),
        eq(monthlyReports.year, year),
        eq(monthlyReports.month, month),
      ),
    )
    .limit(1)

  const reportData = {
    status,
    totalIncome: String(totalIncome),
    totalExpenses: String(totalExpenses),
    netBalance: String(netBalance),
    expensesByCategory: JSON.stringify(expBreakdown),
    incomesByCategory: JSON.stringify(incBreakdown),
    referenceStartDate,
    referenceEndDate,
    generatedAt: new Date(),
  }

  if (existing) {
    await db.update(monthlyReports).set(reportData).where(eq(monthlyReports.id, existing.id))
  } else {
    await db.insert(monthlyReports).values({
      id: crypto.randomUUID(),
      userId,
      year,
      month,
      ...reportData,
    })
  }

  return { success: true }
}
