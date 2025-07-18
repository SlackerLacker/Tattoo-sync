import { type NextRequest, NextResponse } from "next/server"

const OAUTH_CONFIGS = {
  instagram: {
    authUrl: "https://api.instagram.com/oauth/authorize",
    clientId: process.env.INSTAGRAM_CLIENT_ID,
    scopes: ["user_profile", "user_media"],
  },
  facebook: {
    authUrl: "https://www.facebook.com/v18.0/dialog/oauth",
    clientId: process.env.FACEBOOK_APP_ID,
    scopes: ["pages_read_engagement", "pages_show_list", "instagram_basic"],
  },
  twitter: {
    authUrl: "https://twitter.com/i/oauth2/authorize",
    clientId: process.env.TWITTER_CLIENT_ID,
    scopes: ["tweet.read", "users.read", "follows.read", "offline.access"],
  },
}

export async function POST(request: NextRequest) {
  try {
    const { platform, redirectUri, state } = await request.json()

    const config = OAUTH_CONFIGS[platform as keyof typeof OAUTH_CONFIGS]
    if (!config || !config.clientId) {
      return NextResponse.json({ success: false, error: `${platform} OAuth not configured` }, { status: 400 })
    }

    // Build OAuth URL
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      scope: config.scopes.join(" "),
      response_type: "code",
      state: state,
    })

    // Platform-specific parameters
    if (platform === "twitter") {
      params.append("code_challenge", "challenge")
      params.append("code_challenge_method", "plain")
    }

    const authUrl = `${config.authUrl}?${params.toString()}`

    return NextResponse.json({
      success: true,
      authUrl,
      platform,
    })
  } catch (error) {
    console.error("OAuth URL generation error:", error)
    return NextResponse.json({ success: false, error: "Failed to generate OAuth URL" }, { status: 500 })
  }
}
