"use client"

import { useState, useTransition } from "react"
import { Plus, Pencil, Trash2, Receipt, Tag, Repeat2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteFixedEntryAction } from "@/src/actions/fixed-entries"
import { deleteOccasionalEntryAction } from "@/src/actions/occasional-entries"
import { deleteCategoryAction } from "@/src/actions/categories"
import { formatCurrency, cn } from "@/lib/utils"
import { FixedEntryForm } from "./fixed-entry-form"
import { OccasionalEntryForm } from "./occasional-entry-form"
import { CategoryForm } from "./category-form"
import { toast } from "sonner"

type Category = { id: string; name: string; type: "income" | "expense"; color: string; icon: string | null; isSystem: boolean }

type FixedEntry = {
  id: string; type: "income" | "expense"; description: string; amount: string
  dayOfMonth: number; isActive: boolean; startMonth: string; endMonth: string | null
  categoryId: string; categoryName: string; categoryColor: string; categoryIcon: string | null
}

type OccasionalEntry = {
  id: string; type: "income" | "expense"; description: string; amount: string
  date: string; categoryId: string; categoryName: string; categoryColor: string; categoryIcon: string | null
}

interface Props {
  categories: Category[]
  fixedEntries: FixedEntry[]
  occasionalEntries: OccasionalEntry[]
}

type Tab = "fixed" | "occasional" | "categories"

