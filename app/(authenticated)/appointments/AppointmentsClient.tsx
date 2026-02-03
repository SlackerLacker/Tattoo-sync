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
import { Appointment, Artist, Service, Client } from "@/types"

interface AppointmentsClientProps {
  appointments: Appointment[]
  artists: Artist[]
  services: Service[]
  clients: Client[]
}

export default function AppointmentsClient({
  appointments: initialAppointments,
  artists,
  services,
  clients,
}: AppointmentsClientProps) {
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

  const formatTime = (timeString: string | null | undefined) => {
    if (!timeString) return "N/A"
    const [hours, minutes] = timeString.split(":").map(Number)
    const date = new Date()
    date.setHours(hours, minutes)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getEndTime = (startTime: string | null | undefined, duration: number | null | undefined) => {
    if (!startTime || !duration) return ""
    const [hours, minutes] = startTime.split(":").map(Number)
    const startDate = new Date()
    startDate.setHours(hours, minutes, 0)
    const endDate = new Date(startDate.getTime() + duration * 60000)
    return endDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A"
    // Add a time zone correction to avoid off-by-one day errors
    const date = new Date(dateString + "T00:00:00")
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

  const filterAppointments = () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    const weekFromNow = new Date(today)
    weekFromNow.setDate(today.getDate() + 7)

    return (appointments || [])
      .filter((appointment) => {
        const matchesSearch =
          appointment.clients?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.services?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.artists?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.clients?.phone?.includes(searchTerm) ||
          appointment.clients?.email?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === "all" || appointment.status === statusFilter
        const matchesArtist = artistFilter === "all" || appointment.artist_id?.toString() === artistFilter

        if (!appointment.appointment_date) return false
        const appointmentDate = new Date(appointment.appointment_date)
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

        return !!(matchesSearch && matchesStatus && matchesArtist && matchesDate)
      })
      .sort((a, b) => {
        // Sort by date first, then by start time
        const dateCompare = new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()
        if (dateCompare !== 0) return dateCompare
        // Assuming start_time is a string like "HH:mm:ss"
        return (a.start_time || "").localeCompare(b.start_time || "")
      })
  }

  const filteredAppointments = filterAppointments()

  const getStats = () => {
    const today = new Date()
    const upcoming = (appointments || []).filter(
      (apt) => new Date(apt.appointment_date) >= today && apt.status !== "cancelled",
    )
    const confirmed = (appointments || []).filter((apt) => apt.status === "confirmed")
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

  const handleEditAppointment = async () => {
    if (!selectedAppointment) return

    // Construct a clean payload
    const payload: Partial<Appointment> = {
      client_id: formData.client_id,
      artist_id: formData.artist_id,
      service_id: formData.service_id,
      appointment_date: formData.appointment_date,
      start_time: formData.start_time,
      duration_minutes: formData.duration_minutes,
      price: formData.price,
      status: formData.status,
      notes: formData.notes,
    }

    const response = await fetch(`/api/appointments/${selectedAppointment.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (response.ok) {
      const updatedAppointment = await response.json()
      // The API now returns the full nested object, so we can just use it
      setAppointments(appointments.map((apt) => (apt.id === selectedAppointment.id ? updatedAppointment[0] : apt)))
      setIsEditDialogOpen(false)
      setFormData({})
      setSelectedAppointment(null)
    } else {
      // Handle error
      console.error("Failed to update appointment")
    }
  }

  const handleDeleteAppointment = async () => {
    if (selectedAppointment) {
      const response = await fetch(`/api/appointments/${selectedAppointment.id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setAppointments(appointments.filter((apt) => apt.id !== selectedAppointment.id))
        setIsDeleteDialogOpen(false)
        setSelectedAppointment(null)
      }
    }
  }

  const updateAppointmentStatus = async (
    appointmentId: number,
    newStatus: "confirmed" | "pending" | "cancelled" | "completed",
  ) => {
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

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
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
              <SelectTrigger className="w-full sm:w-[140px]">
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
              <SelectTrigger className="w-full sm:w-[160px]">
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
              <SelectTrigger className="w-full sm:w-[140px]">
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
                const appointmentDate = appointment.appointment_date
                  ? new Date(appointment.appointment_date + "T00:00:00")
                  : null
                const isToday = appointmentDate && appointmentDate.toDateString() === new Date().toDateString()
                const isPast = appointmentDate && appointmentDate < new Date() && !isToday
                const clientName = appointment.clients?.full_name || "Unknown Client"
                const artistName = appointment.artists?.name || "Unknown Artist"
                const clientInitials = clientName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")

                return (
                  <Card
                    key={appointment.id}
                    className={`transition-colors hover:bg-gray-50 ${isToday ? "border-blue-200 bg-blue-50" : ""}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${clientInitials}`} />
                            <AvatarFallback>{clientInitials}</AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{clientName}</h3>
                              <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                              {isToday && (
                                <Badge variant="outline" className="text-blue-600">
                                  Today
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {artistName}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(appointment.appointment_date)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTime(appointment.start_time)} -{" "}
                                {getEndTime(appointment.start_time, appointment.duration_minutes)}
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />${appointment.price}
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium">{appointment.services?.name || "Unknown Service"}</span>
                              {appointment.deposit_paid && (
                                <span className="ml-2">• Deposit: ${appointment.deposit_paid}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:self-start">
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Client</Label>
                  <p className="text-sm font-semibold">{selectedAppointment.clients?.full_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge className={getStatusColor(selectedAppointment.status)}>{selectedAppointment.status}</Badge>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Artist</Label>
                  <p className="text-sm">{selectedAppointment.artists?.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Service</Label>
                  <p className="text-sm">{selectedAppointment.services?.name}</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Date</Label>
                  <p className="text-sm">{formatDate(selectedAppointment.appointment_date)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Time</Label>
                  <p className="text-sm">
                    {formatTime(selectedAppointment.start_time)} -{" "}
                    {getEndTime(selectedAppointment.start_time, selectedAppointment.duration_minutes)}
                  </p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                  <p className="text-sm">
                    {selectedAppointment.duration_minutes} minute
                    {selectedAppointment.duration_minutes !== 1 ? "s" : ""}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Price</Label>
                  <p className="text-sm font-semibold">${selectedAppointment.price}</p>
                </div>
              </div>
              {selectedAppointment.deposit_paid && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Deposit Paid</Label>
                    <p className="text-sm">${selectedAppointment.deposit_paid}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Balance Due</Label>
                    <p className="text-sm font-semibold">
                      ${(selectedAppointment.price || 0) - (selectedAppointment.deposit_paid || 0)}
                    </p>
                  </div>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                  <p className="text-sm">{selectedAppointment.clients?.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="text-sm">{selectedAppointment.clients?.email || "Not provided"}</p>
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
                <p className="text-sm">
                  {selectedAppointment.created_at ? new Date(selectedAppointment.created_at).toLocaleString() : "N/A"}
                </p>
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
            <div className="grid gap-2">
              <Label htmlFor="edit-client">Client</Label>
              <Select
                value={formData.client_id?.toString() || ""}
                onValueChange={(value) => setFormData({ ...formData, client_id: Number(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-service">Service</Label>
              <Select
                value={formData.service_id?.toString() || ""}
                onValueChange={(value) => {
                  const service = services.find((s) => s.id === Number(value))
                  setFormData({
                    ...formData,
                    service_id: Number(value),
                    price: service?.price,
                    duration_minutes: service?.duration_minutes,
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.name} ({service.duration_minutes} min) - ${service.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-artist">Artist</Label>
              <Select
                value={formData.artist_id?.toString() || ""}
                onValueChange={(value) => setFormData({ ...formData, artist_id: Number(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an artist" />
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.appointment_date || ""}
                  onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-time">Time</Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={formData.start_time || ""}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Price ($)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={formData.price || ""}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
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
              Are you sure you want to cancel the appointment for {selectedAppointment?.clients?.full_name}? This
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
    </div>
  )
}
