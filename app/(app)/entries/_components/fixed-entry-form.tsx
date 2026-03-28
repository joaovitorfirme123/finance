"use client"

import { useState, useTransition, useMemo } from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { createFixedEntryAction, updateFixedEntryAction } from "@/src/actions/fixed-entries"
import { toast } from "sonner"

type Category = { id: string; name: string; type: "income" | "expense"; color: string; icon: string | null }

type FixedEntry = {
  id: string; type: "income" | "expense"; description: string; amount: string
  dayOfMonth: number; isActive: boolean; startMonth: string; endMonth: string | null
  categoryId: string; categoryName: string; categoryColor: string; categoryIcon: string | null
}

interface Props {
  categories: Category[]
  entry: FixedEntry | null
  onClose: () => void
}

export function FixedEntryForm({ categories, entry, onClose }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [type, setType] = useState<"income" | "expense">(entry?.type ?? "expense")
  const [description, setDescription] = useState(entry?.description ?? "")
  const [categoryId, setCategoryId] = useState(entry?.categoryId ?? "")
  const [amount, setAmount] = useState(entry ? parseFloat(entry.amount).toFixed(2) : "")
  const [dayOfMonth, setDayOfMonth] = useState(String(entry?.dayOfMonth ?? ""))
  const [startMonth, setStartMonth] = useState(entry?.startMonth ?? currentMonth())
  const [endMonth, setEndMonth] = useState(entry?.endMonth ?? "")
  const [isActive, setIsActive] = useState(entry?.isActive ?? true)

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type],
  )

  function handleTypeChange(newType: "income" | "expense") {
    setType(newType)
    setCategoryId("") // reset category when type changes
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const input = {
      type,
      description,
      categoryId,
      amount: parseFloat(amount),
      dayOfMonth: parseInt(dayOfMonth),
      isActive,
      startMonth,
      endMonth: endMonth || null,
    }

    startTransition(async () => {
      const result = entry
        ? await updateFixedEntryAction(entry.id, input)
        : await createFixedEntryAction(input)

      if (result.error) setError(result.error)
      else {
        toast.success(entry ? "Lançamento atualizado!" : "Lançamento criado!")
        onClose()
      }
    })
  }

  return (
    <Modal title={entry ? "Editar lançamento fixo" : "Novo lançamento fixo"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
            {error}
          </p>
        )}

        {/* Tipo */}
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Tipo</span>
          <div className="flex gap-2">
            {(["expense", "income"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTypeChange(t)}
                className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                  type === t
                    ? t === "income"
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      : "border-red-300 bg-red-50 text-red-600 dark:border-red-700 dark:bg-red-950 dark:text-red-400"
                    : "border-zinc-200 bg-white text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
                }`}
              >
                {t === "income" ? "Receita" : "Gasto"}
              </button>
            ))}
          </div>
        </div>

        <Input id="description" label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Aluguel" required />

        <Select id="category" label="Categoria" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
          <option value="">Selecione...</option>
          {filteredCategories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-3">
          <Input id="amount" label="Valor (R$)" type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" required />
          <Input id="dayOfMonth" label="Dia do mês" type="number" min="1" max="31" value={dayOfMonth} onChange={(e) => setDayOfMonth(e.target.value)} placeholder="1" required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input id="startMonth" label="Mês inicial" type="month" value={startMonth} onChange={(e) => setStartMonth(e.target.value)} required />
          <Input id="endMonth" label="Mês final (opcional)" type="month" value={endMonth} onChange={(e) => setEndMonth(e.target.value)} />
        </div>

        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="accent-zinc-900" />
          Ativo
        </label>

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button type="submit" className="flex-1" disabled={isPending}>
            {isPending ? "Salvando…" : "Salvar"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md animate-in fade-in zoom-in-95 duration-150 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
          <button onClick={onClose} className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <X className="size-4 text-zinc-500" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function currentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}