export function EntriesClient({ categories, fixedEntries, occasionalEntries }: Props) {
  const [tab, setTab] = useState<Tab>("fixed")
  const [fixedFormOpen, setFixedFormOpen] = useState(false)
  const [occasionalFormOpen, setOccasionalFormOpen] = useState(false)
  const [categoryFormOpen, setCategoryFormOpen] = useState(false)
  const [editingFixed, setEditingFixed] = useState<FixedEntry | null>(null)
  const [editingOccasional, setEditingOccasional] = useState<OccasionalEntry | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isPending, startTransition] = useTransition()

  function openAddFixed() { setEditingFixed(null); setFixedFormOpen(true) }
  function openEditFixed(e: FixedEntry) { setEditingFixed(e); setFixedFormOpen(true) }
  function openAddOccasional() { setEditingOccasional(null); setOccasionalFormOpen(true) }
  function openEditOccasional(e: OccasionalEntry) { setEditingOccasional(e); setOccasionalFormOpen(true) }
  function openAddCategory() { setEditingCategory(null); setCategoryFormOpen(true) }
  function openEditCategory(c: Category) { setEditingCategory(c); setCategoryFormOpen(true) }

  function handleDeleteFixed(id: string) {
    if (!confirm("Remover este lançamento fixo?")) return
    startTransition(async () => {
      const result = await deleteFixedEntryAction(id)
      if (result?.error) toast.error(result.error)
      else toast.success("Lançamento removido.")
    })
  }

  function handleDeleteOccasional(id: string) {
    if (!confirm("Remover este lançamento?")) return
    startTransition(async () => {
      const result = await deleteOccasionalEntryAction(id)
      if (result?.error) toast.error(result.error)
      else toast.success("Lançamento removido.")
    })
  }

  function handleDeleteCategory(id: string) {
    if (!confirm("Remover esta categoria?")) return
    startTransition(async () => {
      const result = await deleteCategoryAction(id)
      if (result?.error) toast.error(result.error)
      else toast.success("Categoria removida.")
    })
  }

  function handleAddClick() {
    if (tab === "fixed") openAddFixed()
    else if (tab === "occasional") openAddOccasional()
    else openAddCategory()
  }

  const TAB_LABELS: Record<Tab, string> = { fixed: "Fixos", occasional: "Ocasionais", categories: "Categorias" }

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex rounded-lg border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-900">
          {(["fixed", "occasional", "categories"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                tab === t
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300",
              )}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={handleAddClick}>
          <Plus className="size-4" />
          Adicionar
        </Button>
      </div>

      {/* Fixed entries tab */}
      {tab === "fixed" && (
        <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          {fixedEntries.length === 0 ? (
            <EmptyState label="Nenhum lançamento fixo cadastrado." onAdd={openAddFixed} icon={Repeat2} />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <Th>Descrição</Th>
                  <Th>Categoria</Th>
                  <Th>Tipo</Th>
                  <Th>Valor</Th>
                  <Th>Dia</Th>
                  <Th>Ativo</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {fixedEntries.map((e) => (
                  <tr key={e.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                    <Td className="font-medium text-zinc-900 dark:text-zinc-50">{e.description}</Td>
                    <Td>
                      <span className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full" style={{ background: e.categoryColor }} />
                        {e.categoryName}
                      </span>
                    </Td>
                    <Td><TypeBadge type={e.type} /></Td>
                    <Td className="tabular-nums">{formatCurrency(e.amount)}</Td>
                    <Td>Dia {e.dayOfMonth}</Td>
                    <Td>
                      <span className={cn("text-xs font-medium", e.isActive ? "text-emerald-600" : "text-zinc-400")}>
                        {e.isActive ? "Sim" : "Não"}
                      </span>
                    </Td>
                    <Td>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEditFixed(e)} className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                          <Pencil className="size-3.5 text-zinc-400" />
                        </button>
                        <button onClick={() => handleDeleteFixed(e.id)} disabled={isPending} className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                          <Trash2 className="size-3.5 text-zinc-400" />
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Occasional entries tab */}
      {tab === "occasional" && (
        <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          {occasionalEntries.length === 0 ? (
            <EmptyState label="Nenhum lançamento ocasional este mês." onAdd={openAddOccasional} icon={Receipt} />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <Th>Descrição</Th>
                  <Th>Categoria</Th>
                  <Th>Tipo</Th>
                  <Th>Valor</Th>
                  <Th>Data</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {occasionalEntries.map((e) => (
                  <tr key={e.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                    <Td className="font-medium text-zinc-900 dark:text-zinc-50">{e.description}</Td>
                    <Td>
                      <span className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full" style={{ background: e.categoryColor }} />
                        {e.categoryName}
                      </span>
                    </Td>
                    <Td><TypeBadge type={e.type} /></Td>
                    <Td className="tabular-nums">{formatCurrency(e.amount)}</Td>
                    <Td>{new Date(e.date + "T00:00:00").toLocaleDateString("pt-BR")}</Td>
                    <Td>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEditOccasional(e)} className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                          <Pencil className="size-3.5 text-zinc-400" />
                        </button>
                        <button onClick={() => handleDeleteOccasional(e.id)} disabled={isPending} className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                          <Trash2 className="size-3.5 text-zinc-400" />
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Categories tab */}
      {tab === "categories" && (
        <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          {categories.length === 0 ? (
            <EmptyState label="Nenhuma categoria encontrada." onAdd={openAddCategory} icon={Tag} />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <Th>Nome</Th>
                  <Th>Tipo</Th>
                  <Th>Cor</Th>
                  <Th>Origem</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                    <Td className="font-medium text-zinc-900 dark:text-zinc-50">{c.name}</Td>
                    <Td><TypeBadge type={c.type} /></Td>
                    <Td>
                      <span className="flex items-center gap-2">
                        <span className="size-4 rounded-full border border-zinc-200" style={{ background: c.color }} />
                        <span className="text-xs text-zinc-400">{c.color}</span>
                      </span>
                    </Td>
                    <Td>
                      <span className={cn("text-xs font-medium", c.isSystem ? "text-zinc-400" : "text-zinc-700 dark:text-zinc-300")}>
                        {c.isSystem ? "Sistema" : "Minha"}
                      </span>
                    </Td>
                    <Td>
                      {!c.isSystem && (
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEditCategory(c)} className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                            <Pencil className="size-3.5 text-zinc-400" />
                          </button>
                          <button onClick={() => handleDeleteCategory(c.id)} disabled={isPending} className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                            <Trash2 className="size-3.5 text-zinc-400" />
                          </button>
                        </div>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modals */}
      {fixedFormOpen && (
        <FixedEntryForm
          categories={categories}
          entry={editingFixed}
          onClose={() => setFixedFormOpen(false)}
        />
      )}
      {occasionalFormOpen && (
        <OccasionalEntryForm
          categories={categories}
          entry={editingOccasional}
          onClose={() => setOccasionalFormOpen(false)}
        />
      )}
      {categoryFormOpen && (
        <CategoryForm
          entry={editingCategory}
          onClose={() => setCategoryFormOpen(false)}
        />
      )}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">{children}</th>
}

function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 text-zinc-600 dark:text-zinc-400", className)}>{children}</td>
}

function TypeBadge({ type }: { type: "income" | "expense" }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium",
        type === "income"
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
          : "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400",
      )}
    >
      {type === "income" ? "Receita" : "Gasto"}
    </span>
  )
}

function EmptyState({ label, onAdd, icon: Icon }: { label: string; onAdd: () => void; icon: React.ElementType }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
        <Icon className="size-5 text-zinc-400" />
      </div>
      <p className="text-sm text-zinc-500">{label}</p>
      <Button size="sm" variant="outline" onClick={onAdd}>
        <Plus className="size-4" />
        Adicionar
      </Button>
    </div>
  )
}



