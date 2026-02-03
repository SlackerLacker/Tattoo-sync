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
import { Artist, specialtyOptions, socialPlatforms } from "@/types"
import { supabase } from "@/lib/supabase-browser"

interface ArtistsClientProps {
  artists: Artist[]
}

export default function ArtistsClient({ artists: initialArtists }: ArtistsClientProps) {
  const [artists, setArtists] = useState<Artist[]>(initialArtists)
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<Artist>>({})
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "NA"
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "NA"
    return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase()
  }

  const uploadAvatar = async (file: File) => {
    setIsUploadingAvatar(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const safeName = file.name.replace(/\s+/g, "-")
      const path = `artists/${user?.id || "user"}/${Date.now()}-${safeName}`

      const { error } = await supabase.storage.from("portfolio-images").upload(path, file, {
        upsert: true,
        contentType: file.type,
      })
      if (error) throw error

      const { data } = supabase.storage.from("portfolio-images").getPublicUrl(path)
      setFormData({ ...formData, avatar_url: data.publicUrl })
    } catch (error) {
      console.error("Failed to upload avatar", error)
    } finally {
      setIsUploadingAvatar(false)
    }
  }

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

  const handleAddArtist = async () => {
    if (formData.name && formData.email) {
      const response = await fetch("/api/artists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        const newArtist = await response.json()
        setArtists([...artists, newArtist[0]])
        setIsAddDialogOpen(false)
        resetForm()
      }
    }
  }

  const handleEditArtist = async () => {
    if (selectedArtist && formData.name && formData.email) {
      const response = await fetch(`/api/artists/${selectedArtist.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        const updatedArtist = await response.json()
        setArtists(artists.map((artist) => (artist.id === selectedArtist.id ? updatedArtist[0] : artist)))
        setIsEditDialogOpen(false)
        resetForm()
      }
    }
  }

  const handleDeleteArtist = async () => {
    if (selectedArtist) {
      const response = await fetch(`/api/artists/${selectedArtist.id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setArtists(artists.filter((artist) => artist.id !== selectedArtist.id))
        setIsDeleteDialogOpen(false)
        resetForm()
      }
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

  const toggleArtistStatus = async (artistId: number) => {
    const artist = artists.find((a) => a.id === artistId)
    if (artist) {
      const newStatus = artist.status === "active" ? "inactive" : "active"
      const response = await fetch(`/api/artists/${artistId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        const updatedArtist = await response.json()
        setArtists(artists.map((a) => (a.id === artistId ? updatedArtist[0] : a)))
      }
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
    if (num >= 1000) return (num / 1000).toFixed(1) + "K"
    return num.toString()
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
              <div className="grid gap-4 sm:grid-cols-2">
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
              <div className="grid gap-2">
                <Label>Profile Photo</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={formData.avatar_url || undefined} />
                    <AvatarFallback>{getInitials(formData.name)}</AvatarFallback>
                  </Avatar>
                  <Input
                    type="file"
                    accept="image/*"
                    disabled={isUploadingAvatar}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        uploadAvatar(file)
                      }
                    }}
                  />
                </div>
                {isUploadingAvatar && <p className="text-xs text-muted-foreground">Uploading...</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
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
              <div className="grid gap-4 sm:grid-cols-2">
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
                <Label htmlFor="specialty">Specialties</Label>
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
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Total Artists</span>
            </div>
            <p className="text-2xl font-bold mt-2">{(artists || []).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-sm font-medium">Active</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              {(artists || []).filter((a) => (a.status || "active") === "active").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Avg Rating</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              {((artists || []).reduce((sum, a) => sum + (a.rating || 0), 0) / ((artists || []).length || 1)).toFixed(
                1,
              )}
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
                (artists || []).reduce(
                  (sum, a) => sum + (a.socialAccounts || []).reduce((acc, s) => acc + (s.followers || 0), 0),
                  0,
                ),
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Artists Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {(artists || []).map((artist) => (
          <Card key={artist.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={artist.avatar_url || undefined} />
                      <AvatarFallback className="text-lg">{getInitials(artist.name)}</AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                        (artist.status || "active") === "active"
                          ? "bg-green-500"
                          : (artist.status || "active") === "on-leave"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                    />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{artist.name || "New Artist"}</CardTitle>
                    <CardDescription>
                      {artist.experience || "N/A"} • {artist.location || "N/A"}
                    </CardDescription>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(artist.rating || 0) ? "text-yellow-400" : "text-gray-300"
                            }`}
                          >
                            ★
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {(artist.rating || 0).toFixed(1)} ({artist.totalReviews || 0} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(artist.status || "active")}>
                    {(artist.status || "active").replace("-", " ")}
                  </Badge>
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
                        {(artist.status || "active") === "active" ? "Deactivate" : "Activate"}
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
                {(artist.specialty || []).slice(0, 3).map((spec, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {spec}
                  </Badge>
                ))}
                {(artist.specialty || []).length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{(artist.specialty || []).length - 3} more
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
                  <span className="text-muted-foreground">Next: {artist.nextAppointment || "N/A"}</span>
                </div>
              </div>

              {/* Social Media Preview */}
              {(artist.socialAccounts || []).length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Social Media</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {(artist.socialAccounts || []).slice(0, 3).map((account) => {
                      const IconComponent = getSocialIcon(account.platform)
                      return (
                        <div key={account.platform} className="flex items-center gap-1">
                          <IconComponent className={`h-4 w-4 ${getSocialColor(account.platform)}`} />
                          <span className="text-xs text-muted-foreground">
                            {formatNumber(account.followers || 0)}
                          </span>
                          {account.isConnected && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="text-sm">
                  <span className="font-medium">{artist.totalAppointments || 0}</span>
                  <span className="text-muted-foreground"> appointments</span>
                </div>
                <div className="text-sm font-medium">${artist.hourlyRate || 0}/hr</div>
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
            <div className="grid gap-4 sm:grid-cols-2">
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
            <div className="grid gap-2">
              <Label>Profile Photo</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={formData.avatar_url || undefined} />
                  <AvatarFallback>{getInitials(formData.name)}</AvatarFallback>
                </Avatar>
                <Input
                  type="file"
                  accept="image/*"
                  disabled={isUploadingAvatar}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      uploadAvatar(file)
                    }
                  }}
                />
              </div>
              {isUploadingAvatar && <p className="text-xs text-muted-foreground">Uploading...</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
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
            <div className="grid gap-4 sm:grid-cols-2">
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
