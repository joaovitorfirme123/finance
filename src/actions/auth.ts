"use server"

import { signIn, signOut } from "@/src/auth"
import { db } from "@/src/db"
import { users } from "@/src/db/schema"
import { eq } from "drizzle-orm"
import { hashSync } from "bcryptjs"
import { z } from "zod"
import { isRedirectError } from "next/dist/client/components/redirect-error"

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginAction(_prevState: unknown, formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    })
  } catch (error) {
    if (isRedirectError(error)) throw error
    return { error: "E-mail ou senha incorretos." }
  }
}

// ─── Signup ───────────────────────────────────────────────────────────────────

const signupSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres."),
  email: z.string().email("E-mail inválido."),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres."),
})

export async function signupAction(_prevState: unknown, formData: FormData) {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { name, email, password } = parsed.data

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1)
  if (existing) {
    return { error: "Já existe uma conta com esse e-mail." }
  }

  await db.insert(users).values({
    id: crypto.randomUUID(),
    name,
    email,
    passwordHash: hashSync(password, 10),
  })

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" })
  } catch (error) {
    if (isRedirectError(error)) throw error
    return { error: "Conta criada, mas houve um erro ao fazer login. Tente entrar manualmente." }
  }
}

// ─── Sign out ─────────────────────────────────────────────────────────────────

export async function signOutAction() {
  await signOut({ redirectTo: "/login" })
}
