import { createServerSupabase } from "@/lib/supabase/server-client"
import { cookies } from "next/headers"
import ArtistProfileClient from "./ArtistProfileClient"
import { notFound } from "next/navigation"

export default async function ArtistProfilePage({ params }: { params: { id: string } }) {
  const cookieStore = await cookies()
  const supabase = createServerSupabase(cookieStore)

  const { data: artist, error } = await supabase
    .from("artists")
    .select("*")
    .eq("id", params.id)
    .single()

  if (error || !artist) {
    notFound()
  }

  return <ArtistProfileClient artist={artist} />
}
