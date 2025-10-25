
import { createServerSupabase } from "@/lib/supabase/server"
import ScheduleClient from "./ScheduleClient"
import { Artist, Service, Client, Appointment } from "@/types"

export default async function SchedulePage() {
  const supabase = createServerSupabase()

  const { data: artists } = await supabase.from("artists").select("*")
  const { data: services } = await supabase.from("services").select("*")
  const { data: clients } = await supabase.from("clients").select("*")
  const { data: appointments } = await supabase
    .from("appointments")
    .select("*, clients:clients(*), artists:artists(*), services:services(*)")

  return (
    <ScheduleClient
      serverArtists={artists || []}
      serverServices={services || []}
      serverClients={clients || []}
      serverAppointments={appointments || []}
    />
  )
}
