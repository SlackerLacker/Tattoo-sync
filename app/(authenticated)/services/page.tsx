import { createServerSupabase } from "@/lib/supabase/server-client"
import { cookies } from "next/headers"
import ServicesClient from "./ServicesClient"

export default async function ServicesPage() {
  const cookieStore = cookies()
  const supabase = createServerSupabase(cookieStore)
  const { data: services } = await supabase.from("services").select("*")

  return <ServicesClient services={services} />
}
