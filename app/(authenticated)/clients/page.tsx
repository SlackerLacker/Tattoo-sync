import { createServerSupabase } from "@/lib/supabase/server-client"
import ClientsClient from "./ClientsClient"

export default async function ClientsPage() {
  const supabase = await createServerSupabase()
  const { data: clients } = await supabase.from("clients").select("*")

  return <ClientsClient clients={clients} />
}
