import { auth, signOut } from "@/src/auth"
import { redirect } from "next/navigation"
import { AppNav } from "./_components/app-nav"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-svh flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Finance</span>
            <AppNav />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-500">Olá, {session.user?.name?.split(" ")[0]}</span>
            <form
              action={async () => {
                "use server"
                await signOut({ redirectTo: "/login" })
              }}
            >
              <button
                type="submit"
                className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">{children}</main>
    </div>
  )
}
