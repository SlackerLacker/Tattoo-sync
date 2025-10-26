import { createServerSupabase } from "@/lib/supabase-server"
import ArtistsClient from "./ArtistsClient"

export default async function ArtistsPage() {
  const supabase = createServerSupabase()
  const { data: artists } = await supabase.from("artists").select("*")

  return <ArtistsClient artists={artists || []} />
}
