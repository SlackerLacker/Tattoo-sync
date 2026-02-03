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

type RevenuePoint = { month: string; revenue: number; appointments: number }
type StatusPoint = { name: string; value: number; color: string }
type TopArtist = {
  id: string
  name: string
  specialty?: string
  rating?: number
  completedSessions: number
  revenue: number
}
type ScheduleItem = {
  id: string
  client: string
  artist: string
  service: string
  time: string
  duration: number
  status: string
  price: number
}
type ActivityItem = { id: string; type: string; message: string; time: string }
type DashboardStats = {
  totalRevenue: number
  appointments: number
  avgPerAppointment: number
  activeClients: number
}
type ChartRanges = {
  revenueRangeLabel: string
  statusRangeLabel: string
}

export default function DashboardClient({
  user,
  stats,
  revenueData,
  appointmentStatusData,
  topArtists,
  todaysSchedule,
  recentActivity,
  chartRanges,
}: {
  user: User
  stats: DashboardStats
  revenueData: RevenuePoint[]
  appointmentStatusData: StatusPoint[]
  topArtists: TopArtist[]
  todaysSchedule: ScheduleItem[]
  recentActivity: ActivityItem[]
  chartRanges: ChartRanges
}) {
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.email}!</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
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
                <p className="text-2xl font-bold">{stats.appointments}</p>
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
                <p className="text-2xl font-bold">${stats.avgPerAppointment.toLocaleString()}</p>
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
                <p className="text-2xl font-bold">{stats.activeClients}</p>
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

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Revenue & Appointments Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Appointments Trend</CardTitle>
            <CardDescription>Monthly performance for the current year</CardDescription>
            <p className="text-xs text-muted-foreground">{chartRanges.revenueRangeLabel}</p>
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
            <p className="text-xs text-muted-foreground">{chartRanges.statusRangeLabel}</p>
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

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
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
                        <p className="text-sm text-muted-foreground">{artist.specialty || "N/A"}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${artist.revenue.toLocaleString()}</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{(artist.rating || 0).toFixed(1)}</span>
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
                <div
                  key={appointment.id}
                  className="flex flex-col gap-3 p-3 bg-gray-50 rounded-lg sm:flex-row sm:items-center"
                >
                  <div className="text-center sm:text-left">
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
