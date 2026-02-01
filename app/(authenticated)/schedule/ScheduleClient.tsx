"use client"

import type React from "react"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  Edit,
  Trash2,
  MoreHorizontal,
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Artist, Service, Client, Appointment } from "@/types"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { loadStripe } from "@stripe/stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

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
}

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

export default function ScheduleClient({
  serverArtists,
  serverServices,
  serverClients,
  serverAppointments,
}: ScheduleClientProps) {
  const [artists] = useState<Artist[]>(serverArtists)
  const [services] = useState<Service[]>(serverServices)
  const [clients, setClients] = useState<Client[]>(serverClients)
  const [appointments, setAppointments] = useState<Appointment[]>(serverAppointments)

  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [artistFilter, setArtistFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false)
  const [isCashPaymentDialogOpen, setIsCashPaymentDialogOpen] = useState(false)
  const [isNewAppointmentDialogOpen, setIsNewAppointmentDialogOpen] = useState(false)
  const [formData, setFormData] = useState<
    Partial<Appointment & { client_full_name: string; client_phone: string; client_email: string }>
  >({})
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("")
  const [cashPaymentData, setCashPaymentData] = useState({
    amountReceived: 0,
    tip: 0,
    notes: "",
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [showNewClientFields, setShowNewClientFields] = useState(false)

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

  // Generate working hours based on shop hours (by full hours)
  const getWorkingHours = (date: Date) => {
    const shopHours = getShopHours(date)
    if (shopHours.closed) return []

    const hours = []
    for (let hour = Math.floor(shopHours.open); hour < Math.ceil(shopHours.close); hour++) {
      hours.push(hour)
    }
    return hours
  }

  // Generate 15-minute time slots for scheduling
  const getTimeSlots = (date: Date) => {
    const shopHours = getShopHours(date)
    if (shopHours.closed) return []

    const slots = []
    for (let time = shopHours.open; time < shopHours.close; time += 0.25) {
      slots.push(time)
    }
    return slots
  }

  const workingHours = getWorkingHours(currentDate)
  const timeSlots = getTimeSlots(currentDate)

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

  // Get appointments that START in this specific time slot
  const getAppointmentsStartingInSlot = (artistId: string, time: number) => {
    return appointments.filter((apt) => {
      if (!apt.appointment_date) return false
      const aptStartTime = timeToDecimal(apt.start_time)
      return (
        apt.artist_id === artistId && apt.appointment_date.startsWith(currentDateStr) && aptStartTime === time
      )
    })
  }

  const isAvailable = (artistId: string, time: number) => {
    const currentDateStr = currentDate.toISOString().split("T")[0]

    if (!isShopOpen(time, currentDate) || !isArtistAvailable(artistId, time, currentDate)) return false

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
    const currentDateStr = currentDate.toISOString().split("T")[0]

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

  const formatTime = (time: number) => {
    const h = Math.floor(time)
    const m = (time % 1) * 60
    const period = h >= 12 ? "PM" : "AM"
    const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h
    return `${displayHour}${m > 0 ? `:${m.toString().padStart(2, "0")}` : ""}${period}`
  }

  const formatHourOnly = (hour: number) => {
    const period = hour >= 12 ? "pm" : "am"
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:00\n${period}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
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
        return "bg-green-50 hover:bg-green-100"
      case "artist-unavailable":
        return "bg-gray-100"
      case "shop-closed":
        return "bg-gray-200"
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
  }

  // Drag selection handlers
  const handleMouseDown = useCallback((artistId: string, time: number, event: React.MouseEvent) => {
    if (!isAvailable(artistId, time)) return

    event.preventDefault()
    setDragSelection({
      isDragging: true,
      artistId,
      startTime: time,
      endTime: time,
      currentTime: time,
    })
  }, [])

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
      const duration = endTime - startTime + 0.25 // Add 0.25 to include the end slot

      // Check if all slots in the selection are available
      const allSlotsAvailable = timeSlots
        .filter((slot) => slot >= startTime && slot <= endTime)
        .every((slot) => isAvailable(dragSelection.artistId!, slot))

      if (allSlotsAvailable && dragSelection.artistId) {
        const currentDateStr = currentDate.toISOString().split("T")[0]
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
  }, [dragSelection, timeSlots, currentDate])

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

      const currentDateStr = currentDate.toISOString().split("T")[0]
      const appointmentDurationHours = (draggedAppointment.duration || 60) / 60
      const appointmentEndTime = time + appointmentDurationHours
      const slotsNeeded = []
      for (let t = time; t < appointmentEndTime; t += 0.25) {
        slotsNeeded.push(t)
      }

      const allSlotsAvailable = slotsNeeded.every((slot) => {
        if (!isShopOpen(slot, currentDate) || !isArtistAvailable(artistId, slot, currentDate)) {
          return false
        }
        const hasConflict = appointments.some(
          (apt) => {
            const aptDate = new Date(apt.appointment_date)
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
      const currentDateStr = currentDate.toISOString().split("T")[0]
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
      appointment_date: currentDate.toISOString().split("T")[0],
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

    const payload = { ...formData }
    const response = await fetch(`/api/appointments/${selectedAppointment.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (response.ok) {
      const updatedAppointment = await response.json()
      setAppointments(
        appointments.map((apt) => (apt.id === selectedAppointment.id ? updatedAppointment[0] : apt)),
      )
      setIsEditDialogOpen(false)
      resetForm()
      toast.success("Appointment updated!")
    } else {
      // Handle error
      console.error("Failed to update appointment")
    }
  }

  const handleDeleteAppointment = async () => {
    if (selectedAppointment) {
      await fetch(`/api/appointments/${selectedAppointment.id}`, { method: "DELETE" })
      setAppointments(appointments.filter((apt) => apt.id !== selectedAppointment.id))
      setIsDeleteDialogOpen(false)
      resetForm()
    }
  }

  const handlePaymentMethodSelect = (method: string) => {
    if (!selectedAppointment) return

    const balanceDue = (selectedAppointment.price || 0) - (selectedAppointment.deposit_paid || 0)

    switch (method) {
      case "card":
        // Redirect to Stripe checkout
        handleStripeCheckout(balanceDue)
        break
      case "cash":
        // Open cash payment dialog
        setCashPaymentData({
          amountReceived: balanceDue,
          tip: 0,
          notes: "",
        })
        setIsCheckoutDialogOpen(false)
        setIsCashPaymentDialogOpen(true)
        break
      case "cashapp":
        // Generate Cash App link
        handleCashAppPayment(balanceDue)
        break
      case "venmo":
        // Generate Venmo link
        handleVenmoPayment(balanceDue)
        break
    }
  }

  const handleStripeCheckout = async (amount: number) => {
    if (!selectedAppointment) {
      toast.error("No appointment selected for checkout.")
      return
    }

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appointment: selectedAppointment }),
      })

      if (!response.ok) {
        toast.error(`Payment API error: ${response.statusText}`)
        return
      }

      const session = await response.json()

      if (!session || !session.id) {
        toast.error("Failed to create a valid payment session.")
        return
      }

      // The session object now contains a `url` property.
      // We will use this to redirect the user to the Stripe checkout page.
      if (session.url) {
        window.location.href = session.url
      } else {
        toast.error("Could not get checkout URL. Please try again.")
      }
    } catch (error) {
      console.error("Error during Stripe checkout process:", error)
      toast.error("Could not connect to payment provider.")
    }
  }

  const handleCashAppPayment = (amount: number) => {
    const shopCashAppHandle = "$InkStudioTattoo" // This would be configurable
    const note = `Payment for ${selectedAppointment?.services?.name} - ${selectedAppointment?.clients?.full_name}`
    const cashAppUrl = `https://cash.app/${shopCashAppHandle}/${amount}?note=${encodeURIComponent(note)}`

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
    const venmoUrl = `venmo://paycharge?txn=pay&recipients=${shopVenmoHandle}&amount=${amount}&note=${encodeURIComponent(note)}`

    // Try to open Venmo app, fallback to web
    const fallbackUrl = `https://venmo.com/${shopVenmoHandle}?txn=pay&amount=${amount}&note=${encodeURIComponent(note)}`

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

  const completePayment = async (method: string, totalAmount: number, tip: number) => {
    if (selectedAppointment) {
      const payload = {
        status: "completed" as const,
        payment_status: "paid" as const,
        payment_method: method,
        price: (selectedAppointment.price || 0) + tip,
      }

      const response = await fetch(`/api/appointments/${selectedAppointment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const updatedAppointment = await response.json()
        setAppointments(
          appointments.map((apt) => (apt.id === selectedAppointment.id ? updatedAppointment[0] : apt)),
        )
        setSelectedAppointment(null)
      }
    }
  }

  const openViewDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
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
    setSelectedAppointment(appointment)
    setIsDeleteDialogOpen(true)
  }

  const openCheckoutDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsCheckoutDialogOpen(true)
  }

  const updateAppointmentStatus = async (appointmentId: any, newStatus: Appointment["status"]) => {
    const response = await fetch(`/api/appointments/${appointmentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    if (response.ok) {
      const updatedAppointment = await response.json()
      setAppointments(
        appointments.map((apt) => (apt.id === appointmentId ? updatedAppointment[0] : apt)),
      )
    }
  }

  const handleServiceChange = (serviceId: string) => {
    const selectedService = services.find((s) => s.id === serviceId)
    if (!selectedService) return

    setFormData((prev) => ({
      ...prev,
      service_id: selectedService.id,
      // Only set price and duration if they are not already set (i.e., for new appointments)
      duration: prev.duration || selectedService.duration,
      price: prev.price || selectedService.price,
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
          filtered = filtered.filter((apt) => new Date(apt.appointment_date).toDateString() === today.toDateString())
          break
        case "tomorrow":
          filtered = filtered.filter(
            (apt) => new Date(apt.appointment_date).toDateString() === tomorrow.toDateString(),
          )
          break
        case "week":
          filtered = filtered.filter(
            (apt) => new Date(apt.appointment_date) >= weekStart && new Date(apt.appointment_date) <= weekEnd,
          )
          break
        case "upcoming":
          filtered = filtered.filter((apt) => new Date(apt.appointment_date) >= today)
          break
        case "past":
          filtered = filtered.filter((apt) => new Date(apt.appointment_date) < today)
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
          : formatDate(currentDate.toISOString())
        : "Filtered List"

    const appointmentsForDate =
      viewMode === "calendar"
        ? data.filter((apt) => {
          const aptDate = new Date(apt.appointment_date)
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

  return (
    <div className="flex flex-1 flex-col gap-4" onMouseUp={handleMouseUp}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Schedule</h1>
          <p className="text-muted-foreground">Manage appointments with calendar and list views</p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "calendar" | "list")}>
            <TabsList>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Grid3X3 className="h-4 w-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                List
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={handleNewAppointment}>
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
        </div>
      </div>

      {viewMode === "calendar" ? (
        <>
          {/* Date Navigation */}
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

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Click a time slot to create a quick appointment, or drag across multiple slots to
              create longer appointments. Hover over time slots to see exact times.
            </p>
          </div>

          {/* Calendar Grid */}
          <Card className="flex-1">
            <CardContent className="p-0">
              {/* Artist Headers */}
              <div className="grid grid-cols-5 border-b">
                <div className="p-4 border-r bg-gray-50 font-medium text-sm">Time</div>
                {artists.map((artist) => (
                  <div key={artist.id} className="p-4 border-r last:border-r-0 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={
                            artist.avatar_url ||
                            `/placeholder.svg?height=32&width=32&text=${artist.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}`
                          }
                        />
                        <AvatarFallback className="text-xs">
                          {artist.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{artist.name}</div>
                        <div className="text-xs text-gray-500">
                          {artist.specialty} • ${artist.hourlyRate}/hr
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Scrollable Time Slots */}
              <ScrollArea className="h-[600px]">
                {workingHours.map((hour) => (
                  <div key={hour} className="grid grid-cols-5 border-b last:border-b-0 min-h-[120px]">
                    {/* Time label */}
                    <div className="p-3 border-r bg-gray-50 flex items-start justify-center">
                      <div className="text-center">
                        <div className="font-medium text-sm whitespace-pre-line">{formatHourOnly(hour)}</div>
                      </div>
                    </div>

                    {/* Artist columns */}
                    {artists.map((artist) => (
                      <div key={artist.id} className="border-r last:border-r-0 relative">
                        {/* 15-minute subdivisions */}
                        <div className="grid grid-rows-4 h-[120px]">
                          {[0, 0.25, 0.5, 0.75].map((quarterHour) => {
                            const time = hour + quarterHour
                            const slotAppointments = getAppointmentsStartingInSlot(artist.id, time)
                            const slotStatus = getSlotStatus(artist.id, time)
                            const available = slotStatus === "available"
                            const isDragSelected = isInDragSelection(artist.id, time)
                            const isTarget = isDropTarget(artist.id, time)

                            return (
                              <div
                                key={quarterHour}
                                className={`border-b last:border-b-0 p-1 transition-all cursor-pointer relative group ${getSlotBackgroundColor(
                                  slotStatus,
                                  isDragSelected,
                                  isTarget,
                                )} ${available ? "hover:bg-green-100" : ""} ${isDragSelected ? "border-2 border-blue-400" : ""
                                  } ${isDraggingAppointment && available && !isTarget
                                    ? "hover:bg-blue-100 hover:border-2 hover:border-blue-300"
                                    : ""
                                  }`}
                                onClick={() =>
                                  !dragSelection.isDragging &&
                                  !isDraggingAppointment &&
                                  handleSlotClick(artist.id, time)
                                }
                                onMouseDown={(e) => !isDraggingAppointment && handleMouseDown(artist.id, time, e)}
                                onMouseEnter={() => !isDraggingAppointment && handleMouseEnter(artist.id, time)}
                                onDragOver={(e) => handleSlotDragOver(artist.id, time, e)}
                                onDragLeave={handleSlotDragLeave}
                                onDrop={(e) => handleSlotDrop(artist.id, time, e)}
                              >
                                {/* Time indicator for all time marks - show on hover */}
                                <div className="absolute left-1 top-0 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                  {formatTime(time)}
                                </div>

                                {available && !isDragSelected && (
                                  <div className="absolute inset-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Plus className="h-4 w-4 text-green-600" />
                                  </div>
                                )}

                                {/* Drag selection indicator */}
                                {isDragSelected && available && (
                                  <div className="absolute inset-1 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
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

                                {slotStatus === "shop-closed" && quarterHour === 0 && (
                                  <div className="absolute inset-1 flex items-center justify-center">
                                    <span className="text-xs text-gray-500 text-center">
                                      Shop
                                      <br />
                                      Closed
                                    </span>
                                  </div>
                                )}

                                {/* Drop zone indicator when dragging */}
                                {isDraggingAppointment &&
                                  available &&
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
                                    )} group cursor-move hover:shadow-md transition-all z-10 ${isDraggingAppointment && draggedAppointment?.id === appointment.id
                                        ? "opacity-50 scale-105"
                                        : ""
                                      }`}
                                    style={{
                                      height: `calc(${((appointment.duration || 60) / 15) * 30}px - 8px)`,
                                    }}
                                    draggable={true}
                                    onDragStart={(e) => handleAppointmentDragStart(appointment, e)}
                                    onDragEnd={handleAppointmentDragEnd}
                                    onMouseDown={(e) => e.stopPropagation()} // Prevent clash with new appointment drag
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      openViewDialog(appointment)
                                    }}
                                  >
                                    <div className="flex items-start justify-between h-full">
                                      <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-xs mb-1 truncate">
                                          {appointment.clients?.full_name}
                                        </div>
                                        <div className="text-xs mb-1 opacity-90 truncate">
                                          {appointment.services?.name}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs opacity-75 mb-1">
                                          <Clock className="h-2 w-2" />
                                          {formatTime(timeToDecimal(appointment.start_time))}
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
                ))}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Summary Stats */}
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
        </>
      ) : (
        <>
          {/* Stats Cards for List View */}
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

          {/* Filters for List View */}
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
                    const appointmentDate = new Date(appointment.appointment_date)
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
                                  src={`/placeholder.svg?height=40&width=40&text=${artist?.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}`}
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
                                    <span className="ml-2">• Deposit: ${appointment.deposit_paid}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(appointment.status)}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
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
      )}

      {/* View Appointment Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>View appointment information and client details</DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Client</Label>
                  <p className="text-lg font-semibold">{selectedAppointment.clients?.full_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <Badge className={getStatusColor(selectedAppointment.status)}>{selectedAppointment.status}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Artist</Label>
                  <p>{selectedAppointment.artists?.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Service</Label>
                  <p>{selectedAppointment.services?.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Date</Label>
                  <p>{formatDate(selectedAppointment.appointment_date)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Time</Label>
                  <p>
                    {formatTime(timeToDecimal(selectedAppointment.start_time))} -{" "}
                    {formatTime(
                      timeToDecimal(selectedAppointment.start_time) +
                      (selectedAppointment.duration || 0) / 60,
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Duration</Label>
                  <p>
                    {selectedAppointment.duration} minute
                    {selectedAppointment.duration !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Phone</Label>
                  <p>{selectedAppointment.clients?.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p>{selectedAppointment.clients?.email || "Not provided"}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Price</Label>
                  <p className="text-lg font-semibold">${selectedAppointment.price}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Deposit Paid</Label>
                  <p>${selectedAppointment.deposit_paid || 0}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Payment Status</Label>
                  <Badge className={getPaymentStatusColor(selectedAppointment.payment_status || "unpaid")}>
                    {selectedAppointment.payment_status || "unpaid"}
                  </Badge>
                </div>
              </div>

              {selectedAppointment.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Notes</Label>
                  <p className="mt-1 p-3 bg-gray-50 rounded-md">{selectedAppointment.notes}</p>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-gray-500">Created</Label>
                <p>{new Date(selectedAppointment.created_at).toLocaleString()}</p>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                {selectedAppointment.payment_status !== "paid" && (
                  <Button onClick={() => {
                    setIsViewDialogOpen(false)
                    openCheckoutDialog(selectedAppointment)
                  }} className="bg-green-600 hover:bg-green-700">
                    Checkout
                  </Button>
                )}
                <Button onClick={() => openEditDialog(selectedAppointment)}>Edit</Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => updateAppointmentStatus(selectedAppointment.id, "cancelled")} className="text-red-600">
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateAppointmentStatus(selectedAppointment.id, "cancelled")} className="text-orange-600">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      No Show
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
            resetForm()
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditDialogOpen ? "Edit Appointment" : "New Appointment"}</DialogTitle>
            <DialogDescription>
              {isEditDialogOpen ? "Update appointment details" : "Create a new appointment"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
                        {service.name} ({service.duration} min)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Checkout - {selectedAppointment?.clients?.full_name}</DialogTitle>
            <DialogDescription>Select payment method to complete the transaction</DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
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
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Balance Due:</span>
                  <span>${(selectedAppointment.price || 0) - (selectedAppointment.deposit_paid || 0)}</span>
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
        </DialogContent>
      </Dialog>

      {/* Cash Payment Dialog */}
      <Dialog open={isCashPaymentDialogOpen} onOpenChange={setIsCashPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cash Payment - {selectedAppointment?.clients?.full_name}</DialogTitle>
            <DialogDescription>Enter cash payment details</DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Balance Due:</span>
                  <span className="font-bold text-lg">
                    ${(selectedAppointment.price || 0) - (selectedAppointment.deposit_paid || 0)}
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
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span>Change Due:</span>
                      <span className="font-bold text-lg">
                        $
                        {Math.max(
                          0,
                          cashPaymentData.amountReceived -
                          ((selectedAppointment.price || 0) - (selectedAppointment.deposit_paid || 0)),
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
                    cashPaymentData.amountReceived <
                    (selectedAppointment.price || 0) - (selectedAppointment.deposit_paid || 0)
                  }
                >
                  Complete Payment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Legend for Calendar View */}
      {viewMode === "calendar" && (
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
            <span>Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-100 border border-purple-200 rounded"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
            <span>Cancelled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
            <span>Artist Unavailable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded"></div>
            <span>Shop Closed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-200 border border-blue-400 rounded"></div>
            <span>Drag Selection</span>
          </div>
        </div>
      )}
    </div>
  )
}
