import { createServerClient } from '@supabase/ssr'
import { cookies as getCookies } from 'next/headers'

export async function createServerSupabase() {
  const cookieStore = await getCookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll().map(({ name, value }) => ({ name, value }))
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            try {
              cookieStore.set(name, value, options)
            } catch {}
          }
        },
      },
    }
  )
}
