import { createServerSupabase } from "@/lib/supabase-server"
import ClientsClient from "./ClientsClient"

export default async function ClientsPage() {
  const supabase = createServerSupabase()
  const { data: clients } = await supabase.from("clients").select("*")

  return <ClientsClient clients={clients || []} />
}
