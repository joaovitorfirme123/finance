import { db } from "@/src/db"
import { monthlyReports } from "@/src/db/schema"
import { and, ne } from "drizzle-orm"
import { finalizePastReportsForUser } from "@/src/actions/reports"
import { NextRequest } from "next/server"

// Autenticação por Bearer token (CRON_SECRET)
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) return false
  return authHeader === `Bearer ${cronSecret}`
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  // Buscar todos userIds que têm relatórios parciais de meses passados
  const partialRows = await db
    .selectDistinct({ userId: monthlyReports.userId })
    .from(monthlyReports)
    .where(and(ne(monthlyReports.status, "final")))

  const results: Array<{ userId: string; finalized: number }> = []

  for (const { userId } of partialRows) {
    const result = await finalizePastReportsForUser(userId)
    if ("finalized" in result && result.finalized > 0) {
      results.push({ userId, finalized: result.finalized })
    }
  }

  const totalFinalized = results.reduce((acc, r) => acc + r.finalized, 0)

  console.log(`[cron/finalize-reports] ${now.toISOString()} — finalizados ${totalFinalized} relatório(s) para ${results.length} usuário(s)`)

  return Response.json({
    ok: true,
    processedUsers: results.length,
    totalFinalized,
    runAt: now.toISOString(),
  })
}
