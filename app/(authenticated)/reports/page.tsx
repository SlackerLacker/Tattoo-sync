"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  Download,
  Filter,
  Star,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const monthlyRevenueData = [
  { month: "Jan", revenue: 12400, appointments: 45, avgTicket: 276 },
  { month: "Feb", revenue: 15600, appointments: 52, avgTicket: 300 },
  { month: "Mar", revenue: 18200, appointments: 61, avgTicket: 298 },
  { month: "Apr", revenue: 16800, appointments: 58, avgTicket: 290 },
  { month: "May", revenue: 21300, appointments: 67, avgTicket: 318 },
  { month: "Jun", revenue: 19500, appointments: 63, avgTicket: 310 },
  { month: "Jul", revenue: 23100, appointments: 72, avgTicket: 321 },
  { month: "Aug", revenue: 20800, appointments: 65, avgTicket: 320 },
  { month: "Sep", revenue: 24500, appointments: 78, avgTicket: 314 },
  { month: "Oct", revenue: 22300, appointments: 71, avgTicket: 314 },
  { month: "Nov", revenue: 25800, appointments: 82, avgTicket: 315 },
  { month: "Dec", revenue: 27200, appointments: 85, avgTicket: 320 },
]

const serviceRevenueData = [
  { service: "Large Tattoo Session", revenue: 45600, sessions: 76, avgPrice: 600 },
  { service: "Medium Tattoo", revenue: 32400, sessions: 108, avgPrice: 300 },
  { service: "Small Tattoo", revenue: 18900, sessions: 135, avgPrice: 140 },
  { service: "Touch-up Session", revenue: 12600, sessions: 84, avgPrice: 150 },
  { service: "Consultation", revenue: 8100, sessions: 90, avgPrice: 90 },
  { service: "Fine Line Tattoo", revenue: 21600, sessions: 96, avgPrice: 225 },
]

const artistPerformanceData = [
  {
    name: "Mike Rodriguez",
    specialty: "Traditional",
    revenue: 28500,
    sessions: 95,
    rating: 4.9,
    completionRate: 98,
    avgSessionTime: 2.5,
  },
  {
    name: "Luna Martinez",
    specialty: "Fine Line",
    revenue: 22400,
    sessions: 112,
    rating: 4.8,
    completionRate: 96,
    avgSessionTime: 1.8,
  },
  {
    name: "Jake Thompson",
    specialty: "Realism",
    revenue: 31200,
    sessions: 78,
    rating: 4.9,
    completionRate: 97,
    avgSessionTime: 3.2,
  },
  {
    name: "Sarah Kim",
    specialty: "Watercolor",
    revenue: 24800,
    sessions: 89,
    rating: 4.7,
    completionRate: 95,
    avgSessionTime: 2.1,
  },
]

const paymentMethodData = [
  { method: "Credit Card", amount: 78500, percentage: 65, color: "#3b82f6" },
  { method: "Cash", amount: 28200, percentage: 23, color: "#10b981" },
  { method: "Venmo", amount: 9800, percentage: 8, color: "#8b5cf6" },
  { method: "Cash App", amount: 4900, percentage: 4, color: "#06b6d4" },
]

const clientSegmentData = [
  { segment: "New Clients", count: 45, revenue: 18900, avgSpend: 420 },
  { segment: "Returning Clients", count: 78, revenue: 52300, avgSpend: 670 },
  { segment: "VIP Clients", count: 19, revenue: 28200, avgSpend: 1485 },
]

