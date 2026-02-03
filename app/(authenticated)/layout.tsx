
import { createServerSupabase } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import AuthenticatedShell from "@/components/AuthenticatedShell"
import { Toaster } from "@/components/ui/sonner"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <AuthenticatedShell>
      {children}
      <Toaster />
    </AuthenticatedShell>
  )
}
