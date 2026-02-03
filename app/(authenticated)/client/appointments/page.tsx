"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  MessageSquare,
  Edit,
  X,
  Star,
  MapPin,
  Plus,
  Search,
  Download,
  Share2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

interface Appointment {
  id: number
  artistId: number
  artistName: string
  artistSpecialty: string
  service: string
  date: string
  time: string
  duration: string
  status: "confirmed" | "pending" | "completed" | "cancelled" | "rescheduled"
  deposit: number
  total: number
  notes: string
  referenceImages: string[]
  location: string
  createdAt: string
}

const appointments: Appointment[] = [
  {
    id: 1,
    artistId: 1,
    artistName: "Mike Rodriguez",
    artistSpecialty: "Traditional",
    service: "Traditional Rose Tattoo - Forearm",
    date: "2024-01-25",
    time: "14:00",
    duration: "3 hours",
    status: "confirmed",
    deposit: 100,
    total: 450,
    notes:
      "Classic red rose with green leaves and yellow highlights. Bold traditional style with thick black outlines.",
    referenceImages: [
      "/placeholder.svg?height=200&width=200&text=Rose+Reference+1",
      "/placeholder.svg?height=200&width=200&text=Rose+Reference+2",
    ],
    location: "Ink & Soul Tattoo Studio",
    createdAt: "2024-01-20T10:30:00",
  },
  {
    id: 2,
    artistId: 2,
    artistName: "Luna Martinez",
    artistSpecialty: "Fine Line",
    service: "Moon Phases - Behind Ear",
    date: "2024-02-02",
    time: "11:00",
    duration: "2 hours",
    status: "pending",
    deposit: 75,
    total: 240,
    notes: "Minimalist moon phases design with very fine lines. Small and delicate placement behind the ear.",
    referenceImages: [
      "/placeholder.svg?height=150&width=150&text=Moon+Phases+1",
      "/placeholder.svg?height=150&width=150&text=Moon+Phases+2",
    ],
    location: "Ink & Soul Tattoo Studio",
    createdAt: "2024-01-21T15:20:00",
  },
  {
    id: 3,
    artistId: 3,
    artistName: "Jake Thompson",
    artistSpecialty: "Realism",
    service: "Dog Portrait Memorial - Upper Arm",
    date: "2024-02-15",
    time: "10:00",
    duration: "4 hours",
    status: "confirmed",
    deposit: 200,
    total: 720,
    notes:
      "Realistic portrait of beloved dog Buddy. High detail work capturing his personality and features. This will be session 1 of 2.",
    referenceImages: [
      "/placeholder.svg?height=200&width=200&text=Buddy+Photo+1",
      "/placeholder.svg?height=200&width=200&text=Buddy+Photo+2",
      "/placeholder.svg?height=200&width=200&text=Buddy+Photo+3",
    ],
    location: "Ink & Soul Tattoo Studio",
    createdAt: "2024-01-18T14:45:00",
  },
  {
    id: 4,
    artistId: 1,
    artistName: "Mike Rodriguez",
    artistSpecialty: "Traditional",
    service: "Anchor & Rope - Calf",
    date: "2023-12-15",
    time: "13:00",
    duration: "2.5 hours",
    status: "completed",
    deposit: 80,
    total: 375,
    notes: "Traditional nautical anchor with rope detail. Bold black lines with red and blue accents.",
    referenceImages: ["/placeholder.svg?height=200&width=200&text=Anchor+Design"],
    location: "Ink & Soul Tattoo Studio",
    createdAt: "2023-12-10T09:15:00",
  },
  {
    id: 5,
    artistId: 2,
    artistName: "Luna Martinez",
    artistSpecialty: "Fine Line",
    service: "Floral Wrist Band",
    date: "2023-11-28",
    time: "15:30",
    duration: "1.5 hours",
    status: "completed",
    deposit: 60,
    total: 180,
    notes: "Delicate floral band around wrist with small flowers and leaves. Fine line work in black ink only.",
    referenceImages: [
      "/placeholder.svg?height=150&width=150&text=Floral+Band+1",
      "/placeholder.svg?height=150&width=150&text=Floral+Band+2",
    ],
    location: "Ink & Soul Tattoo Studio",
    createdAt: "2023-11-20T11:30:00",
  },
]

