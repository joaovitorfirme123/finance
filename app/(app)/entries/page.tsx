import { auth } from "@/src/auth"
import { redirect } from "next/navigation"
import { listCategoriesAction } from "@/src/actions/categories"
import { listFixedEntriesAction } from "@/src/actions/fixed-entries"
import { listOccasionalEntriesAction } from "@/src/actions/occasional-entries"
import { EntriesClient } from "./_components/entries-client"
import { format } from "date-fns"

export default async function EntriesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const now = new Date()

  const [categoriesResult, fixedResult, occasionalResult] = await Promise.all([
    listCategoriesAction(),
    listFixedEntriesAction(),
    listOccasionalEntriesAction({ year: now.getFullYear(), month: now.getMonth() + 1 }),
  ])

  const categories = (categoriesResult.data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type,
    color: c.color,
    icon: c.icon,
    isSystem: c.userId === null,
  }))

  const fixedEntries = (fixedResult.data ?? []).map((e) => ({
    id: e.id,
    type: e.type,
    description: e.description,
    amount: e.amount,
    dayOfMonth: e.dayOfMonth,
    isActive: e.isActive,
    startMonth: e.startMonth,
    endMonth: e.endMonth,
    categoryId: e.categoryId,
    categoryName: e.categoryName,
    categoryColor: e.categoryColor,
    categoryIcon: e.categoryIcon,
  }))

  const occasionalEntries = (occasionalResult.data ?? []).map((e) => ({
    id: e.id,
    type: e.type,
    description: e.description,
    amount: e.amount,
    date: format(e.date, "yyyy-MM-dd"),
    categoryId: e.categoryId,
    categoryName: e.categoryName,
    categoryColor: e.categoryColor,
    categoryIcon: e.categoryIcon,
  }))

  return (
    <EntriesClient
      categories={categories}
      fixedEntries={fixedEntries}
      occasionalEntries={occasionalEntries}
    />
  )
}

