import { createServerSupabase } from "@/lib/supabase/server-client"
import AppointmentsClient from "./AppointmentsClient"

export default async function AppointmentsPage() {
  const supabase = await createServerSupabase()
  const { data: appointments } = await supabase.from("appointments").select("*")
  const { data: artists } = await supabase.from("artists").select("*")
  const { data: services } = await supabase.from("services").select("*")

  return <AppointmentsClient appointments={appointments} artists={artists} services={services} />
}
