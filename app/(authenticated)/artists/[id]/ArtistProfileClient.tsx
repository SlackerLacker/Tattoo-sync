"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/browser-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  TrendingUp,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Instagram,
  Facebook,
  Twitter,
  Plus,
  ExternalLink,
  Activity,
  Award,
  MoreHorizontal,
  Trash2,
  Clock,
  DollarSign,
  Zap,
  LinkIcon,
  RefreshCw,
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const socialPlatforms = {
  instagram: { name: "Instagram", icon: Instagram, color: "text-pink-600", bgColor: "bg-pink-50" },
  facebook: { name: "Facebook", icon: Facebook, color: "text-blue-600", bgColor: "bg-blue-50" },
  twitter: { name: "Twitter", icon: Twitter, color: "text-blue-400", bgColor: "bg-blue-50" },
  tiktok: { name: "TikTok", icon: Activity, color: "text-black", bgColor: "bg-gray-50" },
}

export default function ArtistProfileClient({ artist: initialArtist }: { artist: any }) {
  const router = useRouter()
  const [artist, setArtist] = useState(initialArtist)
  const [activeTab, setActiveTab] = useState("overview")
  const [isConnectSocialOpen, setIsConnectSocialOpen] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState("")
  const [socialFormData, setSocialFormData] = useState({ username: "", accessToken: "" })
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<any>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isAddPieceDialogOpen, setIsAddPieceDialogOpen] = useState(false)
  const [newPieceFormData, setNewPieceFormData] = useState<Partial<any>>({})
  const [isDeletePieceDialogOpen, setIsDeletePieceDialogOpen] = useState(false)
  const [selectedPiece, setSelectedPiece] = useState<any | null>(null)
  const [isEditPieceDialogOpen, setIsEditPieceDialogOpen] = useState(false)
  const [editPieceFormData, setEditPieceFormData] = useState<Partial<any>>({})

  if (!artist) {
    return <div>Artist not found</div>
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
    if (num >= 1000) return (num / 1000).toFixed(1) + "K"
    return num.toString()
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleConnectSocial = async () => {
    if (!selectedPlatform || !socialFormData.username) return
    setIsRefreshing(true)
    setTimeout(() => {
      const updatedSocialAccounts = (artist.socialAccounts || []).map((account: any) =>
        account.platform === selectedPlatform
          ? {
              ...account,
              username: socialFormData.username,
              isConnected: true,
              lastSync: new Date().toISOString(),
              followers: (account.followers || 0) + Math.floor(Math.random() * 100),
              analytics: {
                ...account.analytics,
                impressions: (account.analytics?.impressions || 0) + Math.floor(Math.random() * 1000),
                engagement: (account.analytics?.engagement || 0) + Math.floor(Math.random() * 50),
              },
            }
          : account,
      )
      setArtist({ ...artist, socialAccounts: updatedSocialAccounts })
      setIsConnectSocialOpen(false)
      setSocialFormData({ username: "", accessToken: "" })
      setSelectedPlatform("")
      setIsRefreshing(false)
    }, 2000)
  }

  const handleRefreshSocials = async () => {
    setIsRefreshing(true)
    setTimeout(() => {
      const updatedSocialAccounts = (artist.socialAccounts || []).map((account: any) =>
        account.isConnected
          ? {
              ...account,
              lastSync: new Date().toISOString(),
              followers: (account.followers || 0) + Math.floor(Math.random() * 20 - 10),
              analytics: {
                ...account.analytics,
                impressions: (account.analytics?.impressions || 0) + Math.floor(Math.random() * 500),
                engagement: (account.analytics?.engagement || 0) + Math.floor(Math.random() * 25),
                engagementRate: Math.max(0, (account.analytics?.engagementRate || 0) + (Math.random() * 2 - 1)),
              },
            }
          : account,
      )
      setArtist({ ...artist, socialAccounts: updatedSocialAccounts })
      setIsRefreshing(false)
    }, 1500)
  }

  const connectedAccounts = (artist.socialAccounts || []).filter((acc: any) => acc.isConnected)
  const totalFollowers = connectedAccounts.reduce((sum: number, acc: any) => sum + (acc.followers || 0), 0)
  const totalEngagement = connectedAccounts.reduce((sum: number, acc: any) => sum + (acc.analytics?.engagement || 0), 0)
  const avgEngagementRate =
    connectedAccounts.length > 0
      ? connectedAccounts.reduce((sum: number, acc: any) => sum + (acc.analytics?.engagementRate || 0), 0) /
        connectedAccounts.length
      : 0

  const resetForm = () => {
    setFormData({})
    setFormError(null)
  }

  const openEditDialog = () => {
    setFormData(artist)
    setFormError(null)
    setIsEditDialogOpen(true)
  }

  const handleEditArtist = async () => {
    setFormError(null)
    if (formData.name && formData.email) {
      const { socialAccounts, ...restOfFormData } = formData
      const response = await fetch(`/api/artists/${artist.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(restOfFormData),
      })
      if (response.ok) {
        const updatedArtist = await response.json()
        setArtist(updatedArtist[0])
        setIsEditDialogOpen(false)
        resetForm()
      } else {
        const errorMessage = await response.text()
        setFormError(errorMessage)
      }
    } else {
      setFormError("Full Name and Email are required.")
    }
  }

  const handleAddPiece = async () => {
    setFormError(null)
    if (!newPieceFormData.title) {
      setFormError("Title is required.")
      return
    }

    const response = await fetch(`/api/artists/${artist.id}/portfolio`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPieceFormData),
    })

    if (response.ok) {
      const newPiece = await response.json()
      const updatedPortfolio = [...(artist.portfolio || []), newPiece[0]]
      setArtist({ ...artist, portfolio: updatedPortfolio })
      setIsAddPieceDialogOpen(false)
      setNewPieceFormData({})
    } else {
      const errorMessage = await response.text()
      setFormError(errorMessage)
    }
  }

  const handleImageUpload = async (file: File) => {
    if (!file) return
    setFormError(null)
    setIsUploading(true)

    try {
      const filePath = `${artist.id}/${crypto.randomUUID()}`
      const { error: uploadError } = await supabase.storage.from("portfolio-images").upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data: urlData } = supabase.storage.from("portfolio-images").getPublicUrl(filePath)

      if (!urlData.publicUrl) {
        throw new Error("Could not get public URL for uploaded image.")
      }

      setNewPieceFormData({ ...newPieceFormData, image_url: urlData.publicUrl })
    } catch (error: any) {
      setFormError(error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const openDeleteDialog = (piece: any) => {
    setSelectedPiece(piece)
    setIsDeletePieceDialogOpen(true)
  }

  const handleDeletePiece = async () => {
    if (!selectedPiece) return

    const response = await fetch(`/api/portfolio/${selectedPiece.id}`, {
      method: "DELETE",
    })

    if (response.ok) {
      const updatedPortfolio = (artist.portfolio || []).filter((p: any) => p.id !== selectedPiece.id)
      setArtist({ ...artist, portfolio: updatedPortfolio })
      setIsDeletePieceDialogOpen(false)
      setSelectedPiece(null)
    } else {
      // Handle error, maybe show a toast notification
      console.error("Failed to delete portfolio piece")
    }
  }

  const handleToggleIsPublic = async (piece: any) => {
    const response = await fetch(`/api/portfolio/${piece.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_public: !piece.is_public }),
    })

    if (response.ok) {
      const updatedPiece = await response.json()
      const updatedPortfolio = (artist.portfolio || []).map((p: any) =>
        p.id === piece.id ? updatedPiece[0] : p,
      )
      setArtist({ ...artist, portfolio: updatedPortfolio })
    } else {
      console.error("Failed to toggle is_public status")
    }
  }

  const openEditPieceDialog = (piece: any) => {
    setSelectedPiece(piece)
    setEditPieceFormData(piece)
    setFormError(null)
    setIsEditPieceDialogOpen(true)
  }

  const handleEditPiece = async () => {
    if (!selectedPiece) return
    setFormError(null)

    if (!editPieceFormData.title) {
      setFormError("Title is required.")
      return
    }

    const response = await fetch(`/api/portfolio/${selectedPiece.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editPieceFormData),
    })

    if (response.ok) {
      const updatedPiece = await response.json()
      const updatedPortfolio = (artist.portfolio || []).map((p: any) =>
        p.id === selectedPiece.id ? updatedPiece[0] : p,
      )
      setArtist({ ...artist, portfolio: updatedPortfolio })
      setIsEditPieceDialogOpen(false)
      setEditPieceFormData({})
      setSelectedPiece(null)
    } else {
      const errorMessage = await response.text()
      setFormError(errorMessage)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Artists
        </Button>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={openEditDialog}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Cover Image & Profile */}
      <Card className="overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-purple-600 to-pink-600 relative">
          <img
            src={artist.coverImage || "/placeholder.svg?height=200&width=800&text=Cover"}
            alt="Cover"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
        <CardContent className="relative -mt-16 pb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage src={artist.profileImage || "/placeholder.svg"} />
                <AvatarFallback className="text-2xl">
                  {(artist.name || "A")
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="mt-4 text-center md:text-left">
                <h1 className="text-3xl font-bold">{artist.name || "New Artist"}</h1>
                <p className="text-lg text-muted-foreground">{(artist.specialty || []).join(" • ")}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(artist.rating || 0) ? "text-yellow-400 fill-current" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {(artist.rating || 0).toFixed(1)} ({artist.totalReviews || 0} reviews)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 md:mt-16">
              <div className="text-center">
                <div className="text-2xl font-bold">{artist.totalAppointments || 0}</div>
                <div className="text-sm text-muted-foreground">Appointments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{formatNumber(totalFollowers)}</div>
                <div className="text-sm text-muted-foreground">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{(artist.portfolio || []).length}</div>
                <div className="text-sm text-muted-foreground">Portfolio</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{artist.experience || "N/A"}</div>
                <div className="text-sm text-muted-foreground">Experience</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* About & Contact */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{artist.bio || "No bio available."}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Specialties</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {(artist.specialty || []).map((spec: string, index: number) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Work</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {(artist.portfolio || []).slice(0, 6).map((item: any) => (
                        <div key={item.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={item.image_url || "/placeholder.svg"}
                            alt={item.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{artist.email || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{artist.phone || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{artist.location || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Next: {artist.nextAppointment || "N/A"}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Professional Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Experience:</span>
                      <span className="text-sm font-medium">{artist.experience || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Hourly Rate:</span>
                      <span className="text-sm font-medium">${artist.hourlyRate || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Started:</span>
                      <span className="text-sm font-medium">{formatDate(artist.startDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge variant={(artist.status || 'active') === "active" ? "default" : "secondary"}>
                        {artist.status || "active"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Certifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {(artist.certifications || []).map((cert: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Social Media Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Followers:</span>
                      <span className="text-sm font-medium">{formatNumber(totalFollowers)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Avg Engagement:</span>
                      <span className="text-sm font-medium">{avgEngagementRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Connected Accounts:</span>
                      <span className="text-sm font-medium">{connectedAccounts.length}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Portfolio</h2>
                <p className="text-muted-foreground">{(artist.portfolio || []).length} pieces showcasing artistic range</p>
              </div>
              <Button onClick={() => setIsAddPieceDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Piece
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(artist.portfolio || []).map((item: any) => (
                <Card key={item.id} className="overflow-hidden group">
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    <img
                      src={item.image_url || "/placeholder.svg"}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-2">
                      <Badge variant={item.is_public ? "default" : "secondary"}>
                        {item.is_public ? "Public" : "Private"}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 bg-white/80 hover:bg-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditPieceDialog(item)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleIsPublic(item)}>
                            <Eye className="mr-2 h-4 w-4" />
                            {item.is_public ? "Make Private" : "Make Public"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDeleteDialog(item)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <Badge variant="outline" className="bg-white/90">
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4 text-red-500" />
                          <span>{item.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{item.duration}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span>${item.price}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {(item.tags || []).slice(0, 3).map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Social Media</h2>
                <p className="text-muted-foreground">Manage and monitor social media presence</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleRefreshSocials} disabled={isRefreshing}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                  Refresh Data
                </Button>
                <Button onClick={() => setIsConnectSocialOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Connect Account
                </Button>
              </div>
            </div>

            {/* Social Media Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Total Followers</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">{formatNumber(totalFollowers)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium">Total Engagement</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">{formatNumber(totalEngagement)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Avg Engagement Rate</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">{avgEngagementRate.toFixed(1)}%</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Connected Accounts</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">{connectedAccounts.length}</p>
                </CardContent>
              </Card>
            </div>

            {/* Individual Platform Cards */}
            <div className="grid gap-6">
              {(artist.socialAccounts || []).map((account: any) => {
                const platform = socialPlatforms[account.platform as keyof typeof socialPlatforms]
                const IconComponent = platform.icon

                return (
                  <Card key={account.platform}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${platform.bgColor}`}>
                            <IconComponent className={`h-6 w-6 ${platform.color}`} />
                          </div>
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {platform.name}
                              {account.isVerified && <Badge variant="secondary">Verified</Badge>}
                            </CardTitle>
                            <CardDescription>
                              {account.isConnected ? `@${account.username}` : "Not connected"}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={account.isConnected ? "default" : "secondary"}>
                            {account.isConnected ? "Connected" : "Disconnected"}
                          </Badge>
                          {account.isConnected && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={account.profileUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {account.isConnected ? (
                        <div className="space-y-4">
                          {/* Stats */}
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                            <div className="text-center">
                              <div className="text-lg font-bold">{formatNumber(account.followers || 0)}</div>
                              <div className="text-xs text-muted-foreground">Followers</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold">{formatNumber(account.following || 0)}</div>
                              <div className="text-xs text-muted-foreground">Following</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold">{account.posts || 0}</div>
                              <div className="text-xs text-muted-foreground">Posts</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold">{formatNumber(account.analytics?.reach || 0)}</div>
                              <div className="text-xs text-muted-foreground">Reach</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold">
                                {formatNumber(account.analytics?.engagement || 0)}
                              </div>
                              <div className="text-xs text-muted-foreground">Engagement</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold">
                                {(account.analytics?.engagementRate || 0).toFixed(1)}%
                              </div>
                              <div className="text-xs text-muted-foreground">Rate</div>
                            </div>
                          </div>

                          <Separator />

                          {/* Recent Posts */}
                          {(account.recentPosts || []).length > 0 && (
                            <div>
                              <h4 className="font-medium mb-3">Recent Posts</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(account.recentPosts || []).map((post: any) => (
                                  <div key={post.id} className="flex gap-3 p-3 border rounded-lg">
                                    <img
                                      src={post.imageUrl || "/placeholder.svg"}
                                      alt="Post"
                                      className="w-16 h-16 object-cover rounded"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm line-clamp-2 mb-2">{post.caption}</p>
                                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                          <Heart className="h-3 w-3" />
                                          <span>{post.likes}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <MessageCircle className="h-3 w-3" />
                                          <span>{post.comments}</span>
                                        </div>
                                        <span>{formatDate(post.timestamp)}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="text-xs text-muted-foreground">
                            Last synced: {account.lastSync ? formatDate(account.lastSync) : "Never"}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <IconComponent className={`h-12 w-12 mx-auto mb-4 ${platform.color} opacity-50`} />
                          <h4 className="font-medium mb-2">Connect {platform.name}</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Connect your {platform.name} account to track analytics and manage your presence.
                          </p>
                          <Button
                            onClick={() => {
                              setSelectedPlatform(account.platform)
                              setIsConnectSocialOpen(true)
                            }}
                          >
                            Connect Account
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Client Reviews</h2>
                <p className="text-muted-foreground">
                  {artist.totalReviews || 0} reviews • {artist.rating || 0} average rating
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(artist.rating || 0) ? "text-yellow-400 fill-current" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold">{artist.rating || 0}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {(artist.recentReviews || []).map((review: any) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{review.client[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{review.client}</div>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">{formatDate(review.date)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{review.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Connect Social Media Dialog */}
      <Dialog open={isConnectSocialOpen} onOpenChange={setIsConnectSocialOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Connect Social Media Account</DialogTitle>
            <DialogDescription>
              Connect your social media account to automatically sync analytics and content.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="platform">Platform</Label>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(socialPlatforms).map(([key, platform]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <platform.icon className={`h-4 w-4 ${platform.color}`} />
                        {platform.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username (without @)"
                value={socialFormData.username}
                onChange={(e) => setSocialFormData({ ...socialFormData, username: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="accessToken">Access Token (Optional)</Label>
              <Input
                id="accessToken"
                type="password"
                placeholder="For advanced analytics (optional)"
                value={socialFormData.accessToken}
                onChange={(e) => setSocialFormData({ ...socialFormData, accessToken: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Access token enables real-time analytics. Leave blank for basic connection.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsConnectSocialOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConnectSocial}
              disabled={!selectedPlatform || !socialFormData.username || isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect Account"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) {
            resetForm()
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Artist</DialogTitle>
            <DialogDescription>Update artist information.</DialogDescription>
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
                  onChange={(e) => setFormData({ ...formData, hourlyRate: Number.parseInt(e.target.value) || 0 })}
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
              <Label htmlFor="edit-bio">Bio</Label>
              <Textarea
                id="edit-bio"
                placeholder="Tell us about the artist..."
                value={formData.bio || ""}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>
          </div>
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditArtist}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Piece Dialog */}
      <Dialog
        open={isAddPieceDialogOpen}
        onOpenChange={(open) => {
          setIsAddPieceDialogOpen(open)
          if (!open) {
            setNewPieceFormData({})
            setFormError(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Portfolio Piece</DialogTitle>
            <DialogDescription>Showcase a new piece of work.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="piece-title">Title *</Label>
              <Input
                id="piece-title"
                placeholder="e.g., Traditional Eagle Chest Piece"
                value={newPieceFormData.title || ""}
                onChange={(e) => setNewPieceFormData({ ...newPieceFormData, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="piece-description">Description</Label>
              <Textarea
                id="piece-description"
                placeholder="A short description of the piece..."
                value={newPieceFormData.description || ""}
                onChange={(e) => setNewPieceFormData({ ...newPieceFormData, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="piece-image_url">Image</Label>
              <Input
                id="piece-image_url"
                type="file"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleImageUpload(e.target.files[0])
                  }
                }}
                disabled={isUploading}
              />
              {isUploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
              {newPieceFormData.image_url && (
                <div className="text-sm text-green-600">
                  <p>Upload successful!</p>
                  <a
                    href={newPieceFormData.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs underline"
                  >
                    View Uploaded Image
                  </a>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="piece-category">Category</Label>
                <Input
                  id="piece-category"
                  placeholder="e.g., Traditional"
                  value={newPieceFormData.category || ""}
                  onChange={(e) => setNewPieceFormData({ ...newPieceFormData, category: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="piece-date">Date</Label>
                <Input
                  id="piece-date"
                  type="date"
                  value={newPieceFormData.piece_date || ""}
                  onChange={(e) => setNewPieceFormData({ ...newPieceFormData, piece_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="piece-tags">Tags (comma-separated)</Label>
              <Input
                id="piece-tags"
                placeholder="e.g., eagle, traditional, chest"
                value={(newPieceFormData.tags || []).join(", ")}
                onChange={(e) =>
                  setNewPieceFormData({ ...newPieceFormData, tags: e.target.value.split(",").map((t) => t.trim()) })
                }
              />
            </div>
          </div>
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddPieceDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPiece}>Add Piece</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Piece Confirmation Dialog */}
      <AlertDialog open={isDeletePieceDialogOpen} onOpenChange={setIsDeletePieceDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Portfolio Piece</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the piece "{selectedPiece?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePiece} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Piece Dialog */}
      <Dialog
        open={isEditPieceDialogOpen}
        onOpenChange={(open) => {
          setIsEditPieceDialogOpen(open)
          if (!open) {
            setEditPieceFormData({})
            setFormError(null)
            setSelectedPiece(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Portfolio Piece</DialogTitle>
            <DialogDescription>Update the details for this piece of work.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-piece-title">Title *</Label>
              <Input
                id="edit-piece-title"
                placeholder="e.g., Traditional Eagle Chest Piece"
                value={editPieceFormData.title || ""}
                onChange={(e) => setEditPieceFormData({ ...editPieceFormData, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-piece-description">Description</Label>
              <Textarea
                id="edit-piece-description"
                placeholder="A short description of the piece..."
                value={editPieceFormData.description || ""}
                onChange={(e) => setEditPieceFormData({ ...editPieceFormData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-piece-category">Category</Label>
                <Input
                  id="edit-piece-category"
                  placeholder="e.g., Traditional"
                  value={editPieceFormData.category || ""}
                  onChange={(e) => setEditPieceFormData({ ...editPieceFormData, category: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-piece-date">Date</Label>
                <Input
                  id="edit-piece-date"
                  type="date"
                  value={editPieceFormData.piece_date || ""}
                  onChange={(e) => setEditPieceFormData({ ...editPieceFormData, piece_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-piece-tags">Tags (comma-separated)</Label>
              <Input
                id="edit-piece-tags"
                placeholder="e.g., eagle, traditional, chest"
                value={(editPieceFormData.tags || []).join(", ")}
                onChange={(e) =>
                  setEditPieceFormData({ ...editPieceFormData, tags: e.target.value.split(",").map((t) => t.trim()) })
                }
              />
            </div>
          </div>
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditPieceDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditPiece}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
