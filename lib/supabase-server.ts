
import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"

// This is the final, correct implementation for the Next.js App Router.
// The internal cookie methods are marked as `async` and the `cookies()`
// function call is `await`ed, which resolves the "should be awaited" error.
export function createServerSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookieStore = await cookies()
          return cookieStore.get(name)?.value
        },
        async set(name: string, value: string, options: CookieOptions) {
          try {
            const cookieStore = await cookies()
            cookieStore.set(name, value, options)
          } catch (error) {
            // The `set` method was called from a Server Component.
          }
        },
        async remove(name: string, options: CookieOptions) {
          try {
            const cookieStore = await cookies()
            cookieStore.set(name, "", options)
          } catch (error) {
            // The `delete` method was called from a Server Component.
          }
        },
      },
    }
  )
}
