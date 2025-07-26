"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Session } from "@supabase/supabase-js"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)

      if (!session) {
        router.push("/login")
      }
    })
  }, [router])

  if (loading) return null // Or a loading spinner

  return <>{children}</>
}

//import ProtectedLayout from "@/components/protected-layout"
// export default function DashboardPage() {
//   return (
//     <ProtectedLayout>
//       <div>Your dashboard content here</div>
//     </ProtectedLayout>
//   )
// }