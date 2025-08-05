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

interface ArtistAvailability {
  [key: string]: {
    // day of week (monday, tuesday, etc.)
    available: boolean
    startTime: string // "09:00"
    endTime: string // "17:00"
    breaks?: Array<{
      startTime: string
      endTime: string
      title: string
    }>
  }
}

const artists = [
  {
    id: 1,
    name: "Mike Rodriguez",
    specialty: "Traditional",
    color: "bg-blue-500",
    hourlyRate: 150,
    availability: {
      monday: { available: true, startTime: "09:00", endTime: "18:00" },
      tuesday: { available: true, startTime: "09:00", endTime: "18:00" },
      wednesday: { available: true, startTime: "09:00", endTime: "18:00" },
      thursday: { available: true, startTime: "09:00", endTime: "18:00" },
      friday: { available: true, startTime: "09:00", endTime: "18:00" },
      saturday: { available: true, startTime: "10:00", endTime: "16:00" },
      sunday: { available: false, startTime: "10:00", endTime: "16:00" },
    } as ArtistAvailability,
  },
  {
    id: 2,
    name: "Luna Martinez",
    specialty: "Fine Line",
    color: "bg-purple-500",
    hourlyRate: 120,
    availability: {
      monday: { available: true, startTime: "10:00", endTime: "19:00" },
      tuesday: { available: true, startTime: "10:00", endTime: "19:00" },
      wednesday: { available: true, startTime: "10:00", endTime: "19:00" },
      thursday: { available: true, startTime: "10:00", endTime: "19:00" },
      friday: { available: true, startTime: "10:00", endTime: "19:00" },
      saturday: { available: true, startTime: "09:00", endTime: "17:00" },
      sunday: { available: true, startTime: "11:00", endTime: "16:00" },
    } as ArtistAvailability,
  },
  {
    id: 3,
    name: "Jake Thompson",
    specialty: "Realism",
    color: "bg-green-500",
    hourlyRate: 180,
    availability: {
      monday: { available: true, startTime: "08:00", endTime: "17:00" },
      tuesday: { available: true, startTime: "08:00", endTime: "17:00" },
      wednesday: { available: true, startTime: "08:00", endTime: "17:00" },
      thursday: { available: true, startTime: "08:00", endTime: "17:00" },
      friday: { available: true, startTime: "08:00", endTime: "17:00" },
      saturday: { available: false, startTime: "09:00", endTime: "15:00" },
      sunday: { available: false, startTime: "10:00", endTime: "15:00" },
    } as ArtistAvailability,
  },
  {
    id: 4,
    name: "Sarah Kim",
    specialty: "Watercolor",
    color: "bg-pink-500",
    hourlyRate: 140,
    availability: {
      monday: { available: false, startTime: "10:00", endTime: "18:00" },
      tuesday: { available: true, startTime: "10:00", endTime: "18:00" },
      wednesday: { available: true, startTime: "10:00", endTime: "18:00" },
      thursday: { available: true, startTime: "10:00", endTime: "18:00" },
      friday: { available: true, startTime: "10:00", endTime: "18:00" },
      saturday: { available: true, startTime: "09:00", endTime: "17:00" },
      sunday: { available: true, startTime: "12:00", endTime: "17:00" },
    } as ArtistAvailability,
  },
]

const services = [
  { id: 1, name: "Small Tattoo", suggestedDuration: 1 },
  { id: 2, name: "Medium Tattoo", suggestedDuration: 2 },
  { id: 3, name: "Large Tattoo Session", suggestedDuration: 4 },
  { id: 4, name: "Consultation", suggestedDuration: 0.5 },
  { id: 5, name: "Touch-up Session", suggestedDuration: 1 },
  { id: 6, name: "Fine Line Tattoo", suggestedDuration: 1.5 },
  { id: 7, name: "Traditional Tattoo", suggestedDuration: 2 },
  { id: 8, name: "Realism Tattoo", suggestedDuration: 3 },
  { id: 9, name: "Watercolor Tattoo", suggestedDuration: 2.5 },
  { id: 10, name: "Cover-up Consultation", suggestedDuration: 1 },
  { id: 11, name: "Custom Design Session", suggestedDuration: 3 },
  { id: 12, name: "Piercing", suggestedDuration: 0.5 },
]

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

