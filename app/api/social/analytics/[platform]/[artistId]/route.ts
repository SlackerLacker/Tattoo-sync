import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { platform: string; artistId: string } }) {
  try {
    const { platform, artistId } = params
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "30d"

    // In a real app, get connection and fetch analytics from platform APIs
    // const connection = await getSocialConnection(artistId, platform)
    // const analytics = await fetchPlatformAnalytics(platform, connection.accessToken, period)

    // For demo, return mock analytics data
    const mockAnalytics = {
      instagram: {
        followers: 15420,
        following: 892,
        posts: 234,
        impressions: 45200,
        reach: 32100,
        engagement: 3420,
        engagementRate: 8.5,
        profileViews: 2100,
        websiteClicks: 156,
        topHashtags: ["#traditionaltattoo", "#tattooart", "#ink"],
        audienceGrowth: 12.3,
        bestPostTime: "2:00 PM - 4:00 PM",
        recentPosts: [
          {
            id: "1",
            imageUrl: "/placeholder.svg?height=300&width=300&text=Post1",
            caption: "Fresh traditional eagle piece! 🦅 #traditionaltattoo #eagle",
            likes: 245,
            comments: 18,
            shares: 12,
            timestamp: "2024-01-20T14:30:00",
            impressions: 1200,
            reach: 890,
          },
          {
            id: "2",
            imageUrl: "/placeholder.svg?height=300&width=300&text=Post2",
            caption: "Neo traditional roses coming together beautifully 🌹",
            likes: 189,
            comments: 12,
            shares: 8,
            timestamp: "2024-01-19T16:45:00",
            impressions: 980,
            reach: 720,
          },
        ],
        demographics: {
          ageGroups: {
            "18-24": 25,
            "25-34": 45,
            "35-44": 20,
            "45-54": 8,
            "55+": 2,
          },
          gender: {
            male: 60,
            female: 38,
            other: 2,
          },
          topLocations: [
            { city: "Los Angeles", percentage: 35 },
            { city: "New York", percentage: 15 },
            { city: "Chicago", percentage: 12 },
          ],
        },
      },
      facebook: {
        followers: 3200,
        likes: 3180,
        posts: 89,
        impressions: 12800,
        reach: 8900,
        engagement: 890,
        engagementRate: 6.2,
        pageViews: 1200,
        websiteClicks: 89,
        topHashtags: ["#tattoo", "#art", "#traditional"],
        audienceGrowth: 5.7,
        bestPostTime: "7:00 PM - 9:00 PM",
        recentPosts: [
          {
            id: "3",
            imageUrl: "/placeholder.svg?height=300&width=300&text=FB1",
            caption: "Check out this amazing traditional piece I completed today!",
            likes: 67,
            comments: 8,
            shares: 5,
            timestamp: "2024-01-20T12:00:00",
            impressions: 450,
            reach: 320,
          },
        ],
        demographics: {
          ageGroups: {
            "18-24": 15,
            "25-34": 35,
            "35-44": 30,
            "45-54": 15,
            "55+": 5,
          },
          gender: {
            male: 55,
            female: 43,
            other: 2,
          },
          topLocations: [
            { city: "Los Angeles", percentage: 40 },
            { city: "San Francisco", percentage: 18 },
            { city: "San Diego", percentage: 10 },
          ],
        },
      },
      twitter: {
        followers: 1850,
        following: 456,
        tweets: 567,
        impressions: 8900,
        reach: 6200,
        engagement: 420,
        engagementRate: 4.8,
        profileViews: 890,
        linkClicks: 45,
        topHashtags: ["#tattoo", "#art", "#ink"],
        audienceGrowth: 3.2,
        bestPostTime: "12:00 PM - 2:00 PM",
        recentPosts: [],
        demographics: {
          ageGroups: {
            "18-24": 30,
            "25-34": 40,
            "35-44": 20,
            "45-54": 8,
            "55+": 2,
          },
          gender: {
            male: 65,
            female: 33,
            other: 2,
          },
          topLocations: [
            { city: "Los Angeles", percentage: 25 },
            { city: "New York", percentage: 20 },
            { city: "Austin", percentage: 15 },
          ],
        },
      },
    }

    const analytics = mockAnalytics[platform as keyof typeof mockAnalytics]

    if (!analytics) {
      return NextResponse.json({ success: false, error: "Platform not supported" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      platform,
      period,
      data: analytics,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Analytics fetch error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch analytics" }, { status: 500 })
  }
}
