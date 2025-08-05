"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  Calendar,
  Clock,
  Search,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  User,
  DollarSign,
  CalendarDays,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
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
import { ScrollArea } from "@/components/ui/scroll-area"

const artists = [
  { id: 1, name: "Mike Rodriguez", specialty: "Traditional", color: "bg-blue-500", hourlyRate: 150 },
  { id: 2, name: "Luna Martinez", specialty: "Fine Line", color: "bg-purple-500", hourlyRate: 120 },
  { id: 3, name: "Jake Thompson", specialty: "Realism", color: "bg-green-500", hourlyRate: 180 },
  { id: 4, name: "Sarah Kim", specialty: "Watercolor", color: "bg-pink-500", hourlyRate: 140 },
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
]

interface Appointment {
  id: number
  artistId: number
  client: string
  service: string
  date: string
  startTime: number
  duration: number
  status: "confirmed" | "pending" | "cancelled" | "completed"
  phone: string
  email?: string
  notes?: string
  price?: number
  depositPaid?: number
  createdAt: string
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
    status: "confirmed",
    phone: "(555) 234-5678",
    email: "david.chen@email.com",
    price: 120,
    depositPaid: 50,
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
    status: "confirmed",
    phone: "(555) 567-8901",
    email: "maria.garcia@email.com",
    price: 240,
    depositPaid: 80,
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
    createdAt: "2024-01-20T16:20:00",
    notes: "Touch-up on watercolor piece from last year.",
  },
]

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [artistFilter, setArtistFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<Appointment>>({})

  const formatTime = (hour: number) => {
    const h = Math.floor(hour)
    const m = (hour % 1) * 60
    const period = h >= 12 ? "PM" : "AM"
    const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h
    return `${displayHour}${m > 0 ? `:${m.toString().padStart(2, "0")}` : ""}${period}`
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
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
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
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getArtistById = (id: number) => {
    return artists.find((artist) => artist.id === id)
  }

  const filterAppointments = () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    const weekFromNow = new Date(today)
    weekFromNow.setDate(today.getDate() + 7)

    return appointments
      .filter((appointment) => {
        const matchesSearch =
          appointment.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.phone.includes(searchTerm) ||
          (appointment.email && appointment.email.toLowerCase().includes(searchTerm.toLowerCase()))

        const matchesStatus = statusFilter === "all" || appointment.status === statusFilter
        const matchesArtist = artistFilter === "all" || appointment.artistId.toString() === artistFilter

        const appointmentDate = new Date(appointment.date)
        let matchesDate = true

        if (dateFilter === "today") {
          matchesDate = appointmentDate.toDateString() === today.toDateString()
        } else if (dateFilter === "tomorrow") {
          matchesDate = appointmentDate.toDateString() === tomorrow.toDateString()
        } else if (dateFilter === "week") {
          matchesDate = appointmentDate >= today && appointmentDate <= weekFromNow
        } else if (dateFilter === "upcoming") {
          matchesDate = appointmentDate >= today
        } else if (dateFilter === "past") {
          matchesDate = appointmentDate < today
        }

        return matchesSearch && matchesStatus && matchesArtist && matchesDate
      })
      .sort((a, b) => {
        // Sort by date first, then by start time
        const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime()
        if (dateCompare !== 0) return dateCompare
        return a.startTime - b.startTime
      })
  }

  const filteredAppointments = filterAppointments()

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

  const handleEditAppointment = () => {
    if (selectedAppointment && formData.client && formData.service) {
      const updatedAppointments = appointments.map((apt) =>
        apt.id === selectedAppointment.id ? { ...apt, ...formData } : apt,
      )
      setAppointments(updatedAppointments)
      setIsEditDialogOpen(false)
      setFormData({})
      setSelectedAppointment(null)
    }
  }

  const handleDeleteAppointment = () => {
    if (selectedAppointment) {
      setAppointments(appointments.filter((apt) => apt.id !== selectedAppointment.id))
      setIsDeleteDialogOpen(false)
      setSelectedAppointment(null)
    }
  }

  const updateAppointmentStatus = (
    appointmentId: number,
    newStatus: "confirmed" | "pending" | "cancelled" | "completed",
  ) => {
    setAppointments(appointments.map((apt) => (apt.id === appointmentId ? { ...apt, status: newStatus } : apt)))
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">View and manage all appointments</p>
        </div>
        <Button asChild>
          <a href="/schedule">
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </a>
        </Button>
      </div>

      {/* Stats Cards */}
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

      {/* Filters */}
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
                const isToday = appointmentDate.toDateString() === new Date().toDateString()
                const isPast = appointmentDate < new Date()

                return (
                  <Card
                    key={appointment.id}
                    className={`transition-colors hover:bg-gray-50 ${isToday ? "border-blue-200 bg-blue-50" : ""}`}
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
                              {isToday && (
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
                                <DropdownMenuItem onClick={() => updateAppointmentStatus(appointment.id, "confirmed")}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Confirm
                                </DropdownMenuItem>
                              )}
                              {appointment.status === "confirmed" && !isPast && (
                                <DropdownMenuItem onClick={() => updateAppointmentStatus(appointment.id, "completed")}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Mark Complete
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => openDeleteDialog(appointment)} className="text-red-600">
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
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {filteredAppointments.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No appointments found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all" || artistFilter !== "all" || dateFilter !== "all"
                ? "Try adjusting your filters to see more results."
                : "No appointments have been scheduled yet."}
            </p>
            <Button asChild>
              <a href="/schedule">
                <Plus className="mr-2 h-4 w-4" />
                Schedule Appointment
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* View Appointment Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>View complete appointment information</DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Client</Label>
                  <p className="text-sm font-semibold">{selectedAppointment.client}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge className={getStatusColor(selectedAppointment.status)}>{selectedAppointment.status}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Artist</Label>
                  <p className="text-sm">{getArtistById(selectedAppointment.artistId)?.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Service</Label>
                  <p className="text-sm">{selectedAppointment.service}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Date</Label>
                  <p className="text-sm">{formatDate(selectedAppointment.date)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Time</Label>
                  <p className="text-sm">
                    {formatTime(selectedAppointment.startTime)} -{" "}
                    {formatTime(selectedAppointment.startTime + selectedAppointment.duration)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                  <p className="text-sm">
                    {selectedAppointment.duration} hour{selectedAppointment.duration !== 1 ? "s" : ""}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Price</Label>
                  <p className="text-sm font-semibold">${selectedAppointment.price}</p>
                </div>
              </div>
              {selectedAppointment.depositPaid && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Deposit Paid</Label>
                    <p className="text-sm">${selectedAppointment.depositPaid}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Balance Due</Label>
                    <p className="text-sm font-semibold">
                      ${(selectedAppointment.price || 0) - (selectedAppointment.depositPaid || 0)}
                    </p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                  <p className="text-sm">{selectedAppointment.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="text-sm">{selectedAppointment.email || "Not provided"}</p>
                </div>
              </div>
              {selectedAppointment.notes && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                  <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{selectedAppointment.notes}</p>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Booked On</Label>
                <p className="text-sm">{new Date(selectedAppointment.createdAt).toLocaleString()}</p>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {selectedAppointment && (
              <Button
                onClick={() => {
                  setIsViewDialogOpen(false)
                  openEditDialog(selectedAppointment)
                }}
              >
                Edit Appointment
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
            <DialogDescription>Update appointment details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-client">Client Name</Label>
                <Input
                  id="edit-client"
                  value={formData.client || ""}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-service">Service</Label>
              <Select
                value={formData.service || ""}
                onValueChange={(value) => setFormData({ ...formData, service: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.name}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Price ($)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={formData.price || ""}
                  onChange={(e) => setFormData({ ...formData, price: Number.parseInt(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value as "confirmed" | "pending" | "cancelled" | "completed" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditAppointment}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel the appointment for {selectedAppointment?.client}? This action cannot be
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
    </div>
  )
}
