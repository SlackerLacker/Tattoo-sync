export interface Appointment {
  id: number
  artistId: number
  client: string
  service: string
  date: string
  startTime: number
  duration: number
  status: "confirmed" | "pending" | "cancelled" | "completed"
  phone: string
  email?: string
  notes?: string
  price?: number
  depositPaid?: number
  createdAt: string
}

export const specialtyOptions = [
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

export const socialPlatforms = [
  { id: "instagram", name: "Instagram", color: "text-pink-600" },
  { id: "facebook", name: "Facebook", color: "text-blue-600" },
  { id: "twitter", name: "Twitter", color: "text-blue-400" },
  { id: "tiktok", name: "TikTok", color: "text-black" },
]

export interface SocialAccount {
  platform: "instagram" | "facebook" | "twitter" | "tiktok"
  username: string
  followers: number
  isConnected: boolean
  lastSync?: string
}

export interface SocialMetrics {
  views: number
  likes: number
  shares: number
  comments: number
  engagement: number
  period: "week" | "month"
}

export interface PortfolioItem {
  id: number
  title: string
  description: string
  imageUrl: string
  category: string
  date: string
  likes: number
  isPublic: boolean
}

export interface Artist {
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

export interface Client {
  id: number
  name: string
  email: string
  phone: string
  totalAppointments: number
  totalSpent: number
  lastAppointment: string
  preferredArtist: string
  notes: string
  avatar?: string
  tags: string[]
  upcomingAppointment?: string
  memberSince: string
}

export interface Service {
  id: number
  name: string
  description: string
  price: number
  duration: number
  category: string
  artist: string
  availability: string
  bookings: number
  revenue: number
}
