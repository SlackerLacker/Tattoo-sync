import BookingClient from "./BookingClient"
import { supabaseAdmin } from "@/lib/supabase-admin"

export default async function BookingPage({
  params,
}: {
  params: { studioId: string; bookingSlug: string }
}) {
  const { studioId, bookingSlug } = params

  const { data: bookingLink } = await supabaseAdmin
    .from("booking_links")
    .select("*")
    .eq("studio_id", studioId)
    .eq("booking_slug", bookingSlug)
    .eq("is_active", true)
    .single()

  if (!bookingLink) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-semibold">Booking link not found</h1>
      </div>
    )
  }

  const { data: studio } = await supabaseAdmin
    .from("studios")
    .select("*")
    .eq("id", studioId)
    .single()

  const { data: artists } = await supabaseAdmin
    .from("artists")
    .select("id, name, specialty, avatar_url, status, bio, hourlyRate")
    .eq("studio_id", studioId)
    .eq("status", "active")

  const { data: services } = await supabaseAdmin
    .from("services")
    .select("id, name, price, duration_minutes")
    .eq("studio_id", studioId)

  if (!studio) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-semibold">Studio not found</h1>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl p-6 md:p-10">
      <BookingClient
        studio={studio}
        artists={artists || []}
        services={(services || []).map((service: any) => ({
          ...service,
          duration: service.duration_minutes ?? service.duration,
        }))}
        studioId={studioId}
        bookingSlug={bookingSlug}
      />
    </div>
  )
}
