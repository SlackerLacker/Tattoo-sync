import { createServerSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto p-6 bg-gray-50">{children}</main>
    </div>
  )
}

