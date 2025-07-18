"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Instagram,
  Facebook,
  Youtube,
  TrendingUp,
  Users,
  MessageCircle,
  Heart,
  Share,
  Calendar,
  ImageIcon,
  Video,
  Plus,
  CheckCircle,
  Clock,
  BarChart3,
} from "lucide-react"

// X (formerly Twitter) icon component
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

// Mock data for social media accounts
const socialAccounts = [
  {
    platform: "Instagram",
    icon: Instagram,
    connected: true,
    handle: "@inkschedule_tattoo",
    followers: 12500,
    posts: 342,
    engagement: 4.2,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-gradient-to-r from-purple-500 to-pink-500",
  },
  {
    platform: "Facebook",
    icon: Facebook,
    connected: true,
    handle: "InkSchedule Tattoo Studio",
    followers: 8900,
    posts: 156,
    engagement: 3.8,
    color: "from-blue-600 to-blue-700",
    bgColor: "bg-blue-600",
  },
  {
    platform: "X",
    icon: XIcon,
    connected: false,
    handle: "",
    followers: 0,
    posts: 0,
    engagement: 0,
    color: "from-gray-800 to-black",
    bgColor: "bg-black",
  },
  {
    platform: "YouTube",
    icon: Youtube,
    connected: true,
    handle: "InkSchedule Studio",
    followers: 2100,
    posts: 28,
    engagement: 6.1,
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-600",
  },
]

// Mock data for recent posts
const recentPosts = [
  {
    id: 1,
    platform: "Instagram",
    content: "Fresh geometric sleeve by @artist_mike! 🔥 Book your consultation today.",
    image: "/placeholder.svg?height=300&width=300",
    likes: 234,
    comments: 18,
    shares: 12,
    timestamp: "2 hours ago",
    status: "published",
  },
  {
    id: 2,
    platform: "Facebook",
    content: "New flash designs available! Come check out our latest collection.",
    image: "/placeholder.svg?height=300&width=300",
    likes: 89,
    comments: 7,
    shares: 23,
    timestamp: "5 hours ago",
    status: "published",
  },
  {
    id: 3,
    platform: "YouTube",
    content: "Behind the scenes: Creating a custom dragon tattoo",
    image: "/placeholder.svg?height=300&width=300",
    likes: 156,
    comments: 34,
    shares: 45,
    timestamp: "1 day ago",
    status: "published",
  },
  {
    id: 4,
    platform: "Instagram",
    content: "Healing progress check! Remember to follow aftercare instructions.",
    image: "/placeholder.svg?height=300&width=300",
    likes: 178,
    comments: 12,
    shares: 8,
    timestamp: "2 days ago",
    status: "scheduled",
  },
]

