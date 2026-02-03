"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Calendar,
  Clock,
  MessageSquare,
  Star,
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Plus,
  Search,
  Heart,
  Share2,
  DollarSign,
  TrendingUp,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

const artists = [
  {
    id: 1,
    name: "Mike Rodriguez",
    specialty: "Traditional",
    rating: 4.9,
    reviews: 127,
    hourlyRate: 150,
    image: "/placeholder.svg?height=200&width=200&text=Mike",
    portfolio: [
      "/placeholder.svg?height=300&width=300&text=Traditional+Rose",
      "/placeholder.svg?height=300&width=300&text=Eagle+Tattoo",
      "/placeholder.svg?height=300&width=300&text=Anchor+Design",
    ],
    bio: "Specializing in traditional American tattoos with bold lines and vibrant colors. 10+ years experience.",
    availability: "Mon-Fri, 10am-6pm",
  },
  {
    id: 2,
    name: "Luna Martinez",
    specialty: "Fine Line",
    rating: 4.8,
    reviews: 89,
    hourlyRate: 120,
    image: "/placeholder.svg?height=200&width=200&text=Luna",
    portfolio: [
      "/placeholder.svg?height=300&width=300&text=Fine+Line+Moon",
      "/placeholder.svg?height=300&width=300&text=Delicate+Flowers",
      "/placeholder.svg?height=300&width=300&text=Minimalist+Bird",
    ],
    bio: "Creating delicate, fine line tattoos with attention to detail. Perfect for first-time clients.",
    availability: "Tue-Sat, 11am-7pm",
  },
  {
    id: 3,
    name: "Jake Thompson",
    specialty: "Realism",
    rating: 4.9,
    reviews: 156,
    hourlyRate: 180,
    image: "/placeholder.svg?height=200&width=200&text=Jake",
    portfolio: [
      "/placeholder.svg?height=300&width=300&text=Portrait+Realism",
      "/placeholder.svg?height=300&width=300&text=Animal+Portrait",
      "/placeholder.svg?height=300&width=300&text=Photo+Realism",
    ],
    bio: "Award-winning realism artist specializing in portraits and photorealistic designs.",
    availability: "Wed-Sun, 12pm-8pm",
  },
]

const upcomingAppointments = [
  {
    id: 1,
    artistName: "Mike Rodriguez",
    service: "Traditional Rose Tattoo",
    date: "2024-01-25",
    time: "2:00 PM",
    duration: "3 hours",
    status: "confirmed",
    deposit: 100,
    total: 450,
  },
  {
    id: 2,
    artistName: "Luna Martinez",
    service: "Fine Line Moon Phases",
    date: "2024-02-02",
    time: "11:00 AM",
    duration: "2 hours",
    status: "pending",
    deposit: 75,
    total: 240,
  },
]

const recentMessages = [
  {
    id: 1,
    artistName: "Mike Rodriguez",
    lastMessage: "Looking forward to our session tomorrow!",
    timestamp: "2024-01-22T16:30:00",
    unread: true,
  },
  {
    id: 2,
    artistName: "Luna Martinez",
    lastMessage: "I have some ideas for the moon phases design.",
    timestamp: "2024-01-21T11:20:00",
    unread: false,
  },
]

const shopInfo = {
  name: "Ink & Soul Tattoo Studio",
  address: "123 Art Street, Creative District",
  phone: "(555) 123-TATT",
  email: "hello@inkandsoul.com",
  hours: "Mon-Sat: 10am-8pm, Sun: 12pm-6pm",
  social: {
    instagram: "@inkandsoul",
    facebook: "InkAndSoulStudio",
  },
}

