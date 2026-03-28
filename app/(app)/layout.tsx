import { auth } from "@/src/auth"
import { redirect } from "next/navigation"
import { AppHeader } from "./_components/app-header"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const firstName = session.user?.name?.split(" ")[0] ?? ""

  return (
    <div className="flex min-h-svh flex-col bg-zinc-50 dark:bg-zinc-950">
      <AppHeader userName={firstName} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">{children}</main>
    </div>
  )
}
