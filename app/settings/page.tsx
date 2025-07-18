"use client"

import { useState } from "react"
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
  Store,
  Users,
  Bell,
  CreditCard,
  Palette,
  Save,
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
  { value: "owner", label: "Owner", description: "Full access to all features" },
  { value: "artist", label: "Artist", description: "Manage own appointments and clients" },
  { value: "receptionist", label: "Receptionist", description: "Manage appointments and basic client info" },
]

const users = [
  { id: 1, name: "John Smith", email: "john@inkstudio.com", role: "owner", status: "active", avatar: "JS" },
  { id: 2, name: "Mike Rodriguez", email: "mike@inkstudio.com", role: "artist", status: "active", avatar: "MR" },
  { id: 3, name: "Luna Martinez", email: "luna@inkstudio.com", role: "artist", status: "active", avatar: "LM" },
  { id: 4, name: "Sarah Kim", email: "sarah@inkstudio.com", role: "artist", status: "active", avatar: "SK" },
  { id: 5, name: "Emma Wilson", email: "emma@inkstudio.com", role: "receptionist", status: "active", avatar: "EW" },
]

export default function SettingsPage() {
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

  const [notificationSettings, setNotificationSettings] = useState({
    emailEnabled: true,
    smsEnabled: true,
    newBookings: true,
    cancellations: true,
    payments: true,
    reviews: true,
    reminders: true,
    reminderTime: 24,
  })

  const [paymentSettings, setPaymentSettings] = useState({
    acceptCash: true,
    acceptCards: true,
    acceptVenmo: true,
    acceptCashApp: true,
    acceptPayPal: false,
    stripeEnabled: true,
    stripePublishableKey: "pk_test_...",
    stripeSecretKey: "sk_test_...",
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

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const handleSave = () => {
    // In a real app, this would save to the backend
    console.log("Saving settings...")
    setHasUnsavedChanges(false)
    // Show success message
    alert("Settings saved successfully!")
  }

  const handleInputChange = (section: string, field: string, value: any) => {
    setHasUnsavedChanges(true)

    switch (section) {
      case "shop":
        setShopSettings((prev) => ({ ...prev, [field]: value }))
        break
      case "appointments":
        setAppointmentSettings((prev) => ({ ...prev, [field]: value }))
        break
      case "notifications":
        setNotificationSettings((prev) => ({ ...prev, [field]: value }))
        break
      case "payments":
        setPaymentSettings((prev) => ({ ...prev, [field]: value }))
        break
      case "appearance":
        setAppearanceSettings((prev) => ({ ...prev, [field]: value }))
        break
      case "security":
        setSecuritySettings((prev) => ({ ...prev, [field]: value }))
        break
    }
  }

  const handleBusinessHoursChange = (day: string, field: string, value: any) => {
    setHasUnsavedChanges(true)
    setShopSettings((prev) => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day as keyof typeof prev.businessHours],
          [field]: value,
        },
      },
    }))
  }

  const formatDayName = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1)
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your shop settings and preferences</p>
        </div>
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              Unsaved Changes
            </Badge>
          )}
          <Button onClick={handleSave} disabled={!hasUnsavedChanges}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
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
                          handleInputChange("appointments", "depositAmount", Number.parseInt(e.target.value))
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
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${user.avatar}`} />
                        <AvatarFallback>{user.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={user.role === "owner" ? "default" : "secondary"}>{user.role}</Badge>
                      <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {user.role !== "owner" && (
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Stripe</Label>
                  <p className="text-sm text-muted-foreground">Process credit card payments through Stripe</p>
                </div>
                <Switch
                  checked={paymentSettings.stripeEnabled}
                  onCheckedChange={(checked) => handleInputChange("payments", "stripeEnabled", checked)}
                />
              </div>

              {paymentSettings.stripeEnabled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="stripe-publishable">Publishable Key</Label>
                    <Input
                      id="stripe-publishable"
                      value={paymentSettings.stripePublishableKey}
                      onChange={(e) => handleInputChange("payments", "stripePublishableKey", e.target.value)}
                      placeholder="pk_test_..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stripe-secret">Secret Key</Label>
                    <Input
                      id="stripe-secret"
                      type="password"
                      value={paymentSettings.stripeSecretKey}
                      onChange={(e) => handleInputChange("payments", "stripeSecretKey", e.target.value)}
                      placeholder="sk_test_..."
                    />
                  </div>
                </>
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
