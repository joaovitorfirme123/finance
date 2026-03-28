/**
 * Seed — categorias do sistema (userId = null)
 * Seguro para rodar múltiplas vezes: usa ON CONFLICT DO NOTHING.
 *
 * Rodar: npm run db:seed
 */

import { config } from "dotenv"
config({ path: ".env.local" })

import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { sql } from "drizzle-orm"
import * as schema from "./schema"

const client = neon(process.env.DATABASE_URL!)
const db = drizzle(client, { schema })

const SYSTEM_CATEGORIES: Array<{
  id: string
  name: string
  type: "income" | "expense"
  color: string
  icon: string | null
}> = [
  // ── Receitas ──────────────────────────────────────────────────
  { id: "sys_salario",        name: "Salário",        type: "income",  color: "#4ade80", icon: null },
  { id: "sys_freelance",      name: "Freelance",      type: "income",  color: "#60a5fa", icon: null },
  { id: "sys_investimentos",  name: "Investimentos",  type: "income",  color: "#facc15", icon: null },
  { id: "sys_outros_rec",     name: "Outras receitas",type: "income",  color: "#94a3b8", icon: null },

  // ── Gastos ────────────────────────────────────────────────────
  { id: "sys_moradia",        name: "Moradia",        type: "expense", color: "#fb923c", icon: null },
  { id: "sys_alimentacao",    name: "Alimentação",    type: "expense", color: "#f87171", icon: null },
  { id: "sys_transporte",     name: "Transporte",     type: "expense", color: "#38bdf8", icon: null },
  { id: "sys_saude",          name: "Saúde",          type: "expense", color: "#34d399", icon: null },
  { id: "sys_educacao",       name: "Educação",       type: "expense", color: "#a78bfa", icon: null },
  { id: "sys_lazer",          name: "Lazer",          type: "expense", color: "#f472b6", icon: null },
  { id: "sys_contas",         name: "Contas",         type: "expense", color: "#fbbf24", icon: null },
  { id: "sys_outros_gasto",   name: "Outros gastos",  type: "expense", color: "#cbd5e1", icon: null },
]

async function seed() {
  console.log("🌱 Inserindo categorias do sistema...")

  for (const cat of SYSTEM_CATEGORIES) {
    await db.execute(
      sql`INSERT INTO categories (id, user_id, name, type, color, icon, created_at)
          VALUES (${cat.id}, NULL, ${cat.name}, ${cat.type}, ${cat.color}, ${cat.icon}, NOW())
          ON CONFLICT (id) DO NOTHING`
    )
    console.log(`  ✓ ${cat.name}`)
  }

  console.log("✅ Seed concluído.")
  process.exit(0)
}

seed().catch((err) => {
  console.error("❌ Erro no seed:", err)
  process.exit(1)
})
