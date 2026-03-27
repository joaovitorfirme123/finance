"use server"

import { auth } from "@/src/auth"
import { db } from "@/src/db"
import { categories, fixedEntries } from "@/src/db/schema"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/

const fixedEntrySchema = z.object({
  categoryId: z.string().min(1, "Categoria obrigatória."),
  type: z.enum(["income", "expense"]),
  description: z.string().min(1, "Descrição obrigatória."),
  amount: z.number().positive("Valor deve ser positivo."),
  dayOfMonth: z.number().int().min(1).max(31),
  isActive: z.boolean().default(true),
  startMonth: z.string().regex(monthPattern, "Mês inicial inválido (use YYYY-MM)."),
  endMonth: z
    .string()
    .regex(monthPattern, "Mês final inválido (use YYYY-MM).")
    .nullable()
    .optional(),
})

// ─── List ─────────────────────────────────────────────────────────────────────

export async function listFixedEntriesAction() {
  const session = await auth()
  if (!session?.user?.id) return { error: "Não autenticado." }

  const data = await db
    .select({
      id: fixedEntries.id,
      type: fixedEntries.type,
      description: fixedEntries.description,
      amount: fixedEntries.amount,
      dayOfMonth: fixedEntries.dayOfMonth,
      isActive: fixedEntries.isActive,
      startMonth: fixedEntries.startMonth,
      endMonth: fixedEntries.endMonth,
      createdAt: fixedEntries.createdAt,
      updatedAt: fixedEntries.updatedAt,
      categoryId: categories.id,
      categoryName: categories.name,
      categoryColor: categories.color,
      categoryIcon: categories.icon,
    })
    .from(fixedEntries)
    .innerJoin(categories, eq(fixedEntries.categoryId, categories.id))
    .where(eq(fixedEntries.userId, session.user.id))
    .orderBy(fixedEntries.type, fixedEntries.description)

  return { data }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createFixedEntryAction(input: {
  categoryId: string
  type: "income" | "expense"
  description: string
  amount: number
  dayOfMonth: number
  isActive?: boolean
  startMonth: string
  endMonth?: string | null
}) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Não autenticado." }

  const parsed = fixedEntrySchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { amount, ...rest } = parsed.data

  const [created] = await db
    .insert(fixedEntries)
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

export async function updateFixedEntryAction(
  id: string,
  input: {
    categoryId: string
    type: "income" | "expense"
    description: string
    amount: number
    dayOfMonth: number
    isActive?: boolean
    startMonth: string
    endMonth?: string | null
  },
) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Não autenticado." }

  const parsed = fixedEntrySchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { amount, ...rest } = parsed.data

  const [updated] = await db
    .update(fixedEntries)
    .set({ amount: String(amount), updatedAt: new Date(), ...rest })
    .where(and(eq(fixedEntries.id, id), eq(fixedEntries.userId, session.user.id)))
    .returning()

  if (!updated) return { error: "Lançamento não encontrado." }

  revalidatePath("/entries")
  return { data: updated }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteFixedEntryAction(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Não autenticado." }

  const [deleted] = await db
    .delete(fixedEntries)
    .where(and(eq(fixedEntries.id, id), eq(fixedEntries.userId, session.user.id)))
    .returning({ id: fixedEntries.id })

  if (!deleted) return { error: "Lançamento não encontrado." }

  revalidatePath("/entries")
  return { success: true }
}
