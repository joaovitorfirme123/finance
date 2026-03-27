"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/entries", label: "Lançamentos" },
  { href: "/report", label: "Relatório" },
  { href: "/history", label: "Histórico" },
]

export function AppNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-6">
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
  )
}
