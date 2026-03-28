"use client"

import { useState, useTransition } from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { createCategoryAction, updateCategoryAction } from "@/src/actions/categories"
import { toast } from "sonner"

type Category = {
  id: string; name: string; type: "income" | "expense"; color: string
  icon: string | null; isSystem: boolean
}

interface Props {
  entry: Category | null
  onClose: () => void
}

const PRESET_COLORS = [
  "#4ade80", "#f87171", "#60a5fa", "#facc15", "#fb923c",
  "#a78bfa", "#34d399", "#f472b6", "#38bdf8", "#94a3b8",
]

export function CategoryForm({ entry, onClose }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(entry?.name ?? "")
  const [type, setType] = useState<"income" | "expense">(entry?.type ?? "expense")
  const [color, setColor] = useState(entry?.color ?? PRESET_COLORS[0])
  const [icon, setIcon] = useState(entry?.icon ?? "")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const input = { name, type, color, icon: icon || undefined }

    startTransition(async () => {
      const result = entry
        ? await updateCategoryAction(entry.id, input)
        : await createCategoryAction(input)

      if (result.error) setError(result.error)
      else {
        toast.success(entry ? "Categoria atualizada!" : "Categoria criada!")
        onClose()
      }
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm animate-in fade-in zoom-in-95 duration-150 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            {entry ? "Editar categoria" : "Nova categoria"}
          </h3>
          <button onClick={onClose} className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <X className="size-4 text-zinc-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
              {error}
            </p>
          )}

          <Input
            id="cat-name"
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Alimentação"
            required
          />

          <Select
            id="cat-type"
            label="Tipo"
            value={type}
            onChange={(e) => setType(e.target.value as "income" | "expense")}
          >
            <option value="expense">Gasto</option>
            <option value="income">Receita</option>
          </Select>

          {/* Color picker */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Cor</span>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="size-7 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    background: c,
                    borderColor: color === c ? "#000" : "transparent",
                  }}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="size-7 cursor-pointer rounded-full border border-zinc-200"
                title="Cor personalizada"
              />
            </div>
          </div>

          <Input
            id="cat-icon"
            label="Ícone (opcional)"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="Ex: shopping-cart"
          />

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? "Salvando…" : "Salvar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
