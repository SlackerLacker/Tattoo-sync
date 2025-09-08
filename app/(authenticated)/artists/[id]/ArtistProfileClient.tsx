"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
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
  Clock,
  DollarSign,
  Zap,
  LinkIcon,
  RefreshCw,
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


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


  if (!artist) {
    return <div>Artist not found</div>
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
    if (num >= 1000) return (num / 1000).toFixed(1) + "K"
    return num.toString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleConnectSocial = async () => {
    if (!selectedPlatform || !socialFormData.username) return

    // Simulate API call to connect social media
    setIsRefreshing(true)

    // Mock API response
    setTimeout(() => {
      const updatedSocialAccounts = artist.socialAccounts.map((account) =>
        account.platform === selectedPlatform
          ? {
              ...account,
              username: socialFormData.username,
              isConnected: true,
              lastSync: new Date().toISOString(),
              // Mock updated stats
              followers: account.followers + Math.floor(Math.random() * 100),
              analytics: {
                ...account.analytics,
                impressions: account.analytics.impressions + Math.floor(Math.random() * 1000),
                engagement: account.analytics.engagement + Math.floor(Math.random() * 50),
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

    // Simulate API refresh
    setTimeout(() => {
      const updatedSocialAccounts = artist.socialAccounts.map((account) =>
        account.isConnected
          ? {
              ...account,
              lastSync: new Date().toISOString(),
              followers: account.followers + Math.floor(Math.random() * 20 - 10),
              analytics: {
                ...account.analytics,
                impressions: account.analytics.impressions + Math.floor(Math.random() * 500),
                engagement: account.analytics.engagement + Math.floor(Math.random() * 25),
                engagementRate: Math.max(0, account.analytics.engagementRate + (Math.random() * 2 - 1)),
              },
            }
          : account,
      )

      setArtist({ ...artist, socialAccounts: updatedSocialAccounts })
      setIsRefreshing(false)
    }, 1500)
  }

  const connectedAccounts = (artist.socialAccounts || []).filter((acc) => acc.isConnected)
  const totalFollowers = connectedAccounts.reduce((sum, acc) => sum + acc.followers, 0)
  const totalEngagement = connectedAccounts.reduce((sum, acc) => sum + acc.analytics.engagement, 0)
  const avgEngagementRate =
    connectedAccounts.length > 0
      ? connectedAccounts.reduce((sum, acc) => sum + acc.analytics.engagementRate, 0) / connectedAccounts.length
      : 0

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Artists
        </Button>
        <div className="flex-1" />
        <Button variant="outline" size="sm">
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
                  {artist.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="mt-4 text-center md:text-left">
                <h1 className="text-3xl font-bold">{artist.name}</h1>
                <p className="text-lg text-muted-foreground">{(artist.specialty || []).join(" • ")}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(artist.rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {artist.rating} ({artist.totalReviews} reviews)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 md:mt-16">
              <div className="text-center">
                <div className="text-2xl font-bold">{artist.totalAppointments}</div>
                <div className="text-sm text-muted-foreground">Appointments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{formatNumber(totalFollowers)}</div>
                <div className="text-sm text-muted-foreground">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{artist.portfolio.length}</div>
                <div className="text-sm text-muted-foreground">Portfolio</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{artist.experience}</div>
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
                    <p className="text-muted-foreground leading-relaxed">{artist.bio}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Specialties</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {artist.specialty.map((spec, index) => (
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
                      {artist.portfolio.slice(0, 6).map((item) => (
                        <div key={item.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={item.imageUrl || "/placeholder.svg"}
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
                      <span className="text-sm">{artist.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{artist.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{artist.location}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Next: {artist.nextAppointment}</span>
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
                      <span className="text-sm font-medium">{artist.experience}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Hourly Rate:</span>
                      <span className="text-sm font-medium">${artist.hourlyRate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Started:</span>
                      <span className="text-sm font-medium">{formatDate(artist.startDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge variant={artist.status === "active" ? "default" : "secondary"}>{artist.status}</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Certifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {artist.certifications.map((cert, index) => (
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
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Piece
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(artist.portfolio || []).map((item) => (
                <Card key={item.id} className="overflow-hidden group">
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    <img
                      src={item.imageUrl || "/placeholder.svg"}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant={item.isPublic ? "default" : "secondary"}>
                        {item.isPublic ? "Public" : "Private"}
                      </Badge>
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
                      {item.tags.slice(0, 3).map((tag, index) => (
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
              {artist.socialAccounts.map((account) => {
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
                              <div className="text-lg font-bold">{formatNumber(account.followers)}</div>
                              <div className="text-xs text-muted-foreground">Followers</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold">{formatNumber(account.following)}</div>
                              <div className="text-xs text-muted-foreground">Following</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold">{account.posts}</div>
                              <div className="text-xs text-muted-foreground">Posts</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold">{formatNumber(account.analytics.reach)}</div>
                              <div className="text-xs text-muted-foreground">Reach</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold">{formatNumber(account.analytics.engagement)}</div>
                              <div className="text-xs text-muted-foreground">Engagement</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold">{account.analytics.engagementRate.toFixed(1)}%</div>
                              <div className="text-xs text-muted-foreground">Rate</div>
                            </div>
                          </div>

                          <Separator />

                          {/* Recent Posts */}
                          {account.recentPosts.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-3">Recent Posts</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {account.recentPosts.map((post) => (
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

          <TabsContent value="analytics" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
              <p className="text-muted-foreground">Comprehensive performance metrics and insights</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Total Impressions</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">
                    {formatNumber(connectedAccounts.reduce((sum, acc) => sum + acc.analytics.impressions, 0))}
                  </p>
                  <p className="text-xs text-green-600 mt-1">+12.5% this month</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Total Reach</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">
                    {formatNumber(connectedAccounts.reduce((sum, acc) => sum + acc.analytics.reach, 0))}
                  </p>
                  <p className="text-xs text-green-600 mt-1">+8.3% this month</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">Engagement Rate</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">{avgEngagementRate.toFixed(1)}%</p>
                  <p className="text-xs text-green-600 mt-1">+2.1% this month</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Growth Rate</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">
                    {(
                      connectedAccounts.reduce((sum, acc) => sum + acc.analytics.audienceGrowth, 0) /
                        connectedAccounts.length || 0
                    ).toFixed(1)}
                    %
                  </p>
                  <p className="text-xs text-green-600 mt-1">Monthly average</p>
                </CardContent>
              </Card>
            </div>

            {/* Platform Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Performance</CardTitle>
                <CardDescription>Detailed analytics for each connected platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {connectedAccounts.map((account) => {
                    const platform = socialPlatforms[account.platform as keyof typeof socialPlatforms]
                    const IconComponent = platform.icon

                    return (
                      <div key={account.platform} className="border rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <IconComponent className={`h-6 w-6 ${platform.color}`} />
                          <div>
                            <h4 className="font-medium">{platform.name}</h4>
                            <p className="text-sm text-muted-foreground">@{account.username}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div>
                            <div className="text-lg font-bold">{formatNumber(account.analytics.impressions)}</div>
                            <div className="text-xs text-muted-foreground">Impressions</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold">{formatNumber(account.analytics.reach)}</div>
                            <div className="text-xs text-muted-foreground">Reach</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold">{formatNumber(account.analytics.engagement)}</div>
                            <div className="text-xs text-muted-foreground">Engagement</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold">{account.analytics.engagementRate.toFixed(1)}%</div>
                            <div className="text-xs text-muted-foreground">Engagement Rate</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-green-600">
                              +{account.analytics.audienceGrowth.toFixed(1)}%
                            </div>
                            <div className="text-xs text-muted-foreground">Growth</div>
                          </div>
                        </div>

                        {account.analytics.topHashtags.length > 0 && (
                          <div className="mt-4">
                            <h5 className="text-sm font-medium mb-2">Top Hashtags</h5>
                            <div className="flex flex-wrap gap-2">
                              {account.analytics.topHashtags.map((hashtag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {hashtag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {account.analytics.bestPostTime && (
                          <div className="mt-3">
                            <span className="text-sm text-muted-foreground">
                              Best posting time: {account.analytics.bestPostTime}
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Client Reviews</h2>
                <p className="text-muted-foreground">
                  {artist.totalReviews} reviews • {artist.rating} average rating
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(artist.rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold">{artist.rating}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {artist.recentReviews.map((review) => (
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
                                  className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
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
    </div>
  )
}
