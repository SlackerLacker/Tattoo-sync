"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Instagram,
  Facebook,
  Twitter,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Key,
  Shield,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SocialPlatform {
  id: string
  name: string
  icon: any
  color: string
  bgColor: string
  authUrl: string
  scopes: string[]
  description: string
  features: string[]
}

const socialPlatforms: Record<string, SocialPlatform> = {
  instagram: {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    authUrl: "https://api.instagram.com/oauth/authorize",
    scopes: ["user_profile", "user_media"],
    description: "Connect your Instagram Business account to showcase your tattoo work and track engagement.",
    features: ["Post analytics", "Follower insights", "Media management", "Story metrics"],
  },
  facebook: {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    authUrl: "https://www.facebook.com/v18.0/dialog/oauth",
    scopes: ["pages_read_engagement", "pages_show_list", "instagram_basic"],
    description: "Connect your Facebook Page to manage posts and track page performance.",
    features: ["Page insights", "Post engagement", "Audience demographics", "Ad performance"],
  },
  twitter: {
    id: "twitter",
    name: "Twitter",
    icon: Twitter,
    color: "text-blue-400",
    bgColor: "bg-blue-50",
    authUrl: "https://twitter.com/i/oauth2/authorize",
    scopes: ["tweet.read", "users.read", "follows.read"],
    description: "Connect your Twitter account to share updates and engage with the tattoo community.",
    features: ["Tweet analytics", "Follower growth", "Engagement metrics", "Hashtag tracking"],
  },
}

