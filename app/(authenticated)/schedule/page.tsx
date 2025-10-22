import { createServerSupabase } from "@/lib/supabase/server-client"
import { cookies } from "next/headers"
import ScheduleClient from "./ScheduleClient"
import { Artist, Service, Client, Appointment } from "@/types"

export default async function SchedulePage() {
  const cookieStore = await cookies()
  const supabase = createServerSupabase(cookieStore)

  // --- START DIAGNOSTIC LOGGING ---
  console.log("--- SCHEDULE PAGE SERVER-SIDE LOGS ---")

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError) {
    console.error("Error fetching user:", userError)
  }
  console.log("Current user:", user)
  // --- END DIAGNOSTIC LOGGING ---

  const { data: artists, error: artistsError } = await supabase.from("artists").select("*")
  const { data: services, error: servicesError } = await supabase.from("services").select("*")
  const { data: clients, error: clientsError } = await supabase.from("clients").select("*")
  const { data: appointments, error: appointmentsError } = await supabase
    .from("appointments")
    .select("*, clients:clients(*), artists:artists(*), services:services(*)")

  // --- START DIAGNOSTIC LOGGING ---
  if (artistsError) console.error("Error fetching artists:", artistsError)
  if (servicesError) console.error("Error fetching services:", servicesError)
  if (clientsError) console.error("Error fetching clients:", clientsError)
  if (appointmentsError) console.error("Error fetching appointments:", appointmentsError)

  console.log("Fetched artists count:", artists?.length ?? 0)
  console.log("Fetched services count:", services?.length ?? 0)
  console.log("Fetched clients count:", clients?.length ?? 0)
  console.log("Fetched appointments count:", appointments?.length ?? 0)
  console.log("--------------------------------------")
  // --- END DIAGNOSTIC LOGGING ---

  return (
    <ScheduleClient
      serverArtists={artists || []}
      serverServices={services || []}
      serverClients={clients || []}
      serverAppointments={appointments || []}
    />
  )
}
