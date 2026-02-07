"use client"

import type React from "react"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock,
  Calendar,
  Edit,
  Trash2,
  MoreHorizontal,
  MoreVertical,
  User,
  CreditCard,
  CheckCircle,
  AlertCircle,
  XCircle,
  DollarSign,
  Smartphone,
  Search,
  Plus,
  Eye,
  CalendarDays,
  List,
  Grid3X3,
  SlidersHorizontal,
  ChartBar,
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { formatDuration } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Artist, Service, Client, Appointment } from "@/types"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

// Shop settings (would normally come from settings page/API)
const shopSettings = {
  businessHours: {
    monday: { open: "08:00", close: "20:00", closed: false },
    tuesday: { open: "08:00", close: "20:00", closed: false },
    wednesday: { open: "08:00", close: "20:00", closed: false },
    thursday: { open: "08:00", close: "20:00", closed: false },
    friday: { open: "08:00", close: "20:00", closed: false },
    saturday: { open: "09:00", close: "18:00", closed: false },
    sunday: { open: "10:00", close: "17:00", closed: false },
  },
}

const paymentMethods = [
  {
    id: "partial",
    name: "Partial payment",
    description: "Charge a custom amount",
    icon: DollarSign,
    color: "border-slate-200 bg-white",
  },
  {
    id: "card",
    name: "Credit/Debit Card",
    icon: CreditCard,
    description: "Process through Stripe",
    color: "bg-blue-50 border-blue-200 text-blue-800",
  },
  {
    id: "cash",
    name: "Cash",
    icon: DollarSign,
    description: "Manual cash payment",
    color: "bg-green-50 border-green-200 text-green-800",
  },
  {
    id: "cashapp",
    name: "Cash App",
    icon: Smartphone,
    description: "Send to Cash App",
    color: "bg-emerald-50 border-emerald-200 text-emerald-800",
  },
  {
    id: "venmo",
    name: "Venmo",
    icon: Smartphone,
    description: "Send to Venmo",
    color: "bg-purple-50 border-purple-200 text-purple-800",
  },
]

interface DragSelection {
  isDragging: boolean
  artistId: string | null
  startTime: number | null
  endTime: number | null
  currentTime: number | null
}

interface DropTarget {
  artistId: string
  time: number
}

interface ScheduleClientProps {
  serverArtists: Artist[]
  serverServices: Service[]
  serverClients: Client[]
  serverAppointments: Appointment[]
  currentUserId?: string | null
  currentUserRole?: string | null
}

const SLOT_MINUTES = 30
const SLOT_HOURS = SLOT_MINUTES / 60
const SLOTS_PER_HOUR = Math.round(60 / SLOT_MINUTES)
const SLOT_HEIGHT_PX = 28
const HOUR_ROW_HEIGHT_PX = SLOT_HEIGHT_PX * SLOTS_PER_HOUR
const TIME_RAIL_WIDTH_PX = 96

// Helper to convert HH:mm:ss to a decimal hour
const timeToDecimal = (time: string | null | undefined): number => {
  if (!time) return 0
  const [hours, minutes] = time.split(":").map(Number)
  return hours + minutes / 60
}

// Helper to convert a decimal hour to a HH:mm string
const decimalToTimeString = (decimal: number): string => {
  const hours = Math.floor(decimal)
  const minutes = Math.round((decimal % 1) * 60)
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
}

const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, "0")
  const day = `${date.getDate()}`.padStart(2, "0")
  return `${year}-${month}-${day}`
}

const parseLocalDateString = (dateString: string): Date => {
  if (!dateString) return new Date(NaN)
  const [ymd] = dateString.split("T")
  const parts = ymd.split("-").map(Number)
  if (parts.length !== 3 || parts.some((p) => Number.isNaN(p))) {
    return new Date(dateString)
  }
  const [year, month, day] = parts
  return new Date(year, month - 1, day)
}

