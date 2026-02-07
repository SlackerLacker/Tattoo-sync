"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { formatDuration } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { loadStripe } from "@stripe/stripe-js"
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js"

type Studio = {
  id: string
  name: string
  description?: string | null
  allow_online_booking?: boolean | null
  require_deposit?: boolean | null
  deposit_amount?: number | null
  deposit_percentage?: boolean | null
  stripe_account_id?: string | null
}

type Artist = {
  id: string
  name: string
  specialty?: string[] | string
  avatar_url?: string | null
  bio?: string | null
  rating?: number | null
  totalReviews?: number | null
  hourlyRate?: number | null
}

type Service = {
  id: string
  name: string
  price?: number | null
  duration?: number | null
}

type BookingClientProps = {
  studio: Studio
  artists: Artist[]
  services: Service[]
  studioId: string
  bookingSlug: string
}


const SLOT_MINUTES = 30
const SLOT_HOURS = SLOT_MINUTES / 60

const shopSettings = {
  businessHours: {
    monday: { open: "10:00", close: "20:00", closed: false },
    tuesday: { open: "10:00", close: "20:00", closed: false },
    wednesday: { open: "10:00", close: "20:00", closed: false },
    thursday: { open: "10:00", close: "20:00", closed: false },
    friday: { open: "10:00", close: "20:00", closed: false },
    saturday: { open: "10:00", close: "18:00", closed: false },
    sunday: { open: "12:00", close: "17:00", closed: false },
  },
}

const timeToDecimal = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number)
  return hours + minutes / 60
}

const decimalToTimeString = (decimal: number) => {
  const hours = Math.floor(decimal)
  const minutes = Math.round((decimal % 1) * 60)
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
}

