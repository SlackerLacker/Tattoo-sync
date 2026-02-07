import { stripe } from "@/lib/stripe"
import { supabaseAdmin } from "@/lib/supabase-admin"

export default async function BookingConfirmation({
  params,
  searchParams,
}: {
  params: Promise<{ studioId: string; bookingSlug: string }>
  searchParams: Promise<{ session_id?: string; paid?: string; amount?: string }>
}) {
  const { studioId } = await params
  const { session_id: sessionId, paid, amount } = await searchParams
  let paidAmount: number | null = null
  const paidFromQuery = paid === "1" || paid === "true"

  if (amount) {
    const parsedAmount = Number.parseFloat(amount)
    if (Number.isFinite(parsedAmount)) {
      paidAmount = parsedAmount
    }
  }

  if (sessionId) {
    try {
      const { data: studioAccount } = await supabaseAdmin
        .from("studios")
        .select("stripe_account_id")
        .eq("id", studioId)
        .single()

      const session = await stripe.checkout.sessions.retrieve(
        sessionId,
        {},
        studioAccount?.stripe_account_id ? { stripeAccount: studioAccount.stripe_account_id } : undefined,
      )
      const studioId = session.metadata?.studioId
      const bookingSlug = session.metadata?.bookingSlug
      const artistId = session.metadata?.artistId
      const serviceId = session.metadata?.serviceId
      const appointmentDate = session.metadata?.appointmentDate
      const startTime = session.metadata?.startTime
      const clientName = session.metadata?.clientName
      const clientEmail = session.metadata?.clientEmail
      const clientPhone = session.metadata?.clientPhone
      const notes = session.metadata?.notes
      const amountTotal = session.amount_total ? session.amount_total / 100 : 0
      let cardBrand: string | null = null
      let cardLast4: string | null = null
      if (typeof session.payment_intent === "string") {
        try {
          const intent = await stripe.paymentIntents.retrieve(
            session.payment_intent,
            { expand: ["latest_charge"] },
            studioAccount?.stripe_account_id ? { stripeAccount: studioAccount.stripe_account_id } : undefined,
          )
          const latestCharge = intent.latest_charge as
            | { payment_method_details?: { card?: { brand?: string; last4?: string } } }
            | null
            | undefined
          cardBrand = latestCharge?.payment_method_details?.card?.brand ?? null
          cardLast4 = latestCharge?.payment_method_details?.card?.last4 ?? null
        } catch {
          // best-effort
        }
      }

      if (Number.isFinite(amountTotal) && amountTotal > 0) {
        paidAmount = amountTotal
      }

      if (studioId && bookingSlug && artistId && serviceId && appointmentDate && startTime && clientEmail) {
        const { data: studio } = await supabaseAdmin
          .from("studios")
          .select("id")
          .eq("id", studioId)
          .single()

        if (studio) {
          const normalizedEmail = clientEmail.trim().toLowerCase()
          const { data: existingClient } = await supabaseAdmin
            .from("clients")
            .select("id")
            .eq("studio_id", studioId)
            .eq("email", normalizedEmail)
            .maybeSingle()

          let clientId = existingClient?.id
          if (!clientId) {
            const { data: newClient } = await supabaseAdmin
              .from("clients")
              .insert([
                {
                  full_name: clientName || "Client",
                  email: normalizedEmail,
                  phone: clientPhone || null,
                  studio_id: studioId,
                },
              ])
              .select()
              .single()

            clientId = newClient?.id || null
          }

          if (clientId) {
            const { data: existingAppointment } = await supabaseAdmin
              .from("appointments")
              .select("id")
              .eq("studio_id", studioId)
              .eq("artist_id", artistId)
              .eq("client_id", clientId)
              .eq("appointment_date", appointmentDate)
              .eq("start_time", startTime)
              .maybeSingle()

            if (!existingAppointment) {
              const { data: service } = await supabaseAdmin
                .from("services")
                .select("duration_minutes, price")
                .eq("id", serviceId)
                .eq("studio_id", studioId)
                .single()

              const { data: createdAppointment } = await supabaseAdmin.from("appointments").insert([
                {
                  studio_id: studioId,
                  artist_id: artistId,
                  client_id: clientId,
                  service_id: serviceId,
                  appointment_date: appointmentDate,
                  start_time: startTime,
                  duration: service?.duration_minutes || 60,
                  status: "pending",
                  price: service?.price || 0,
                  deposit_paid: amountTotal,
                  payment_status: "paid",
                  payment_method: "card",
                  notes: notes || null,
                },
              ]).select("id").single()

              const appointmentId = createdAppointment?.id
              const reference = typeof session.payment_intent === "string" ? session.payment_intent : session.id
              if (appointmentId) {
                await supabaseAdmin.from("payments").insert([
                  {
                    appointment_id: appointmentId,
                    studio_id: studioId,
                    amount: amountTotal,
                    status: "paid",
                    method: "card",
                    reference,
                    card_brand: cardBrand,
                    card_last4: cardLast4,
                  },
                ])
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("[PUBLIC_BOOKING_CONFIRMATION_ERROR]", error)
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center p-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-semibold">You're Booked!</h1>
        <p className="mt-2 text-slate-600">
          Thank you for booking with us. We will confirm the appointment soon.
        </p>
        {(sessionId || paidFromQuery) && (
          <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-left text-sm text-emerald-900">
            <div className="font-semibold">Deposit received</div>
            {paidAmount !== null && (
              <div className="mt-1 text-emerald-800">Amount: ${paidAmount}</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
