import { createServerClient } from '@supabase/ssr'
import { cookies as getCookies } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'
import DashboardClient from './DashboardClient'
import { supabaseAdmin } from "@/lib/supabase-admin"

const getLocalDateString = (date: Date) => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, "0")
  const day = `${date.getDate()}`.padStart(2, "0")
  return `${year}-${month}-${day}`
}

const parseLocalDateString = (dateString: string) => {
  const [ymd] = dateString.split("T")
  const parts = ymd.split("-").map(Number)
  if (parts.length !== 3 || parts.some((p) => Number.isNaN(p))) {
    return new Date(dateString)
  }
  const [year, month, day] = parts
  return new Date(year, month - 1, day)
}

const formatTimeString = (timeString?: string | null) => {
  if (!timeString) return ""
  const [hours, minutes] = timeString.split(":").map(Number)
  const date = new Date()
  date.setHours(hours || 0, minutes || 0, 0, 0)
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

const formatMonthYear = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short", year: "numeric" })

export default async function DashboardPage() {
  const cookieStore = await getCookies() // ✅ Await required in your case

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (key) => cookieStore.get(key)?.value,
        set: () => {}, // No-op for now
        remove: () => {}, // No-op for now
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase.from("profiles").select("studio_id").eq("id", user.id).single()

  const appointmentsQuery = supabaseAdmin
    .from("appointments")
    .select("id, studio_id, appointment_date, start_time, status, price, created_at, artist_id, client_id, service_id, duration")

  const appointmentsResponse = profile?.studio_id
    ? await appointmentsQuery.eq("studio_id", profile.studio_id)
    : await appointmentsQuery

  const appointments = appointmentsResponse.data || []

  const artistIds = Array.from(new Set(appointments.map((apt) => apt.artist_id).filter(Boolean))) as string[]
  const clientIds = Array.from(new Set(appointments.map((apt) => apt.client_id).filter(Boolean))) as string[]
  const serviceIds = Array.from(new Set(appointments.map((apt) => apt.service_id).filter(Boolean))) as string[]

  const artistsResponse = artistIds.length
    ? await supabaseAdmin.from("artists").select("id, name, specialty").in("id", artistIds)
    : { data: [] }
  const clientsResponse = clientIds.length
    ? await supabaseAdmin.from("clients").select("id, full_name").in("id", clientIds)
    : { data: [] }
  const servicesResponse = serviceIds.length
    ? await supabaseAdmin.from("services").select("id, name").in("id", serviceIds)
    : { data: [] }

  const artists = artistsResponse.data || []
  const clients = clientsResponse.data || []
  const services = servicesResponse.data || []

  const artistMap = new Map(artists.map((artist) => [artist.id, artist]))
  const clientMap = new Map(clients.map((client) => [client.id, client]))
  const serviceMap = new Map(services.map((service) => [service.id, service]))

  const { count: activeClients } = profile?.studio_id
    ? await supabaseAdmin.from("clients").select("id", { count: "exact", head: true }).eq("studio_id", profile.studio_id)
    : await supabaseAdmin.from("clients").select("id", { count: "exact", head: true })

  const isBillableStatus = (status?: string | null) => {
    const normalized = (status || "scheduled").toLowerCase()
    return !["cancelled", "canceled", "no-show"].includes(normalized)
  }

  const totalRevenue = appointments.reduce((sum, apt) => {
    if (isBillableStatus(apt.status)) {
      return sum + (apt.price || 0)
    }
    return sum
  }, 0)

  const billableCount = appointments.filter((apt) => isBillableStatus(apt.status)).length
  const avgPerAppointment = billableCount > 0 ? Math.round(totalRevenue / billableCount) : 0

  const appointmentStatusCounts = appointments.reduce<Record<string, number>>((acc, apt) => {
    const status = (apt.status || "scheduled").toLowerCase()
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  const statusPalette: Record<string, string> = {
    scheduled: "#10b981",
    confirmed: "#10b981",
    pending: "#f59e0b",
    "in-progress": "#8b5cf6",
    completed: "#3b82f6",
    cancelled: "#ef4444",
    canceled: "#ef4444",
    "no-show": "#ef4444",
  }

  const appointmentStatusData = Object.entries(appointmentStatusCounts).map(([status, value]) => ({
    name: status.replace(/(^.|-.)/g, (match) => match.replace("-", " ").toUpperCase()),
    value,
    color: statusPalette[status] || "#9ca3af",
  }))

  const now = new Date()
  const monthBuckets: { label: string; year: number; monthIndex: number }[] = []
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), i, 1)
    monthBuckets.push({
      label: d.toLocaleDateString("en-US", { month: "short" }),
      year: d.getFullYear(),
      monthIndex: d.getMonth(),
    })
  }
  const rangeStart = new Date(now.getFullYear(), 0, 1)
  const rangeEnd = new Date(now.getFullYear(), 11, 1)
  const revenueRangeLabel = `${formatMonthYear(rangeStart)} – ${formatMonthYear(rangeEnd)}`
  const statusRangeLabel = `As of ${now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`

  const revenueData = monthBuckets.map((bucket) => {
    const monthAppointments = appointments.filter((apt) => {
      if (!apt.appointment_date) return false
      const date = parseLocalDateString(apt.appointment_date)
      return date.getFullYear() === bucket.year && date.getMonth() === bucket.monthIndex
    })

    const monthRevenue = monthAppointments.reduce((sum, apt) => {
      if (isBillableStatus(apt.status)) {
        return sum + (apt.price || 0)
      }
      return sum
    }, 0)

    return {
      month: bucket.label,
      revenue: monthRevenue,
      appointments: monthAppointments.length,
    }
  })

  const topArtistMap = new Map<
    string,
    { id: string; name: string; specialty?: string; rating?: number; completedSessions: number; revenue: number }
  >()
  appointments.forEach((apt) => {
    if (!apt.artist_id) return
    const id = apt.artist_id
    const artist = artistMap.get(id)
    const entry = topArtistMap.get(id) || {
      id,
      name: artist?.name || "Unknown Artist",
      specialty: artist?.specialty,
      rating: artist?.rating,
      completedSessions: 0,
      revenue: 0,
    }
    if (isBillableStatus(apt.status)) {
      entry.completedSessions += 1
      entry.revenue += apt.price || 0
    }
    topArtistMap.set(id, entry)
  })

  const topArtists = Array.from(topArtistMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4)

  const today = new Date()
  const todayStr = getLocalDateString(today)
  const todaysSchedule = appointments
    .filter((apt) => {
      if (!apt.appointment_date) return false
      const date = parseLocalDateString(apt.appointment_date)
      return getLocalDateString(date) === todayStr
    })
    .sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""))
    .slice(0, 6)
    .map((apt) => ({
      id: apt.id,
      client: clientMap.get(apt.client_id)?.full_name || "Unknown Client",
      artist: artistMap.get(apt.artist_id)?.name || "Unknown Artist",
      service: serviceMap.get(apt.service_id)?.name || "Service",
      time: formatTimeString(apt.start_time),
      duration: (apt.duration || 60) / 60,
      status: apt.status,
      price: apt.price || 0,
    }))

  const recentActivity = appointments
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map((apt) => {
      const price = apt.price || 0
      const status = (apt.status || "scheduled").toLowerCase()
      const type = status === "completed" ? "completion" : "booking"
      const message =
        status === "completed"
          ? `Session completed by ${artistMap.get(apt.artist_id)?.name || "Artist"}`
          : `New appointment booked by ${clientMap.get(apt.client_id)?.full_name || "Client"}`

      const time = new Date(apt.created_at).toLocaleString()

      return {
        id: apt.id,
        type,
        message,
        time,
      }
    })

  const stats = {
    totalRevenue,
    appointments: appointments.length,
    avgPerAppointment,
    activeClients: activeClients || 0,
  }

  return (
    <DashboardClient
      user={user}
      stats={stats}
      revenueData={revenueData}
      appointmentStatusData={appointmentStatusData}
      topArtists={topArtists}
      todaysSchedule={todaysSchedule}
      recentActivity={recentActivity}
      chartRanges={{ revenueRangeLabel, statusRangeLabel }}
    />
  )
}
