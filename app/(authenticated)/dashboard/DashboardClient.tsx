'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import type { User } from '@supabase/supabase-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Calendar, DollarSign, Users, TrendingUp, Clock, Star, MessageSquare, Plus,
  ArrowUpRight, CheckCircle, AlertCircle
} from 'lucide-react'
import {
  LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Legend, ResponsiveContainer
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const revenueData = [
  { month: "Jan", revenue: 12400, appointments: 45 },
  { month: "Feb", revenue: 15600, appointments: 52 },
  { month: "Mar", revenue: 18200, appointments: 61 },
  { month: "Apr", revenue: 16800, appointments: 58 },
  { month: "May", revenue: 21300, appointments: 67 },
  { month: "Jun", revenue: 19500, appointments: 63 },
]

const appointmentStatusData = [
  { name: "Confirmed", value: 45, color: "#10b981" },
  { name: "Pending", value: 12, color: "#f59e0b" },
  { name: "Completed", value: 128, color: "#3b82f6" },
  { name: "Cancelled", value: 8, color: "#ef4444" },
]

const topArtists = [
  { id: 1, name: "Mike Rodriguez", specialty: "Traditional", rating: 4.9, completedSessions: 34, revenue: 8500 },
  { id: 2, name: "Luna Martinez", specialty: "Fine Line", rating: 4.8, completedSessions: 28, revenue: 6720 },
  { id: 3, name: "Jake Thompson", specialty: "Realism", rating: 4.9, completedSessions: 22, revenue: 7920 },
  { id: 4, name: "Sarah Kim", specialty: "Watercolor", rating: 4.7, completedSessions: 26, revenue: 6240 },
]

const todaysSchedule = [
  {
    id: 1, client: "Sarah Johnson", artist: "Mike Rodriguez", service: "Traditional Rose",
    time: "10:00 AM", duration: 2, status: "confirmed", price: 300,
  },
  {
    id: 2, client: "David Chen", artist: "Luna Martinez", service: "Fine Line Script",
    time: "2:00 PM", duration: 1, status: "in-progress", price: 120,
  },
  {
    id: 3, client: "Emma Wilson", artist: "Jake Thompson", service: "Portrait Consultation",
    time: "4:30 PM", duration: 0.5, status: "pending", price: 90,
  },
]

const recentActivity = [
  { id: 1, type: "booking", message: "New appointment booked by Alex Rivera", time: "5 minutes ago" },
  { id: 2, type: "payment", message: "Payment received from Maria Garcia ($240)", time: "12 minutes ago" },
  { id: 3, type: "completion", message: "Session completed by Jake Thompson", time: "1 hour ago" },
  { id: 4, type: "message", message: "New message from Tom Wilson", time: "2 hours ago" },
  { id: 5, type: "review", message: "5-star review received for Luna Martinez", time: "3 hours ago" },
]

export default function DashboardClient({ user }: { user: User }) {
  const router = useRouter()
  const [timeRange, setTimeRange] = useState("30d")

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "in-progress": return "bg-purple-100 text-purple-800"
      case "completed": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed": return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending": return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case "in-progress": return <Clock className="h-4 w-4 text-purple-600" />
      case "completed": return <CheckCircle className="h-4 w-4 text-blue-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "booking": return <Calendar className="h-4 w-4 text-blue-600" />
      case "payment": return <DollarSign className="h-4 w-4 text-green-600" />
      case "completion": return <CheckCircle className="h-4 w-4 text-purple-600" />
      case "message": return <MessageSquare className="h-4 w-4 text-orange-600" />
      case "review": return <Star className="h-4 w-4 text-yellow-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.email}!</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Today
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
          <Button variant="destructive" onClick={handleLogout}>Logout</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">$21,300</p>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  +12.5% from last month
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Appointments</p>
                <p className="text-2xl font-bold">67</p>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  +8.2% from last month
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg per Appointment</p>
                <p className="text-2xl font-bold">$318</p>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  +4.1% from last month
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Clients</p>
                <p className="text-2xl font-bold">142</p>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  +15.3% from last month
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue & Appointments Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue & Appointments Trend</CardTitle>
            <CardDescription>Monthly performance over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                revenue: {
                  label: "Revenue",
                  color: "hsl(var(--chart-1))",
                },
                appointments: {
                  label: "Appointments",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                    strokeWidth={2}
                    name="Revenue ($)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="appointments"
                    stroke="var(--color-appointments)"
                    strokeWidth={2}
                    name="Appointments"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Appointment Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Appointment Status</CardTitle>
            <CardDescription>Current appointment distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                confirmed: { label: "Confirmed", color: "#10b981" },
                pending: { label: "Pending", color: "#f59e0b" },
                completed: { label: "Completed", color: "#3b82f6" },
                cancelled: { label: "Cancelled", color: "#ef4444" },
              }}
              className="h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={appointmentStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {appointmentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Artists */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Artists</CardTitle>
            <CardDescription>Artist performance this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topArtists.map((artist, index) => (
                <div key={artist.id} className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-medium">
                    {index + 1}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={`/placeholder.svg?height=40&width=40&text=${artist.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}`}
                    />
                    <AvatarFallback>
                      {artist.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{artist.name}</p>
                        <p className="text-sm text-muted-foreground">{artist.specialty}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${artist.revenue.toLocaleString()}</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{artist.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">{artist.completedSessions} sessions</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Upcoming appointments for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaysSchedule.map((appointment) => (
                <div key={appointment.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm font-medium">{appointment.time}</p>
                    <p className="text-xs text-muted-foreground">{appointment.duration}h</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{appointment.client}</p>
                        <p className="text-sm text-muted-foreground">{appointment.service}</p>
                        <p className="text-xs text-muted-foreground">with {appointment.artist}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${appointment.price}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {getStatusIcon(appointment.status)}
                          <Badge className={getStatusColor(appointment.status)} variant="secondary">
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates from your shop</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
