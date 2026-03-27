import { auth } from "@/src/auth"
import { NextResponse } from "next/server"

// Rotas que não precisam de autenticação
const publicRoutes = ["/login", "/signup", "/api/auth"]

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname)

  // Usuário não autenticado tentando acessar rota privada → redireciona para login
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  // Usuário autenticado tentando acessar login → redireciona para dashboard
  if (session && nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  // Aplica o middleware em todas as rotas exceto assets estáticos e internos do Next.js
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
