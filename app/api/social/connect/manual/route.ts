import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { platform, artistId, credentials } = await request.json()

    const { accessToken, userId, username } = credentials

    if (!accessToken) {
      return NextResponse.json({ success: false, error: "Access token is required" }, { status: 400 })
    }

    // Validate the access token by making a test API call
    const validationResult = await validateAccessToken(platform, accessToken, userId)

    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: validationResult.error }, { status: 400 })
    }

    // Store connection in database
    const connectionData = {
      artistId,
      platform,
      accessToken,
      userId: validationResult.userId,
      username: validationResult.username || username,
      displayName: validationResult.displayName,
      profilePicture: validationResult.profilePicture,
      followers: validationResult.followers,
      isVerified: validationResult.isVerified,
      connectedAt: new Date().toISOString(),
      connectionType: "manual",
    }

    // In a real app, save to database
    // await saveSocialConnection(connectionData)

    // For demo, we'll simulate saving
    console.log("Saving manual social connection:", connectionData)

    return NextResponse.json({
      success: true,
      platform,
      username: validationResult.username,
      followers: validationResult.followers,
    })
  } catch (error) {
    console.error("Manual connection error:", error)
    return NextResponse.json({ success: false, error: "Manual connection failed" }, { status: 500 })
  }
}

async function validateAccessToken(platform: string, accessToken: string, userId?: string) {
  try {
    let apiUrl: string
    const headers: any = {}

    if (platform === "instagram") {
      apiUrl = `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${accessToken}`
    } else if (platform === "facebook") {
      if (userId) {
        apiUrl = `https://graph.facebook.com/${userId}?fields=id,name,picture,followers_count&access_token=${accessToken}`
      } else {
        apiUrl = `https://graph.facebook.com/me?fields=id,name,picture&access_token=${accessToken}`
      }
    } else if (platform === "twitter") {
      apiUrl = "https://api.twitter.com/2/users/me?user.fields=public_metrics,profile_image_url,verified"
      headers["Authorization"] = `Bearer ${accessToken}`
    } else {
      return { success: false, error: "Unsupported platform" }
    }

    const response = await fetch(apiUrl, { headers })
    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error?.message || data.error_description || "Invalid access token",
      }
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
        username: data.name?.toLowerCase().replace(/\s+/g, "") || data.id,
        displayName: data.name || "Facebook User",
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
    return { success: false, error: "Token validation request failed" }
  }
}