export default function SocialPage() {
  const [postContent, setPostContent] = useState("")
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [isPosting, setIsPosting] = useState(false)
  const [scheduledDate, setScheduledDate] = useState("")

  const connectedAccounts = socialAccounts.filter((account) => account.connected)
  const totalFollowers = connectedAccounts.reduce((sum, account) => sum + account.followers, 0)
  const totalPosts = connectedAccounts.reduce((sum, account) => sum + account.posts, 0)
  const avgEngagement =
    connectedAccounts.length > 0
      ? connectedAccounts.reduce((sum, account) => sum + account.engagement, 0) / connectedAccounts.length
      : 0

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms((prev) => (prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]))
  }

  const handlePost = async () => {
    if (!postContent.trim() || selectedPlatforms.length === 0) return

    setIsPosting(true)
    // Simulate posting delay
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsPosting(false)
    setPostContent("")
    setSelectedPlatforms([])
    setScheduledDate("")
  }

  const connectAccount = (platform: string) => {
    // Simulate account connection
    console.log(`Connecting ${platform} account...`)
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Social Media</h1>
        <p className="text-muted-foreground">Manage your social media presence and engage with your audience</p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFollowers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8</span> this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgEngagement.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+0.3%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Accounts</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedAccounts.length}/4</div>
            <p className="text-xs text-muted-foreground">Social platforms connected</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="create">Create Post</TabsTrigger>
          <TabsTrigger value="posts">Recent Posts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {socialAccounts.map((account) => (
              <Card key={account.platform}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${account.bgColor} text-white`}>
                        <account.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{account.platform}</CardTitle>
                        <CardDescription>{account.connected ? account.handle : "Not connected"}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={account.connected ? "default" : "secondary"}>
                      {account.connected ? "Connected" : "Disconnected"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {account.connected ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold">{account.followers.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">Followers</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{account.posts}</div>
                          <div className="text-xs text-muted-foreground">Posts</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{account.engagement}%</div>
                          <div className="text-xs text-muted-foreground">Engagement</div>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full bg-transparent">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        View Analytics
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Connect your {account.platform} account to start managing your social presence
                      </p>
                      <Button onClick={() => connectAccount(account.platform)} className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Connect {account.platform}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Create Post Tab */}
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Post</CardTitle>
              <CardDescription>Create and schedule posts across your connected social media accounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">Post Content</Label>
                <Textarea
                  id="content"
                  placeholder="What's happening at your tattoo shop?"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="text-xs text-muted-foreground text-right">{postContent.length}/280 characters</div>
              </div>

              <div className="space-y-2">
                <Label>Select Platforms</Label>
                <div className="flex flex-wrap gap-2">
                  {connectedAccounts.map((account) => (
                    <Button
                      key={account.platform}
                      variant={selectedPlatforms.includes(account.platform) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePlatformToggle(account.platform)}
                    >
                      <account.icon className="mr-2 h-4 w-4" />
                      {account.platform}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schedule">Schedule Post (Optional)</Label>
                  <Input
                    id="schedule"
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Add Media</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Image
                    </Button>
                    <Button variant="outline" size="sm">
                      <Video className="mr-2 h-4 w-4" />
                      Video
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handlePost}
                  disabled={!postContent.trim() || selectedPlatforms.length === 0 || isPosting}
                  className="flex-1"
                >
                  {isPosting ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : scheduledDate ? (
                    <>
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Post
                    </>
                  ) : (
                    <>
                      <Share className="mr-2 h-4 w-4" />
                      Post Now
                    </>
                  )}
                </Button>
                <Button variant="outline">Save Draft</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Posts Tab */}
        <TabsContent value="posts" className="space-y-4">
          <div className="grid gap-4">
            {recentPosts.map((post) => {
              const platform = socialAccounts.find((acc) => acc.platform === post.platform)
              return (
                <Card key={post.id}>
                  <CardContent className="p-4">
                    <div className="flex space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          src={post.image || "/placeholder.svg"}
                          alt="Post content"
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {platform && (
                              <div className={`p-1 rounded ${platform.bgColor} text-white`}>
                                <platform.icon className="h-3 w-3" />
                              </div>
                            )}
                            <span className="text-sm font-medium">{post.platform}</span>
                            <Badge variant={post.status === "published" ? "default" : "secondary"}>{post.status}</Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">{post.timestamp}</span>
                        </div>
                        <p className="text-sm">{post.content}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Heart className="h-3 w-3" />
                            <span>{post.likes}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="h-3 w-3" />
                            <span>{post.comments}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Share className="h-3 w-3" />
                            <span>{post.shares}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {connectedAccounts.map((account) => (
              <Card key={account.platform}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${account.bgColor} text-white`}>
                      <account.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{account.platform} Analytics</CardTitle>
                      <CardDescription>Last 30 days</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">+{Math.floor(Math.random() * 500)}</div>
                        <div className="text-xs text-muted-foreground">New Followers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{Math.floor(Math.random() * 10000)}</div>
                        <div className="text-xs text-muted-foreground">Total Reach</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Engagement Rate</span>
                        <span className="font-medium">{account.engagement}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${account.color}`}
                          style={{ width: `${account.engagement * 10}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <div className="font-medium">{Math.floor(Math.random() * 1000)}</div>
                        <div className="text-muted-foreground">Likes</div>
                      </div>
                      <div>
                        <div className="font-medium">{Math.floor(Math.random() * 200)}</div>
                        <div className="text-muted-foreground">Comments</div>
                      </div>
                      <div>
                        <div className="font-medium">{Math.floor(Math.random() * 100)}</div>
                        <div className="text-muted-foreground">Shares</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
