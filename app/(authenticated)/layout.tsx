import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { cookies } from "next/headers"
import { Toaster } from '@/components/ui/sonner'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const supabase = createServerSupabase(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {children}
        <Toaster />
      </main>
    </div>
  )
}

