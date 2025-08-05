import { createServerClient } from '@supabase/ssr'
import { cookies as getCookies } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const cookieStore = await getCookies() // ✅ Await required in your case

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (key) => cookieStore.get(key)?.value,
        set: () => {}, // No-op for now
        remove: () => {}, // No-op for now
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <DashboardClient user={user} />
}
