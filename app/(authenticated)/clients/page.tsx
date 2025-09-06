import { createServerSupabase } from "@/lib/supabase/server-client"
import { cookies } from "next/headers"
import ClientsClient from "./ClientsClient"

export default async function ClientsPage() {
  const cookieStore = await cookies()
  const supabase = createServerSupabase(cookieStore)
  const { data: clients } = await supabase.from("clients").select("*")

  return <ClientsClient clients={clients} />
}
