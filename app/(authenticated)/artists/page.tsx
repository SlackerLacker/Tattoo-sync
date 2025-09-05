import { createServerSupabase } from "@/lib/supabase/server-client"
import ArtistsClient from "./ArtistsClient"

export default async function ArtistsPage() {
  const supabase = await createServerSupabase()
  const { data: artists } = await supabase.from("artists").select("*")

  return <ArtistsClient artists={artists} />
}
