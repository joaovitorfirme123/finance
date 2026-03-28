"use client"

import { useState, useTransition, useMemo } from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { createOccasionalEntryAction, updateOccasionalEntryAction } from "@/src/actions/occasional-entries"
import { format } from "date-fns"
import { toast } from "sonner"

type Category = { id: string; name: string; type: "income" | "expense"; color: string; icon: string | null }

type OccasionalEntry = {
  id: string; type: "income" | "expense"; description: string; amount: string
  date: string; categoryId: string; categoryName: string; categoryColor: string; categoryIcon: string | null
}

interface Props {
  categories: Category[]
  entry: OccasionalEntry | null
  onClose: () => void
}

export function OccasionalEntryForm({ categories, entry, onClose }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [type, setType] = useState<"income" | "expense">(entry?.type ?? "expense")
  const [description, setDescription] = useState(entry?.description ?? "")
  const [categoryId, setCategoryId] = useState(entry?.categoryId ?? "")
  const [amount, setAmount] = useState(entry ? parseFloat(entry.amount).toFixed(2) : "")
  const [date, setDate] = useState(entry?.date ?? format(new Date(), "yyyy-MM-dd"))

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type],
  )

  function handleTypeChange(newType: "income" | "expense") {
    setType(newType)
    setCategoryId("")
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const input = {
      type,
      description,
      categoryId,
      amount: parseFloat(amount),
      date,
    }

    startTransition(async () => {
      const result = entry
        ? await updateOccasionalEntryAction(entry.id, input)
        : await createOccasionalEntryAction(input)

      if (result.error) setError(result.error)
      else {
        toast.success(entry ? "Lançamento atualizado!" : "Lançamento registrado!")
        onClose()
      }
    })
  }

  return (
    <Modal title={entry ? "Editar lançamento" : "Novo lançamento"} onClose={onClose}>
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

        <Input id="description" label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Compra no mercado" required />

        <Select id="category" label="Categoria" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
          <option value="">Selecione...</option>
          {filteredCategories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-3">
          <Input id="amount" label="Valor (R$)" type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" required />
          <Input id="date" label="Data" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>

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
