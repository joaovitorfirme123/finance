"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { loginAction } from "@/src/actions/auth"

export function LoginForm() {
  const [state, action, isPending] = useActionState(loginAction, null)

  return (
    <form action={action} className="flex flex-col gap-4">
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {state.error}
        </div>
      )}

      <Input
        id="email"
        name="email"
        type="email"
        label="E-mail"
        placeholder="seu@email.com"
        autoComplete="email"
        required
      />

      <Input
        id="password"
        name="password"
        type="password"
        label="Senha"
        placeholder="••••••••"
        autoComplete="current-password"
        required
      />

      <Button type="submit" disabled={isPending} className="mt-2 w-full">
        {isPending ? "Entrando…" : "Entrar"}
      </Button>

      <p className="text-center text-sm text-zinc-500">
        Não tem uma conta?{" "}
        <Link href="/signup" className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100">
          Cadastre-se
        </Link>
      </p>
    </form>
  )
}
