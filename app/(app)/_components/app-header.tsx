"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import { signOutAction } from "@/src/actions/auth"

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/entries", label: "Lançamentos" },
  { href: "/report", label: "Relatório" },
  { href: "/history", label: "Histórico" },
]

export function AppHeader({ userName }: { userName: string }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex w-full items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Wallet className="size-5 text-zinc-800 dark:text-zinc-200" />
            <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Finance</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  pathname === href
                    ? "text-zinc-900 dark:text-zinc-50"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100",
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Desktop right side */}
        <div className="hidden items-center gap-4 md:flex">
          <span className="text-sm text-zinc-500">Olá, {userName}</span>
          <form action={signOutAction}>
            <button
              type="submit"
              className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Sair
            </button>
          </form>
        </div>

        {/* Mobile hamburger */}
        <button
          className="rounded-md p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="w-full border-t border-zinc-100 bg-white px-6 pb-4 pt-2 dark:border-zinc-800 dark:bg-zinc-900 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname === href
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100",
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
            <span className="text-sm text-zinc-500">Olá, {userName}</span>
            <form action={signOutAction}>
              <button
                type="submit"
                className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  )
}
