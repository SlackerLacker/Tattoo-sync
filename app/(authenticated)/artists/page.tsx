import { createServerSupabase } from "@/lib/supabase/server-client"
import { cookies } from "next/headers"
import ArtistsClient from "./ArtistsClient"

export default async function ArtistsPage() {
  const cookieStore = await cookies()
  const supabase = createServerSupabase(cookieStore)
  const { data: artists } = await supabase.from("artists").select("*")

  return <ArtistsClient artists={artists} />
}