export default function ClientDashboard() {
  const [selectedArtist, setSelectedArtist] = useState<any>(null)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("all")
  const [bookingData, setBookingData] = useState({
    artistId: "",
    service: "",
    date: "",
    time: "",
    notes: "",
    referenceImages: [] as string[],
  })

  const filteredArtists = artists.filter((artist) => {
    const matchesSearch =
      artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialty = selectedSpecialty === "all" || artist.specialty.toLowerCase() === selectedSpecialty
    return matchesSearch && matchesSpecialty
  })

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  const handleBooking = () => {
    console.log("Booking submitted:", bookingData)
    setIsBookingOpen(false)
    setBookingData({
      artistId: "",
      service: "",
      date: "",
      time: "",
      notes: "",
      referenceImages: [],
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">{shopInfo.name}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/client/messages">
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                  {recentMessages.some((m) => m.unread) && (
                    <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                      {recentMessages.filter((m) => m.unread).length}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link href="/client/appointments">
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  My Appointments
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h2>
          <p className="text-gray-600">Ready to book your next tattoo? Browse our talented artists below.</p>
        </div>

        {/* Quick Stats */}
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
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Total Spent</span>
              </div>
              <p className="text-2xl font-bold mt-2">$1,240</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium">Favorite Artist</span>
              </div>
              <p className="text-lg font-bold mt-2">Mike Rodriguez</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Sessions</span>
              </div>
              <p className="text-2xl font-bold mt-2">8</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Book New Appointment */}
            <Card className="mb-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <CardContent className="p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Ready for your next tattoo?</h3>
                    <p className="opacity-90">Book with one of our amazing artists today!</p>
                  </div>
                  <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                    <DialogTrigger asChild>
                      <Button size="lg" variant="secondary">
                        <Plus className="h-4 w-4 mr-2" />
                        Book Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Book New Appointment</DialogTitle>
                        <DialogDescription>Choose your artist, service, and preferred time.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="artist">Artist</Label>
                          <Select
                            value={bookingData.artistId}
                            onValueChange={(value) => setBookingData({ ...bookingData, artistId: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select an artist" />
                            </SelectTrigger>
                            <SelectContent>
                              {artists.map((artist) => (
                                <SelectItem key={artist.id} value={artist.id.toString()}>
                                  {artist.name} - {artist.specialty} (${artist.hourlyRate}/hr)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="service">Service</Label>
                          <Input
                            id="service"
                            placeholder="e.g., Small rose tattoo on wrist"
                            value={bookingData.service}
                            onChange={(e) => setBookingData({ ...bookingData, service: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="grid gap-2">
                            <Label htmlFor="date">Preferred Date</Label>
                            <Input
                              id="date"
                              type="date"
                              value={bookingData.date}
                              onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="time">Preferred Time</Label>
                            <Select
                              value={bookingData.time}
                              onValueChange={(value) => setBookingData({ ...bookingData, time: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10:00">10:00 AM</SelectItem>
                                <SelectItem value="11:00">11:00 AM</SelectItem>
                                <SelectItem value="12:00">12:00 PM</SelectItem>
                                <SelectItem value="13:00">1:00 PM</SelectItem>
                                <SelectItem value="14:00">2:00 PM</SelectItem>
                                <SelectItem value="15:00">3:00 PM</SelectItem>
                                <SelectItem value="16:00">4:00 PM</SelectItem>
                                <SelectItem value="17:00">5:00 PM</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="notes">Notes & Details</Label>
                          <Textarea
                            id="notes"
                            placeholder="Describe your tattoo idea, size, placement, style preferences..."
                            value={bookingData.notes}
                            onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                            rows={3}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsBookingOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleBooking}>Submit Booking Request</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Artists Section */}
            <div className="mb-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Our Artists</h3>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search artists..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-full"
                    />
                  </div>
                  <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Styles</SelectItem>
                      <SelectItem value="traditional">Traditional</SelectItem>
                      <SelectItem value="fine line">Fine Line</SelectItem>
                      <SelectItem value="realism">Realism</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredArtists.map((artist) => (
                  <Card key={artist.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img
                        src={artist.image || "/placeholder.svg"}
                        alt={artist.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button size="sm" variant="secondary">
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="secondary">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2">
                        <h4 className="text-lg font-bold">{artist.name}</h4>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{artist.rating}</span>
                          <span className="text-sm text-gray-500">({artist.reviews})</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
                        <Badge variant="secondary">{artist.specialty}</Badge>
                        <span className="text-sm font-medium text-green-600">${artist.hourlyRate}/hr</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{artist.bio}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{artist.availability}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={() => {
                            setBookingData({ ...bookingData, artistId: artist.id.toString() })
                            setIsBookingOpen(true)
                          }}
                        >
                          Book Now
                        </Button>
                        <Button variant="outline" onClick={() => setSelectedArtist(artist)}>
                          View Portfolio
                        </Button>
                        <Link href="/client/messages">
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{appointment.service}</h4>
                          <Badge variant={appointment.status === "confirmed" ? "default" : "secondary"}>
                            {appointment.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{appointment.artistName}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{appointment.date}</span>
                          <span>{appointment.time}</span>
                          <span>{appointment.duration}</span>
                        </div>
                      </div>
                    ))}
                    <Link href="/client/appointments">
                      <Button variant="outline" className="w-full bg-transparent">
                        View All Appointments
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No upcoming appointments</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Messages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Recent Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentMessages.length > 0 ? (
                  <div className="space-y-3">
                    {recentMessages.map((message) => (
                      <div key={message.id} className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={`/placeholder.svg?height=32&width=32&text=${message.artistName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}`}
                          />
                          <AvatarFallback className="text-xs">
                            {message.artistName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{message.artistName}</p>
                            {message.unread && <div className="w-2 h-2 bg-red-500 rounded-full"></div>}
                          </div>
                          <p className="text-xs text-gray-600 truncate">{message.lastMessage}</p>
                          <p className="text-xs text-gray-400">{formatTime(message.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                    <Link href="/client/messages">
                      <Button variant="outline" className="w-full bg-transparent">
                        View All Messages
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No recent messages</p>
                )}
              </CardContent>
            </Card>

            {/* Shop Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shop Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{shopInfo.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{shopInfo.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{shopInfo.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>{shopInfo.hours}</span>
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <Button variant="outline" size="sm">
                    <Instagram className="h-4 w-4 mr-1" />
                    {shopInfo.social.instagram}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Facebook className="h-4 w-4 mr-1" />
                    Follow
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Artist Portfolio Modal */}
        {selectedArtist && (
          <Dialog open={!!selectedArtist} onOpenChange={() => setSelectedArtist(null)}>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>{selectedArtist.name}'s Portfolio</DialogTitle>
                <DialogDescription>
                  {selectedArtist.specialty} specialist • {selectedArtist.rating} ⭐ ({selectedArtist.reviews} reviews)
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {selectedArtist.portfolio.map((image: string, index: number) => (
                    <img
                      key={index}
                      src={image || "/placeholder.svg"}
                      alt={`Portfolio ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setBookingData({ ...bookingData, artistId: selectedArtist.id.toString() })
                      setSelectedArtist(null)
                      setIsBookingOpen(true)
                    }}
                  >
                    Book with {selectedArtist.name}
                  </Button>
                  <Link href="/client/messages">
                    <Button variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </Link>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
