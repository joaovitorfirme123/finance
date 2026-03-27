"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { signupAction } from "@/src/actions/auth"

export function SignupForm() {
  const [state, action, isPending] = useActionState(signupAction, null)

  return (
    <form action={action} className="flex flex-col gap-4">
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {state.error}
        </div>
      )}

      <Input
        id="name"
        name="name"
        type="text"
        label="Nome completo"
        placeholder="João Silva"
        autoComplete="name"
        required
      />

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
        placeholder="Mínimo 6 caracteres"
        autoComplete="new-password"
        required
        minLength={6}
      />

      <Button type="submit" disabled={isPending} className="mt-2 w-full">
        {isPending ? "Criando conta…" : "Criar conta"}
      </Button>

      <p className="text-center text-sm text-zinc-500">
        Já tem uma conta?{" "}
        <Link href="/login" className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100">
          Entrar
        </Link>
      </p>
    </form>
  )
}
