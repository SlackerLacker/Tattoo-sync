"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Plus,
  Mail,
  Phone,
  Calendar,
  Edit,
  Trash2,
  MoreHorizontal,
  User,
  Eye,
  Instagram,
  Facebook,
  Twitter,
  TrendingUp,
  Users,
  ExternalLink,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

interface SocialAccount {
  platform: "instagram" | "facebook" | "twitter" | "tiktok"
  username: string
  followers: number
  isConnected: boolean
  lastSync?: string
}

interface SocialMetrics {
  views: number
  likes: number
  shares: number
  comments: number
  engagement: number
  period: "week" | "month"
}

interface PortfolioItem {
  id: number
  title: string
  description: string
  imageUrl: string
  category: string
  date: string
  likes: number
  isPublic: boolean
}

interface Artist {
  id: number
  name: string
  email: string
  phone: string
  specialty: string[]
  experience: string
  status: "active" | "on-leave" | "inactive"
  bio: string
  profileImage?: string
  nextAppointment: string
  totalAppointments: number
  hourlyRate?: number
  startDate: string
  location?: string
  certifications?: string[]
  socialAccounts: SocialAccount[]
  socialMetrics: SocialMetrics
  portfolio: PortfolioItem[]
  rating: number
  totalReviews: number
}

const initialArtists: Artist[] = [
  {
    id: 1,
    name: "Mike Rodriguez",
    email: "mike@inkstudio.com",
    phone: "(555) 123-4567",
    specialty: ["Traditional", "Neo Traditional", "American Traditional"],
    experience: "8 years",
    status: "active",
    bio: "Specializing in bold traditional tattoos with a modern twist. Mike has been tattooing for over 8 years and loves creating custom pieces that tell a story. His work is heavily influenced by classic American traditional style with contemporary elements.",
    profileImage: "/placeholder.svg?height=200&width=200&text=MR",
    nextAppointment: "Today, 10:00 AM",
    totalAppointments: 156,
    hourlyRate: 150,
    startDate: "2016-03-15",
    location: "Los Angeles, CA",
    certifications: ["Bloodborne Pathogen Certified", "CPR Certified", "Advanced Tattoo Techniques"],
    socialAccounts: [
      {
        platform: "instagram",
        username: "mike_ink_art",
        followers: 15420,
        isConnected: true,
        lastSync: "2024-01-20T10:30:00",
      },
      {
        platform: "facebook",
        username: "MikeRodriguezTattoo",
        followers: 3200,
        isConnected: true,
        lastSync: "2024-01-20T10:30:00",
      },
      { platform: "twitter", username: "mike_tattoos", followers: 1850, isConnected: false },
    ],
    socialMetrics: {
      views: 45200,
      likes: 3420,
      shares: 180,
      comments: 890,
      engagement: 8.5,
      period: "month",
    },
    portfolio: [
      {
        id: 1,
        title: "Traditional Eagle Chest Piece",
        description: "Bold traditional eagle with banner and roses",
        imageUrl: "/placeholder.svg?height=300&width=300&text=Eagle",
        category: "Traditional",
        date: "2024-01-15",
        likes: 245,
        isPublic: true,
      },
      {
        id: 2,
        title: "Neo Traditional Rose Sleeve",
        description: "Colorful neo traditional roses with geometric elements",
        imageUrl: "/placeholder.svg?height=300&width=300&text=Roses",
        category: "Neo Traditional",
        date: "2024-01-10",
        likes: 189,
        isPublic: true,
      },
    ],
    rating: 4.8,
    totalReviews: 127,
  },
  {
    id: 2,
    name: "Luna Martinez",
    email: "luna@inkstudio.com",
    phone: "(555) 234-5678",
    specialty: ["Fine Line", "Minimalist", "Botanical"],
    experience: "5 years",
    status: "active",
    bio: "Expert in delicate fine line work and minimalist designs. Luna creates beautiful, intricate pieces with incredible attention to detail. She specializes in botanical tattoos and geometric patterns that flow naturally with the body.",
    profileImage: "/placeholder.svg?height=200&width=200&text=LM",
    nextAppointment: "Today, 2:00 PM",
    totalAppointments: 89,
    hourlyRate: 120,
    startDate: "2019-07-22",
    location: "Los Angeles, CA",
    certifications: ["Bloodborne Pathogen Certified", "Fine Line Specialist Certification"],
    socialAccounts: [
      {
        platform: "instagram",
        username: "luna_fineline",
        followers: 28500,
        isConnected: true,
        lastSync: "2024-01-20T09:15:00",
      },
      {
        platform: "tiktok",
        username: "luna_tattoos",
        followers: 12300,
        isConnected: true,
        lastSync: "2024-01-20T09:15:00",
      },
    ],
    socialMetrics: {
      views: 78900,
      likes: 5670,
      shares: 320,
      comments: 1240,
      engagement: 12.3,
      period: "month",
    },
    portfolio: [
      {
        id: 3,
        title: "Delicate Botanical Forearm",
        description: "Fine line botanical design with native flowers",
        imageUrl: "/placeholder.svg?height=300&width=300&text=Botanical",
        category: "Fine Line",
        date: "2024-01-18",
        likes: 412,
        isPublic: true,
      },
    ],
    rating: 4.9,
    totalReviews: 94,
  },
  {
    id: 3,
    name: "Jake Thompson",
    email: "jake@inkstudio.com",
    phone: "(555) 345-6789",
    specialty: ["Realism", "Portrait", "Black & Grey"],
    experience: "12 years",
    status: "active",
    bio: "Master of photorealistic tattoos and portraits. Jake's work is known for its incredible detail and lifelike quality. With over a decade of experience, he has perfected the art of bringing photographs to life on skin.",
    profileImage: "/placeholder.svg?height=200&width=200&text=JT",
    nextAppointment: "Today, 4:30 PM",
    totalAppointments: 234,
    hourlyRate: 180,
    startDate: "2012-01-10",
    location: "Los Angeles, CA",
    certifications: ["Bloodborne Pathogen Certified", "Portrait Realism Master Class", "Advanced Shading Techniques"],
    socialAccounts: [
      {
        platform: "instagram",
        username: "jake_realism_ink",
        followers: 42100,
        isConnected: true,
        lastSync: "2024-01-20T11:45:00",
      },
      {
        platform: "facebook",
        username: "JakeThompsonRealism",
        followers: 8900,
        isConnected: true,
        lastSync: "2024-01-20T11:45:00",
      },
    ],
    socialMetrics: {
      views: 125000,
      likes: 8900,
      shares: 450,
      comments: 2100,
      engagement: 15.2,
      period: "month",
    },
    portfolio: [
      {
        id: 4,
        title: "Photorealistic Portrait",
        description: "Detailed black and grey portrait of client's grandmother",
        imageUrl: "/placeholder.svg?height=300&width=300&text=Portrait",
        category: "Realism",
        date: "2024-01-12",
        likes: 678,
        isPublic: true,
      },
    ],
    rating: 4.9,
    totalReviews: 189,
  },
  {
    id: 4,
    name: "Sarah Kim",
    email: "sarah@inkstudio.com",
    phone: "(555) 456-7890",
    specialty: ["Watercolor", "Abstract", "Illustrative"],
    experience: "6 years",
    status: "on-leave",
    bio: "Creative watercolor and abstract tattoo artist. Sarah brings a unique artistic flair to every piece she creates, combining traditional tattoo techniques with modern artistic expression.",
    profileImage: "/placeholder.svg?height=200&width=200&text=SK",
    nextAppointment: "On Leave",
    totalAppointments: 112,
    hourlyRate: 140,
    startDate: "2018-09-05",
    location: "Los Angeles, CA",
    certifications: ["Bloodborne Pathogen Certified", "Watercolor Techniques Workshop"],
    socialAccounts: [{ platform: "instagram", username: "sarah_watercolor_ink", followers: 19800, isConnected: false }],
    socialMetrics: {
      views: 0,
      likes: 0,
      shares: 0,
      comments: 0,
      engagement: 0,
      period: "month",
    },
    portfolio: [],
    rating: 4.7,
    totalReviews: 76,
  },
]