interface Appointment {
  id: number
  artistId: number
  client: string
  service: string
  date: string
  startTime: number
  duration: number
  status: "confirmed" | "pending" | "cancelled" | "completed" | "in-progress"
  phone: string
  email?: string
  notes?: string
  price?: number
  depositPaid?: number
  paymentStatus: "unpaid" | "deposit" | "paid"
  paymentMethod?: "cash" | "card" | "cashapp" | "venmo"
  createdAt: string
}

interface DragSelection {
  isDragging: boolean
  artistId: number | null
  startTime: number | null
  endTime: number | null
  currentTime: number | null
}

const initialAppointments: Appointment[] = [
  {
    id: 1,
    artistId: 1,
    client: "Sarah Johnson",
    service: "Traditional Sleeve Session",
    date: "2024-01-22",
    startTime: 10,
    duration: 4,
    status: "confirmed",
    phone: "(555) 123-4567",
    email: "sarah.johnson@email.com",
    price: 600,
    depositPaid: 200,
    paymentStatus: "deposit",
    paymentMethod: "card",
    createdAt: "2024-01-15T10:30:00",
    notes: "Continuing work on traditional sleeve. Client prefers bold colors.",
  },
  {
    id: 2,
    artistId: 2,
    client: "David Chen",
    service: "Small Script Tattoo",
    date: "2024-01-22",
    startTime: 14,
    duration: 1,
    status: "in-progress",
    phone: "(555) 234-5678",
    email: "david.chen@email.com",
    price: 120,
    depositPaid: 50,
    paymentStatus: "deposit",
    paymentMethod: "cash",
    createdAt: "2024-01-18T14:20:00",
    notes: "First tattoo. Wants small script on wrist.",
  },
  {
    id: 3,
    artistId: 3,
    client: "Emma Wilson",
    service: "Consultation",
    date: "2024-01-23",
    startTime: 16.5,
    duration: 0.5,
    status: "pending",
    phone: "(555) 345-6789",
    email: "emma.wilson@email.com",
    price: 90,
    paymentStatus: "unpaid",
    createdAt: "2024-01-20T09:15:00",
    notes: "Cover-up consultation. Nervous about the process.",
  },
  {
    id: 4,
    artistId: 1,
    client: "Alex Rivera",
    service: "Cover-up Touch-up",
    date: "2024-01-24",
    startTime: 15,
    duration: 2,
    status: "confirmed",
    phone: "(555) 456-7890",
    email: "alex.rivera@email.com",
    price: 300,
    depositPaid: 100,
    paymentStatus: "deposit",
    paymentMethod: "card",
    createdAt: "2024-01-19T11:45:00",
    notes: "Touch-up work on previous cover-up tattoo.",
  },
  {
    id: 5,
    artistId: 2,
    client: "Maria Garcia",
    service: "Fine Line Flowers",
    date: "2024-01-25",
    startTime: 11,
    duration: 2,
    status: "completed",
    phone: "(555) 567-8901",
    email: "maria.garcia@email.com",
    price: 240,
    depositPaid: 80,
    paymentStatus: "paid",
    paymentMethod: "card",
    createdAt: "2024-01-17T16:30:00",
    notes: "Delicate flower design on forearm.",
  },
  {
    id: 6,
    artistId: 4,
    client: "Tom Wilson",
    service: "Watercolor Design",
    date: "2024-01-26",
    startTime: 13,
    duration: 3,
    status: "confirmed",
    phone: "(555) 678-9012",
    email: "tom.wilson@email.com",
    price: 420,
    depositPaid: 150,
    paymentStatus: "deposit",
    paymentMethod: "cashapp",
    createdAt: "2024-01-16T13:20:00",
    notes: "Abstract watercolor piece on shoulder.",
  },
  {
    id: 7,
    artistId: 3,
    client: "Lisa Brown",
    service: "Realism Portrait",
    date: "2024-01-20",
    startTime: 10,
    duration: 4,
    status: "completed",
    phone: "(555) 789-0123",
    email: "lisa.brown@email.com",
    price: 720,
    depositPaid: 200,
    paymentStatus: "paid",
    paymentMethod: "card",
    createdAt: "2024-01-10T12:00:00",
    notes: "Portrait of client's grandmother. Completed successfully.",
  },
  {
    id: 8,
    artistId: 2,
    client: "James Miller",
    service: "Small Tattoo",
    date: "2024-01-19",
    startTime: 15,
    duration: 1,
    status: "cancelled",
    phone: "(555) 890-1234",
    email: "james.miller@email.com",
    price: 120,
    paymentStatus: "unpaid",
    createdAt: "2024-01-18T10:15:00",
    notes: "Client cancelled due to scheduling conflict.",
  },
  {
    id: 9,
    artistId: 1,
    client: "Rachel Davis",
    service: "Traditional Tattoo",
    date: "2024-01-27",
    startTime: 12,
    duration: 2.5,
    status: "pending",
    phone: "(555) 901-2345",
    email: "rachel.davis@email.com",
    price: 375,
    paymentStatus: "unpaid",
    createdAt: "2024-01-21T14:45:00",
    notes: "Waiting for design approval before confirming.",
  },
  {
    id: 10,
    artistId: 4,
    client: "Kevin Lee",
    service: "Touch-up Session",
    date: "2024-01-28",
    startTime: 14,
    duration: 1,
    status: "confirmed",
    phone: "(555) 012-3456",
    email: "kevin.lee@email.com",
    price: 140,
    depositPaid: 50,
    paymentStatus: "deposit",
    paymentMethod: "venmo",
    createdAt: "2024-01-20T16:20:00",
    notes: "Touch-up on watercolor piece from last year.",
  },
]

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments)
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
  const [formData, setFormData] = useState<Partial<Appointment>>({})
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("")
  const [cashPaymentData, setCashPaymentData] = useState({
    amountReceived: 0,
    tip: 0,
    notes: "",
  })

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

    const openTime = Number.parseFloat(shopHours.open.replace(":", "."))
    const closeTime = Number.parseFloat(shopHours.close.replace(":", "."))

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
  const isArtistAvailable = (artistId: number, time: number, date: Date) => {
    const artist = artists.find((a) => a.id === artistId)
    if (!artist) return false

    const dayOfWeek = getDayOfWeek(date)
    const availability = artist.availability[dayOfWeek]

    if (!availability || !availability.available) return false

    const startTime = Number.parseFloat(availability.startTime.replace(":", "."))
    const endTime = Number.parseFloat(availability.endTime.replace(":", "."))

    return time >= startTime && time < endTime
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
  const getAppointmentsStartingInSlot = (artistId: number, time: number) => {
    const currentDateStr = currentDate.toISOString().split("T")[0]
    return appointments.filter(
      (apt) => apt.artistId === artistId && apt.date === currentDateStr && apt.startTime === time,
    )
  }

  const isAvailable = (artistId: number, time: number) => {
    const currentDateStr = currentDate.toISOString().split("T")[0]

    // Check if shop is open
    if (!isShopOpen(time, currentDate)) return false

    // Check if artist is available
    if (!isArtistAvailable(artistId, time, currentDate)) return false

    // Check if there's already an appointment
    const hasAppointment = appointments.some(
      (apt) =>
        apt.artistId === artistId &&
        apt.date === currentDateStr &&
        time >= apt.startTime &&
        time < apt.startTime + apt.duration,
    )

    return !hasAppointment
  }

  const getSlotStatus = (artistId: number, time: number) => {
    const currentDateStr = currentDate.toISOString().split("T")[0]

    // Check if there's an appointment
    const hasAppointment = appointments.some(
      (apt) =>
        apt.artistId === artistId &&
        apt.date === currentDateStr &&
        time >= apt.startTime &&
        time < apt.startTime + apt.duration,
    )

    if (hasAppointment) return "booked"

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

  const getSlotBackgroundColor = (status: string, isDragSelected = false) => {
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

  const getArtistById = (id: number) => {
    return artists.find((artist) => artist.id === id)
  }

  const getStats = () => {
    const today = new Date()
    const upcoming = appointments.filter((apt) => new Date(apt.date) >= today && apt.status !== "cancelled")
    const confirmed = appointments.filter((apt) => apt.status === "confirmed")
    const pending = appointments.filter((apt) => apt.status === "pending")
    const totalRevenue = appointments
      .filter((apt) => apt.status === "completed")
      .reduce((sum, apt) => sum + (apt.price || 0), 0)

    return { upcoming: upcoming.length, confirmed: confirmed.length, pending: pending.length, totalRevenue }
  }

  const stats = getStats()

  const calculatePrice = (artistId: number, duration: number) => {
    const artist = artists.find((a) => a.id === artistId)
    if (!artist || !duration) return 0
    return Math.round(artist.hourlyRate * duration)
  }

  const resetForm = () => {
    setFormData({})
    setSelectedAppointment(null)
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
  const handleMouseDown = useCallback((artistId: number, time: number, event: React.MouseEvent) => {
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
    (artistId: number, time: number) => {
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
        setFormData({
          artistId: dragSelection.artistId,
          startTime,
          duration,
          date: currentDateStr,
          status: "pending",
          paymentStatus: "unpaid",
          price: calculatePrice(dragSelection.artistId, duration),
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

  const handleAppointmentDragEnd = useCallback(() => {
    setDraggedAppointment(null)
    setIsDraggingAppointment(false)
  }, [])

  const handleSlotDragOver = useCallback(
    (event: React.DragEvent) => {
      if (isDraggingAppointment) {
        event.preventDefault()
        event.dataTransfer.dropEffect = "move"
      }
    },
    [isDraggingAppointment],
  )

  const handleSlotDrop = useCallback(
    (artistId: number, time: number, event: React.DragEvent) => {
      event.preventDefault()

      if (!draggedAppointment || !isDraggingAppointment) return

      const currentDateStr = currentDate.toISOString().split("T")[0]

      // Check if the new slot is available for the duration of the appointment
      const appointmentEndTime = time + draggedAppointment.duration
      const slotsNeeded = []
      for (let t = time; t < appointmentEndTime; t += 0.25) {
        slotsNeeded.push(t)
      }

      const allSlotsAvailable = slotsNeeded.every((slot) => {
        // Check if slot is within working hours and artist availability
        if (!isShopOpen(slot, currentDate) || !isArtistAvailable(artistId, slot, currentDate)) {
          return false
        }

        // Check if slot is occupied by other appointments (excluding the one being moved)
        const hasConflict = appointments.some(
          (apt) =>
            apt.id !== draggedAppointment.id &&
            apt.artistId === artistId &&
            apt.date === currentDateStr &&
            slot >= apt.startTime &&
            slot < apt.startTime + apt.duration,
        )

        return !hasConflict
      })

      if (allSlotsAvailable) {
        // Update the appointment with new time and artist
        const updatedAppointments = appointments.map((apt) =>
          apt.id === draggedAppointment.id ? { ...apt, artistId, startTime: time, date: currentDateStr } : apt,
        )
        setAppointments(updatedAppointments)
      }

      setDraggedAppointment(null)
      setIsDraggingAppointment(false)
    },
    [draggedAppointment, isDraggingAppointment, appointments, currentDate],
  )

  // Check if a time slot is in the drag selection
  const isInDragSelection = (artistId: number, time: number) => {
    if (!dragSelection.isDragging || dragSelection.artistId !== artistId) return false
    if (dragSelection.startTime === null || dragSelection.currentTime === null) return false

    const start = Math.min(dragSelection.startTime, dragSelection.currentTime)
    const end = Math.max(dragSelection.startTime, dragSelection.currentTime)

    return time >= start && time <= end
  }

  const handleSlotClick = (artistId: number, time: number) => {
    if (isAvailable(artistId, time)) {
      const currentDateStr = currentDate.toISOString().split("T")[0]
      setFormData({
        artistId,
        startTime: time,
        duration: 1,
        date: currentDateStr,
        status: "pending",
        paymentStatus: "unpaid",
        price: calculatePrice(artistId, 1),
      })
      setIsNewAppointmentDialogOpen(true)
    }
  }

  const handleNewAppointment = () => {
    setFormData({
      status: "pending",
      paymentStatus: "unpaid",
      date: currentDate.toISOString().split("T")[0],
      startTime: timeSlots[0] || 9,
      duration: 1,
    })
    setIsNewAppointmentDialogOpen(true)
  }

  const handleCreateAppointment = () => {
    if (formData.client && formData.service && formData.artistId && formData.startTime && formData.duration) {
      const newAppointment: Appointment = {
        id: Math.max(...appointments.map((a) => a.id)) + 1,
        artistId: formData.artistId,
        client: formData.client,
        service: formData.service,
        date: formData.date || currentDate.toISOString().split("T")[0],
        startTime: formData.startTime,
        duration: formData.duration,
        status: (formData.status as Appointment["status"]) || "pending",
        phone: formData.phone || "",
        email: formData.email,
        notes: formData.notes,
        price: formData.price || calculatePrice(formData.artistId, formData.duration),
        depositPaid: formData.depositPaid,
        paymentStatus: (formData.paymentStatus as Appointment["paymentStatus"]) || "unpaid",
        paymentMethod: formData.paymentMethod,
        createdAt: new Date().toISOString(),
      }

      setAppointments([...appointments, newAppointment])
      setIsNewAppointmentDialogOpen(false)
      resetForm()
    }
  }

  const handleEditAppointment = () => {
    if (selectedAppointment && formData.client && formData.service) {
      const updatedAppointments = appointments.map((apt) =>
        apt.id === selectedAppointment.id ? { ...apt, ...formData } : apt,
      )
      setAppointments(updatedAppointments)
      setIsEditDialogOpen(false)
      resetForm()
    }
  }

  const handleDeleteAppointment = () => {
    if (selectedAppointment) {
      setAppointments(appointments.filter((apt) => apt.id !== selectedAppointment.id))
      setIsDeleteDialogOpen(false)
      resetForm()
    }
  }

  const handlePaymentMethodSelect = (method: string) => {
    if (!selectedAppointment) return

    const balanceDue = (selectedAppointment.price || 0) - (selectedAppointment.depositPaid || 0)

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

  const handleStripeCheckout = (amount: number) => {
    // TODO: Integrate with Stripe
    console.log("Redirecting to Stripe checkout for $", amount)
    // For now, simulate successful payment
    setTimeout(() => {
      completePayment("card", amount, 0)
    }, 2000)
  }

  const handleCashAppPayment = (amount: number) => {
    const shopCashAppHandle = "$InkStudioTattoo" // This would be configurable
    const note = `Payment for ${selectedAppointment?.service} - ${selectedAppointment?.client}`
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
    const note = `Payment for ${selectedAppointment?.service} - ${selectedAppointment?.client}`
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

  const completePayment = (method: string, totalAmount: number, tip: number) => {
    if (selectedAppointment) {
      const updatedAppointments = appointments.map((apt) =>
        apt.id === selectedAppointment.id
          ? {
              ...apt,
              status: "completed" as const,
              paymentStatus: "paid" as const,
              paymentMethod: method as Appointment["paymentMethod"],
              price: (apt.price || 0) + tip, // Add tip to total price
            }
          : apt,
      )
      setAppointments(updatedAppointments)
      setSelectedAppointment(null)
    }
  }

  const openViewDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsViewDialogOpen(true)
  }

  const openEditDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setFormData(appointment)
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

  const updateAppointmentStatus = (appointmentId: number, newStatus: Appointment["status"]) => {
    setAppointments(appointments.map((apt) => (apt.id === appointmentId ? { ...apt, status: newStatus } : apt)))
  }

  const handleServiceChange = (serviceName: string) => {
    const selectedService = services.find((s) => s.name === serviceName)
    const updatedFormData = {
      ...formData,
      service: serviceName,
      // Only update duration if this is a new appointment (no existing duration)
      duration: isEditDialogOpen ? formData.duration : selectedService?.suggestedDuration || 1,
    }

    if (updatedFormData.artistId && updatedFormData.duration) {
      updatedFormData.price = calculatePrice(updatedFormData.artistId, updatedFormData.duration)
    }

    setFormData(updatedFormData)
  }

  const handleDurationChange = (duration: number) => {
    const updatedFormData = {
      ...formData,
      duration,
    }

    if (updatedFormData.artistId) {
      updatedFormData.price = calculatePrice(updatedFormData.artistId, duration)
    }

    setFormData(updatedFormData)
  }

  const handleArtistChange = (artistId: string) => {
    const updatedFormData = {
      ...formData,
      artistId: Number.parseInt(artistId),
    }

    if (updatedFormData.duration) {
      updatedFormData.price = calculatePrice(Number.parseInt(artistId), updatedFormData.duration)
    }

    setFormData(updatedFormData)
  }

  // Get available time slots for artist selection in new appointment dialog
  const getAvailableTimeSlotsForArtist = (artistId: number, date: string) => {
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
          apt.client.toLowerCase().includes(lowerSearchTerm) ||
          apt.service.toLowerCase().includes(lowerSearchTerm) ||
          apt.phone.includes(lowerSearchTerm) ||
          (apt.email && apt.email.toLowerCase().includes(lowerSearchTerm))
        )
      })
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((apt) => apt.status === statusFilter)
    }

    // Artist filter
    if (artistFilter !== "all") {
      filtered = filtered.filter((apt) => apt.artistId === Number.parseInt(artistFilter))
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
          filtered = filtered.filter((apt) => new Date(apt.date).toDateString() === today.toDateString())
          break
        case "tomorrow":
          filtered = filtered.filter((apt) => new Date(apt.date).toDateString() === tomorrow.toDateString())
          break
        case "week":
          filtered = filtered.filter((apt) => new Date(apt.date) >= weekStart && new Date(apt.date) <= weekEnd)
          break
        case "upcoming":
          filtered = filtered.filter((apt) => new Date(apt.date) >= today)
          break
        case "past":
          filtered = filtered.filter((apt) => new Date(apt.date) < today)
          break
        default:
          break
      }
    }

    return filtered
  }, [appointments, searchTerm, statusFilter, artistFilter, dateFilter])

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
                {artists.map((artist) => {
                  const dayOfWeek = getDayOfWeek(currentDate)
                  const availability = artist.availability[dayOfWeek]
                  const isArtistWorkingToday = availability?.available

                  return (
                    <div key={artist.id} className="p-4 border-r last:border-r-0 bg-gray-50">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={`/placeholder.svg?height=32&width=32&text=${artist.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}`}
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
                          <div className="text-xs">
                            {isArtistWorkingToday ? (
                              <span className="text-green-600">
                                {formatTime(Number.parseFloat(availability.startTime.replace(":", ".")))} -{" "}
                                {formatTime(Number.parseFloat(availability.endTime.replace(":", ".")))}
                              </span>
                            ) : (
                              <span className="text-red-600">Unavailable</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
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

                            return (
                              <div
                                key={quarterHour}
                                className={`border-b last:border-b-0 p-1 transition-all cursor-pointer relative group ${getSlotBackgroundColor(slotStatus, isDragSelected)} ${
                                  available ? "hover:bg-green-100" : ""
                                } ${isDragSelected ? "border-2 border-blue-400" : ""} ${isDraggingAppointment && available ? "hover:bg-blue-100 hover:border-2 hover:border-blue-300" : ""}`}
                                onClick={() =>
                                  !dragSelection.isDragging &&
                                  !isDraggingAppointment &&
                                  handleSlotClick(artist.id, time)
                                }
                                onMouseDown={(e) => !isDraggingAppointment && handleMouseDown(artist.id, time, e)}
                                onMouseEnter={() => !isDraggingAppointment && handleMouseEnter(artist.id, time)}
                                onDragOver={handleSlotDragOver}
                                onDrop={(e) => handleSlotDrop(artist.id, time, e)}
                              >
                                {/* Time indicator for all time marks - show on hover */}
                                <div className="absolute left-1 top-0 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                  {formatTime(time)}
                                </div>

                                {available && !isDragSelected && (
                                  <div className="absolute inset-1 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
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
                                {isDraggingAppointment && available && (
                                  <div className="absolute inset-1 border-2 border-dashed border-blue-400 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="text-xs text-blue-600 font-medium">Drop Here</div>
                                  </div>
                                )}

                                {slotAppointments.map((appointment) => (
                                  <div
                                    key={appointment.id}
                                    className={`absolute inset-1 rounded-lg p-2 border shadow-sm ${getStatusColor(appointment.status)} group cursor-move hover:shadow-md transition-all z-10 ${isDraggingAppointment && draggedAppointment?.id === appointment.id ? "opacity-50 scale-105" : ""}`}
                                    style={{
                                      height: `${appointment.duration * 120 - 8}px`, // 120px per hour (30px per 15min slot * 4)
                                    }}
                                    draggable={true}
                                    onDragStart={(e) => handleAppointmentDragStart(appointment, e)}
                                    onDragEnd={handleAppointmentDragEnd}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      openViewDialog(appointment)
                                    }}
                                  >
                                    <div className="flex items-start justify-between h-full">
                                      <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-xs mb-1 truncate">{appointment.client}</div>
                                        <div className="text-xs mb-1 opacity-90 truncate">{appointment.service}</div>
                                        <div className="flex items-center gap-1 text-xs opacity-75 mb-1">
                                          <Clock className="h-2 w-2" />
                                          {formatTime(appointment.startTime)}
                                        </div>
                                        <div className="flex items-center justify-between">
                                          {appointment.price && (
                                            <div className="text-xs opacity-75">${appointment.price}</div>
                                          )}
                                          <Badge
                                            className={`${getPaymentStatusColor(appointment.paymentStatus)} text-xs px-1 py-0`}
                                          >
                                            {appointment.paymentStatus}
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
                                            appointment.paymentStatus !== "paid" && (
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
                                    {/* Drag indicator */}
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
          <div className="grid grid-cols-4 gap-4">
            {artists.map((artist) => {
              const currentDateStr = currentDate.toISOString().split("T")[0]
              const artistAppointments = appointments.filter(
                (apt) => apt.artistId === artist.id && apt.date === currentDateStr,
              )
              const totalHours = artistAppointments.reduce((sum, apt) => sum + apt.duration, 0)
              const totalRevenue = artistAppointments.reduce((sum, apt) => sum + (apt.price || 0), 0)

              const dayOfWeek = getDayOfWeek(currentDate)
              const availability = artist.availability[dayOfWeek]
              const isWorkingToday = availability?.available

              return (
                <Card key={artist.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${artist.color}`}></div>
                      <span className="font-medium text-sm">{artist.name}</span>
                      {!isWorkingToday && (
                        <Badge variant="secondary" className="text-xs">
                          Off
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div>{artistAppointments.length} appointments</div>
                      <div>{totalHours} hours booked</div>
                      <div>${totalRevenue} revenue</div>
                      {isWorkingToday && (
                        <div className="text-green-600">
                          Available: {formatTime(Number.parseFloat(availability.startTime.replace(":", ".")))} -{" "}
                          {formatTime(Number.parseFloat(availability.endTime.replace(":", ".")))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      ) : (
        <>
          {/* Stats Cards for List View */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Upcoming</span>
                </div>
                <p className="text-2xl font-bold mt-2">{stats.upcoming}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Confirmed</span>
                </div>
                <p className="text-2xl font-bold mt-2">{stats.confirmed}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">Pending</span>
                </div>
                <p className="text-2xl font-bold mt-2">{stats.pending}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Revenue (Completed)</span>
                </div>
                <p className="text-2xl font-bold mt-2">${stats.totalRevenue.toLocaleString()}</p>
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
                    const artist = getArtistById(appointment.artistId)
                    const appointmentDate = new Date(appointment.date)
                    const isAppointmentToday = appointmentDate.toDateString() === new Date().toDateString()
                    const isPast = appointmentDate < new Date()

                    return (
                      <Card
                        key={appointment.id}
                        className={`transition-colors hover:bg-gray-50 ${isAppointmentToday ? "border-blue-200 bg-blue-50" : ""}`}
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
                                  <h3 className="font-semibold">{appointment.client}</h3>
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
                                    {formatDate(appointment.date)}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatTime(appointment.startTime)} -{" "}
                                    {formatTime(appointment.startTime + appointment.duration)}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />${appointment.price}
                                  </div>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  <span className="font-medium">{appointment.service}</span>
                                  {appointment.depositPaid && (
                                    <span className="ml-2">• Deposit: ${appointment.depositPaid}</span>
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
                                    appointment.paymentStatus !== "paid" && (
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
                  <p className="text-lg font-semibold">{selectedAppointment.client}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <Badge className={getStatusColor(selectedAppointment.status)}>{selectedAppointment.status}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Artist</Label>
                  <p>{getArtistById(selectedAppointment.artistId)?.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Service</Label>
                  <p>{selectedAppointment.service}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Date</Label>
                  <p>{formatDate(selectedAppointment.date)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Time</Label>
                  <p>
                    {formatTime(selectedAppointment.startTime)} -{" "}
                    {formatTime(selectedAppointment.startTime + selectedAppointment.duration)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Duration</Label>
                  <p>
                    {selectedAppointment.duration} hour{selectedAppointment.duration !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Phone</Label>
                  <p>{selectedAppointment.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p>{selectedAppointment.email || "Not provided"}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Price</Label>
                  <p className="text-lg font-semibold">${selectedAppointment.price}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Deposit Paid</Label>
                  <p>${selectedAppointment.depositPaid || 0}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Payment Status</Label>
                  <Badge className={getPaymentStatusColor(selectedAppointment.paymentStatus)}>
                    {selectedAppointment.paymentStatus}
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
                <p>{new Date(selectedAppointment.createdAt).toLocaleString()}</p>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => openEditDialog(selectedAppointment)}>Edit Appointment</Button>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client">Client Name *</Label>
                <Input
                  id="client"
                  value={formData.client || ""}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  placeholder="Enter client name"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="client@email.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="artist">Artist *</Label>
                <Select value={formData.artistId?.toString() || ""} onValueChange={handleArtistChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select artist" />
                  </SelectTrigger>
                  <SelectContent>
                    {artists.map((artist) => {
                      const appointmentDate = new Date(formData.date || currentDate.toISOString().split("T")[0])
                      const dayOfWeek = getDayOfWeek(appointmentDate)
                      const availability = artist.availability[dayOfWeek]
                      const isAvailable = availability?.available

                      return (
                        <SelectItem key={artist.id} value={artist.id.toString()} disabled={!isAvailable}>
                          <div className="flex items-center justify-between w-full">
                            <span>{artist.name}</span>
                            {!isAvailable && <span className="text-xs text-red-500 ml-2">Unavailable</span>}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="service">Service *</Label>
                <Select value={formData.service || ""} onValueChange={handleServiceChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.name}>
                        {service.name} ({service.suggestedDuration}h)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date || ""}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="startTime">Start Time *</Label>
                <Select
                  value={formData.startTime?.toString() || ""}
                  onValueChange={(value) => setFormData({ ...formData, startTime: Number.parseFloat(value) })}
                  disabled={!formData.artistId || !formData.date}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={!formData.artistId || !formData.date ? "Select artist & date first" : "Select time"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.artistId && formData.date ? (
                      getAvailableTimeSlotsForArtist(formData.artistId, formData.date).length > 0 ? (
                        getAvailableTimeSlotsForArtist(formData.artistId, formData.date).map((time) => (
                          <SelectItem key={time} value={time.toString()}>
                            {formatTime(time)}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-slots" disabled>
                          No available time slots
                        </SelectItem>
                      )
                    ) : (
                      <SelectItem value="select-first" disabled>
                        Select artist and date first
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="duration">Duration (hours) *</Label>
                <Select
                  value={formData.duration?.toString() || ""}
                  onValueChange={(value) => handleDurationChange(Number.parseFloat(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.25">15 minutes</SelectItem>
                    <SelectItem value="0.5">30 minutes</SelectItem>
                    <SelectItem value="0.75">45 minutes</SelectItem>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="1.25">1 hour 15 minutes</SelectItem>
                    <SelectItem value="1.5">1.5 hours</SelectItem>
                    <SelectItem value="1.75">1 hour 45 minutes</SelectItem>
                    <SelectItem value="2">2 hours</SelectItem>
                    <SelectItem value="2.5">2.5 hours</SelectItem>
                    <SelectItem value="3">3 hours</SelectItem>
                    <SelectItem value="4">4 hours</SelectItem>
                    <SelectItem value="5">5 hours</SelectItem>
                    <SelectItem value="6">6 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price || ""}
                  onChange={(e) => setFormData({ ...formData, price: Number.parseInt(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="deposit">Deposit Paid ($)</Label>
                <Input
                  id="deposit"
                  type="number"
                  value={formData.depositPaid || ""}
                  onChange={(e) => setFormData({ ...formData, depositPaid: Number.parseInt(e.target.value) })}
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
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
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
                disabled={!formData.client || !formData.service || !formData.artistId || !formData.startTime}
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
              Are you sure you want to cancel this appointment with {selectedAppointment?.client}? This action cannot be
              undone.
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
            <DialogTitle>Checkout - {selectedAppointment?.client}</DialogTitle>
            <DialogDescription>Select payment method to complete the transaction</DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Service:</span>
                  <span className="font-medium">{selectedAppointment.service}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Price:</span>
                  <span className="font-medium">${selectedAppointment.price}</span>
                </div>
                <div className="flex justify-between">
                  <span>Deposit Paid:</span>
                  <span className="font-medium">${selectedAppointment.depositPaid || 0}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Balance Due:</span>
                  <span>${(selectedAppointment.price || 0) - (selectedAppointment.depositPaid || 0)}</span>
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
            <DialogTitle>Cash Payment - {selectedAppointment?.client}</DialogTitle>
            <DialogDescription>Enter cash payment details</DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Balance Due:</span>
                  <span className="font-bold text-lg">
                    ${(selectedAppointment.price || 0) - (selectedAppointment.depositPaid || 0)}
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
                            ((selectedAppointment.price || 0) - (selectedAppointment.depositPaid || 0)),
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
                    (selectedAppointment.price || 0) - (selectedAppointment.depositPaid || 0)
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
