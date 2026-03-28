"use server"

import { auth } from "@/src/auth"
import { db } from "@/src/db"
import { categories, fixedEntries, occasionalEntries } from "@/src/db/schema"
import { and, count, eq, isNull, or } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const categorySchema = z.object({
  name: z.string().min(1, "Nome obrigatório."),
  type: z.enum(["income", "expense"]),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida (use formato #RRGGBB)."),
  icon: z.string().optional(),
})

// ─── List ─────────────────────────────────────────────────────────────────────

export async function listCategoriesAction() {
  const session = await auth()
  if (!session?.user?.id) return { error: "Não autenticado." }

  const data = await db
    .select()
    .from(categories)
    .where(or(eq(categories.userId, session.user.id), isNull(categories.userId)))
    .orderBy(categories.type, categories.name)

  return { data }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createCategoryAction(input: {
  name: string
  type: "income" | "expense"
  color: string
  icon?: string
}) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Não autenticado." }

  const parsed = categorySchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const [created] = await db
    .insert(categories)
    .values({ id: crypto.randomUUID(), userId: session.user.id, ...parsed.data })
    .returning()

  revalidatePath("/entries")
  return { data: created }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateCategoryAction(
  id: string,
  input: { name: string; type: "income" | "expense"; color: string; icon?: string },
) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Não autenticado." }

  const parsed = categorySchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const [updated] = await db
    .update(categories)
    .set(parsed.data)
    .where(and(eq(categories.id, id), eq(categories.userId, session.user.id)))
    .returning()

  if (!updated) return { error: "Categoria não encontrada." }

  revalidatePath("/entries")
  return { data: updated }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteCategoryAction(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Não autenticado." }

  // Verificar se há lançamentos vinculados
  const [fixedCount] = await db
    .select({ n: count() })
    .from(fixedEntries)
    .where(eq(fixedEntries.categoryId, id))
  const [occasionalCount] = await db
    .select({ n: count() })
    .from(occasionalEntries)
    .where(eq(occasionalEntries.categoryId, id))

  if (Number(fixedCount.n) + Number(occasionalCount.n) > 0)
    return { error: "Esta categoria possui lançamentos vinculados e não pode ser removida." }

  const [deleted] = await db
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, session.user.id)))
    .returning({ id: categories.id })

  if (!deleted) return { error: "Categoria não encontrada." }

  revalidatePath("/entries")
  return { success: true }
}
