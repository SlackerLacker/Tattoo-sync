import { createServerSupabase } from "@/lib/supabase-server"
import ServicesClient from "./ServicesClient"

export default async function ServicesPage() {
  const supabase = createServerSupabase()
  const { data: services } = await supabase.from("services").select("*")

  return <ServicesClient services={services || []} />
}
