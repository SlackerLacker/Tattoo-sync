import { type NextRequest, NextResponse } from "next/server"

const TOKEN_ENDPOINTS = {
  instagram: "https://api.instagram.com/oauth/access_token",
  facebook: "https://graph.facebook.com/v18.0/oauth/access_token",
  twitter: "https://api.twitter.com/2/oauth2/token",
}

const CLIENT_SECRETS = {
  instagram: process.env.INSTAGRAM_CLIENT_SECRET,
  facebook: process.env.FACEBOOK_APP_SECRET,
  twitter: process.env.TWITTER_CLIENT_SECRET,
}

const CLIENT_IDS = {
  instagram: process.env.INSTAGRAM_CLIENT_ID,
  facebook: process.env.FACEBOOK_APP_ID,
  twitter: process.env.TWITTER_CLIENT_ID,
}

export async function POST(request: NextRequest) {
  try {
    const { platform, code, artistId, redirectUri } = await request.json()

    const tokenEndpoint = TOKEN_ENDPOINTS[platform as keyof typeof TOKEN_ENDPOINTS]
    const clientSecret = CLIENT_SECRETS[platform as keyof typeof CLIENT_SECRETS]
    const clientId = CLIENT_IDS[platform as keyof typeof CLIENT_IDS]

    if (!tokenEndpoint || !clientSecret || !clientId) {
      return NextResponse.json({ success: false, error: `${platform} OAuth not configured` }, { status: 400 })
    }

    // Exchange code for access token
    const tokenResponse = await exchangeCodeForToken(platform, code, clientId, clientSecret, redirectUri, tokenEndpoint)

    if (!tokenResponse.success) {
      return NextResponse.json({ success: false, error: tokenResponse.error }, { status: 400 })
    }

    // Get user profile information
    const profileData = await getUserProfile(platform, tokenResponse.accessToken)

    if (!profileData.success) {
      return NextResponse.json({ success: false, error: profileData.error }, { status: 400 })
    }

    // Store connection in database
    const connectionData = {
      artistId,
      platform,
      accessToken: tokenResponse.accessToken,
      refreshToken: tokenResponse.refreshToken,
      expiresAt: tokenResponse.expiresAt,
      userId: profileData.userId,
      username: profileData.username,
      displayName: profileData.displayName,
      profilePicture: profileData.profilePicture,
      followers: profileData.followers,
      isVerified: profileData.isVerified,
      connectedAt: new Date().toISOString(),
    }

    // In a real app, save to database
    // await saveSocialConnection(connectionData)

    // For demo, we'll simulate saving
    console.log("Saving social connection:", connectionData)

    return NextResponse.json({
      success: true,
      platform,
      username: profileData.username,
      followers: profileData.followers,
    })
  } catch (error) {
    console.error("OAuth callback error:", error)
    return NextResponse.json({ success: false, error: "OAuth callback failed" }, { status: 500 })
  }
}

async function exchangeCodeForToken(
  platform: string,
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  tokenEndpoint: string,
) {
  try {
    let body: any
    const headers: any = { "Content-Type": "application/x-www-form-urlencoded" }

    if (platform === "instagram") {
      body = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code: code,
      })
    } else if (platform === "facebook") {
      body = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code: code,
      })
    } else if (platform === "twitter") {
      headers["Authorization"] = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`
      body = new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
        code_verifier: "challenge",
      })
    }

    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers,
      body,
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error_description || data.error || "Token exchange failed" }
    }

    return {
      success: true,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000).toISOString() : null,
    }
  } catch (error) {
    return { success: false, error: "Token exchange request failed" }
  }
}

async function getUserProfile(platform: string, accessToken: string) {
  try {
    let profileUrl: string
    const headers: any = {}

    if (platform === "instagram") {
      profileUrl = `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${accessToken}`
    } else if (platform === "facebook") {
      profileUrl = `https://graph.facebook.com/me?fields=id,name,picture,followers_count&access_token=${accessToken}`
    } else if (platform === "twitter") {
      profileUrl = "https://api.twitter.com/2/users/me?user.fields=public_metrics,profile_image_url,verified"
      headers["Authorization"] = `Bearer ${accessToken}`
    } else {
      return { success: false, error: "Unsupported platform" }
    }

    const response = await fetch(profileUrl, { headers })
    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error?.message || "Profile fetch failed" }
    }

    // Normalize data across platforms
    let normalizedData: any = {}

    if (platform === "instagram") {
      normalizedData = {
        userId: data.id,
        username: data.username,
        displayName: data.username,
        profilePicture: null,
        followers: 0, // Instagram Basic Display doesn't provide follower count
        isVerified: false,
      }
    } else if (platform === "facebook") {
      normalizedData = {
        userId: data.id,
        username: data.name.toLowerCase().replace(/\s+/g, ""),
        displayName: data.name,
        profilePicture: data.picture?.data?.url,
        followers: data.followers_count || 0,
        isVerified: false,
      }
    } else if (platform === "twitter") {
      normalizedData = {
        userId: data.data.id,
        username: data.data.username,
        displayName: data.data.name,
        profilePicture: data.data.profile_image_url,
        followers: data.data.public_metrics?.followers_count || 0,
        isVerified: data.data.verified || false,
      }
    }

    return { success: true, ...normalizedData }
  } catch (error) {
    return { success: false, error: "Profile fetch request failed" }
  }
}
