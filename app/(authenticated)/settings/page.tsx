"use client"

import { useEffect, useRef, useState } from "react"
import { supabase } from "@/lib/supabase-browser"
import ConnectStripe from "@/components/stripe/ConnectStripe"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Store,
  Users,
  Bell,
  CreditCard,
  Palette,
  Upload,
  Trash2,
  Edit,
  Plus,
  DollarSign,
  Calendar,
} from "lucide-react"

const timeZones = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "America/Anchorage",
  "Pacific/Honolulu",
]

const roles = [
  { value: "admin", label: "Owner/Admin", description: "Full access to all features" },
  { value: "artist", label: "Artist", description: "Manage own appointments and clients" },
]

export default function SettingsPage() {
  const [studio, setStudio] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  const [activeTab, setActiveTab] = useState("shop")
  const [shopSettings, setShopSettings] = useState({
    name: "Ink Studio Tattoo",
    description: "Premium tattoo studio specializing in custom artwork and professional body art.",
    address: "123 Main Street",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90210",
    phone: "(555) 123-4567",
    email: "info@inkstudio.com",
    website: "www.inkstudio.com",
    timezone: "America/Los_Angeles",
    businessHours: {
      monday: { open: "10:00", close: "20:00", closed: false },
      tuesday: { open: "10:00", close: "20:00", closed: false },
      wednesday: { open: "10:00", close: "20:00", closed: false },
      thursday: { open: "10:00", close: "20:00", closed: false },
      friday: { open: "10:00", close: "20:00", closed: false },
      saturday: { open: "10:00", close: "18:00", closed: false },
      sunday: { open: "12:00", close: "17:00", closed: false },
    },
  })

  const [appointmentSettings, setAppointmentSettings] = useState({
    defaultDuration: 60,
    bufferTime: 15,
    maxAdvanceBooking: 90,
    minAdvanceBooking: 24,
    cancellationWindow: 24,
    requireDeposit: true,
    depositAmount: 50,
    depositPercentage: false,
    autoConfirm: false,
    allowOnlineBooking: true,
    reminderEnabled: true,
    reminderTime: 24,
  })

  const [bookingLinks, setBookingLinks] = useState<any[]>([])
  const [newBookingLink, setNewBookingLink] = useState({
    booking_slug: "",
    label: "",
    source: "",
  })
  const [isCreatingLink, setIsCreatingLink] = useState(false)
  const [hasLoadedAppointmentSettings, setHasLoadedAppointmentSettings] = useState(false)
  const [hasLoadedStudioSettings, setHasLoadedStudioSettings] = useState(false)
  const [hasLoadedNotificationSettings, setHasLoadedNotificationSettings] = useState(false)
  const saveTimeoutsRef = useRef<Record<string, NodeJS.Timeout | null>>({})
  const [savingSections, setSavingSections] = useState({
    shop: false,
    appointments: false,
    payments: false,
    appearance: false,
    security: false,
    notifications: false,
  })
  const [lastSavedAt, setLastSavedAt] = useState<Record<string, string | null>>({
    shop: null,
    appointments: null,
    payments: null,
    appearance: null,
    security: null,
    notifications: null,
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailEnabled: true,
    smsEnabled: true,
    inAppEnabled: true,
    newBookings: true,
    cancellations: true,
    payments: true,
    reviews: true,
    reminders: true,
    reminderTime: 24,
    notifyNewConversation: true,
    notifyNewMessage: true,
  })

  const [paymentSettings, setPaymentSettings] = useState({
    acceptCash: true,
    acceptCards: true,
    acceptVenmo: true,
    acceptCashApp: true,
    acceptPayPal: false,
    stripeEnabled: true,
    processingFee: 2.9,
    cancellationFee: 25,
    lateFee: 10,
  })

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "light",
    primaryColor: "#8b5cf6",
    accentColor: "#ec4899",
    logoUrl: "",
    brandName: "Ink Studio",
  })

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    passwordRequirements: {
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSymbols: true,
    },
    auditLogging: true,
    dataRetention: 365,
  })

  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [availableArtists, setAvailableArtists] = useState<any[]>([])
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
  const [isConnectArtistOpen, setIsConnectArtistOpen] = useState(false)
  const [pendingArtistId, setPendingArtistId] = useState<string | null>(null)
  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false)
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<any>(null)
  const [resetPasswordValue, setResetPasswordValue] = useState("")
  const [connectProfileId, setConnectProfileId] = useState<string | null>(null)
  const [connectArtistId, setConnectArtistId] = useState<string>("")
  const [createUserData, setCreateUserData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "artist",
  })

  const fetchTeamMembers = async (studioId: string) => {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, avatar_url")
      .eq("studio_id", studioId)
      .neq("role", "client")

    if (profilesError) {
      console.error("Error fetching team members:", profilesError?.message || profilesError)
      return
    }

    const { data: artists, error: artistsError } = await supabase
      .from("artists")
      .select("id, name, user_id")
      .eq("studio_id", studioId)

    if (artistsError) {
      console.error("Error fetching artists:", artistsError?.message || artistsError)
      return
    }

    const artistByUserId = new Map(
      (artists || []).filter((artist) => artist.user_id).map((artist) => [artist.user_id, artist]),
    )

    setAvailableArtists((artists || []).filter((artist) => !artist.user_id))

    const members = (profiles || []).map((member) => ({
      ...member,
      artist: artistByUserId.get(member.id) || null,
    }))

    setTeamMembers(members)
  }

  useEffect(() => {
    const fetchStudio = async () => {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name, email, avatar_url, studio_id, role")
          .eq("id", user.id)
          .single()
        if (profileError) {
          console.error("Error fetching profile:", profileError?.message || profileError)
        } else {
          setProfile(profileData)
        }
        if (profileData?.studio_id) {
          const { data, error } = await supabase.from("studios").select("*").eq("id", profileData.studio_id).single()
          if (error) {
            console.error("Error fetching studio:", error?.message || error)
          } else {
            setStudio(data)
            setAppointmentSettings((prev) => ({
              ...prev,
              allowOnlineBooking: data.allow_online_booking ?? prev.allowOnlineBooking,
              requireDeposit: data.require_deposit ?? prev.requireDeposit,
              depositAmount: data.deposit_amount ?? prev.depositAmount,
              depositPercentage: data.deposit_percentage ?? prev.depositPercentage,
            }))
          }
          await fetchTeamMembers(profileData.studio_id)
        }
      }
      setLoading(false)
    }

    fetchStudio()
  }, [])

  useEffect(() => {
    if (!studio?.id) return
    const loadLinks = async () => {
      const response = await fetch("/api/booking-links")
      if (!response.ok) return
      const data = await response.json()
      setBookingLinks(data || [])
    }
    loadLinks()
  }, [studio?.id])

  useEffect(() => {
    if (!studio?.id) return
    const loadStudioSettings = async () => {
      try {
        const response = await fetch(`/api/studios/${studio.id}/settings`)
        if (!response.ok) return
        const data = await response.json()
        if (data?.shop) {
          setShopSettings((prev) => ({ ...prev, ...data.shop }))
        }
        if (data?.appointments) {
          setAppointmentSettings((prev) => ({ ...prev, ...data.appointments }))
        }
        if (data?.payments) {
          setPaymentSettings((prev) => ({ ...prev, ...data.payments }))
        }
        if (data?.appearance) {
          setAppearanceSettings((prev) => ({ ...prev, ...data.appearance }))
        }
        if (data?.security) {
          setSecuritySettings((prev) => ({ ...prev, ...data.security }))
        }
      } finally {
        setHasLoadedStudioSettings(true)
        setHasLoadedAppointmentSettings(true)
      }
    }
    loadStudioSettings()
  }, [studio?.id])

  useEffect(() => {
    const fetchNotificationSettings = async () => {
      try {
        const res = await fetch("/api/notification-settings")
        if (!res.ok) return
        const data = await res.json()
        setNotificationSettings({
          emailEnabled: !!data.email_enabled,
          smsEnabled: !!data.sms_enabled,
          inAppEnabled: !!data.in_app_enabled,
          newBookings: !!data.new_bookings,
          cancellations: !!data.cancellations,
          payments: !!data.payments,
          reviews: !!data.reviews,
          reminders: !!data.reminders,
          reminderTime: data.reminder_time ?? 24,
          notifyNewConversation: !!data.notify_new_conversation,
          notifyNewMessage: !!data.notify_new_message,
        })
      } catch (error) {
        console.error("Error loading notification settings:", error)
      } finally {
        setHasLoadedNotificationSettings(true)
      }
    }

    fetchNotificationSettings()
  }, [])

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "NA"
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return (parts[0][0] || "N").toUpperCase()
    return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase()
  }

  const uploadProfileAvatar = async (file: File) => {
    setIsUploadingAvatar(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const safeName = file.name.replace(/\s+/g, "-")
      const path = `profiles/${user.id}/${Date.now()}-${safeName}`

      const { error } = await supabase.storage.from("portfolio-images").upload(path, file, {
        upsert: true,
        contentType: file.type,
      })
      if (error) throw error

      const { data } = supabase.storage.from("portfolio-images").getPublicUrl(path)
      const avatarUrl = data.publicUrl

      const { error: updateError } = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", user.id)
      if (updateError) throw updateError

      setProfile((prev: any) => ({ ...(prev || {}), avatar_url: avatarUrl }))
    } catch (error) {
      console.error("Failed to upload profile avatar", error)
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const createUser = async () => {
    if (!profile?.studio_id) return
    const response = await fetch("/api/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: createUserData.email,
        password: createUserData.password,
        role: createUserData.role,
        studio_id: profile.studio_id,
        full_name: createUserData.full_name,
      }),
    })

    if (response.ok) {
      const { user } = await response.json()
      if (pendingArtistId && user?.id) {
        await fetch(`/api/artists/${pendingArtistId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user.id }),
        })
      }
      setIsCreateUserOpen(false)
      setPendingArtistId(null)
      setCreateUserData({ full_name: "", email: "", password: "", role: "artist" })
      await fetchTeamMembers(profile.studio_id)
    } else {
      const { error } = await response.json()
      console.error("Failed to create user:", error)
    }
  }

  const connectArtistToUser = async () => {
    if (!connectProfileId || !connectArtistId) return
    const response = await fetch(`/api/artists/${connectArtistId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: connectProfileId }),
    })

    if (response.ok && profile?.studio_id) {
      setIsConnectArtistOpen(false)
      setConnectProfileId(null)
      setConnectArtistId("")
      await fetchTeamMembers(profile.studio_id)
    } else {
      console.error("Failed to connect artist to user")
    }
  }

  const openEditMember = (member: any) => {
    setSelectedMember(member)
    setIsEditMemberOpen(true)
  }

  const openResetPassword = (member: any) => {
    setSelectedMember(member)
    setResetPasswordValue("")
    setIsResetPasswordOpen(true)
  }

  const saveMemberEdits = async () => {
    if (!selectedMember) return
    const response = await fetch(`/api/team-members/${selectedMember.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: selectedMember.full_name,
        email: selectedMember.email,
        role: selectedMember.role,
      }),
    })

    if (response.ok && profile?.studio_id) {
      setIsEditMemberOpen(false)
      setSelectedMember(null)
      await fetchTeamMembers(profile.studio_id)
    } else {
      const { error } = await response.json()
      console.error("Failed to update member:", error)
    }
  }

  const resetMemberPassword = async () => {
    if (!selectedMember || !resetPasswordValue) return
    const response = await fetch(`/api/team-members/${selectedMember.id}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: resetPasswordValue }),
    })

    if (response.ok) {
      setIsResetPasswordOpen(false)
      setSelectedMember(null)
      setResetPasswordValue("")
    } else {
      const { error } = await response.json()
      console.error("Failed to reset password:", error)
    }
  }

  const scheduleSectionSave = (section: string, callback: () => void) => {
    const existingTimeout = saveTimeoutsRef.current[section]
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }
    saveTimeoutsRef.current[section] = setTimeout(() => {
      callback()
    }, 800)
  }

  const updateSavingState = (section: keyof typeof savingSections, isSaving: boolean) => {
    setSavingSections((prev) => ({ ...prev, [section]: isSaving }))
  }

  const saveStudioSettingsSection = async (section: keyof typeof savingSections, data: any) => {
    if (!studio?.id) return
    updateSavingState(section, true)
    try {
      const response = await fetch(`/api/studios/${studio.id}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, data }),
      })
      if (!response.ok) {
        const message = await response.text()
        console.error(`Failed to auto-save ${section} settings`, message)
        return
      }
      setLastSavedAt((prev) => ({ ...prev, [section]: new Date().toLocaleTimeString() }))
    } finally {
      updateSavingState(section, false)
    }
  }

  const saveNotificationSettings = async (settingsOverride?: typeof notificationSettings) => {
    updateSavingState("notifications", true)
    const settingsPayload = settingsOverride || notificationSettings
    try {
      const response = await fetch("/api/notification-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_enabled: settingsPayload.emailEnabled,
          sms_enabled: settingsPayload.smsEnabled,
          in_app_enabled: settingsPayload.inAppEnabled,
          new_bookings: settingsPayload.newBookings,
          cancellations: settingsPayload.cancellations,
          payments: settingsPayload.payments,
          reviews: settingsPayload.reviews,
          reminders: settingsPayload.reminders,
          reminder_time: settingsPayload.reminderTime,
          notify_new_conversation: settingsPayload.notifyNewConversation,
          notify_new_message: settingsPayload.notifyNewMessage,
        }),
      })
      if (!response.ok) {
        const message = await response.text()
        console.error("Failed to auto-save notification settings", message)
        return
      }
      setLastSavedAt((prev) => ({ ...prev, notifications: new Date().toLocaleTimeString() }))
    } catch (error) {
      console.error("Failed to auto-save notification settings", error)
    } finally {
      updateSavingState("notifications", false)
    }
  }

  const handleSaveAppointmentSettings = async (settingsOverride?: typeof appointmentSettings) => {
    if (!studio?.id) return
    updateSavingState("appointments", true)
    try {
      const sourceSettings = settingsOverride || appointmentSettings
      const normalizedDepositAmount = Number.isFinite(sourceSettings.depositAmount)
        ? sourceSettings.depositAmount
        : 0
      const normalizedPayload = {
        ...sourceSettings,
        requireDeposit: !!sourceSettings.requireDeposit,
        depositPercentage: !!sourceSettings.depositPercentage,
        depositAmount: normalizedDepositAmount,
      }

      const response = await fetch(`/api/studios/${studio.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          allow_online_booking: normalizedPayload.allowOnlineBooking,
          require_deposit: normalizedPayload.requireDeposit,
          deposit_amount: normalizedPayload.depositAmount,
          deposit_percentage: normalizedPayload.depositPercentage,
        }),
      })
      if (!response.ok) {
        const message = await response.text()
        console.error("Failed to save appointment settings", message)
        return
      }
      const data = await response.json()
      if (Array.isArray(data) && data[0]) {
        setStudio(data[0])
      } else if (data) {
        setStudio(data)
      }
      if (normalizedPayload.depositAmount !== appointmentSettings.depositAmount) {
        setAppointmentSettings((prev) => ({ ...prev, depositAmount: normalizedPayload.depositAmount }))
      }
      await saveStudioSettingsSection("appointments", normalizedPayload)
    } finally {
      updateSavingState("appointments", false)
    }
  }

  const handleCreateBookingLink = async () => {
    const bookingSlug = newBookingLink.booking_slug.trim()
    if (!bookingSlug) return
    setIsCreatingLink(true)
    try {
      const response = await fetch("/api/booking-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_slug: bookingSlug,
          label: newBookingLink.label || null,
          source: newBookingLink.source || null,
        }),
      })
      if (!response.ok) {
        console.error("Failed to create booking link")
        return
      }
      const data = await response.json()
      setBookingLinks((prev) => [data, ...prev])
      setNewBookingLink({ booking_slug: "", label: "", source: "" })
    } finally {
      setIsCreatingLink(false)
    }
  }

  const handleInputChange = (section: string, field: string, value: any) => {
    switch (section) {
      case "shop":
        setShopSettings((prev) => {
          const next = { ...prev, [field]: value }
          if (studio?.id && hasLoadedStudioSettings) {
            scheduleSectionSave("shop", () => {
              saveStudioSettingsSection("shop", next)
            })
          }
          return next
        })
        break
      case "appointments":
        setAppointmentSettings((prev) => {
          const next = { ...prev, [field]: value }
          if (studio?.id && hasLoadedAppointmentSettings) {
            scheduleSectionSave("appointments", () => {
              handleSaveAppointmentSettings(next)
            })
          }
          return next
        })
        break
      case "notifications":
        setNotificationSettings((prev) => {
          const next = { ...prev, [field]: value }
          if (hasLoadedNotificationSettings) {
            scheduleSectionSave("notifications", () => {
              saveNotificationSettings(next)
            })
          }
          return next
        })
        break
      case "payments":
        setPaymentSettings((prev) => {
          const next = { ...prev, [field]: value }
          if (studio?.id && hasLoadedStudioSettings) {
            scheduleSectionSave("payments", () => {
              saveStudioSettingsSection("payments", next)
            })
          }
          return next
        })
        break
      case "appearance":
        setAppearanceSettings((prev) => {
          const next = { ...prev, [field]: value }
          if (studio?.id && hasLoadedStudioSettings) {
            scheduleSectionSave("appearance", () => {
              saveStudioSettingsSection("appearance", next)
            })
          }
          return next
        })
        break
      case "security":
        setSecuritySettings((prev) => {
          const next = { ...prev, [field]: value }
          if (studio?.id && hasLoadedStudioSettings) {
            scheduleSectionSave("security", () => {
              saveStudioSettingsSection("security", next)
            })
          }
          return next
        })
        break
    }
  }

  const handleBusinessHoursChange = (day: string, field: string, value: any) => {
    setShopSettings((prev) => {
      const next = {
        ...prev,
        businessHours: {
          ...prev.businessHours,
          [day]: {
            ...prev.businessHours[day as keyof typeof prev.businessHours],
            [field]: value,
          },
        },
      }
      if (studio?.id && hasLoadedStudioSettings) {
        scheduleSectionSave("shop", () => {
          saveStudioSettingsSection("shop", next)
        })
      }
      return next
    })
  }

  const formatDayName = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  const isSavingAny = Object.values(savingSections).some(Boolean)
  const activeTabSavedAt = lastSavedAt[activeTab] || "Not saved yet"

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your shop settings and preferences</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-900">
            {isSavingAny ? "Saving..." : "Auto-save enabled"}
          </Badge>
          <span className="text-sm text-muted-foreground">Last saved: {activeTabSavedAt}</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="shop" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            Shop Info
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Appointments
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        {/* Shop Information */}
        <TabsContent value="shop" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Update your account avatar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>{getInitials(profile?.full_name)}</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <input
                    id="profile-avatar-upload"
                    type="file"
                    accept="image/*"
                    disabled={isUploadingAvatar}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        uploadProfileAvatar(file)
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("profile-avatar-upload")?.click()}
                    disabled={isUploadingAvatar}
                  >
                    Upload Profile Pic
                  </Button>
                  {isUploadingAvatar && <p className="text-xs text-muted-foreground">Uploading...</p>}
                  <div className="text-sm text-muted-foreground">
                    {profile?.full_name || "Your account"} · {profile?.email || ""}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update your shop's basic information and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shop-name">Shop Name</Label>
                  <Input
                    id="shop-name"
                    value={shopSettings.name}
                    onChange={(e) => handleInputChange("shop", "name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shop-phone">Phone Number</Label>
                  <Input
                    id="shop-phone"
                    value={shopSettings.phone}
                    onChange={(e) => handleInputChange("shop", "phone", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shop-description">Description</Label>
                <Textarea
                  id="shop-description"
                  value={shopSettings.description}
                  onChange={(e) => handleInputChange("shop", "description", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shop-email">Email</Label>
                  <Input
                    id="shop-email"
                    type="email"
                    value={shopSettings.email}
                    onChange={(e) => handleInputChange("shop", "email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shop-website">Website</Label>
                  <Input
                    id="shop-website"
                    value={shopSettings.website}
                    onChange={(e) => handleInputChange("shop", "website", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
              <CardDescription>Your shop's physical location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shop-address">Street Address</Label>
                <Input
                  id="shop-address"
                  value={shopSettings.address}
                  onChange={(e) => handleInputChange("shop", "address", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shop-city">City</Label>
                  <Input
                    id="shop-city"
                    value={shopSettings.city}
                    onChange={(e) => handleInputChange("shop", "city", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shop-state">State</Label>
                  <Input
                    id="shop-state"
                    value={shopSettings.state}
                    onChange={(e) => handleInputChange("shop", "state", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shop-zip">ZIP Code</Label>
                  <Input
                    id="shop-zip"
                    value={shopSettings.zipCode}
                    onChange={(e) => handleInputChange("shop", "zipCode", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shop-timezone">Time Zone</Label>
                <Select
                  value={shopSettings.timezone}
                  onValueChange={(value) => handleInputChange("shop", "timezone", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeZones.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Business Hours</CardTitle>
              <CardDescription>Set your operating hours for each day of the week</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(shopSettings.businessHours).map(([day, hours]) => (
                <div key={day} className="flex items-center gap-4">
                  <div className="w-24">
                    <Label className="font-medium">{formatDayName(day)}</Label>
                  </div>
                  <Switch
                    checked={!hours.closed}
                    onCheckedChange={(checked) => handleBusinessHoursChange(day, "closed", !checked)}
                  />
                  {!hours.closed && (
                    <>
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={hours.open}
                          onChange={(e) => handleBusinessHoursChange(day, "open", e.target.value)}
                          className="w-32"
                        />
                        <span className="text-muted-foreground">to</span>
                        <Input
                          type="time"
                          value={hours.close}
                          onChange={(e) => handleBusinessHoursChange(day, "close", e.target.value)}
                          className="w-32"
                        />
                      </div>
                    </>
                  )}
                  {hours.closed && <span className="text-muted-foreground">Closed</span>}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointment Settings */}
        <TabsContent value="appointments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Default Settings</CardTitle>
              <CardDescription>Configure default appointment settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default-duration">Default Duration (minutes)</Label>
                  <Input
                    id="default-duration"
                    type="number"
                    value={appointmentSettings.defaultDuration}
                    onChange={(e) =>
                      handleInputChange("appointments", "defaultDuration", Number.parseInt(e.target.value))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buffer-time">Buffer Time (minutes)</Label>
                  <Input
                    id="buffer-time"
                    type="number"
                    value={appointmentSettings.bufferTime}
                    onChange={(e) => handleInputChange("appointments", "bufferTime", Number.parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max-advance">Maximum Advance Booking (days)</Label>
                  <Input
                    id="max-advance"
                    type="number"
                    value={appointmentSettings.maxAdvanceBooking}
                    onChange={(e) =>
                      handleInputChange("appointments", "maxAdvanceBooking", Number.parseInt(e.target.value))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min-advance">Minimum Advance Booking (hours)</Label>
                  <Input
                    id="min-advance"
                    type="number"
                    value={appointmentSettings.minAdvanceBooking}
                    onChange={(e) =>
                      handleInputChange("appointments", "minAdvanceBooking", Number.parseInt(e.target.value))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cancellation-window">Cancellation Window (hours)</Label>
                <Input
                  id="cancellation-window"
                  type="number"
                  value={appointmentSettings.cancellationWindow}
                  onChange={(e) =>
                    handleInputChange("appointments", "cancellationWindow", Number.parseInt(e.target.value))
                  }
                />
                <p className="text-sm text-muted-foreground">Clients must cancel at least this many hours in advance</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deposit Settings</CardTitle>
              <CardDescription>Configure deposit requirements for appointments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Deposit</Label>
                  <p className="text-sm text-muted-foreground">Require clients to pay a deposit when booking</p>
                </div>
                <Switch
                  checked={appointmentSettings.requireDeposit}
                  onCheckedChange={(checked) => handleInputChange("appointments", "requireDeposit", checked)}
                />
              </div>

              {appointmentSettings.requireDeposit && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="fixed-amount"
                        name="deposit-type"
                        checked={!appointmentSettings.depositPercentage}
                        onChange={() => handleInputChange("appointments", "depositPercentage", false)}
                      />
                      <Label htmlFor="fixed-amount">Fixed Amount</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="percentage"
                        name="deposit-type"
                        checked={appointmentSettings.depositPercentage}
                        onChange={() => handleInputChange("appointments", "depositPercentage", true)}
                      />
                      <Label htmlFor="percentage">Percentage</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deposit-amount">
                      Deposit {appointmentSettings.depositPercentage ? "Percentage" : "Amount"}
                    </Label>
                    <div className="flex items-center gap-2">
                      {!appointmentSettings.depositPercentage && (
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Input
                        id="deposit-amount"
                        type="number"
                        value={appointmentSettings.depositAmount}
                        onChange={(e) =>
                          handleInputChange(
                            "appointments",
                            "depositAmount",
                            Number.isFinite(Number.parseFloat(e.target.value))
                              ? Number.parseFloat(e.target.value)
                              : 0,
                          )
                        }
                        className="w-32"
                      />
                      {appointmentSettings.depositPercentage && <span className="text-muted-foreground">%</span>}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Booking Options</CardTitle>
              <CardDescription>Configure how clients can book appointments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-Confirm Appointments</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically confirm new bookings without manual review
                  </p>
                </div>
                <Switch
                  checked={appointmentSettings.autoConfirm}
                  onCheckedChange={(checked) => handleInputChange("appointments", "autoConfirm", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Online Booking</Label>
                  <p className="text-sm text-muted-foreground">Let clients book appointments through your website</p>
                </div>
                <Switch
                  checked={appointmentSettings.allowOnlineBooking}
                  onCheckedChange={(checked) => handleInputChange("appointments", "allowOnlineBooking", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Send Reminders</Label>
                  <p className="text-sm text-muted-foreground">Automatically send appointment reminders to clients</p>
                </div>
                <Switch
                  checked={appointmentSettings.reminderEnabled}
                  onCheckedChange={(checked) => handleInputChange("appointments", "reminderEnabled", checked)}
                />
              </div>

              {appointmentSettings.reminderEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="reminder-time">Reminder Time (hours before appointment)</Label>
                  <Input
                    id="reminder-time"
                    type="number"
                    value={appointmentSettings.reminderTime}
                    onChange={(e) => handleInputChange("appointments", "reminderTime", Number.parseInt(e.target.value))}
                    className="w-32"
                  />
                </div>
              )}
              <div className="flex justify-end text-xs text-slate-500">
                {savingSections.appointments ? "Saving..." : "Changes auto-save"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Public Booking Links</CardTitle>
              <CardDescription>Create shareable links for socials and your website.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="booking-slug">Booking Slug</Label>
                  <Input
                    id="booking-slug"
                    placeholder="summer-campaign"
                    value={newBookingLink.booking_slug}
                    onChange={(e) => setNewBookingLink({ ...newBookingLink, booking_slug: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="booking-label">Label</Label>
                  <Input
                    id="booking-label"
                    placeholder="Instagram bio link"
                    value={newBookingLink.label}
                    onChange={(e) => setNewBookingLink({ ...newBookingLink, label: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="booking-source">Source</Label>
                  <Input
                    id="booking-source"
                    placeholder="instagram"
                    value={newBookingLink.source}
                    onChange={(e) => setNewBookingLink({ ...newBookingLink, source: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleCreateBookingLink} disabled={isCreatingLink}>
                  {isCreatingLink ? "Creating..." : "Create Link"}
                </Button>
              </div>

              <div className="space-y-3">
                {bookingLinks.length === 0 && (
                  <p className="text-sm text-muted-foreground">No booking links created yet.</p>
                )}
                {bookingLinks.map((link) => {
                  const baseUrl =
                    typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || ""
                  return (
                    <div key={link.id} className="rounded-lg border border-slate-200 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="font-medium">{link.label || link.booking_slug}</div>
                          <div className="text-xs text-muted-foreground">{link.source || "general"}</div>
                        </div>
                        <Badge variant={link.is_active ? "default" : "secondary"}>
                          {link.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      {studio?.id && (
                        <div className="mt-2 break-all text-xs text-slate-600">
                          {baseUrl}/studios/{studio.id}/book/{link.booking_slug}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Management */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>Manage user accounts and permissions</CardDescription>
                </div>
                <Button onClick={() => {
                  setPendingArtistId(null)
                  setIsCreateUserOpen(true)
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>{getInitials(member.full_name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.full_name || "Unnamed User"}</div>
                        <div className="text-sm text-muted-foreground">{member.email || "No email"}</div>
                        {member.role === "artist" && (
                          <div className="text-xs text-muted-foreground">
                            Artist: {member.artist?.name || "Not connected"}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={member.role === "admin" ? "default" : "secondary"}>{member.role}</Badge>
                      {member.role === "artist" && !member.artist && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setConnectProfileId(member.id)
                            setIsConnectArtistOpen(true)
                          }}
                        >
                          Connect Artist
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => openEditMember(member)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openResetPassword(member)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {availableArtists.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Artists Without User Accounts</CardTitle>
                <CardDescription>Connect each artist to a user account.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {availableArtists.map((artist) => (
                    <div key={artist.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="text-sm font-medium">{artist.name}</div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPendingArtistId(artist.id)
                            setCreateUserData((prev) => ({ ...prev, role: "artist" }))
                            setIsCreateUserOpen(true)
                          }}
                        >
                          Create User + Connect
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setConnectProfileId(null)
                            setConnectArtistId(artist.id)
                            setIsConnectArtistOpen(true)
                          }}
                        >
                          Connect Existing User
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>User Roles</CardTitle>
              <CardDescription>Available user roles and their permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roles.map((role) => (
                  <div key={role.value} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{role.label}</div>
                        <div className="text-sm text-muted-foreground">{role.description}</div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Permissions
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>Create a user account for your studio.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="new-user-name">Full Name</Label>
                <Input
                  id="new-user-name"
                  value={createUserData.full_name}
                  onChange={(e) => setCreateUserData({ ...createUserData, full_name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-user-email">Email</Label>
                <Input
                  id="new-user-email"
                  type="email"
                  value={createUserData.email}
                  onChange={(e) => setCreateUserData({ ...createUserData, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-user-password">Temporary Password</Label>
                <Input
                  id="new-user-password"
                  type="password"
                  value={createUserData.password}
                  onChange={(e) => setCreateUserData({ ...createUserData, password: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Role</Label>
                <Select
                  value={createUserData.role}
                  onValueChange={(value) => setCreateUserData({ ...createUserData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateUserOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createUser} disabled={!createUserData.email || !createUserData.password}>
                Create User
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isConnectArtistOpen} onOpenChange={setIsConnectArtistOpen}>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle>Connect Artist</DialogTitle>
              <DialogDescription>Select an artist to link to this user.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Select value={connectArtistId} onValueChange={setConnectArtistId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select artist" />
                </SelectTrigger>
                <SelectContent>
                  {availableArtists.map((artist) => (
                    <SelectItem key={artist.id} value={artist.id}>
                      {artist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsConnectArtistOpen(false)}>
                Cancel
              </Button>
              <Button onClick={connectArtistToUser} disabled={!connectArtistId}>
                Connect
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditMemberOpen} onOpenChange={setIsEditMemberOpen}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Edit Team Member</DialogTitle>
              <DialogDescription>Update name, email, or role.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-member-name">Full Name</Label>
                <Input
                  id="edit-member-name"
                  value={selectedMember?.full_name || ""}
                  onChange={(e) =>
                    setSelectedMember((prev: any) => ({ ...prev, full_name: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-member-email">Email</Label>
                <Input
                  id="edit-member-email"
                  type="email"
                  value={selectedMember?.email || ""}
                  onChange={(e) =>
                    setSelectedMember((prev: any) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Role</Label>
                <Select
                  value={selectedMember?.role || "artist"}
                  onValueChange={(value) =>
                    setSelectedMember((prev: any) => ({ ...prev, role: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditMemberOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveMemberEdits}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>Set a temporary password for this user.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="reset-password">Temporary Password</Label>
                <Input
                  id="reset-password"
                  type="password"
                  value={resetPasswordValue}
                  onChange={(e) => setResetPasswordValue(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsResetPasswordOpen(false)}>
                Cancel
              </Button>
              <Button onClick={resetMemberPassword} disabled={!resetPasswordValue}>
                Reset Password
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
              <CardDescription>Choose how you want to receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  checked={notificationSettings.emailEnabled}
                  onCheckedChange={(checked) => handleInputChange("notifications", "emailEnabled", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via text message</p>
                </div>
                <Switch
                  checked={notificationSettings.smsEnabled}
                  onCheckedChange={(checked) => handleInputChange("notifications", "smsEnabled", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>In-app Notifications</Label>
                  <p className="text-sm text-muted-foreground">Show notifications in the app</p>
                </div>
                <Switch
                  checked={notificationSettings.inAppEnabled}
                  onCheckedChange={(checked) => handleInputChange("notifications", "inAppEnabled", checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Messaging Notifications</CardTitle>
              <CardDescription>Choose which messaging events notify you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Conversations</Label>
                  <p className="text-sm text-muted-foreground">When someone starts a conversation with you</p>
                </div>
                <Switch
                  checked={notificationSettings.notifyNewConversation}
                  onCheckedChange={(checked) => handleInputChange("notifications", "notifyNewConversation", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Messages</Label>
                  <p className="text-sm text-muted-foreground">When you receive a new message</p>
                </div>
                <Switch
                  checked={notificationSettings.notifyNewMessage}
                  onCheckedChange={(checked) => handleInputChange("notifications", "notifyNewMessage", checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Types</CardTitle>
              <CardDescription>Choose which events trigger notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Bookings</Label>
                  <p className="text-sm text-muted-foreground">When a new appointment is booked</p>
                </div>
                <Switch
                  checked={notificationSettings.newBookings}
                  onCheckedChange={(checked) => handleInputChange("notifications", "newBookings", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Cancellations</Label>
                  <p className="text-sm text-muted-foreground">When an appointment is cancelled</p>
                </div>
                <Switch
                  checked={notificationSettings.cancellations}
                  onCheckedChange={(checked) => handleInputChange("notifications", "cancellations", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Payments</Label>
                  <p className="text-sm text-muted-foreground">When payments are received</p>
                </div>
                <Switch
                  checked={notificationSettings.payments}
                  onCheckedChange={(checked) => handleInputChange("notifications", "payments", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Reviews</Label>
                  <p className="text-sm text-muted-foreground">When new reviews are received</p>
                </div>
                <Switch
                  checked={notificationSettings.reviews}
                  onCheckedChange={(checked) => handleInputChange("notifications", "reviews", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Appointment Reminders</Label>
                  <p className="text-sm text-muted-foreground">Daily summary of upcoming appointments</p>
                </div>
                <Switch
                  checked={notificationSettings.reminders}
                  onCheckedChange={(checked) => handleInputChange("notifications", "reminders", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Accepted Payment Methods</CardTitle>
              <CardDescription>Choose which payment methods you accept</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label>Cash</Label>
                  <Switch
                    checked={paymentSettings.acceptCash}
                    onCheckedChange={(checked) => handleInputChange("payments", "acceptCash", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Credit/Debit Cards</Label>
                  <Switch
                    checked={paymentSettings.acceptCards}
                    onCheckedChange={(checked) => handleInputChange("payments", "acceptCards", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Venmo</Label>
                  <Switch
                    checked={paymentSettings.acceptVenmo}
                    onCheckedChange={(checked) => handleInputChange("payments", "acceptVenmo", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Cash App</Label>
                  <Switch
                    checked={paymentSettings.acceptCashApp}
                    onCheckedChange={(checked) => handleInputChange("payments", "acceptCashApp", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stripe Configuration</CardTitle>
              <CardDescription>Configure your Stripe payment processing</CardDescription>
            </CardHeader>
            <CardContent>
              {studio ? (
                <ConnectStripe studio={studio} />
              ) : (
                <p>Could not load studio information.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fees & Charges</CardTitle>
              <CardDescription>Configure additional fees and charges</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="processing-fee">Processing Fee (%)</Label>
                  <Input
                    id="processing-fee"
                    type="number"
                    step="0.1"
                    value={paymentSettings.processingFee}
                    onChange={(e) => handleInputChange("payments", "processingFee", Number.parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cancellation-fee">Cancellation Fee ($)</Label>
                  <Input
                    id="cancellation-fee"
                    type="number"
                    value={paymentSettings.cancellationFee}
                    onChange={(e) => handleInputChange("payments", "cancellationFee", Number.parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="late-fee">Late Fee ($)</Label>
                  <Input
                    id="late-fee"
                    type="number"
                    value={paymentSettings.lateFee}
                    onChange={(e) => handleInputChange("payments", "lateFee", Number.parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>Customize the look and feel of your application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Color Theme</Label>
                <Select
                  value={appearanceSettings.theme}
                  onValueChange={(value) => handleInputChange("appearance", "theme", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={appearanceSettings.primaryColor}
                      onChange={(e) => handleInputChange("appearance", "primaryColor", e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={appearanceSettings.primaryColor}
                      onChange={(e) => handleInputChange("appearance", "primaryColor", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accent-color">Accent Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="accent-color"
                      type="color"
                      value={appearanceSettings.accentColor}
                      onChange={(e) => handleInputChange("appearance", "accentColor", e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={appearanceSettings.accentColor}
                      onChange={(e) => handleInputChange("appearance", "accentColor", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>Upload your logo and customize your brand name</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="brand-name">Brand Name</Label>
                <Input
                  id="brand-name"
                  value={appearanceSettings.brandName}
                  onChange={(e) => handleInputChange("appearance", "brandName", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex items-center gap-4">
                  {appearanceSettings.logoUrl ? (
                    <img
                      src={appearanceSettings.logoUrl || "/placeholder.svg"}
                      alt="Logo"
                      className="w-16 h-16 object-contain border rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 border rounded flex items-center justify-center">
                      <Upload className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Button variant="outline">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Logo
                    </Button>
                    {appearanceSettings.logoUrl && (
                      <Button variant="outline" onClick={() => handleInputChange("appearance", "logoUrl", "")}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