const specialtyOptions = [
  "Traditional",
  "Neo Traditional",
  "American Traditional",
  "Fine Line",
  "Minimalist",
  "Botanical",
  "Realism",
  "Portrait",
  "Black & Grey",
  "Watercolor",
  "Abstract",
  "Illustrative",
  "Geometric",
  "Tribal",
  "Japanese",
  "Blackwork",
  "Dotwork",
  "Script",
]

const socialPlatforms = [
  { id: "instagram", name: "Instagram", icon: Instagram, color: "text-pink-600" },
  { id: "facebook", name: "Facebook", icon: Facebook, color: "text-blue-600" },
  { id: "twitter", name: "Twitter", icon: Twitter, color: "text-blue-400" },
  { id: "tiktok", name: "TikTok", icon: User, color: "text-black" },
]

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>(initialArtists)
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<Artist>>({})

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "on-leave":
        return "bg-yellow-100 text-yellow-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSocialIcon = (platform: string) => {
    const socialPlatform = socialPlatforms.find((p) => p.id === platform)
    return socialPlatform ? socialPlatform.icon : User
  }

  const getSocialColor = (platform: string) => {
    const socialPlatform = socialPlatforms.find((p) => p.id === platform)
    return socialPlatform ? socialPlatform.color : "text-gray-600"
  }

  const resetForm = () => {
    setFormData({})
    setSelectedArtist(null)
  }

  const handleAddArtist = () => {
    if (formData.name && formData.email && formData.specialty) {
      const newArtist: Artist = {
        id: Math.max(...artists.map((a) => a.id)) + 1,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || "",
        specialty: Array.isArray(formData.specialty) ? formData.specialty : [formData.specialty],
        experience: formData.experience || "0 years",
        status: "active",
        bio: formData.bio || "",
        nextAppointment: "No appointments scheduled",
        totalAppointments: 0,
        hourlyRate: formData.hourlyRate || 100,
        startDate: new Date().toISOString().split("T")[0],
        location: formData.location || "",
        certifications: [],
        socialAccounts: [],
        socialMetrics: {
          views: 0,
          likes: 0,
          shares: 0,
          comments: 0,
          engagement: 0,
          period: "month",
        },
        portfolio: [],
        rating: 0,
        totalReviews: 0,
      }
      setArtists([...artists, newArtist])
      setIsAddDialogOpen(false)
      resetForm()
    }
  }

  const handleEditArtist = () => {
    if (selectedArtist && formData.name && formData.email) {
      const updatedArtists = artists.map((artist) =>
        artist.id === selectedArtist.id ? { ...artist, ...formData } : artist,
      )
      setArtists(updatedArtists)
      setIsEditDialogOpen(false)
      resetForm()
    }
  }

  const handleDeleteArtist = () => {
    if (selectedArtist) {
      setArtists(artists.filter((artist) => artist.id !== selectedArtist.id))
      setIsDeleteDialogOpen(false)
      resetForm()
    }
  }

  const openEditDialog = (artist: Artist) => {
    setSelectedArtist(artist)
    setFormData({
      ...artist,
      specialty: artist.specialty,
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (artist: Artist) => {
    setSelectedArtist(artist)
    setIsDeleteDialogOpen(true)
  }

  const toggleArtistStatus = (artistId: number) => {
    setArtists(
      artists.map((artist) =>
        artist.id === artistId
          ? { ...artist, status: artist.status === "active" ? "inactive" : ("active" as "active" | "inactive") }
          : artist,
      ),
    )
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
    if (num >= 1000) return (num / 1000).toFixed(1) + "K"
    return num.toString()
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Artists</h1>
          <p className="text-muted-foreground">Manage your tattoo artists and their profiles</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Artist
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Artist</DialogTitle>
              <DialogDescription>Add a new tattoo artist to your shop.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="artist@example.com"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    placeholder="100"
                    value={formData.hourlyRate || ""}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: Number.parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    placeholder="5 years"
                    value={formData.experience || ""}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="City, State"
                    value={formData.location || ""}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="specialty">Specialties *</Label>
                <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px]">
                  {((formData.specialty as string[]) || []).map((spec, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {spec}
                      <button
                        onClick={() => {
                          const newSpecialties = ((formData.specialty as string[]) || []).filter((_, i) => i !== index)
                          setFormData({ ...formData, specialty: newSpecialties })
                        }}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <Select
                  value=""
                  onValueChange={(value) => {
                    const currentSpecialties = (formData.specialty as string[]) || []
                    if (!currentSpecialties.includes(value)) {
                      setFormData({ ...formData, specialty: [...currentSpecialties, value] })
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Add specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialtyOptions.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about the artist..."
                  value={formData.bio || ""}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddArtist}>Add Artist</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Total Artists</span>
            </div>
            <p className="text-2xl font-bold mt-2">{artists.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-sm font-medium">Active</span>
            </div>
            <p className="text-2xl font-bold mt-2">{artists.filter((a) => a.status === "active").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Avg Rating</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              {(artists.reduce((sum, a) => sum + a.rating, 0) / artists.length).toFixed(1)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Total Followers</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              {formatNumber(
                artists.reduce((sum, a) => sum + a.socialAccounts.reduce((acc, s) => acc + s.followers, 0), 0),
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Artists Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {artists.map((artist) => (
          <Card key={artist.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={artist.profileImage || "/placeholder.svg"} />
                      <AvatarFallback className="text-lg">
                        {artist.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                        artist.status === "active"
                          ? "bg-green-500"
                          : artist.status === "on-leave"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                    />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{artist.name}</CardTitle>
                    <CardDescription>
                      {artist.experience} • {artist.location}
                    </CardDescription>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-3 h-3 ${i < Math.floor(artist.rating) ? "text-yellow-400" : "text-gray-300"}`}
                          >
                            ★
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {artist.rating} ({artist.totalReviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(artist.status)}>{artist.status.replace("-", " ")}</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/artists/${artist.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(artist)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Artist
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleArtistStatus(artist.id)}>
                        <User className="mr-2 h-4 w-4" />
                        {artist.status === "active" ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openDeleteDialog(artist)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Artist
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-1">
                {artist.specialty.slice(0, 3).map((spec, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {spec}
                  </Badge>
                ))}
                {artist.specialty.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{artist.specialty.length - 3} more
                  </Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">{artist.bio}</p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground truncate">{artist.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{artist.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Next: {artist.nextAppointment}</span>
                </div>
              </div>

              {/* Social Media Preview */}
              {artist.socialAccounts.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Social Media</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {artist.socialAccounts.slice(0, 3).map((account) => {
                      const IconComponent = getSocialIcon(account.platform)
                      return (
                        <div key={account.platform} className="flex items-center gap-1">
                          <IconComponent className={`h-4 w-4 ${getSocialColor(account.platform)}`} />
                          <span className="text-xs text-muted-foreground">{formatNumber(account.followers)}</span>
                          {account.isConnected && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="text-sm">
                  <span className="font-medium">{artist.totalAppointments}</span>
                  <span className="text-muted-foreground"> appointments</span>
                </div>
                <div className="text-sm font-medium">${artist.hourlyRate}/hr</div>
              </div>

              {/* Quick Action Button */}
              <Button asChild className="w-full bg-transparent" variant="outline">
                <Link href={`/artists/${artist.id}`}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Full Profile
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {artists.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No artists added yet</h3>
            <p className="text-muted-foreground mb-4">Start by adding your first tattoo artist to the platform.</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Artist
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Artist</DialogTitle>
            <DialogDescription>Update artist information and settings.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Full Name *</Label>
                <Input
                  id="edit-name"
                  placeholder="Enter full name"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="artist@example.com"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-hourlyRate">Hourly Rate ($)</Label>
                <Input
                  id="edit-hourlyRate"
                  type="number"
                  placeholder="100"
                  value={formData.hourlyRate || ""}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: Number.parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-experience">Years of Experience</Label>
                <Input
                  id="edit-experience"
                  placeholder="5 years"
                  value={formData.experience || ""}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  placeholder="City, State"
                  value={formData.location || ""}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-specialty">Specialties</Label>
              <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px]">
                {((formData.specialty as string[]) || []).map((spec, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {spec}
                    <button
                      onClick={() => {
                        const newSpecialties = ((formData.specialty as string[]) || []).filter((_, i) => i !== index)
                        setFormData({ ...formData, specialty: newSpecialties })
                      }}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <Select
                value=""
                onValueChange={(value) => {
                  const currentSpecialties = (formData.specialty as string[]) || []
                  if (!currentSpecialties.includes(value)) {
                    setFormData({ ...formData, specialty: [...currentSpecialties, value] })
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Add specialty" />
                </SelectTrigger>
                <SelectContent>
                  {specialtyOptions.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as "active" | "on-leave" | "inactive" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on-leave">On Leave</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-bio">Bio</Label>
              <Textarea
                id="edit-bio"
                placeholder="Tell us about the artist..."
                value={formData.bio || ""}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditArtist}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Artist</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedArtist?.name}? This action cannot be undone and will remove all
              associated data including portfolio and social media connections.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteArtist} className="bg-red-600 hover:bg-red-700">
              Delete Artist
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