const formatTime = (time: number) => {
  const h = Math.floor(time)
  const m = (time % 1) * 60
  const period = h >= 12 ? "PM" : "AM"
  const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${displayHour}${m > 0 ? `:${m.toString().padStart(2, "0")}` : ""}${period}`
}

const getLocalDateString = (date: Date) => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, "0")
  const day = `${date.getDate()}`.padStart(2, "0")
  return `${year}-${month}-${day}`
}

const getDayOfWeek = (date: Date) => {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
  return days[date.getDay()]
}

const getShopHours = (date: Date) => {
  const dayOfWeek = getDayOfWeek(date)
  const shopHours = shopSettings.businessHours[dayOfWeek as keyof typeof shopSettings.businessHours]

  if (shopHours.closed) {
    return { open: 0, close: 0, closed: true }
  }

  return {
    open: timeToDecimal(shopHours.open),
    close: timeToDecimal(shopHours.close),
    closed: false,
  }
}

export default function BookingClient({ studio, artists, services, studioId, bookingSlug }: BookingClientProps) {
  const studioName =
    studio.name || (studio as { studio_name?: string }).studio_name || (studio as { studioName?: string }).studioName || "Studio"
  const studioDescription =
    studio.description ||
    (studio as { studio_description?: string }).studio_description ||
    (studio as { description_text?: string }).description_text ||
    null
  const [step, setStep] = useState<"home" | "artist" | "details" | "pay">("home")
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null)
  const [selectedDate, setSelectedDate] = useState(getLocalDateString(new Date()))
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [selectedServiceId, setSelectedServiceId] = useState<string>("")
  const [bookedSlots, setBookedSlots] = useState<{ start_time: string; duration: number }[]>([])
  const [clientInfo, setClientInfo] = useState({ full_name: "", email: "", phone: "" })
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showValidationErrors, setShowValidationErrors] = useState(false)
  const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [paymentSummary, setPaymentSummary] = useState<{
    serviceName: string
    servicePrice: number
    depositAmount: number
    durationMinutes: number
  } | null>(null)

  const steps: { id: typeof step; label: string }[] = [
    { id: "home", label: "Start" },
    { id: "artist", label: "Artist" },
    { id: "details", label: "Details" },
    { id: "pay", label: "Pay" },
  ]

  const stripePromise = useMemo(() => {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
    const stripeAccount = studio.stripe_account_id || undefined
    return loadStripe(publishableKey, stripeAccount ? { stripeAccount } : undefined)
  }, [studio.stripe_account_id])

  const selectedService = services.find((service) => service.id === selectedServiceId)

  const depositAmount = useMemo(() => {
    if (!studio.require_deposit || !selectedService?.price) return 0
    if (studio.deposit_percentage) {
      return Math.round((Number(selectedService.price) * Number(studio.deposit_amount || 0)) / 100)
    }
    return Math.round(Number(studio.deposit_amount || 0))
  }, [selectedService, studio.deposit_amount, studio.deposit_percentage, studio.require_deposit])

  const canCollectDeposit = Boolean(studio.require_deposit && studio.stripe_account_id)

  const timeSlots = useMemo(() => {
    const dateObj = new Date(selectedDate)
    const hours = getShopHours(dateObj)
    if (hours.closed) return []
    const slots = []
    for (let time = hours.open; time < hours.close; time += SLOT_HOURS) {
      slots.push(time)
    }
    return slots
  }, [selectedDate])

  const isBookedRange = (startTime: number, endTime: number) => {
    return bookedSlots.some((apt) => {
      const start = timeToDecimal(apt.start_time)
      const duration = (apt.duration || 60) / 60
      const end = start + duration
      return startTime < end && endTime > start
    })
  }

  const availableTimeSlots = useMemo(() => {
    if (!selectedService) return []
    const dateObj = new Date(selectedDate)
    const hours = getShopHours(dateObj)
    if (hours.closed) return []

    const durationHours = (selectedService.duration || 60) / 60
    return timeSlots.filter((slot) => {
      const endTime = slot + durationHours
      if (endTime > hours.close) return false
      return !isBookedRange(slot, endTime)
    })
  }, [selectedService, selectedDate, timeSlots, bookedSlots])

  useEffect(() => {
    if (!selectedArtist || !selectedDate) return

    const controller = new AbortController()
    const loadAvailability = async () => {
      const params = new URLSearchParams({
        studioId,
        artistId: selectedArtist.id,
        date: selectedDate,
      })
      const response = await fetch(`/api/public/availability?${params.toString()}`, { signal: controller.signal })
      if (!response.ok) return
      const data = await response.json()
      setBookedSlots(data || [])
    }

    loadAvailability()
    return () => controller.abort()
  }, [selectedArtist, selectedDate, studioId])

  const handleCheckout = async () => {
    if (!selectedArtist || !selectedService) return
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/public/booking-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studioId,
          bookingSlug,
          artistId: selectedArtist.id,
          serviceId: selectedService.id,
          appointmentDate: selectedDate,
          startTime: selectedTime,
          client: clientInfo,
          notes,
        }),
      })

      if (!response.ok) {
        setIsSubmitting(false)
        return
      }

      const data = await response.json()
      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl
        return
      }

      if (data?.clientSecret) {
        setPaymentClientSecret(data.clientSecret)
        setPaymentIntentId(data.paymentIntentId || null)
        setPaymentSummary({
          serviceName: data.serviceName || selectedService.name,
          servicePrice: data.servicePrice || 0,
          depositAmount: data.depositAmount || 0,
          durationMinutes: data.durationMinutes || selectedService.duration || 60,
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const emailIsValid = useMemo(() => {
    const value = clientInfo.email.trim()
    if (!value) return false
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }, [clientInfo.email])

  const canContinue =
    Boolean(selectedDate) &&
    Boolean(selectedServiceId) &&
    Boolean(selectedTime) &&
    Boolean(clientInfo.full_name.trim()) &&
    emailIsValid

  if (!studio.allow_online_booking) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Online Booking Unavailable</CardTitle>
          <CardDescription>Please contact the studio directly to book.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        {steps.map((crumb, index) => {
          const isActive = step === crumb.id
          const isFuture = steps.findIndex((item) => item.id === step) < index
          const canNavigate = !isFuture
          return (
            <div key={crumb.id} className="flex items-center gap-2">
              <button
                type="button"
                disabled={!canNavigate}
                onClick={() => {
                  if (!canNavigate) return
                  setStep(crumb.id)
                }}
                className={`rounded-full px-3 py-1 transition ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : canNavigate
                      ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                {crumb.label}
              </button>
              {index < steps.length - 1 && <span className="text-slate-300">/</span>}
            </div>
          )
        })}
      </div>

      <Card className="border-slate-200/70 shadow-sm">
        <CardHeader>
          <CardTitle>{studioName}</CardTitle>
          {studioDescription && <CardDescription>{studioDescription}</CardDescription>}
        </CardHeader>
      </Card>

      {step === "home" && (
        <Card>
          <CardHeader>
            <CardTitle>Book with this studio</CardTitle>
            <CardDescription>Pick an artist, time, and service to get started.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setStep("artist")}>Start Booking</Button>
          </CardContent>
        </Card>
      )}

      {step === "artist" && (
        <Card>
          <CardHeader>
            <CardTitle>Select an artist</CardTitle>
            <CardDescription>Only active artists are shown.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {artists.map((artist) => (
              <button
                key={artist.id}
                onClick={() => {
                  setSelectedArtist(artist)
                  setStep("details")
                }}
                className="flex items-center gap-4 rounded-xl border border-slate-200 p-4 text-left transition hover:border-slate-400"
              >
                <div className="h-12 w-12 flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700">
                  {artist.avatar_url ? (
                    <img src={artist.avatar_url} alt={artist.name} className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    artist.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold">{artist.name}</div>
                    {typeof artist.hourlyRate === "number" && (
                      <div className="text-xs text-slate-600 whitespace-nowrap">${artist.hourlyRate}/hr</div>
                    )}
                  </div>
                  {artist.specialty && (
                    <div className="mt-1 text-xs text-slate-500">
                      Specialties:{" "}
                      {Array.isArray(artist.specialty) ? artist.specialty.join(" • ") : artist.specialty}
                    </div>
                  )}
                  {artist.bio && (
                    <div className="mt-2 text-xs text-slate-500 line-clamp-2">
                      Bio: {artist.bio}
                    </div>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
                    {typeof artist.rating === "number" && (
                      <span>
                        {artist.rating.toFixed(1)} ★
                        {typeof artist.totalReviews === "number" && ` (${artist.totalReviews})`}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {step === "details" && selectedArtist && (
        <Card>
          <CardHeader>
            <CardTitle>Pick a time & service</CardTitle>
            <CardDescription>{selectedArtist.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Date</Label>
                <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
              </div>
              <div>
                <Label>Service</Label>
                <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder="Select service"
                      aria-label={selectedService ? selectedService.name : "Select service"}
                    >
                      {selectedService
                        ? `${selectedService.name}${
                            selectedService.duration ? ` • ~${formatDuration(selectedService.duration)}` : ""
                          }${selectedService.price ? ` ($${selectedService.price})` : ""}`
                        : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                        {service.duration ? ` • ~${formatDuration(service.duration)}` : ""}
                        {service.price ? ` ($${service.price})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedService?.duration && (
              <div className="text-xs text-slate-500">
                Estimated duration: ~{formatDuration(selectedService.duration)}
              </div>
            )}

            <div>
              <Label className="mb-2 block">Available Times</Label>
              {!selectedService && (
                <p className="text-xs text-slate-500">Select a service to see available times.</p>
              )}
              {selectedService && availableTimeSlots.length === 0 && (
                <p className="text-xs text-slate-500">No available times for this service.</p>
              )}
              {selectedService && availableTimeSlots.length > 0 && (
                <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
                  {availableTimeSlots.map((slot) => {
                    const value = decimalToTimeString(slot)
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(value)}
                        className={`rounded-md border px-2 py-1 text-xs transition ${
                          selectedTime === value
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                        }`}
                      >
                        {formatTime(slot)}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Full Name</Label>
                <Input
                  value={clientInfo.full_name}
                  onChange={(e) => setClientInfo({ ...clientInfo, full_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={clientInfo.email}
                  onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={clientInfo.phone}
                  onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                />
              </div>
              <div>
                <Label>Notes (optional)</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                {studio.require_deposit && (
                  <Badge variant="secondary">Deposit due: ${depositAmount}</Badge>
                )}
              </div>
              <Button
                onClick={() => {
                  if (!canContinue) {
                    setShowValidationErrors(true)
                    return
                  }
                  if (!canCollectDeposit) {
                    handleCheckout()
                    return
                  }
                  setStep("pay")
                }}
                disabled={!canContinue}
              >
                Continue
              </Button>
            </div>
            {showValidationErrors && !canContinue && (
              <div className="text-xs text-red-500">
                Please enter a valid full name, email, service, date, and time to continue.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === "pay" && selectedService && selectedArtist && (
        <Card>
          <CardHeader>
            <CardTitle>Pay Deposit</CardTitle>
            <CardDescription>
              {selectedArtist.name} • {selectedService.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Service price</span>
              <span>${selectedService.price || 0}</span>
            </div>
            {canCollectDeposit && (
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>Deposit due now</span>
                <span>${depositAmount}</span>
              </div>
            )}
            {!paymentClientSecret && (
              <Button onClick={handleCheckout} disabled={isSubmitting}>
                {isSubmitting ? "Preparing..." : canCollectDeposit ? "Pay Deposit" : "Confirm Booking"}
              </Button>
            )}
            {paymentClientSecret && (
              <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                {paymentSummary && (
                  <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Service</span>
                      <span className="font-medium">{paymentSummary.serviceName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Service price</span>
                      <span>${paymentSummary.servicePrice}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Deposit due</span>
                      <span className="font-semibold">${paymentSummary.depositAmount}</span>
                    </div>
                  </div>
                )}
                <Elements stripe={stripePromise} options={{ clientSecret: paymentClientSecret }}>
                  <PaymentForm
                    clientSecret={paymentClientSecret}
                    studioId={studioId}
                    paymentIntentId={paymentIntentId}
                    onError={setPaymentError}
                    onSuccess={() => {
                      const paidAmount = paymentSummary?.depositAmount ?? 0
                      const amountParam = Number.isFinite(paidAmount) ? `&amount=${paidAmount}` : ""
                      window.location.href = `/studios/${studioId}/book/${bookingSlug}/confirmation?paid=1${amountParam}`
                    }}
                  />
                </Elements>
                {paymentError && <p className="text-xs text-red-500">{paymentError}</p>}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function PaymentForm({
  clientSecret,
  studioId,
  paymentIntentId,
  onSuccess,
  onError,
}: {
  clientSecret: string
  studioId: string
  paymentIntentId: string | null
  onSuccess: () => void
  onError: (message: string | null) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isPaying, setIsPaying] = useState(false)

  const handlePay = async () => {
    if (!stripe || !elements) return
    onError(null)
    setIsPaying(true)

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      onError("Payment form not ready.")
      setIsPaying(false)
      return
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    })

    if (result.error) {
      onError(result.error.message || "Payment failed.")
      setIsPaying(false)
      return
    }

    const intentId = result.paymentIntent?.id || paymentIntentId
    if (!intentId) {
      onError("Payment succeeded but intent missing.")
      setIsPaying(false)
      return
    }

    const confirmResponse = await fetch("/api/public/booking-confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentIntentId: intentId, studioId }),
    })

    if (!confirmResponse.ok) {
      onError("Payment succeeded but booking confirmation failed.")
      setIsPaying(false)
      return
    }

    setIsPaying(false)
    onSuccess()
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-slate-200 bg-white p-3">
        <CardElement options={{ hidePostalCode: true }} />
      </div>
      <Button onClick={handlePay} disabled={!stripe || isPaying}>
        {isPaying ? "Processing..." : "Pay Now"}
      </Button>
    </div>
  )
}