export default function ConnectSocialPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const artistId = params.id as string

  const [selectedPlatform, setSelectedPlatform] = useState<string>("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [isManualSetup, setIsManualSetup] = useState(false)
  const [manualCredentials, setManualCredentials] = useState({
    accessToken: "",
    refreshToken: "",
    userId: "",
    username: "",
  })

  // Check for OAuth callback
  useEffect(() => {
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    if (error) {
      setConnectionStatus("error")
      setErrorMessage(`OAuth Error: ${error}`)
      return
    }

    if (code && state) {
      handleOAuthCallback(code, state)
    }
  }, [searchParams])

  const handleOAuthCallback = async (code: string, state: string) => {
    setIsConnecting(true)
    setConnectionStatus("connecting")

    try {
      // Parse state to get platform info
      const stateData = JSON.parse(atob(state))
      const platform = stateData.platform

      // Exchange code for access token
      const response = await fetch("/api/social/oauth/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          code,
          artistId,
          redirectUri: `${window.location.origin}/artists/${artistId}/connect-social`,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setConnectionStatus("success")
        // Redirect back to artist profile after 2 seconds
        setTimeout(() => {
          router.push(`/artists/${artistId}?tab=social`)
        }, 2000)
      } else {
        throw new Error(result.error || "Failed to connect account")
      }
    } catch (error) {
      setConnectionStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Connection failed")
    } finally {
      setIsConnecting(false)
    }
  }

  const initiateOAuthFlow = async (platformId: string) => {
    const platform = socialPlatforms[platformId]
    if (!platform) return

    setSelectedPlatform(platformId)
    setIsConnecting(true)

    try {
      // Create state parameter with platform info
      const state = btoa(
        JSON.stringify({
          platform: platformId,
          artistId,
          timestamp: Date.now(),
        }),
      )

      // Get OAuth URL from backend
      const response = await fetch("/api/social/oauth/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: platformId,
          redirectUri: `${window.location.origin}/artists/${artistId}/connect-social`,
          state,
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Redirect to OAuth provider
        window.location.href = result.authUrl
      } else {
        throw new Error(result.error || "Failed to initiate OAuth")
      }
    } catch (error) {
      setConnectionStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Failed to start connection")
      setIsConnecting(false)
    }
  }

  const handleManualConnection = async () => {
    if (!selectedPlatform || !manualCredentials.accessToken) return

    setIsConnecting(true)
    setConnectionStatus("connecting")

    try {
      const response = await fetch("/api/social/connect/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: selectedPlatform,
          artistId,
          credentials: manualCredentials,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setConnectionStatus("success")
        setTimeout(() => {
          router.push(`/artists/${artistId}?tab=social`)
        }, 2000)
      } else {
        throw new Error(result.error || "Failed to connect account")
      }
    } catch (error) {
      setConnectionStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Connection failed")
    } finally {
      setIsConnecting(false)
    }
  }

  const testConnection = async (platformId: string) => {
    try {
      const response = await fetch(`/api/social/test/${platformId}/${artistId}`)
      const result = await response.json()

      if (result.success) {
        alert(`Connection test successful! Found ${result.data.followers} followers.`)
      } else {
        alert(`Connection test failed: ${result.error}`)
      }
    } catch (error) {
      alert("Connection test failed")
    }
  }

  if (connectionStatus === "success") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-green-600 mb-2">Connection Successful!</h1>
          <p className="text-muted-foreground">Your {selectedPlatform} account has been connected successfully.</p>
          <p className="text-sm text-muted-foreground mt-2">Redirecting to your profile...</p>
        </div>
      </div>
    )
  }

  if (connectionStatus === "error") {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center gap-6">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-600 mb-2">Connection Failed</h1>
            <p className="text-muted-foreground mb-4">{errorMessage}</p>
            <div className="flex gap-2">
              <Button onClick={() => setConnectionStatus("idle")}>Try Again</Button>
              <Button variant="outline" onClick={() => router.back()}>
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Connect Social Media</h1>
          <p className="text-muted-foreground">
            Link your social media accounts to track analytics and manage your online presence
          </p>
        </div>
      </div>

      {/* Connection Methods */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* OAuth Connection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Secure OAuth Connection
            </CardTitle>
            <CardDescription>
              Recommended method using official OAuth authentication for maximum security and features.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {Object.values(socialPlatforms).map((platform) => {
                const IconComponent = platform.icon
                return (
                  <div key={platform.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${platform.bgColor}`}>
                          <IconComponent className={`h-6 w-6 ${platform.color}`} />
                        </div>
                        <div>
                          <h4 className="font-medium">{platform.name}</h4>
                          <p className="text-sm text-muted-foreground">OAuth 2.0</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => initiateOAuthFlow(platform.id)}
                        disabled={isConnecting}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        {isConnecting && selectedPlatform === platform.id ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Connect
                          </>
                        )}
                      </Button>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">{platform.description}</p>

                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Features included:</h5>
                      <div className="grid grid-cols-2 gap-1">
                        {platform.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Manual Connection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-orange-600" />
              Manual API Connection
            </CardTitle>
            <CardDescription>
              Advanced method using API tokens for developers or when OAuth is not available.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Manual connection requires API tokens from each platform's developer console. This method provides
                limited features compared to OAuth.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <Label htmlFor="platform-select">Select Platform</Label>
                <select
                  id="platform-select"
                  className="w-full p-2 border rounded-md"
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                >
                  <option value="">Choose platform...</option>
                  {Object.values(socialPlatforms).map((platform) => (
                    <option key={platform.id} value={platform.id}>
                      {platform.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedPlatform && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-medium">{socialPlatforms[selectedPlatform]?.name} API Credentials</h4>

                  <div className="grid gap-3">
                    <div>
                      <Label htmlFor="access-token">Access Token *</Label>
                      <Input
                        id="access-token"
                        type="password"
                        placeholder="Enter your access token"
                        value={manualCredentials.accessToken}
                        onChange={(e) =>
                          setManualCredentials({
                            ...manualCredentials,
                            accessToken: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="user-id">User ID</Label>
                      <Input
                        id="user-id"
                        placeholder="Your user/page ID"
                        value={manualCredentials.userId}
                        onChange={(e) =>
                          setManualCredentials({
                            ...manualCredentials,
                            userId: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        placeholder="Your username (without @)"
                        value={manualCredentials.username}
                        onChange={(e) =>
                          setManualCredentials({
                            ...manualCredentials,
                            username: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleManualConnection}
                      disabled={!manualCredentials.accessToken || isConnecting}
                      className="flex-1"
                    >
                      {isConnecting ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        "Connect Account"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => testConnection(selectedPlatform)}
                      disabled={!manualCredentials.accessToken}
                    >
                      Test
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
          <CardDescription>Step-by-step guide to get your API credentials for manual connection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {/* Instagram Instructions */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Instagram className="h-5 w-5 text-pink-600" />
                <h4 className="font-medium">Instagram Setup</h4>
              </div>
              <div className="text-sm space-y-2">
                <p>
                  1. Go to{" "}
                  <a
                    href="https://developers.facebook.com"
                    target="_blank"
                    className="text-blue-600 hover:underline"
                    rel="noreferrer"
                  >
                    Facebook Developers
                  </a>
                </p>
                <p>2. Create a new app and add Instagram Basic Display</p>
                <p>3. Configure OAuth redirect URI:</p>
                <code className="block p-2 bg-muted rounded text-xs">
                  {typeof window !== "undefined" && `${window.location.origin}/artists/${artistId}/connect-social`}
                </code>
                <p>4. Get your Access Token from the app dashboard</p>
              </div>
            </div>

            {/* Facebook Instructions */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Facebook className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium">Facebook Setup</h4>
              </div>
              <div className="text-sm space-y-2">
                <p>
                  1. Go to{" "}
                  <a
                    href="https://developers.facebook.com"
                    target="_blank"
                    className="text-blue-600 hover:underline"
                    rel="noreferrer"
                  >
                    Facebook Developers
                  </a>
                </p>
                <p>2. Create app and add Facebook Login</p>
                <p>3. Add your page to the app</p>
                <p>4. Generate Page Access Token</p>
                <p>5. Use Graph API Explorer to test</p>
              </div>
            </div>

            {/* Twitter Instructions */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Twitter className="h-5 w-5 text-blue-400" />
                <h4 className="font-medium">Twitter Setup</h4>
              </div>
              <div className="text-sm space-y-2">
                <p>
                  1. Go to{" "}
                  <a
                    href="https://developer.twitter.com"
                    target="_blank"
                    className="text-blue-600 hover:underline"
                    rel="noreferrer"
                  >
                    Twitter Developers
                  </a>
                </p>
                <p>2. Create a new project and app</p>
                <p>3. Generate Bearer Token</p>
                <p>4. Enable OAuth 2.0 settings</p>
                <p>5. Add callback URL and permissions</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Notice:</strong> Your social media credentials are encrypted and stored securely. We only
          access the data you explicitly grant permission for, and you can revoke access at any time from your artist
          profile settings.
        </AlertDescription>
      </Alert>
    </div>
  )
}
