export interface Appointment {
  id: string
  artist_id: string
  client_id: string
  service_id: string
  appointment_date: string
  start_time: string
  duration: number
  duration_minutes?: number
  status: "confirmed" | "pending" | "cancelled" | "completed" | "in-progress"
  notes?: string
  price?: number
  deposit_paid?: number
  created_at: string
  payment_status?: "paid" | "unpaid" | "deposit"
  payment_method?: string
  clients?: Client // For joined data
  artists?: Artist // For joined data
  services?: Service // For joined data
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
  id: string
  name: string
  email: string
  phone: string
  avatar_url?: string
  specialty: string[]
  experience: string
  status: "active" | "on-leave" | "inactive"
  bio: string
  profileImage?: string
  avatar_url?: string
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
  id: string
  full_name: string
  email: string
  phone: string
  avatar_url?: string
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
  id: string
  name: string
  description: string
  price: number
  duration: number
  duration_minutes?: number
  category: string
  artist: string
  availability: string
  bookings: number
  revenue: number
  popularity?: number
}

export interface Studio {
  id: string
  name: string
  owner_id: string
  stripe_account_id?: string
}