const timeSlotData = [
  { time: "9:00 AM", bookings: 12, utilization: 75 },
  { time: "10:00 AM", bookings: 18, utilization: 90 },
  { time: "11:00 AM", bookings: 16, utilization: 80 },
  { time: "12:00 PM", bookings: 14, utilization: 70 },
  { time: "1:00 PM", bookings: 15, utilization: 75 },
  { time: "2:00 PM", bookings: 19, utilization: 95 },
  { time: "3:00 PM", bookings: 17, utilization: 85 },
  { time: "4:00 PM", bookings: 16, utilization: 80 },
  { time: "5:00 PM", bookings: 13, utilization: 65 },
  { time: "6:00 PM", bookings: 11, utilization: 55 },
]

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("12m")
  const [selectedArtist, setSelectedArtist] = useState("all")

  const totalRevenue = monthlyRevenueData.reduce((sum, month) => sum + month.revenue, 0)
  const totalAppointments = monthlyRevenueData.reduce((sum, month) => sum + month.appointments, 0)
  const avgTicketSize = totalRevenue / totalAppointments

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights into your shop's performance</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Date Range and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Date Range:</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="3m">Last 3 months</SelectItem>
                  <SelectItem value="6m">Last 6 months</SelectItem>
                  <SelectItem value="12m">Last 12 months</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Artist:</label>
              <Select value={selectedArtist} onValueChange={setSelectedArtist}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Artists</SelectItem>
                  <SelectItem value="mike">Mike Rodriguez</SelectItem>
                  <SelectItem value="luna">Luna Martinez</SelectItem>
                  <SelectItem value="jake">Jake Thompson</SelectItem>
                  <SelectItem value="sarah">Sarah Kim</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 gap-2 sm:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="artists">Artists</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-green-600 mt-1">+15.2% vs last period</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Appointments</p>
                    <p className="text-2xl font-bold">{totalAppointments}</p>
                    <p className="text-xs text-green-600 mt-1">+8.7% vs last period</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Ticket Size</p>
                    <p className="text-2xl font-bold">${Math.round(avgTicketSize)}</p>
                    <p className="text-xs text-green-600 mt-1">+6.1% vs last period</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Clients</p>
                    <p className="text-2xl font-bold">142</p>
                    <p className="text-xs text-green-600 mt-1">+12.3% vs last period</p>
                  </div>
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue & Appointments Trend</CardTitle>
              <CardDescription>Monthly performance over the last 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
                  appointments: { label: "Appointments", color: "hsl(var(--chart-2))" },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyRevenueData}>
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
                      strokeWidth={3}
                      name="Revenue ($)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="appointments"
                      stroke="var(--color-appointments)"
                      strokeWidth={3}
                      name="Appointments"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Service Revenue Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Service</CardTitle>
                <CardDescription>Performance of different service types</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={serviceRevenueData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="service" type="category" width={120} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="revenue" fill="var(--color-revenue)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Revenue distribution by payment type</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    card: { label: "Credit Card", color: "#3b82f6" },
                    cash: { label: "Cash", color: "#10b981" },
                    venmo: { label: "Venmo", color: "#8b5cf6" },
                    cashapp: { label: "Cash App", color: "#06b6d4" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentMethodData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="amount"
                        nameKey="method"
                      >
                        {paymentMethodData.map((entry, index) => (
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

          {/* Service Details Table */}
          <Card>
            <CardHeader>
              <CardTitle>Service Performance Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceRevenueData.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{service.service}</h4>
                      <p className="text-sm text-muted-foreground">{service.sessions} sessions completed</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${service.revenue.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Avg: ${service.avgPrice}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service Performance Table</CardTitle>
              <CardDescription>Scrollable table view for detailed comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-[640px] w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-4 font-medium">Service</th>
                      <th className="py-2 pr-4 font-medium">Sessions</th>
                      <th className="py-2 pr-4 font-medium">Avg Price</th>
                      <th className="py-2 pr-4 font-medium">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceRevenueData.map((service, index) => (
                      <tr key={index} className="border-b last:border-b-0">
                        <td className="py-2 pr-4">{service.service}</td>
                        <td className="py-2 pr-4">{service.sessions}</td>
                        <td className="py-2 pr-4">${service.avgPrice}</td>
                        <td className="py-2 pr-4 font-medium">${service.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Artists Tab */}
        <TabsContent value="artists" className="space-y-6">
          {/* Artist Performance Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Artist Performance Comparison</CardTitle>
              <CardDescription>Revenue and session metrics by artist</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
                  sessions: { label: "Sessions", color: "hsl(var(--chart-2))" },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={artistPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="revenue" fill="var(--color-revenue)" name="Revenue ($)" />
                    <Bar yAxisId="right" dataKey="sessions" fill="var(--color-sessions)" name="Sessions" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Artist Details */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {artistPerformanceData.map((artist, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
                      {artist.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <h3 className="font-semibold">{artist.name}</h3>
                      <p className="text-sm text-muted-foreground">{artist.specialty} Specialist</p>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Revenue</p>
                      <p className="font-bold">${artist.revenue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Sessions</p>
                      <p className="font-bold">{artist.sessions}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rating</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold">{artist.rating}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Completion Rate</p>
                      <p className="font-bold">{artist.completionRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Clients Tab */}
        <TabsContent value="clients" className="space-y-6">
          {/* Client Segmentation */}
          <Card>
            <CardHeader>
              <CardTitle>Client Segmentation</CardTitle>
              <CardDescription>Revenue and behavior by client type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {clientSegmentData.map((segment, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-2">{segment.segment}</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Count</span>
                          <span className="font-medium">{segment.count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Revenue</span>
                          <span className="font-medium">${segment.revenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Avg Spend</span>
                          <span className="font-medium">${segment.avgSpend}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Client Growth Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Client Growth Trend</CardTitle>
              <CardDescription>New vs returning clients over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  newClients: { label: "New Clients", color: "hsl(var(--chart-1))" },
                  returningClients: { label: "Returning Clients", color: "hsl(var(--chart-2))" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="appointments"
                      stackId="1"
                      stroke="var(--color-newClients)"
                      fill="var(--color-newClients)"
                      name="New Clients"
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stackId="1"
                      stroke="var(--color-returningClients)"
                      fill="var(--color-returningClients)"
                      name="Returning Clients"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operations Tab */}
        <TabsContent value="operations" className="space-y-6">
          {/* Time Slot Utilization */}
          <Card>
            <CardHeader>
              <CardTitle>Time Slot Utilization</CardTitle>
              <CardDescription>Booking patterns throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  bookings: { label: "Bookings", color: "hsl(var(--chart-1))" },
                  utilization: { label: "Utilization %", color: "hsl(var(--chart-2))" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeSlotData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="bookings" fill="var(--color-bookings)" name="Bookings" />
                    <Line
                      yAxisId="right"
                      dataKey="utilization"
                      stroke="var(--color-utilization)"
                      name="Utilization %"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Operational KPIs */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Session Duration</p>
                    <p className="text-2xl font-bold">2.4h</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                    <p className="text-2xl font-bold">96.5%</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">No-Show Rate</p>
                    <p className="text-2xl font-bold">2.1%</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Rebooking Rate</p>
                    <p className="text-2xl font-bold">68%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