export default function ClientAppointments() {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [newImages, setNewImages] = useState<string[]>([])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":")
    const date = new Date()
    date.setHours(Number.parseInt(hours), Number.parseInt(minutes))
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "rescheduled":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setNewImages((prev) => [...prev, e.target!.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number, isNew = false) => {
    if (isNew) {
      setNewImages((prev) => prev.filter((_, i) => i !== index))
    } else if (editingAppointment) {
      setEditingAppointment({
        ...editingAppointment,
        referenceImages: editingAppointment.referenceImages.filter((_, i) => i !== index),
      })
    }
  }

  const saveAppointmentChanges = () => {
    if (!editingAppointment) return

    // In a real app, you would send this to your backend
    console.log("Saving appointment changes:", {
      ...editingAppointment,
      referenceImages: [...editingAppointment.referenceImages, ...newImages],
    })

    setEditingAppointment(null)
    setNewImages([])
  }

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.artistName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const upcomingAppointments = filteredAppointments.filter(
    (apt) => new Date(apt.date) >= new Date() && apt.status !== "completed" && apt.status !== "cancelled",
  )

  const pastAppointments = filteredAppointments.filter(
    (apt) => new Date(apt.date) < new Date() || apt.status === "completed",
  )

  const totalSpent = appointments.filter((apt) => apt.status === "completed").reduce((sum, apt) => sum + apt.total, 0)

  const totalSessions = appointments.filter((apt) => apt.status === "completed").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link href="/client" className="mr-4">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">My Appointments</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Upcoming</span>
              </div>
              <p className="text-2xl font-bold mt-2">{upcomingAppointments.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium">Completed</span>
              </div>
              <p className="text-2xl font-bold mt-2">{totalSessions}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Total Spent</span>
              </div>
              <p className="text-2xl font-bold mt-2">${totalSpent}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Hours Tattooed</span>
              </div>
              <p className="text-2xl font-bold mt-2">
                {appointments
                  .filter((apt) => apt.status === "completed")
                  .reduce((sum, apt) => sum + Number.parseFloat(apt.duration.split(" ")[0]), 0)}
                h
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Appointments Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({pastAppointments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment) => (
                <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={`/placeholder.svg?height=48&width=48&text=${appointment.artistName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}`}
                            />
                            <AvatarFallback>
                              {appointment.artistName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-lg">{appointment.service}</h3>
                            <p className="text-gray-600">
                              {appointment.artistName} • {appointment.artistSpecialty}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{formatDate(appointment.date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>
                              {formatTime(appointment.time)} ({appointment.duration})
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{appointment.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span>
                              Deposit: ${appointment.deposit} / Total: ${appointment.total}
                            </span>
                          </div>
                        </div>

                        {appointment.notes && (
                          <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg">{appointment.notes}</p>
                        )}

                        {appointment.referenceImages.length > 0 && (
                          <div className="flex gap-2 mb-4">
                            {appointment.referenceImages.slice(0, 3).map((image, index) => (
                              <img
                                key={index}
                                src={image || "/placeholder.svg"}
                                alt={`Reference ${index + 1}`}
                                className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80"
                                onClick={() => window.open(image, "_blank")}
                              />
                            ))}
                            {appointment.referenceImages.length > 3 && (
                              <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">
                                +{appointment.referenceImages.length - 3}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </Badge>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                              <DialogHeader>
                                <DialogTitle>Edit Appointment</DialogTitle>
                                <DialogDescription>
                                  Update your appointment notes and reference images.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="notes">Notes</Label>
                                  <Textarea
                                    id="notes"
                                    value={editingAppointment?.notes || appointment.notes}
                                    onChange={(e) =>
                                      setEditingAppointment({
                                        ...appointment,
                                        notes: e.target.value,
                                      })
                                    }
                                    rows={3}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label>Reference Images</Label>
                                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                    {(editingAppointment?.referenceImages || appointment.referenceImages).map(
                                      (image, index) => (
                                        <div key={index} className="relative">
                                          <img
                                            src={image || "/placeholder.svg"}
                                            alt={`Reference ${index + 1}`}
                                            className="w-full h-20 object-cover rounded"
                                          />
                                          <Button
                                            variant="destructive"
                                            size="sm"
                                            className="absolute -top-2 -right-2 h-6 w-6 p-0"
                                            onClick={() => removeImage(index)}
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      ),
                                    )}
                                    {newImages.map((image, index) => (
                                      <div key={`new-${index}`} className="relative">
                                        <img
                                          src={image || "/placeholder.svg"}
                                          alt={`New reference ${index + 1}`}
                                          className="w-full h-20 object-cover rounded"
                                        />
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          className="absolute -top-2 -right-2 h-6 w-6 p-0"
                                          onClick={() => removeImage(index, true)}
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ))}
                                    <label className="w-full h-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:border-gray-400">
                                      <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                      />
                                      <Plus className="h-6 w-6 text-gray-400" />
                                    </label>
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setEditingAppointment(null)
                                    setNewImages([])
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button onClick={saveAppointmentChanges}>Save Changes</Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Link href="/client/messages">
                            <Button variant="outline" size="sm">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Message
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No upcoming appointments</h3>
                  <p className="text-gray-600 mb-4">Ready to book your next tattoo?</p>
                  <Link href="/client">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Book New Appointment
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastAppointments.length > 0 ? (
              pastAppointments.map((appointment) => (
                <Card key={appointment.id} className="hover:shadow-md transition-shadow opacity-90">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={`/placeholder.svg?height=48&width=48&text=${appointment.artistName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}`}
                            />
                            <AvatarFallback>
                              {appointment.artistName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-lg">{appointment.service}</h3>
                            <p className="text-gray-600">
                              {appointment.artistName} • {appointment.artistSpecialty}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{formatDate(appointment.date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>
                              {formatTime(appointment.time)} ({appointment.duration})
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{appointment.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span>Total: ${appointment.total}</span>
                          </div>
                        </div>

                        {appointment.referenceImages.length > 0 && (
                          <div className="flex gap-2 mb-4">
                            {appointment.referenceImages.slice(0, 4).map((image, index) => (
                              <img
                                key={index}
                                src={image || "/placeholder.svg"}
                                alt={`Reference ${index + 1}`}
                                className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80"
                                onClick={() => window.open(image, "_blank")}
                              />
                            ))}
                            {appointment.referenceImages.length > 4 && (
                              <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">
                                +{appointment.referenceImages.length - 4}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </Badge>
                        {appointment.status === "completed" && (
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Receipt
                            </Button>
                            <Button variant="outline" size="sm">
                              <Share2 className="h-4 w-4 mr-1" />
                              Share
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Star className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No past appointments</h3>
                  <p className="text-gray-600">Your completed tattoo sessions will appear here.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