export default function ScheduleClient({
  serverArtists,
  serverServices,
  serverClients,
  serverAppointments,
  currentUserId: initialUserId = null,
  currentUserRole: initialUserRole = null,
}: ScheduleClientProps) {
  const [artists] = useState<Artist[]>(serverArtists)
  const [services] = useState<Service[]>(serverServices)
  const [clients, setClients] = useState<Client[]>(serverClients)
  const [appointments, setAppointments] = useState<Appointment[]>(serverAppointments)

  const [currentDate, setCurrentDate] = useState(new Date())
  const [nowTime, setNowTime] = useState(new Date())
  const [viewMode, setViewMode] = useState<"calendar" | "list" | "stats">("calendar")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [artistFilter, setArtistFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("today")
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false)
  const [isCashPaymentDialogOpen, setIsCashPaymentDialogOpen] = useState(false)
  const [isNewAppointmentDialogOpen, setIsNewAppointmentDialogOpen] = useState(false)
  const [isPartialPaymentDialogOpen, setIsPartialPaymentDialogOpen] = useState(false)
  const suppressViewOpenRef = useRef(false)
  const paymentSectionRef = useRef<HTMLDivElement | null>(null)
  const [highlightPaymentCard, setHighlightPaymentCard] = useState(false)
  const [cardClientSecret, setCardClientSecret] = useState<string | null>(null)
  const [cardPaymentIntentId, setCardPaymentIntentId] = useState<string | null>(null)
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null)
  const stripePromise = useMemo(() => {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
    return loadStripe(publishableKey, stripeAccountId ? { stripeAccount: stripeAccountId } : undefined)
  }, [stripeAccountId])
  const [formData, setFormData] = useState<
    Partial<Appointment & { client_full_name: string; client_phone: string; client_email: string }>
  >({})
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("")
  const [cashPaymentData, setCashPaymentData] = useState({
    amountReceived: 0,
    tip: 0,
    notes: "",
  })
  const [paymentAmount, setPaymentAmount] = useState<number>(0)
  const [formError, setFormError] = useState<string | null>(null)
  const [showNewClientFields, setShowNewClientFields] = useState(false)
  const [isMobileStatsOpen, setIsMobileStatsOpen] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [expandedUnavailableBlocks, setExpandedUnavailableBlocks] = useState<Set<string>>(new Set())
  const dateInputRef = useRef<HTMLInputElement | null>(null)
  const touchStartXRef = useRef<number | null>(null)
  const touchEndXRef = useRef<number | null>(null)

  // Drag selection state
  const [dragSelection, setDragSelection] = useState<DragSelection>({
    isDragging: false,
    artistId: null,
    startTime: null,
    endTime: null,
    currentTime: null,
  })

  // Add after the existing dragSelection state
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null)
  const [isDraggingAppointment, setIsDraggingAppointment] = useState(false)
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null)
  const [dragOverSlot, setDragOverSlot] = useState<{ artistId: string; time: number } | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileArtistId, setMobileArtistId] = useState<string>("all")
  const [currentUserId, setCurrentUserId] = useState<string | null>(initialUserId)
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(initialUserRole)
  const [currentArtistId, setCurrentArtistId] = useState<string | null>(null)
  const [hasMounted, setHasMounted] = useState(false)

  // Get day of week for current date
  const getDayOfWeek = (date: Date) => {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    return days[date.getDay()]
  }

  // Get shop hours for current day
  const getShopHours = (date: Date) => {
    const dayOfWeek = getDayOfWeek(date)
    const shopHours = shopSettings.businessHours[dayOfWeek as keyof typeof shopSettings.businessHours]

    if (shopHours.closed) {
      return { open: 0, close: 0, closed: true }
    }

    const openTime = timeToDecimal(shopHours.open)
    const closeTime = timeToDecimal(shopHours.close)

    return {
      open: openTime,
      close: closeTime,
      closed: false,
    }
  }

  // Generate working hours for full day (12am to 12am)
  const getWorkingHours = (date: Date) => {
    const hours = []
    for (let hour = 0; hour < 24; hour++) {
      hours.push(hour)
    }
    return hours
  }

  // Generate 30-minute time slots for full day scheduling
  const getTimeSlots = (date: Date) => {
    const slots = []
    for (let time = 0; time < 24; time += SLOT_HOURS) {
      slots.push(time)
    }
    return slots
  }

  const workingHours = getWorkingHours(currentDate)
  const timeSlots = getTimeSlots(currentDate)
  const timeRailWidth = isMobile ? 72 : TIME_RAIL_WIDTH_PX
  const timeRailMin = isMobile ? 64 : 84

  useEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)")
    const handleChange = () => setIsMobile(mediaQuery.matches)
    handleChange()
    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  useEffect(() => {
    let isMounted = true

    const resolveArtistLink = (userId: string | null) => {
      if (!userId) {
        setCurrentArtistId(null)
        return
      }
      const linkedArtist = artists.find((artist) => (artist as { user_id?: string }).user_id === userId)
      setCurrentArtistId(linkedArtist?.id || null)
    }

    if (currentUserId && currentUserRole) {
      resolveArtistLink(currentUserId)
      return () => {
        isMounted = false
      }
    }

    const loadUserRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!isMounted) return

      if (!user) {
        setCurrentUserId(null)
        setCurrentUserRole(null)
        setCurrentArtistId(null)
        return
      }

      setCurrentUserId(user.id)

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
      if (!isMounted) return

      setCurrentUserRole(profile?.role || null)
      resolveArtistLink(user.id)
    }

    loadUserRole()

    return () => {
      isMounted = false
    }
  }, [artists, currentUserId, currentUserRole])

  useEffect(() => {
    if (!artists.length) return
    if (mobileArtistId) return
    setMobileArtistId("all")
  }, [artists, mobileArtistId])

  const visibleArtists = useMemo(() => {
    if (!isMobile) return artists
    if (!mobileArtistId || mobileArtistId === "all") return artists
    const selected = artists.find((artist) => artist.id === mobileArtistId)
    return selected ? [selected] : artists
  }, [artists, isMobile, mobileArtistId])


  // Check if artist is available at specific time
  // This is a simplified check. A more robust solution would involve checking artist-specific schedules.
  const isArtistAvailable = (artistId: string, time: number, date: Date) => {
    const artist = artists.find((a) => a.id === artistId)
    if (!artist) return false

    // For now, let's assume artists are available whenever the shop is open.
    // We can add more complex availability logic later if needed.
    const dayOfWeek = getDayOfWeek(date)
    const shopHours = shopSettings.businessHours[dayOfWeek as keyof typeof shopSettings.businessHours]
    if (shopHours.closed) return false

    const openTime = timeToDecimal(shopHours.open)
    const closeTime = timeToDecimal(shopHours.close)

    return time >= openTime && time < closeTime
  }

  // Check if shop is open at specific time
  const isShopOpen = (time: number, date: Date) => {
    const shopHours = getShopHours(date)
    if (shopHours.closed) return false

    return time >= shopHours.open && time < shopHours.close
  }

  const navigateDay = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction === "next" ? 1 : -1))
    setCurrentDate(newDate)
  }

  const handleDateSwipeStart = (event: React.TouchEvent) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null
    touchEndXRef.current = null
  }

  const handleDateSwipeMove = (event: React.TouchEvent) => {
    touchEndXRef.current = event.touches[0]?.clientX ?? null
  }

  const handleDateSwipeEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return
    const deltaX = touchStartXRef.current - touchEndXRef.current
    const threshold = 40
    if (Math.abs(deltaX) < threshold) return
    if (deltaX > 0) {
      navigateDay("next")
    } else {
      navigateDay("prev")
    }
    touchStartXRef.current = null
    touchEndXRef.current = null
  }

  // Get appointments that START in this specific time slot
  const getAppointmentsStartingInSlot = (artistId: string, time: number) => {
    return appointments.filter((apt) => {
      if (!apt.appointment_date) return false
      const aptDate = parseLocalDateString(apt.appointment_date)

      const isSameDay =
        aptDate.getFullYear() === currentDate.getFullYear() &&
        aptDate.getMonth() === currentDate.getMonth() &&
        aptDate.getDate() === currentDate.getDate()

      const aptStartTime = timeToDecimal(apt.start_time)

      return apt.artist_id === artistId && isSameDay && aptStartTime === time

    })
  }

  const isAvailable = (artistId: string, time: number) => {
    const currentDateStr = getLocalDateString(currentDate)

    const canOverride = canOverrideHoursForArtist(artistId)

    if (!canOverride && (!isShopOpen(time, currentDate) || !isArtistAvailable(artistId, time, currentDate))) {
      return false
    }

    const hasAppointment = appointments.some((apt) => {
      if (!apt.appointment_date) return false
      const aptStartTime = timeToDecimal(apt.start_time)
      const aptDuration = (apt.duration || 60) / 60 // default to 1 hour
      return (
        apt.artist_id === artistId &&
        apt.appointment_date.startsWith(currentDateStr) &&
        time >= aptStartTime &&
        time < aptStartTime + aptDuration
      )
    })

    return !hasAppointment
  }

  const getSlotStatus = (artistId: string, time: number) => {
    const currentDateStr = getLocalDateString(currentDate)

    const appointment = appointments.find((apt) => {
      if (!apt.appointment_date) return false
      const aptStartTime = timeToDecimal(apt.start_time)
      const aptDuration = (apt.duration || 60) / 60
      return (
        apt.artist_id === artistId &&
        apt.appointment_date.startsWith(currentDateStr) &&
        time >= aptStartTime &&
        time < aptStartTime + aptDuration
      )
    })

    if (appointment) return "booked"

    // Check if shop is closed
    if (!isShopOpen(time, currentDate)) return "shop-closed"

    // Check if artist is unavailable
    if (!isArtistAvailable(artistId, time, currentDate)) return "artist-unavailable"

    return "available"
  }

  const mobileHourRows = useMemo(() => {
    if (!isMobile || visibleArtists.length !== 1) {
      return workingHours.map((hour) => ({ type: "hour", hour }))
    }

    const artistId = visibleArtists[0].id
    const rows: Array<
      | { type: "hour"; hour: number }
      | { type: "collapsed"; key: string; artistId: string; hiddenHours: number }
    > = []

    let index = 0
    while (index < workingHours.length) {
      const hour = workingHours[index]
      const hourUnavailable =
        isUnavailableStatus(getSlotStatus(artistId, hour)) &&
        isUnavailableStatus(getSlotStatus(artistId, hour + SLOT_HOURS))

      if (!hourUnavailable) {
        rows.push({ type: "hour", hour })
        index += 1
        continue
      }

      const startIndex = index
      while (index < workingHours.length) {
        const scanHour = workingHours[index]
        const scanUnavailable =
          isUnavailableStatus(getSlotStatus(artistId, scanHour)) &&
          isUnavailableStatus(getSlotStatus(artistId, scanHour + SLOT_HOURS))
        if (!scanUnavailable) break
        index += 1
      }

      const blockLength = index - startIndex
      const blockKey = `${artistId}:${workingHours[startIndex]}`
      const isExpanded = expandedUnavailableBlocks.has(blockKey)

      if (blockLength <= 2 || isExpanded) {
        for (let i = startIndex; i < index; i += 1) {
          rows.push({ type: "hour", hour: workingHours[i] })
        }
      } else {
        rows.push({ type: "hour", hour: workingHours[startIndex] })
        rows.push({ type: "hour", hour: workingHours[startIndex + 1] })
        rows.push({
          type: "collapsed",
          key: blockKey,
          artistId,
          hiddenHours: blockLength - 2,
        })
      }
    }

    return rows
  }, [expandedUnavailableBlocks, isMobile, visibleArtists, workingHours, currentDate, appointments])

  const unavailableMidpoints = useMemo(() => {
    const map = new Map<string, Set<number>>()
    visibleArtists.forEach((artist) => {
      const midpoints = new Set<number>()
      let index = 0

      while (index < timeSlots.length) {
        const time = timeSlots[index]
        const status = getSlotStatus(artist.id, time)
        if (!isUnavailableStatus(status)) {
          index += 1
          continue
        }

        const startIndex = index
        while (index < timeSlots.length) {
          const scanTime = timeSlots[index]
          const scanStatus = getSlotStatus(artist.id, scanTime)
          if (!isUnavailableStatus(scanStatus)) break
          index += 1
        }

        const length = index - startIndex
        const midpointIndex = startIndex + Math.floor(length / 2)
        const midpointTime = timeSlots[midpointIndex]
        midpoints.add(Number(midpointTime.toFixed(2)))
      }

      map.set(artist.id, midpoints)
    })

    return map
  }, [visibleArtists, timeSlots, currentDate, appointments])

  const formatTime = (time: number) => {
    const h = Math.floor(time)
    const m = Math.floor((time % 1) * 60)
    const period = h >= 12 ? "PM" : "AM"
    const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h
    return `${displayHour}:${m.toString().padStart(2, "0")}${period}`
  }

  const formatHourOnly = (hour: number) => {
    const period = hour >= 12 ? "pm" : "am"
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:00\n${period}`
  }

  const formatDate = (dateString: string) => {
    const date = parseLocalDateString(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getPaymentsTotal = (appointment?: Appointment | null) => {
    if (!appointment?.payments?.length) return 0
    return appointment.payments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0)
  }

  const getTotalPaid = (appointment?: Appointment | null) => {
    if (!appointment) return 0
    const depositPaid = appointment.deposit_paid || 0
    const paymentsTotal = getPaymentsTotal(appointment)
    return paymentsTotal >= depositPaid ? paymentsTotal : depositPaid + paymentsTotal
  }

  const getBalanceDue = (appointment?: Appointment | null) => {
    if (!appointment) return 0
    const totalPaid = getTotalPaid(appointment)
    return Math.max(0, (appointment.price || 0) - totalPaid)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "in-progress":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-purple-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "deposit":
        return "bg-yellow-100 text-yellow-800"
      case "unpaid":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSlotBackgroundColor = (status: string, isDragSelected = false, isDropTarget = false) => {
    if (isDropTarget) {
      return "bg-blue-200 border-blue-300"
    }
    if (isDragSelected) {
      return "bg-blue-200 border-blue-400"
    }

    switch (status) {
      case "available":
        return "bg-white hover:bg-green-50"
      case "artist-unavailable":
        return "bg-slate-50"
      case "shop-closed":
        return "bg-slate-100"
      case "booked":
        return "bg-white"
      default:
        return "bg-white"
    }
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const getArtistById = (id: any | null | undefined) => {
    if (!id) return null
    return artists.find((artist) => artist.id === id)
  }

  function isUnavailableStatus(status: string) {
    return status === "artist-unavailable" || status === "shop-closed"
  }

  function canOverrideHoursForArtist(artistId: string) {
    if (currentUserRole === "admin" || currentUserRole === "superadmin") return true
    if (currentUserRole === "artist" && currentArtistId === artistId) return true
    return false
  }

  const getUnavailableStyle = (time: number) => {
    const slotIndex = Math.round(time / SLOT_HOURS)
    const offsetY = slotIndex * SLOT_HEIGHT_PX
    return {
      backgroundColor: "#f8fafc",
      backgroundImage:
        "repeating-linear-gradient(135deg, rgba(148,163,184,0.12) 0, rgba(148,163,184,0.12) 8px, transparent 8px, transparent 16px)",
      backgroundSize: "24px 24px",
      backgroundPosition: `0 ${-offsetY}px`,
    }
  }

  const getArtistAvatar = (artist: Artist) => {
    return (
      artist.avatar_url ||
      artist.profileImage ||
      (artist as { avatar?: string }).avatar ||
      (artist as { imageUrl?: string }).imageUrl ||
      "/placeholder-user.jpg"
    )
  }

  const calculatePrice = (artistId: any | null | undefined, duration: number | null | undefined) => {
    const artist = getArtistById(artistId)
    if (!artist || !duration) return 0
    const durationInHours = duration / 60
    return Math.round((artist.hourlyRate || 100) * durationInHours)
  }

  const resetForm = () => {
    setFormData({})
    setSelectedAppointment(null)
    setFormError(null)
    setShowNewClientFields(false)
  }

  const resetCheckout = () => {
    setSelectedPaymentMethod("")
    setCashPaymentData({
      amountReceived: 0,
      tip: 0,
      notes: "",
    })
    setPaymentAmount(0)
    setCardClientSecret(null)
    setCardPaymentIntentId(null)
    setStripeAccountId(null)
  }

  // Drag selection handlers
  const startDragSelection = useCallback(
    (artistId: string, time: number) => {
      if (!isAvailable(artistId, time)) return

      setDragSelection({
        isDragging: true,
        artistId,
        startTime: time,
        endTime: time,
        currentTime: time,
      })
    },
    [isAvailable],
  )

  const handleMouseDown = useCallback(
    (artistId: string, time: number, event: React.MouseEvent) => {
      event.preventDefault()
      startDragSelection(artistId, time)
    },
    [startDragSelection],
  )

  const handleTouchStart = useCallback(
    (artistId: string, time: number, event: React.TouchEvent) => {
      event.preventDefault()
      startDragSelection(artistId, time)
    },
    [startDragSelection],
  )

  const handleMouseEnter = useCallback(
    (artistId: string, time: number) => {
      if (dragSelection.isDragging && dragSelection.artistId === artistId) {
        setDragSelection((prev) => ({
          ...prev,
          currentTime: time,
          endTime: time,
        }))
      }
    },
    [dragSelection.isDragging, dragSelection.artistId],
  )

  const handleMouseUp = useCallback(() => {
    if (dragSelection.isDragging && dragSelection.startTime !== null && dragSelection.endTime !== null) {
      const startTime = Math.min(dragSelection.startTime, dragSelection.endTime)
      const endTime = Math.max(dragSelection.startTime, dragSelection.endTime)
      const duration = endTime - startTime + SLOT_HOURS // Include the end slot

      // Check if all slots in the selection are available
      const allSlotsAvailable = timeSlots
        .filter((slot) => slot >= startTime && slot <= endTime)
        .every((slot) => isAvailable(dragSelection.artistId!, slot))

      if (allSlotsAvailable && dragSelection.artistId) {
        const currentDateStr = getLocalDateString(currentDate)
        const durationValue = duration * 60
        setFormData({
          artist_id: dragSelection.artistId,
          start_time: decimalToTimeString(startTime),
          duration: durationValue,
          appointment_date: currentDateStr,
          status: "confirmed",
          price: calculatePrice(dragSelection.artistId, durationValue),
        })
        setIsNewAppointmentDialogOpen(true)
      }
    }

    setDragSelection({
      isDragging: false,
      artistId: null,
      startTime: null,
      endTime: null,
      currentTime: null,
    })
  }, [calculatePrice, currentDate, dragSelection, isAvailable, timeSlots])

  useEffect(() => {
    if (!dragSelection.isDragging) return

    const handleMoveFromPoint = (clientX: number, clientY: number) => {
      const target = document.elementFromPoint(clientX, clientY) as HTMLElement | null
      const slot = target?.closest("[data-slot='true']") as HTMLElement | null
      if (!slot) return

      const artistId = slot.dataset.artistId
      const timeValue = slot.dataset.time
      if (!artistId || !timeValue) return

      const time = Number.parseFloat(timeValue)
      if (Number.isNaN(time)) return

      handleMouseEnter(artistId, time)
    }

    const handleMouseMove = (event: MouseEvent) => {
      handleMoveFromPoint(event.clientX, event.clientY)
    }

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 0) return
      const touch = event.touches[0]
      handleMoveFromPoint(touch.clientX, touch.clientY)
    }

    const handleUp = () => {
      handleMouseUp()
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleUp)
    window.addEventListener("touchmove", handleTouchMove, { passive: false })
    window.addEventListener("touchend", handleUp)
    window.addEventListener("touchcancel", handleUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleUp)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleUp)
      window.removeEventListener("touchcancel", handleUp)
    }
  }, [dragSelection.isDragging, handleMouseEnter, handleMouseUp])

  useEffect(() => {
    const interval = setInterval(() => {
      setNowTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Add these new functions after the existing drag selection handlers
  const handleAppointmentDragStart = useCallback((appointment: Appointment, event: React.DragEvent) => {
    setDraggedAppointment(appointment)
    setIsDraggingAppointment(true)
    event.dataTransfer.effectAllowed = "move"
  }, [])

  const handleSlotDragLeave = useCallback(() => {
    if (!isDraggingAppointment) return
    setDragOverSlot(null)
  }, [isDraggingAppointment])

  const handleAppointmentDragEnd = useCallback(() => {
    setDraggedAppointment(null)
    setIsDraggingAppointment(false)
    setDropTarget(null)
  }, [])

  const handleSlotDragOver = useCallback(
    (artistId: string, time: number, event: React.DragEvent) => {
      if (isDraggingAppointment) {
        event.preventDefault()
        event.dataTransfer.dropEffect = "move"
        setDropTarget({ artistId, time })
      }
    },
    [isDraggingAppointment],
  )

  const handleSlotDrop = useCallback(
    async (artistId: string, time: number, event: React.DragEvent) => {
      event.preventDefault()

      if (!draggedAppointment || !isDraggingAppointment) return

      const currentDateStr = getLocalDateString(currentDate)
      const appointmentDurationHours = (draggedAppointment.duration || 60) / 60
      const appointmentEndTime = time + appointmentDurationHours
      const canOverride = canOverrideHoursForArtist(artistId)
      const slotsNeeded = []
      for (let t = time; t < appointmentEndTime; t += SLOT_HOURS) {
        slotsNeeded.push(t)
      }

      const allSlotsAvailable = slotsNeeded.every((slot) => {
        if (!canOverride && (!isShopOpen(slot, currentDate) || !isArtistAvailable(artistId, slot, currentDate))) {
          return false
        }
        const hasConflict = appointments.some(
          (apt) => {
            const aptDate = parseLocalDateString(apt.appointment_date)
            const isSameDay =
              aptDate.getFullYear() === currentDate.getFullYear() &&
              aptDate.getMonth() === currentDate.getMonth() &&
              aptDate.getDate() === currentDate.getDate()

            return (
              apt.id !== draggedAppointment.id &&
              apt.artist_id === artistId &&
              isSameDay &&
              slot >= timeToDecimal(apt.start_time) &&
              slot < timeToDecimal(apt.start_time) + (apt.duration || 60) / 60
            )
          }
        )
        return !hasConflict
      })

      if (allSlotsAvailable) {
        const newStartTime = decimalToTimeString(time)

        // Persist change to the backend and get the updated appointment
        const response = await fetch(`/api/appointments/${draggedAppointment.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            artist_id: artistId,
            start_time: newStartTime,
            appointment_date: currentDateStr,
          }),
        })

        if (response.ok) {
          const updatedAppointmentResult = await response.json()
          const flatAppointment = updatedAppointmentResult[0]

          // The API returns a flat object. We need to manually reconstruct the
          // 'enriched' object with nested client, artist, and service details
          // to keep the UI state consistent for subsequent drags.
          const client = clients.find((c) => c.id === flatAppointment.client_id)
          const artist = artists.find((a) => a.id === flatAppointment.artist_id)
          const service = services.find((s) => s.id === flatAppointment.service_id)

          const enrichedAppointment = {
            ...flatAppointment,
            clients: client,
            artists: artist,
            services: service,
          }

          setAppointments((prevAppointments) =>
            prevAppointments.map((apt) => (apt.id === draggedAppointment.id ? enrichedAppointment : apt)),
          )
          toast.success("Appointment updated!")
        } else {
          // If the API call fails, we don't update the UI
          console.error("Failed to move appointment")
        }
      }

      setDraggedAppointment(null)
      setIsDraggingAppointment(false)
      setDropTarget(null)
    },
    [draggedAppointment, isDraggingAppointment, appointments, currentDate],
  )

  // Check if a time slot is in the drag selection
  const isInDragSelection = (artistId: string, time: number) => {
    if (!dragSelection.isDragging || dragSelection.artistId !== artistId) return false
    if (dragSelection.startTime === null || dragSelection.currentTime === null) return false
    if (!isAvailable(artistId, time)) return false

    const start = Math.min(dragSelection.startTime, dragSelection.currentTime)
    const end = Math.max(dragSelection.startTime, dragSelection.currentTime)

    return time >= start && time <= end
  }

  const isDropTarget = (artistId: string, time: number) => {
    if (!dropTarget || !draggedAppointment || dropTarget.artistId !== artistId) {
      return false
    }

    const durationInHours = (draggedAppointment.duration || 60) / 60
    const startTime = dropTarget.time
    const endTime = startTime + durationInHours

    return time >= startTime && time < endTime
  }

  const handleSlotClick = (artistId: string, time: number) => {
    if (isAvailable(artistId, time)) {
      const currentDateStr = getLocalDateString(currentDate)
      const duration = 60
      setFormData({
        artist_id: artistId,
        start_time: decimalToTimeString(time),
        duration: duration,
        appointment_date: currentDateStr,
        status: "pending",
        price: calculatePrice(artistId, duration),
      })
      setIsNewAppointmentDialogOpen(true)
    }
  }

  const handleNewAppointment = () => {
    setFormData({
      status: "confirmed",
      appointment_date: getLocalDateString(currentDate),
      start_time: "09:00:00",
      duration: 60,
    })
    setIsNewAppointmentDialogOpen(true)
  }

  const handleCreateAppointment = async () => {
    setFormError(null)
    let finalClientId = formData.client_id

    // Step 1: Create a new client if needed
    if (showNewClientFields) {
      if (!formData.client_full_name || !formData.client_email) {
        setFormError("New client's Full Name and Email are required.")
        return
      }
      const clientResponse = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.client_full_name,
          email: formData.client_email,
          phone: formData.client_phone,
        }),
      })

      if (!clientResponse.ok) {
        const { error } = await clientResponse.json()
        setFormError(`Failed to create client: ${error}`)
        return
      }
      const newClient = await clientResponse.json()
      finalClientId = newClient.id
      setClients([...clients, newClient]) // Add new client to local state
    }

    if (!finalClientId) {
      setFormError("Please select or create a client.")
      return
    }

    // Step 2: Create the appointment
    const appointmentPayload = {
      client_id: finalClientId,
      artist_id: formData.artist_id,
      service_id: formData.service_id,
      appointment_date: formData.appointment_date,
      start_time: formData.start_time,
      duration: formData.duration,
      price: formData.price,
      status: formData.status,
      notes: formData.notes,
      deposit_paid: formData.deposit_paid,
    }

    const appointmentResponse = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appointmentPayload),
    })

    if (appointmentResponse.ok) {
      const newAppointmentResult = await appointmentResponse.json()
      const newAppointment = newAppointmentResult[0]

      // Manually construct the full appointment object for immediate UI update
      // The API returns a flat object, but the calendar component needs the nested objects
      const client = clients.find((c) => c.id === newAppointment.client_id)
      const artist = artists.find((a) => a.id === newAppointment.artist_id)
      const service = services.find((s) => s.id === newAppointment.service_id)

      const enrichedAppointment = {
        ...newAppointment,
        clients: client,
        artists: artist,
        services: service,
      }

      setAppointments([...appointments, enrichedAppointment])
      setIsNewAppointmentDialogOpen(false)
      resetForm()
      toast.success("Appointment created!")
    } else {
      const { error } = await appointmentResponse.json()
      setFormError(`Failed to create appointment: ${error}`)
    }
  }

  const handleEditAppointment = async () => {
    if (!selectedAppointment) return

    const {
      clients: _clients,
      artists: _artists,
      services: _services,
      ...payload
    } = formData as Partial<Appointment>
    const paymentsTotal = getPaymentsTotal(selectedAppointment)
    const depositPaid = formData.deposit_paid ?? selectedAppointment.deposit_paid ?? 0
    const totalPaid = paymentsTotal >= depositPaid ? paymentsTotal : depositPaid + paymentsTotal
    const hasPayment = totalPaid > 0
    if (hasPayment && payload.status && !["confirmed", "completed"].includes(payload.status)) {
      toast.error("With payments attached, status can only be Confirmed or Completed.")
      return
    }
    if (payload.status === "completed" || payload.status === "in-progress") {
      const balanceDue = getBalanceDue(selectedAppointment)
      if (balanceDue > 0) {
        toast.error("Cannot move to this status while a balance is still due.")
        return
      }
    }
    const response = await fetch(`/api/appointments/${selectedAppointment.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (response.ok) {
      const updatedAppointment = await response.json()
      const nextAppointment = updatedAppointment[0]
      setAppointments(
        appointments.map((apt) => (apt.id === selectedAppointment.id ? nextAppointment : apt)),
      )
      setSelectedAppointment((prev) => (prev?.id === selectedAppointment.id ? nextAppointment : prev))
      setIsEditDialogOpen(false)
      setIsViewDialogOpen(false)
      resetForm()
      toast.success("Appointment updated!")
    } else {
      const message = await response.text()
      console.error("Failed to update appointment", message)
      toast.error(`Failed to update appointment: ${message}`)
    }
  }

  const handleDeleteAppointment = async () => {
    if (selectedAppointment) {
      if (selectedAppointment.payment_status === "paid" || getTotalPaid(selectedAppointment) > 0) {
        toast.error("Cannot cancel or delete this appointment because a payment has been received.")
        return
      }
      await fetch(`/api/appointments/${selectedAppointment.id}`, { method: "DELETE" })
      setAppointments(appointments.filter((apt) => apt.id !== selectedAppointment.id))
      setIsDeleteDialogOpen(false)
      resetForm()
    }
  }

  const handlePaymentMethodSelect = (method: string) => {
    if (!selectedAppointment) return

    const balanceDue = getBalanceDue(selectedAppointment)

    switch (method) {
      case "partial":
        setIsPartialPaymentDialogOpen(true)
        return
      case "card":
        if (paymentAmount <= 0 || paymentAmount > balanceDue) {
          toast.error("Enter a valid partial amount.")
          return
        }
        handleStripeCheckout(paymentAmount)
        break
      case "cash":
        // Open cash payment dialog
        if (paymentAmount <= 0 || paymentAmount > balanceDue) {
          toast.error("Enter a valid partial amount.")
          return
        }
        setCashPaymentData({
          amountReceived: paymentAmount,
          tip: 0,
          notes: "",
        })
        setIsCheckoutDialogOpen(false)
        setIsCashPaymentDialogOpen(true)
        break
      case "cashapp":
        // Generate Cash App link
        if (paymentAmount <= 0 || paymentAmount > balanceDue) {
          toast.error("Enter a valid partial amount.")
          return
        }
        handleCashAppPayment(paymentAmount)
        break
      case "venmo":
        // Generate Venmo link
        if (paymentAmount <= 0 || paymentAmount > balanceDue) {
          toast.error("Enter a valid partial amount.")
          return
        }
        handleVenmoPayment(paymentAmount)
        break
    }
  }

  const handleStripeCheckout = async (amount: number) => {
    if (!selectedAppointment) {
      toast.error("No appointment selected for checkout.")
      return
    }

    if (amount <= 0) {
      toast.error("Enter a valid amount to charge.")
      return
    }

    try {
      setCardClientSecret(null)
      setCardPaymentIntentId(null)
      const response = await fetch("/api/stripe/intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appointmentId: selectedAppointment.id, amount }),
      })

      if (!response.ok) {
        const message = await response.text()
        toast.error(`Payment API error: ${message}`)
        return
      }

      const intent = await response.json()
      if (!intent?.clientSecret) {
        toast.error("Failed to create a valid payment intent.")
        return
      }
      setStripeAccountId(intent.stripeAccountId || null)
      setCardClientSecret(intent.clientSecret)
      setCardPaymentIntentId(intent.paymentIntentId || null)
    } catch (error) {
      console.error("Error during Stripe checkout process:", error)
      toast.error("Could not connect to payment provider.")
    }
  }

  const handleCashAppPayment = (amount: number) => {
    const shopCashAppHandle = "$InkStudioTattoo" // This would be configurable
    const note = `Payment for ${selectedAppointment?.services?.name} - ${selectedAppointment?.clients?.full_name}`
    const cashAppUrl = `https://cash.app/${shopCashAppHandle}/${amount}-note=${encodeURIComponent(note)}`

    // Open Cash App
    window.open(cashAppUrl, "_blank")

    // Mark as pending payment
    setIsCheckoutDialogOpen(false)
    resetCheckout()

    // Show confirmation that link was sent
    alert("Cash App payment link opened. Please confirm payment in Cash App.")
  }

  const handleVenmoPayment = (amount: number) => {
    const shopVenmoHandle = "InkStudio-Tattoo" // This would be configurable
    const note = `Payment for ${selectedAppointment?.services?.name} - ${selectedAppointment?.clients?.full_name}`
    const venmoUrl = `venmo://paycharge-txn=pay&recipients=${shopVenmoHandle}&amount=${amount}&note=${encodeURIComponent(note)}`

    // Try to open Venmo app, fallback to web
    const fallbackUrl = `https://venmo.com/${shopVenmoHandle}-txn=pay&amount=${amount}&note=${encodeURIComponent(note)}`

    try {
      window.location.href = venmoUrl
    } catch {
      window.open(fallbackUrl, "_blank")
    }

    // Mark as pending payment
    setIsCheckoutDialogOpen(false)
    resetCheckout()

    // Show confirmation that link was sent
    alert("Venmo payment link opened. Please confirm payment in Venmo.")
  }

  const handleCashPayment = () => {
    const totalAmount = cashPaymentData.amountReceived + cashPaymentData.tip
    completePayment("cash", totalAmount, cashPaymentData.tip)
    setIsCashPaymentDialogOpen(false)
    resetCheckout()
  }

  const completePayment = async (
    method: string,
    totalAmount: number,
    tip: number,
    details?: { reference?: string | null; card_brand?: string | null; card_last4?: string | null },
  ) => {
    if (selectedAppointment) {
      const appliedAmount = Math.max(0, totalAmount - tip)
      const depositPaid = selectedAppointment.deposit_paid || 0
      const existingPaymentsTotal = getPaymentsTotal(selectedAppointment)
      const nextPaymentsTotal = existingPaymentsTotal + appliedAmount
      const nextTotalPaid = nextPaymentsTotal >= depositPaid ? nextPaymentsTotal : depositPaid + nextPaymentsTotal
      const nextPaymentStatus =
        nextTotalPaid >= (selectedAppointment.price || 0)
          ? ("paid" as const)
          : nextTotalPaid > 0
            ? ("deposit" as const)
            : ("unpaid" as const)
      const nextStatus =
        nextTotalPaid >= (selectedAppointment.price || 0)
          ? ("completed" as const)
          : ((selectedAppointment.status || "confirmed") as Appointment["status"])
      const payload = {
        status: nextStatus,
        payment_status: nextPaymentStatus,
        payment_method: method,
      }

      const response = await fetch(`/api/appointments/${selectedAppointment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const updatedAppointment = await response.json()
        const nextAppointment = updatedAppointment[0]
        const paymentResponse = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            appointment_id: selectedAppointment.id,
            studio_id: selectedAppointment.studio_id,
            amount: totalAmount,
            status: "paid",
            method,
            reference: details?.reference || `${method}-${Date.now()}`,
            card_brand: details?.card_brand ?? null,
            card_last4: details?.card_last4 ?? null,
          }),
        })
        const payment = paymentResponse.ok ? await paymentResponse.json() : null
        const nextPayments = payment
          ? [...(selectedAppointment.payments || []), payment]
          : selectedAppointment.payments
        const mergedAppointment = { ...nextAppointment, payments: nextPayments }
        setAppointments(
          appointments.map((apt) => (apt.id === selectedAppointment.id ? mergedAppointment : apt)),
        )
        setSelectedAppointment(mergedAppointment)
        setPaymentAmount(0)
        setIsCashPaymentDialogOpen(false)
        setIsCheckoutDialogOpen(false)
      }
    }
  }

  const openViewDialog = (appointment: Appointment) => {
    if (suppressViewOpenRef.current) return
    setSelectedAppointment(appointment)
    setIsEditDialogOpen(false)
    setIsNewAppointmentDialogOpen(false)
    setIsDeleteDialogOpen(false)
    setIsCheckoutDialogOpen(false)
    setIsCashPaymentDialogOpen(false)
    setIsViewDialogOpen(true)
  }

  const openEditDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setFormData({
      ...appointment,
      // Format start_time to HH:mm for the input field
      start_time: appointment.start_time ? appointment.start_time.substring(0, 5) : "",
    })
    setShowNewClientFields(false) // Ensure we're in "select existing" mode when editing
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (appointment: Appointment) => {
    if (appointment.payment_status === "paid" || getTotalPaid(appointment) > 0) {
      toast.error("Cannot cancel or delete this appointment because a payment has been received.")
      return
    }
    suppressViewOpenRef.current = true
    setTimeout(() => {
      suppressViewOpenRef.current = false
    }, 0)
    setSelectedAppointment(appointment)
    setIsViewDialogOpen(false)
    setIsEditDialogOpen(false)
    setIsNewAppointmentDialogOpen(false)
    setIsDeleteDialogOpen(true)
  }

  const openCheckoutDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    const balanceDue = getBalanceDue(appointment)
    setPaymentAmount(Math.max(0, balanceDue))
    setIsCheckoutDialogOpen(true)
  }

  const updateAppointmentStatus = async (appointmentId: any, newStatus: Appointment["status"]) => {
    const appointment = appointments.find((apt) => apt.id === appointmentId)
    if (!appointment) return

    if (newStatus === "cancelled") {
      if (appointment.payment_status === "paid" || getTotalPaid(appointment) > 0) {
        toast.error("Cannot cancel this appointment because a payment has been received.")
        return
      }
    }

    const balanceDue = getBalanceDue(appointment)
    if ((newStatus === "completed" || newStatus === "in-progress") && balanceDue > 0) {
      toast.error("Cannot move to this status while a balance is still due.")
      return
    }
    let previousAppointment: Appointment | undefined
    setAppointments((prev) =>
      prev.map((apt) => {
        if (apt.id !== appointmentId) return apt
        previousAppointment = apt
        return { ...apt, status: newStatus }
      }),
    )
    setSelectedAppointment((prev) => (prev?.id === appointmentId ? { ...prev, status: newStatus } : prev))

    const response = await fetch(`/api/appointments/${appointmentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    if (response.ok) {
      const updatedAppointment = await response.json()
      const nextAppointment = updatedAppointment[0]
      setAppointments((prev) => prev.map((apt) => (apt.id === appointmentId ? nextAppointment : apt)))
      setSelectedAppointment((prev) => (prev?.id === appointmentId ? nextAppointment : prev))
      return
    }

    if (previousAppointment) {
      setAppointments((prev) => prev.map((apt) => (apt.id === appointmentId ? previousAppointment! : apt)))
      setSelectedAppointment((prev) => (prev?.id === appointmentId ? previousAppointment! : prev))
    }
  }

  const handleServiceChange = (serviceId: string) => {
    const selectedService = services.find((s) => s.id === serviceId)
    if (!selectedService) return
    const serviceDuration = selectedService.duration ?? selectedService.duration_minutes

    setFormData((prev) => ({
      ...prev,
      service_id: selectedService.id,
      // Always align duration with the selected service when available
      duration: serviceDuration ?? prev.duration,
      price: selectedService.price ?? prev.price,
    }))
  }

  const handleDurationChange = (duration: number) => {
    const updatedFormData = {
      ...formData,
      duration: duration,
    }

    if (updatedFormData.artist_id) {
      updatedFormData.price = calculatePrice(updatedFormData.artist_id, duration)
    }

    setFormData(updatedFormData)
  }

  const handleArtistChange = (artistId: string) => {
    const updatedFormData = {
      ...formData,
      artist_id: artistId,
    }

    if (updatedFormData.duration) {
      updatedFormData.price = calculatePrice(artistId, updatedFormData.duration)
    }

    setFormData(updatedFormData)
  }

  // Get available time slots for artist selection in new appointment dialog
  const getAvailableTimeSlotsForArtist = (artistId: string, date: string) => {
    const appointmentDate = new Date(date)
    const availableSlots = getTimeSlots(appointmentDate)

    return availableSlots.filter((time) => isArtistAvailable(artistId, time, appointmentDate))
  }

  const filteredAppointments = useMemo(() => {
    let filtered = [...appointments]

    // Search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase()
      filtered = filtered.filter((apt) => {
        return (
          apt.clients?.full_name.toLowerCase().includes(lowerSearchTerm) ||
          apt.services?.name.toLowerCase().includes(lowerSearchTerm) ||
          apt.clients?.phone?.includes(lowerSearchTerm) ||
          (apt.clients?.email && apt.clients.email.toLowerCase().includes(lowerSearchTerm))
        )
      })
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((apt) => apt.status === statusFilter)
    }

    // Artist filter
    if (artistFilter !== "all") {
      filtered = filtered.filter((apt) => apt.artist_id === artistFilter)
    }

    // Date filter
    if (dateFilter !== "all") {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay()) // Start of the week (Sunday)
      const weekEnd = new Date(today)
      weekEnd.setDate(today.getDate() + (6 - today.getDay())) // End of the week (Saturday)

      switch (dateFilter) {
        case "today":
          filtered = filtered.filter(
            (apt) => parseLocalDateString(apt.appointment_date).toDateString() === today.toDateString(),
          )
          break
        case "tomorrow":
          filtered = filtered.filter(
            (apt) => parseLocalDateString(apt.appointment_date).toDateString() === tomorrow.toDateString(),
          )
          break
        case "week":
          filtered = filtered.filter(
            (apt) =>
              parseLocalDateString(apt.appointment_date) >= weekStart &&
              parseLocalDateString(apt.appointment_date) <= weekEnd,
          )
          break
        case "upcoming":
          filtered = filtered.filter((apt) => parseLocalDateString(apt.appointment_date) >= today)
          break
        case "past":
          filtered = filtered.filter((apt) => parseLocalDateString(apt.appointment_date) < today)
          break
        default:
          break
      }
    }

    return filtered
  }, [appointments, searchTerm, statusFilter, artistFilter, dateFilter])

  const stats = useMemo(() => {
    const data = viewMode === "calendar" ? appointments : filteredAppointments
    const title =
      viewMode === "calendar"
        ? isToday(currentDate)
          ? "Today"
          : formatDate(getLocalDateString(currentDate))
        : "Filtered List"

    const appointmentsForDate =
      viewMode === "calendar"
        ? data.filter((apt) => {
          const aptDate = parseLocalDateString(apt.appointment_date)
          return (
            aptDate.getFullYear() === currentDate.getFullYear() &&
            aptDate.getMonth() === currentDate.getMonth() &&
            aptDate.getDate() === currentDate.getDate()
          )
        })
        : data

    const revenue = appointmentsForDate.reduce((sum, apt) => {
      if (apt.payment_status === "paid" || apt.status === "completed") {
        return sum + (apt.price || 0)
      }
      return sum
    }, 0)

    const totalBookedHours = appointmentsForDate.reduce((sum, apt) => sum + (apt.duration || 0), 0) / 60

    return {
      title,
      appointments: appointmentsForDate.length,
      revenue,
      bookedHours: totalBookedHours.toFixed(1),
    }
  }, [viewMode, appointments, filteredAppointments, currentDate])

  const statsFilters = useMemo(() => {
    const labels: string[] = []
    if (statusFilter !== "all") {
      labels.push(statusFilter.replace("-", " "))
    }
    if (artistFilter !== "all") {
      const artist = artists.find((item) => item.id === artistFilter)
      if (artist?.name) labels.push(artist.name)
    }
    if (dateFilter && dateFilter !== "today") {
      labels.push(dateFilter.replace("-", " "))
    }
    return labels
  }, [artistFilter, artists, dateFilter, statusFilter])

  return (
    <div className="flex flex-1 flex-col gap-4" onMouseUp={handleMouseUp}>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "calendar" | "list" | "stats")}>
            <TabsList>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Grid3X3 className="h-4 w-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                List
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <ChartBar className="h-4 w-4" />
                Stats
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>


      {viewMode === "calendar" ? (
        <>
          {/* Date Navigation */}
          {isMobile ? (
            <div
              className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm"
              onTouchStart={handleDateSwipeStart}
              onTouchMove={handleDateSwipeMove}
              onTouchEnd={handleDateSwipeEnd}
            >
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => dateInputRef.current?.showPicker?.()}
                  className="flex items-center gap-2 text-base font-semibold text-slate-900"
                >
                  {currentDate.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
                {!isToday(currentDate) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full border border-slate-200 px-3"
                    onClick={() => setCurrentDate(new Date())}
                  >
                    Today
                  </Button>
                )}
              </div>
              <Input
                ref={dateInputRef}
                type="date"
                value={getLocalDateString(currentDate)}
                onChange={(e) => setCurrentDate(parseLocalDateString(e.target.value))}
                className="sr-only"
              />
              <div className="mt-2 text-xs text-slate-500">
                {getShopHours(currentDate).closed
                  ? "Shop hours: Closed"
                  : `Shop hours: ${formatTime(getShopHours(currentDate).open)} - ${formatTime(
                      getShopHours(currentDate).close,
                    )}`}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={() => navigateDay("prev")}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <h2 className="text-xl font-semibold">
                    {currentDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </h2>
                  {isToday(currentDate) && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">Today</span>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={() => navigateDay("next")}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  Shop Hours:{" "}
                  {getShopHours(currentDate).closed
                    ? "Closed"
                    : `${formatTime(getShopHours(currentDate).open)} - ${formatTime(getShopHours(currentDate).close)}`}
                </Badge>
                <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
                  Go to Today
                </Button>
              </div>
            </div>
          )}

          {/* Calendar Grid */}
          <Card className="flex-1 w-full -mx-4 sm:mx-0 rounded-none sm:rounded-xl border-x-0 sm:border">
            <CardContent
              className="p-0"
              onTouchStart={handleDateSwipeStart}
              onTouchMove={handleDateSwipeMove}
              onTouchEnd={handleDateSwipeEnd}
            >
              {isMobile && visibleArtists.length > 0 && (
                <div className="px-4 py-3 border-b bg-gray-50">
                  <Label className="text-xs text-gray-500">Artist</Label>
                  <Select value={mobileArtistId} onValueChange={setMobileArtistId}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="All artists" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All artists</SelectItem>
                      {artists.map((artist) => (
                        <SelectItem key={artist.id} value={artist.id}>
                          {artist.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {/* Artist Headers */}
              <div
                className="grid border-b"
                style={{
                  gridTemplateColumns: `minmax(${timeRailMin}px, ${timeRailWidth}px) repeat(${visibleArtists.length}, minmax(${isMobile ? 140 : 180}px, 1fr))`,
                }}
              >
                <div className="px-4 py-3 border-r bg-gray-50" />
                {visibleArtists.map((artist) => (
                    <div key={artist.id} className="p-3 border-r last:border-r-0 bg-gray-50">
                      <div className="flex flex-col items-center justify-center gap-2 text-center">
                      <Avatar className={`ring-2 ring-white shadow-sm ${isMobile ? "h-8 w-8" : "h-10 w-10"}`}>
                        <AvatarImage
                          src={getArtistAvatar(artist)}
                          alt={artist.name}
                        />
                        <AvatarFallback className="text-xs">
                          {artist.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className={`font-medium text-gray-900 ${isMobile ? "text-xs" : "text-sm"}`}>
                          {artist.name}
                        </div>
                        <div className="hidden">
                          {artist.specialty} - ${artist.hourlyRate}/hr
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              <div className="relative">
                {hasMounted && isToday(currentDate) && (
                  <div
                    className="absolute z-30 pointer-events-none"
                    style={{
                      top: `${(nowTime.getHours() + nowTime.getMinutes() / 60 + nowTime.getSeconds() / 3600) * HOUR_ROW_HEIGHT_PX}px`,
                      left: `${timeRailWidth}px`,
                      right: 0,
                    }}
                  >
                    <div className="relative h-0.5 bg-red-500/90">
                      <div className="absolute -left-2 -top-1 h-3 w-3 rounded-full bg-red-500 shadow" />
                      <div className="absolute -left-14 -top-2 rounded-full bg-white border border-red-200 px-2 py-0.5 text-[10px] font-semibold text-red-600 shadow-sm">
                        {nowTime.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                )}
                {mobileHourRows.map((row) => {
                  if (row.type === "collapsed") {
                    return (
                      <div
                        key={`collapsed-${row.key}`}
                        className="grid border-b last:border-b-0 bg-slate-50"
                        style={{
                          minHeight: `${HOUR_ROW_HEIGHT_PX}px`,
                          gridTemplateColumns: `minmax(${timeRailMin}px, ${timeRailWidth}px) repeat(${visibleArtists.length}, minmax(${isMobile ? 140 : 180}px, 1fr))`,
                        }}
                      >
                        <div className="px-3 border-r bg-gray-50" />
                        {visibleArtists.map((artist) => (
                          <div key={artist.id} className="border-r last:border-r-0 flex items-center justify-center">
                            {artist.id === row.artistId ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setExpandedUnavailableBlocks((prev) => {
                                    const next = new Set(prev)
                                    next.add(row.key)
                                    return next
                                  })
                                }}
                              >
                                Show {row.hiddenHours} more hours unavailable
                              </Button>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    )
                  }

                  const hour = row.hour
                  return (
                    <div
                      key={hour}
                      className="grid border-b last:border-b-0"
                      style={{
                        minHeight: `${HOUR_ROW_HEIGHT_PX}px`,
                        gridTemplateColumns: `minmax(${timeRailMin}px, ${timeRailWidth}px) repeat(${visibleArtists.length}, minmax(${isMobile ? 140 : 180}px, 1fr))`,
                      }}
                    >
                      {/* Time label */}
                      <div className="px-3 border-r bg-gray-50 flex items-start">
                        <div className="pt-1 text-left leading-none">
                          <div className="text-[13px] font-semibold text-gray-900">
                            {formatTime(hour).replace(":00", "")}
                          </div>
                          <div className="text-[10px] uppercase tracking-widest text-gray-500">
                            {hour >= 12 ? "pm" : "am"}
                          </div>
                        </div>
                      </div>

                      {/* Artist columns */}
                      {visibleArtists.map((artist) => (
                        <div key={artist.id} className="border-r last:border-r-0 relative">
                          {/* 30-minute subdivisions */}
                          <div
                            className="grid"
                            style={{
                              height: `${HOUR_ROW_HEIGHT_PX}px`,
                              gridTemplateRows: `repeat(${SLOTS_PER_HOUR}, minmax(0, 1fr))`,
                            }}
                          >
                            {Array.from({ length: SLOTS_PER_HOUR }, (_, index) => index * SLOT_HOURS).map((slotOffset) => {
                              const time = hour + slotOffset
                            const slotAppointments = getAppointmentsStartingInSlot(artist.id, time)
                            const slotStatus = getSlotStatus(artist.id, time)
                            const isBookable = isAvailable(artist.id, time)
                            const isDragSelected = isInDragSelection(artist.id, time)
                            const isTarget = isDropTarget(artist.id, time)
                            const isUnavailable = isUnavailableStatus(slotStatus)
                            const timeKey = Number(time.toFixed(2))
                            const showUnavailableLabel = isUnavailable && unavailableMidpoints.get(artist.id)?.has(timeKey)
                            const selectionStart =
                              dragSelection.isDragging &&
                              dragSelection.artistId === artist.id &&
                              dragSelection.startTime !== null &&
                              dragSelection.currentTime !== null
                                ? Math.min(dragSelection.startTime, dragSelection.currentTime)
                                : null
                            const selectionEnd =
                              dragSelection.isDragging &&
                              dragSelection.artistId === artist.id &&
                              dragSelection.startTime !== null &&
                              dragSelection.currentTime !== null
                                ? Math.max(dragSelection.startTime, dragSelection.currentTime) + SLOT_HOURS
                                : null
                            const showRangeLabel =
                              isDragSelected &&
                              selectionStart !== null &&
                              selectionEnd !== null &&
                              time === selectionStart

                              return (
                                <div
                                  key={slotOffset}
                                  className={`border-b last:border-b-0 p-1 transition-all relative group touch-none ${getSlotBackgroundColor(
                                    slotStatus,
                                    isDragSelected,
                                    isTarget,
                                  )} ${isBookable ? "cursor-pointer hover:bg-green-100" : "cursor-not-allowed"} ${
                                    isDragSelected ? "border-2 border-blue-400" : ""
                                  } ${
                                    isDraggingAppointment && isBookable && !isTarget
                                      ? "hover:bg-blue-100 hover:border-2 hover:border-blue-300"
                                      : ""
                                  }`}
                                  style={isUnavailable ? getUnavailableStyle(time) : undefined}
                                  data-slot="true"
                                  data-artist-id={artist.id}
                                  data-time={time}
                                  title={formatTime(time)}
                                  onClick={() =>
                                    isBookable &&
                                    !dragSelection.isDragging &&
                                    !isDraggingAppointment &&
                                    handleSlotClick(artist.id, time)
                                  }
                                  onMouseDown={(e) =>
                                    isBookable && !isDraggingAppointment && handleMouseDown(artist.id, time, e)
                                  }
                                  onTouchStart={(e) =>
                                    isBookable && !isDraggingAppointment && handleTouchStart(artist.id, time, e)
                                  }
                                  onMouseEnter={() => !isDraggingAppointment && handleMouseEnter(artist.id, time)}
                                  onDragOver={(e) => handleSlotDragOver(artist.id, time, e)}
                                  onDragLeave={handleSlotDragLeave}
                                  onDrop={(e) => handleSlotDrop(artist.id, time, e)}
                                >
                                {/* Time indicator for all time marks - show on hover */}
                                <div className="absolute left-1 top-0 text-[11px] text-gray-700 bg-white/90 border border-gray-200 rounded px-1.5 py-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                                  {formatTime(time)}
                                </div>

                                {isBookable && !isDragSelected && (
                                  <div className="absolute inset-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Plus className="h-4 w-4 text-green-600" />
                                  </div>
                                )}

                                {showRangeLabel && (
                                  <div className="absolute left-2 top-1 z-20 rounded-full bg-blue-600/90 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                                    {formatTime(selectionStart)}–{formatTime(selectionEnd)}
                                  </div>
                                )}

                                {/* Show availability status for unavailable slots */}
                                {/* {slotStatus === "artist-unavailable" && quarterHour === 0 && (
                                  <div className="absolute inset-1 flex items-center justify-center">
                                    <span className="text-xs text-gray-500 text-center">
                                      Artist
                                      <br />
                                      Unavailable
                                    </span>
                                  </div>
                                )} */}

                                {showUnavailableLabel && (
                                  <div className="absolute inset-1 flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-500 text-center">Not Available</span>
                                  </div>
                                )}

                                {/* Drop zone indicator when dragging */}
                                {isDraggingAppointment &&
                                  isBookable &&
                                  dragOverSlot?.artistId === artist.id &&
                                  dragOverSlot?.time === time && (
                                    <div className="absolute inset-1 border-2 border-dashed border-blue-400 rounded opacity-100 transition-opacity flex items-center justify-center">
                                      <div className="text-xs text-blue-600 font-medium">Drop Here</div>
                                    </div>
                                  )}

                                {slotAppointments.map((appointment) => (
                                  <div
                                    key={appointment.id}
                                    className={`absolute inset-1 rounded-lg p-2 border shadow-sm overflow-hidden ${getStatusColor(
                                      appointment.status,
                                    )} group cursor-move hover:shadow-md transition-all z-10 ${
                                      dragSelection.isDragging ? "pointer-events-none" : ""
                                    } ${
                                      isDraggingAppointment && draggedAppointment?.id === appointment.id
                                        ? "opacity-50 scale-105"
                                        : ""
                                    }`}
                                    style={{
                                      height: `calc(${((appointment.duration || 60) / SLOT_MINUTES) * SLOT_HEIGHT_PX}px - 8px)`,
                                    }}
                                    title={`${formatTime(timeToDecimal(appointment.start_time))}–${formatTime(
                                      timeToDecimal(appointment.start_time) + (appointment.duration || 60) / 60,
                                    )}`}
                                    draggable={true}
                                    onDragStart={(e) => handleAppointmentDragStart(appointment, e)}
                                    onDragEnd={handleAppointmentDragEnd}
                                    onMouseDown={(e) => e.stopPropagation()} // Prevent clash with new appointment drag
                                    onMouseUp={(e) => {
                                      if (e.button !== 0) return
                                      if (suppressViewOpenRef.current) return
                                      const target = e.target as HTMLElement
                                      if (target.closest("[data-appointment-menu]")) return
                                      e.stopPropagation()
                                      openViewDialog(appointment)
                                    }}
                                  >
                                    <div className="flex items-start justify-between h-full">
                                      <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-xs mb-1 truncate">
                                          {appointment.clients?.full_name}
                                          <span className="ml-2 font-normal text-[10px] text-gray-600">
                                            {formatTime(timeToDecimal(appointment.start_time))}–
                                            {formatTime(
                                              timeToDecimal(appointment.start_time) +
                                                (appointment.duration || 60) / 60,
                                            )}
                                          </span>
                                        </div>
                                        <div className="text-xs mb-1 opacity-90 truncate">
                                          {appointment.services?.name}
                                        </div>
                                        <div className="flex items-center justify-between">
                                          {appointment.price && (
                                            <div className="text-xs opacity-75">${appointment.price}</div>
                                          )}
                                          <Badge
                                            className={`${getPaymentStatusColor(
                                              appointment.payment_status || "unpaid",
                                            )} text-xs px-1 py-0`}
                                          >
                                            {appointment.payment_status || "unpaid"}
                                          </Badge>
                                        </div>
                                      </div>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="opacity-0 group-hover:opacity-100 h-4 w-4 p-0"
                                            onClick={(e) => e.stopPropagation()}
                                            onMouseUp={(e) => e.stopPropagation()}
                                            data-appointment-menu
                                          >
                                            <MoreHorizontal className="h-2 w-2" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem onClick={() => openViewDialog(appointment)}>
                                            <User className="mr-2 h-4 w-4" />
                                            View Details
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => openEditDialog(appointment)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                          </DropdownMenuItem>
                                          {appointment.status === "pending" && (
                                            <DropdownMenuItem
                                              onClick={() => updateAppointmentStatus(appointment.id, "confirmed")}
                                            >
                                              <CheckCircle className="mr-2 h-4 w-4" />
                                              Confirm
                                            </DropdownMenuItem>
                                          )}
                                          {(appointment.status === "confirmed" ||
                                            appointment.status === "in-progress") && (
                                              <DropdownMenuItem
                                                onClick={() => updateAppointmentStatus(appointment.id, "in-progress")}
                                              >
                                                <Clock className="mr-2 h-4 w-4" />
                                                Start Session
                                              </DropdownMenuItem>
                                            )}
                                          {(appointment.status === "confirmed" ||
                                            appointment.status === "in-progress") &&
                                            appointment.payment_status !== "paid" && (
                                              <DropdownMenuItem onClick={() => openCheckoutDialog(appointment)}>
                                                <CreditCard className="mr-2 h-4 w-4" />
                                                Checkout
                                              </DropdownMenuItem>
                                            )}
                                          <DropdownMenuItem
                                            onClick={() => openDeleteDialog(appointment)}
                                            onMouseDown={() => {
                                              suppressViewOpenRef.current = true
                                            }}
                                            className="text-red-600"
                                          >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Cancel
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                    </div>
                                  </div>
                                ))}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </>
      ) : viewMode === "list" ? (
        <>
          {/* Filters for List View */}
          {isMobile ? (
            <div className="rounded-xl border border-slate-200 bg-white">
              <Button
                variant="ghost"
                className="w-full justify-between"
                onClick={() => setIsFiltersOpen((prev) => !prev)}
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </span>
                <span className="text-xs text-slate-500">{isFiltersOpen ? "Hide" : "Show"}</span>
              </Button>
              {isFiltersOpen && (
                <div className="p-4 pt-0">
                  <div className="flex flex-col gap-3">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search appointments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={artistFilter} onValueChange={setArtistFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Artist" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Artists</SelectItem>
                        {artists.map((artist) => (
                          <SelectItem key={artist.id} value={artist.id.toString()}>
                            {artist.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Date" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Dates</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="tomorrow">Tomorrow</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="past">Past</SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge variant="secondary">{filteredAppointments.length} results</Badge>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search appointments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={artistFilter} onValueChange={setArtistFilter}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Artist" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Artists</SelectItem>
                      {artists.map((artist) => (
                        <SelectItem key={artist.id} value={artist.id.toString()}>
                          {artist.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Dates</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="tomorrow">Tomorrow</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="past">Past</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge variant="secondary">{filteredAppointments.length} results</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appointments List */}
          <Card>
            <CardHeader>
              <CardTitle>Appointments</CardTitle>
              <CardDescription>
                {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? "s" : ""} found
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="space-y-2 p-4">
                  {filteredAppointments.map((appointment) => {
                    const artist = getArtistById(appointment.artist_id)
                    const appointmentDate = parseLocalDateString(appointment.appointment_date)
                    const isAppointmentToday = appointmentDate.toDateString() === new Date().toDateString()
                    const isPast = appointmentDate < new Date()

                    return (
                      <Card
                        key={appointment.id}
                        className={`transition-colors hover:bg-gray-50 ${isAppointmentToday ? "border-blue-200 bg-blue-50" : ""
                          }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  src={artist ? getArtistAvatar(artist) : "/placeholder-user.jpg"}
                                  alt={artist?.name || "Artist"}
                                />
                                <AvatarFallback>
                                  {artist?.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold">{appointment.clients?.full_name}</h3>
                                  <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                                  {isAppointmentToday && (
                                    <Badge variant="outline" className="text-blue-600">
                                      Today
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {artist?.name}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(appointment.appointment_date)}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatTime(timeToDecimal(appointment.start_time))} -{" "}
                                    {formatTime(
                                      timeToDecimal(appointment.start_time) +
                                      (appointment.duration || 0) / 60,
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />${appointment.price}
                                  </div>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  <span className="font-medium">{appointment.services?.name}</span>
                                  {appointment.deposit_paid && (
                                    <span className="ml-2">- Deposit: ${appointment.deposit_paid}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(appointment.status)}
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => e.stopPropagation()}
                                        onMouseUp={(e) => e.stopPropagation()}
                                        data-appointment-menu
                                      >
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openViewDialog(appointment)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openEditDialog(appointment)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  {appointment.status === "pending" && (
                                    <DropdownMenuItem
                                      onClick={() => updateAppointmentStatus(appointment.id, "confirmed")}
                                    >
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Confirm
                                    </DropdownMenuItem>
                                  )}
                                  {appointment.status === "confirmed" && !isPast && (
                                    <DropdownMenuItem
                                      onClick={() => updateAppointmentStatus(appointment.id, "completed")}
                                    >
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Mark Complete
                                    </DropdownMenuItem>
                                  )}
                                  {(appointment.status === "confirmed" || appointment.status === "in-progress") &&
                                    appointment.payment_status !== "paid" && (
                                      <DropdownMenuItem onClick={() => openCheckoutDialog(appointment)}>
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        Checkout
                                      </DropdownMenuItem>
                                    )}
                                  <DropdownMenuItem
                                    onClick={() => openDeleteDialog(appointment)}
                                    onMouseDown={() => {
                                      suppressViewOpenRef.current = true
                                    }}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Cancel
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                  {filteredAppointments.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No appointments found matching your filters.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-3 flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-semibold text-slate-700">Stats</div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="secondary">Today</Badge>
              {statsFilters.map((label) => (
                <Badge key={label} variant="outline">
                  {label}
                </Badge>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFiltersOpen((prev) => !prev)}
              >
                Edit filters
              </Button>
            </div>
          </div>
          {isFiltersOpen && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={artistFilter} onValueChange={setArtistFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Artist" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Artists</SelectItem>
                    {artists.map((artist) => (
                      <SelectItem key={artist.id} value={artist.id.toString()}>
                        {artist.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="tomorrow">Tomorrow</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="past">Past</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStatusFilter("all")
                      setArtistFilter("all")
                      setDateFilter("today")
                    }}
                  >
                    Reset filters
                  </Button>
                </div>
              </div>
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Appointments ({stats.title})</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.appointments}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue ({stats.title})</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.revenue.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Booked Hours ({stats.title})</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.bookedHours}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* View Appointment Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur border border-slate-200/80 shadow-2xl sm:rounded-2xl p-6 sm:p-8">
          <DialogHeader className="pb-4 border-b border-slate-200/70">
            <div className="flex items-center justify-between gap-4">
              <div>
                <DialogTitle className="text-xl">Appointment Details</DialogTitle>
                {selectedAppointment && (
                  <button
                    type="button"
                    className="mt-1 text-xs text-slate-400 hover:text-slate-500 transition text-left"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedAppointment.id)
                      toast.success("Appointment ID copied")
                    }}
                  >
                    ID: {selectedAppointment.id}
                  </button>
                )}
              </div>
              {selectedAppointment && (
                <Badge className={getStatusColor(selectedAppointment.status)}>{selectedAppointment.status}</Badge>
              )}
            </div>
          </DialogHeader>
          {selectedAppointment && (
            <div className="grid gap-6 pt-4 lg:grid-cols-[280px_1fr]">
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-14 w-14 border border-white shadow-sm">
                      <AvatarImage src={selectedAppointment.clients?.avatar_url} />
                      <AvatarFallback>
                        {selectedAppointment.clients?.full_name
                          ?.split(" ")
                          .map((part) => part[0])
                          .join("") || "CL"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-base font-semibold">{selectedAppointment.clients?.full_name}</div>
                      <div className="text-xs text-slate-500">{selectedAppointment.clients?.email}</div>
                      {selectedAppointment.clients?.phone && (
                        <div className="text-xs text-slate-500">{selectedAppointment.clients?.phone}</div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Date</span>
                      <span className="font-medium">{formatDate(selectedAppointment.appointment_date)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Time</span>
                      <span className="font-medium">
                        {formatTime(timeToDecimal(selectedAppointment.start_time))} -{" "}
                        {formatTime(
                          timeToDecimal(selectedAppointment.start_time) +
                          (selectedAppointment.duration || 0) / 60,
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Duration</span>
                      <span className="font-medium">{formatDuration(selectedAppointment.duration)}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge className={getStatusColor(selectedAppointment.status)}>{selectedAppointment.status}</Badge>
                    <Badge className={getPaymentStatusColor(selectedAppointment.payment_status || "unpaid")}>
                      {selectedAppointment.payment_status || "unpaid"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div
                  ref={paymentSectionRef}
                  className={`rounded-2xl border bg-white p-5 transition-shadow ${
                    highlightPaymentCard ? "border-emerald-300 shadow-[0_0_0_2px_rgba(16,185,129,0.25)]" : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-700">Service & Payment</div>
                      <div className="mt-1 text-base font-medium">{selectedAppointment.services?.name}</div>
                      <div className="text-xs text-slate-500">
                        {selectedAppointment.artists?.name} - {formatDuration(selectedAppointment.duration)}
                      </div>
                    </div>
                    <div className="text-sm font-semibold">${selectedAppointment.price}</div>
                  </div>
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                    <div className="grid gap-2 text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Price</span>
                      <span className="font-semibold text-slate-900">
                        ${selectedAppointment.price || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Deposit</span>
                      <span className="font-semibold text-slate-900">- ${selectedAppointment.deposit_paid || 0}</span>
                    </div>
                    {(() => {
                      const paymentsTotal = getPaymentsTotal(selectedAppointment)
                      const depositPaid = selectedAppointment.deposit_paid || 0
                      const otherPayments = paymentsTotal >= depositPaid ? paymentsTotal - depositPaid : paymentsTotal
                      if (otherPayments <= 0) return null
                      return (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">Payments</span>
                          <span className="font-semibold text-slate-900">- ${otherPayments}</span>
                        </div>
                      )
                    })()}
                    {(() => {
                      const payments = selectedAppointment.payments || []
                      if (!payments.length) return null
                      const sortedPayments = [...payments].sort(
                        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
                      )
                      return (
                        <div className="rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-600">
                          <div className="flex items-center justify-between">
                            <span>Payments</span>
                            <span className="font-semibold">{sortedPayments.length}</span>
                          </div>
                          <div className="mt-2 space-y-2">
                            {sortedPayments.map((payment) => {
                              const shortRef = payment.reference
                                ? `${payment.reference.slice(0, 6)}...${payment.reference.slice(-4)}`
                                : null
                              return (
                                <div key={payment.id} className="rounded-md border border-slate-200 p-2">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">${payment.amount}</span>
                                    <span className="text-slate-500">
                                      {new Date(payment.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="mt-1 flex items-center justify-between">
                                    <span className="text-slate-500">Method</span>
                                    <span className="uppercase">{payment.method || "N/A"}</span>
                                  </div>
                                  {payment.card_brand && payment.card_last4 && (
                                    <div className="mt-1 flex items-center justify-between">
                                      <span className="text-slate-500">Card</span>
                                      <span className="uppercase">
                                        {payment.card_brand} **** {payment.card_last4}
                                      </span>
                                    </div>
                                  )}
                                  <div className="mt-1 flex items-center justify-between">
                                    <span className="text-slate-500">Reference</span>
                                    {shortRef ? (
                                      <span className="text-slate-900">{shortRef}</span>
                                    ) : (
                                      <span className="text-slate-400">-</span>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })()}
                    <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
                      <span className="text-xs text-slate-500">Balance due</span>
                      <span className="font-semibold text-emerald-700">${getBalanceDue(selectedAppointment)}</span>
                    </div>
                    </div>
                  </div>
                </div>

                {selectedAppointment.notes && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                    <div className="text-sm font-semibold text-slate-700">Notes</div>
                    <p className="mt-2 text-sm text-slate-700">{selectedAppointment.notes}</p>
                  </div>
                )}

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="text-xs text-slate-500">
                    Created {new Date(selectedAppointment.created_at).toLocaleString()}
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    {(() => {
                      const balanceDue = getBalanceDue(selectedAppointment)
                      const isFullyPaid = balanceDue === 0
                      const isPending = selectedAppointment.status === "pending"
                      const isConfirmed =
                        selectedAppointment.status === "confirmed" ||
                        selectedAppointment.status === "in-progress"

                      if ((isPending || isConfirmed) && balanceDue > 0) {
                        return (
                          <Button
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              setIsViewDialogOpen(false)
                              openCheckoutDialog(selectedAppointment)
                            }}
                          >
                            Checkout
                          </Button>
                        )
                      }

                      if (isFullyPaid) {
                        return (
                          <Button
                            className="flex-1"
                            onClick={() => {
                              paymentSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
                              setHighlightPaymentCard(true)
                              window.setTimeout(() => setHighlightPaymentCard(false), 1400)
                            }}
                          >
                            View Sale
                          </Button>
                        )
                      }

                      return (
                        <Button
                          className="flex-1"
                          onClick={() => {
                            setIsViewDialogOpen(false)
                            openCheckoutDialog(selectedAppointment)
                          }}
                        >
                          Checkout
                        </Button>
                      )
                    })()}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setIsViewDialogOpen(false)}>Close</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New/Edit Appointment Dialog */}
      <Dialog
        open={isNewAppointmentDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsNewAppointmentDialogOpen(false)
            setIsEditDialogOpen(false)
            setIsViewDialogOpen(false)
            resetForm()
          }
        }}
      >
        <DialogContent className="max-w-3xl bg-white/95 backdrop-blur border border-slate-200/80 shadow-2xl sm:rounded-2xl p-8">
          <DialogHeader className="pb-4 border-b border-slate-200/70">
            <DialogTitle className="text-xl">
              {isEditDialogOpen ? "Edit Appointment" : "New Appointment"}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              {isEditDialogOpen ? "Update appointment details" : "Create a new appointment"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-2">
            <div>
              <Label htmlFor="client_id">Client *</Label>
              <Select
                value={formData.client_id?.toString() || ""}
                onValueChange={(value) => {
                  if (value === "new-client") {
                    setShowNewClientFields(true)
                    setFormData({ ...formData, client_id: undefined })
                  } else {
                    setShowNewClientFields(false)
                    setFormData({ ...formData, client_id: value })
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an existing client or create new" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.full_name} ({client.email})
                    </SelectItem>
                  ))}
                  <Separator />
                  <SelectItem value="new-client">
                    <span className="font-medium text-blue-600">Create New Client...</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {showNewClientFields && (
              <div className="space-y-4 p-4 border rounded-md bg-gray-50">
                <h4 className="font-medium">New Client Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client_full_name">Full Name *</Label>
                    <Input
                      id="client_full_name"
                      value={formData.client_full_name || ""}
                      onChange={(e) => setFormData({ ...formData, client_full_name: e.target.value })}
                      placeholder="Enter client's full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="client_phone">Phone</Label>
                    <Input
                      id="client_phone"
                      value={formData.client_phone || ""}
                      onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="client_email">Email *</Label>
                  <Input
                    id="client_email"
                    type="email"
                    value={formData.client_email || ""}
                    onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                    placeholder="client@email.com"
                  />
                </div>
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="artist_id">Artist *</Label>
                <Select value={formData.artist_id?.toString() || ""} onValueChange={handleArtistChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select artist" />
                  </SelectTrigger>
                  <SelectContent>
                    {artists.map((artist) => (
                      <SelectItem key={artist.id} value={artist.id.toString()}>
                        {artist.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="service_id">Service *</Label>
                <Select value={formData.service_id?.toString() || ""} onValueChange={handleServiceChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id.toString()}>
                        {service.name} ({formatDuration(service.duration ?? service.duration_minutes)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.duration ? (
                  <p className="mt-1 text-xs text-muted-foreground">Duration: {formatDuration(formData.duration)}</p>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="appointment_date">Date *</Label>
                <Input
                  id="appointment_date"
                  type="date"
                  value={formData.appointment_date || ""}
                  onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="start_time">Start Time *</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time || ""}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration || ""}
                  onChange={(e) => handleDurationChange(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price || ""}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  placeholder="Auto-calculated"
                />
              </div>
              <div>
                <Label htmlFor="deposit_paid">Deposit Paid ($)</Label>
                <Input
                  id="deposit_paid"
                  type="number"
                  value={formData.deposit_paid || ""}
                  onChange={(e) => setFormData({ ...formData, deposit_paid: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status || "pending"}
                  onValueChange={(value) => setFormData({ ...formData, status: value as Appointment["status"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(() => {
                      const paymentsTotal = getPaymentsTotal(selectedAppointment)
                      const price = formData.price ?? selectedAppointment?.price ?? 0
                      const depositPaid = formData.deposit_paid ?? selectedAppointment?.deposit_paid ?? 0
                      const totalPaid = paymentsTotal >= depositPaid ? paymentsTotal : depositPaid + paymentsTotal
                      const balanceDue = Math.max(0, price - totalPaid)
                      const hasPayment = totalPaid > 0

                      if (hasPayment) {
                        return (
                          <>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            {balanceDue === 0 && <SelectItem value="completed">Completed</SelectItem>}
                          </>
                        )
                      }

                      return (
                        <>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="no-show">No Show</SelectItem>
                          {balanceDue === 0 && (
                            <>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </>
                          )}
                        </>
                      )
                    })()}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about the appointment..."
                rows={3}
              />
            </div>
            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsNewAppointmentDialogOpen(false)
                  setIsEditDialogOpen(false)
                  setIsViewDialogOpen(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={isEditDialogOpen ? handleEditAppointment : handleCreateAppointment}
                disabled={
                  (!showNewClientFields && !formData.client_id && !isEditDialogOpen) ||
                  (showNewClientFields && !formData.client_full_name) ||
                  !formData.service_id ||
                  !formData.artist_id
                }
              >
                {isEditDialogOpen ? "Update Appointment" : "Create Appointment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment with {selectedAppointment?.clients?.full_name}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAppointment} className="bg-red-600 hover:bg-red-700">
              Cancel Appointment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutDialogOpen} onOpenChange={setIsCheckoutDialogOpen}>
        <DialogContent className="max-w-xl bg-white/95 backdrop-blur border border-slate-200/80 shadow-2xl sm:rounded-2xl p-6">
          <DialogHeader className="pb-3 border-b border-slate-200/70">
            <DialogTitle className="text-lg">Checkout</DialogTitle>
            <DialogDescription className="text-slate-500">
              {selectedAppointment?.clients?.full_name} - Select payment method
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <div className="flex justify-between">
                  <span>Service:</span>
                  <span className="font-medium">{selectedAppointment.services?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Price:</span>
                  <span className="font-medium">${selectedAppointment.price}</span>
                </div>
                <div className="flex justify-between">
                  <span>Deposit Paid:</span>
                  <span className="font-medium">${selectedAppointment.deposit_paid || 0}</span>
                </div>
                {(() => {
                  const paymentsTotal = getPaymentsTotal(selectedAppointment)
                  const depositPaid = selectedAppointment.deposit_paid || 0
                  const otherPayments = paymentsTotal >= depositPaid ? paymentsTotal - depositPaid : paymentsTotal
                  if (otherPayments <= 0) return null
                  return (
                    <div className="flex justify-between">
                      <span>Payments:</span>
                      <span className="font-medium">-${otherPayments}</span>
                    </div>
                  )
                })()}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Balance Due:</span>
                  <span>${getBalanceDue(selectedAppointment)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Select Payment Method</Label>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((method) => (
                    <Button
                      key={method.id}
                      variant="outline"
                      className={`h-auto p-4 flex flex-col items-center gap-2 ${method.color}`}
                      onClick={() => handlePaymentMethodSelect(method.id)}
                    >
                      <method.icon className="h-6 w-6" />
                      <div className="text-center">
                        <div className="font-medium">{method.name}</div>
                        <div className="text-xs opacity-75">{method.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCheckoutDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
          {cardClientSecret && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <Elements stripe={stripePromise} options={{ clientSecret: cardClientSecret }}>
                <CardPaymentForm
                  clientSecret={cardClientSecret}
                  amount={paymentAmount}
                  onSuccess={async (intentId) => {
                    if (!selectedAppointment) return
                    const detailsResponse = await fetch("/api/stripe/intent-details", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        appointmentId: selectedAppointment.id,
                        paymentIntentId: intentId,
                      }),
                    })
                    const details = detailsResponse.ok ? await detailsResponse.json() : {}
                    await completePayment("card", paymentAmount, 0, details)
                    setCardClientSecret(null)
                    setCardPaymentIntentId(null)
                    setIsCheckoutDialogOpen(false)
                  }}
                  onError={(message) => toast.error(message)}
                />
              </Elements>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Partial Payment Amount Dialog */}
      <Dialog open={isPartialPaymentDialogOpen} onOpenChange={setIsPartialPaymentDialogOpen}>
        <DialogContent className="max-w-sm bg-white/95 backdrop-blur border border-slate-200/80 shadow-2xl sm:rounded-2xl p-6">
          <DialogHeader className="pb-3 border-b border-slate-200/70">
            <DialogTitle className="text-lg">Partial payment</DialogTitle>
            <DialogDescription className="text-slate-500">
              Enter a custom amount to charge.
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Balance Due</span>
                  <span className="font-semibold">
                    ${getBalanceDue(selectedAppointment)}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="partialAmount">Amount</Label>
                <Input
                  id="partialAmount"
                  type="number"
                  step="0.01"
                  min={0}
                  max={getBalanceDue(selectedAppointment)}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number.parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsPartialPaymentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    const balanceDue = getBalanceDue(selectedAppointment)
                    if (paymentAmount <= 0 || paymentAmount > balanceDue) {
                      toast.error("Enter a valid partial amount.")
                      return
                    }
                    setIsPartialPaymentDialogOpen(false)
                    setIsCheckoutDialogOpen(true)
                    handleStripeCheckout(paymentAmount)
                  }}
                >
                  Charge Amount
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cash Payment Dialog */}
      <Dialog open={isCashPaymentDialogOpen} onOpenChange={setIsCashPaymentDialogOpen}>
        <DialogContent className="max-w-xl bg-white/95 backdrop-blur border border-slate-200/80 shadow-2xl sm:rounded-2xl p-6">
          <DialogHeader className="pb-3 border-b border-slate-200/70">
            <DialogTitle className="text-lg">Cash Payment</DialogTitle>
            <DialogDescription className="text-slate-500">
              {selectedAppointment?.clients?.full_name} - Enter payment details
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <div className="flex justify-between">
                  <span>Balance Due:</span>
                  <span className="font-bold text-lg">
                    ${getBalanceDue(selectedAppointment)}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="amountReceived">Amount Received ($)</Label>
                  <Input
                    id="amountReceived"
                    type="number"
                    step="0.01"
                    value={cashPaymentData.amountReceived}
                    onChange={(e) =>
                      setCashPaymentData({ ...cashPaymentData, amountReceived: Number.parseFloat(e.target.value) })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="tip">Tip ($)</Label>
                  <Input
                    id="tip"
                    type="number"
                    step="0.01"
                    value={cashPaymentData.tip}
                    onChange={(e) => setCashPaymentData({ ...cashPaymentData, tip: Number.parseFloat(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="cashNotes">Notes</Label>
                  <Textarea
                    id="cashNotes"
                    value={cashPaymentData.notes}
                    onChange={(e) => setCashPaymentData({ ...cashPaymentData, notes: e.target.value })}
                    placeholder="Payment notes..."
                    rows={2}
                  />
                </div>

                {cashPaymentData.amountReceived > 0 && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex justify-between items-center">
                      <span>Change Due:</span>
                      <span className="font-bold text-lg">
                        $
                        {Math.max(
                          0,
                          cashPaymentData.amountReceived -
                          getBalanceDue(selectedAppointment),
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCashPaymentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCashPayment}
                  disabled={
                    cashPaymentData.amountReceived <= 0 ||
                    cashPaymentData.amountReceived > getBalanceDue(selectedAppointment)
                  }
                >
                  Complete Payment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  )
}

const CardPaymentForm = ({
  clientSecret,
  amount,
  onSuccess,
  onError,
}: {
  clientSecret: string
  amount: number
  onSuccess: (paymentIntentId: string) => void
  onError: (message: string) => void
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!stripe || !elements) return

    if (amount <= 0) {
      onError("Enter a valid amount to charge.")
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      onError("Card details are missing.")
      return
    }

    setIsSubmitting(true)
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    })

    if (error) {
      onError(error.message || "Card payment failed.")
      setIsSubmitting(false)
      return
    }

    if (!paymentIntent?.id) {
      onError("Payment could not be confirmed.")
      setIsSubmitting(false)
      return
    }

    onSuccess(paymentIntent.id)
    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#0f172a",
                "::placeholder": { color: "#94a3b8" },
              },
            },
          }}
        />
      </div>
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>Amount to charge</span>
        <span className="font-semibold text-slate-900">${amount.toFixed(2)}</span>
      </div>
      <Button type="submit" disabled={!stripe || isSubmitting} className="w-full">
        {isSubmitting ? "Processing..." : "Charge card"}
      </Button>
    </form>
  )
}







