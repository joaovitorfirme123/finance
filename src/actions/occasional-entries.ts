"use server"

import { auth } from "@/src/auth"
import { db } from "@/src/db"
import { categories, occasionalEntries } from "@/src/db/schema"
import { and, eq, gte, lte } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const occasionalEntrySchema = z.object({
  categoryId: z.string().min(1, "Categoria obrigatória."),
  type: z.enum(["income", "expense"]),
  description: z.string().min(1, "Descrição obrigatória."),
  amount: z.number().positive("Valor deve ser positivo."),
  date: z.coerce.date(),
})

// ─── List ─────────────────────────────────────────────────────────────────────

export async function listOccasionalEntriesAction(filters?: { year: number; month: number }) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Não autenticado." }

  const conditions = [eq(occasionalEntries.userId, session.user.id)]

  if (filters) {
    const start = new Date(filters.year, filters.month - 1, 1)
    const end = new Date(filters.year, filters.month, 0, 23, 59, 59)
    conditions.push(gte(occasionalEntries.date, start))
    conditions.push(lte(occasionalEntries.date, end))
  }

  const data = await db
    .select({
      id: occasionalEntries.id,
      type: occasionalEntries.type,
      description: occasionalEntries.description,
      amount: occasionalEntries.amount,
      date: occasionalEntries.date,
      createdAt: occasionalEntries.createdAt,
      updatedAt: occasionalEntries.updatedAt,
      categoryId: categories.id,
      categoryName: categories.name,
      categoryColor: categories.color,
      categoryIcon: categories.icon,
    })
    .from(occasionalEntries)
    .innerJoin(categories, eq(occasionalEntries.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(occasionalEntries.date)

  return { data }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createOccasionalEntryAction(input: {
  categoryId: string
  type: "income" | "expense"
  description: string
  amount: number
  date: Date | string
}) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Não autenticado." }

  const parsed = occasionalEntrySchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { amount, ...rest } = parsed.data

  const [created] = await db
    .insert(occasionalEntries)
    .values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      amount: String(amount),
      ...rest,
    })
    .returning()

  revalidatePath("/entries")
  return { data: created }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateOccasionalEntryAction(
  id: string,
  input: {
    categoryId: string
    type: "income" | "expense"
    description: string
    amount: number
    date: Date | string
  },
) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Não autenticado." }

  const parsed = occasionalEntrySchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { amount, ...rest } = parsed.data

  const [updated] = await db
    .update(occasionalEntries)
    .set({ amount: String(amount), updatedAt: new Date(), ...rest })
    .where(and(eq(occasionalEntries.id, id), eq(occasionalEntries.userId, session.user.id)))
    .returning()

  if (!updated) return { error: "Lançamento não encontrado." }

  revalidatePath("/entries")
  return { data: updated }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteOccasionalEntryAction(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Não autenticado." }

  const [deleted] = await db
    .delete(occasionalEntries)
    .where(and(eq(occasionalEntries.id, id), eq(occasionalEntries.userId, session.user.id)))
    .returning({ id: occasionalEntries.id })

  if (!deleted) return { error: "Lançamento não encontrado." }

  revalidatePath("/entries")
  return { success: true }
}
