"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DollarSign,
  TrendingUp,
  Users,
  CreditCard,
  Banknote,
  Smartphone,
  Settings,
  Plus,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"

// Mock data
const mockArtists = [
  {
    id: 1,
    name: "Sarah Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    paymentStructure: "percentage",
    commissionRate: 70,
    boothRent: 0,
    totalEarnings: 4250,
    shopOwed: 850, // Amount owed to shop from cash/digital payments
    lastPayout: "2024-01-15",
    status: "active",
    rentDueDate: null,
    isOverdue: false,
  },
  {
    id: 2,
    name: "Mike Chen",
    avatar: "/placeholder.svg?height=40&width=40",
    paymentStructure: "booth_rent",
    commissionRate: 0,
    boothRent: 800,
    totalEarnings: 3200,
    shopOwed: 800, // Monthly booth rent
    lastPayout: "2024-01-10",
    status: "active",
    rentDueDate: "2024-02-01",
    isOverdue: false,
  },
  {
    id: 3,
    name: "Alex Rivera",
    avatar: "/placeholder.svg?height=40&width=40",
    paymentStructure: "percentage",
    commissionRate: 65,
    boothRent: 0,
    totalEarnings: 2800,
    shopOwed: 420,
    lastPayout: "2024-01-12",
    status: "active",
    rentDueDate: null,
    isOverdue: false,
  },
  {
    id: 4,
    name: "Emma Davis",
    avatar: "/placeholder.svg?height=40&width=40",
    paymentStructure: "booth_rent",
    commissionRate: 0,
    boothRent: 750,
    totalEarnings: 2950,
    shopOwed: 750,
    lastPayout: "2024-01-08",
    status: "active",
    rentDueDate: "2024-02-15",
    isOverdue: true,
  },
]

const mockTransactions = [
  {
    id: 1,
    artistId: 1,
    artistName: "Sarah Johnson",
    clientName: "John Doe",
    service: "Traditional Sleeve",
    amount: 450,
    paymentMethod: "cash",
    artistEarnings: 450, // Artist keeps all cash
    shopEarnings: 0, // Shop gets commission later
    shopOwed: 135, // 30% commission owed to shop
    date: "2024-01-20",
    status: "completed",
  },
  {
    id: 2,
    artistId: 1,
    artistName: "Sarah Johnson",
    clientName: "Jane Smith",
    service: "Small Tattoo",
    amount: 200,
    paymentMethod: "card",
    artistEarnings: 140, // 70% to artist
    shopEarnings: 60, // 30% to shop
    shopOwed: 0,
    date: "2024-01-19",
    status: "completed",
  },
  {
    id: 3,
    artistId: 2,
    artistName: "Mike Chen",
    clientName: "Bob Wilson",
    service: "Portrait Tattoo",
    amount: 350,
    paymentMethod: "venmo",
    artistEarnings: 350, // Artist keeps all (booth rent model)
    shopEarnings: 0,
    shopOwed: 0, // No commission in booth rent model
    date: "2024-01-18",
    status: "completed",
  },
  {
    id: 4,
    artistId: 3,
    artistName: "Alex Rivera",
    clientName: "Lisa Brown",
    service: "Geometric Design",
    amount: 300,
    paymentMethod: "cashapp",
    artistEarnings: 300, // Artist keeps all cash app
    shopEarnings: 0,
    shopOwed: 105, // 35% commission owed to shop
    date: "2024-01-17",
    status: "completed",
  },
]

const mockShopPayments = [
  {
    id: 1,
    artistId: 1,
    artistName: "Sarah Johnson",
    amount: 500,
    paymentType: "commission",
    paymentMethod: "bank_transfer",
    date: "2024-01-15",
    status: "completed",
  },
  {
    id: 2,
    artistId: 2,
    artistName: "Mike Chen",
    amount: 800,
    paymentType: "booth_rent",
    paymentMethod: "cash",
    date: "2024-01-01",
    status: "completed",
  },
]

export default function FinancialsPage() {
  const [selectedArtist, setSelectedArtist] = useState<number | null>(null)
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [shopPaymentDialogOpen, setShopPaymentDialogOpen] = useState(false)

  // Calculate totals
  const totalArtistEarnings = mockArtists.reduce((sum, artist) => sum + artist.totalEarnings, 0)
  const totalOwedToShop = mockArtists.reduce((sum, artist) => sum + artist.shopOwed, 0)
  const monthlyEarnings = 12500
  const averageCommissionRate =
    mockArtists
      .filter((a) => a.paymentStructure === "percentage")
      .reduce((sum, artist) => sum + artist.commissionRate, 0) /
    mockArtists.filter((a) => a.paymentStructure === "percentage").length

  const overdueArtists = mockArtists.filter((artist) => artist.isOverdue)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Financials</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Dialog open={shopPaymentDialogOpen} onOpenChange={setShopPaymentDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Record Shop Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Payment to Shop</DialogTitle>
                <DialogDescription>
                  Record a commission or booth rent payment from an artist to the shop.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2 sm:grid-cols-4 sm:items-center">
                  <Label htmlFor="artist" className="text-right">
                    Artist
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select artist" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockArtists.map((artist) => (
                        <SelectItem key={artist.id} value={artist.id.toString()}>
                          {artist.name} - ${artist.shopOwed} owed
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2 sm:grid-cols-4 sm:items-center">
                  <Label htmlFor="amount" className="text-right">
                    Amount
                  </Label>
                  <Input id="amount" placeholder="$0.00" className="col-span-3" />
                </div>
                <div className="grid gap-2 sm:grid-cols-4 sm:items-center">
                  <Label htmlFor="payment-method" className="text-right">
                    Method
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="venmo">Venmo</SelectItem>
                      <SelectItem value="cashapp">CashApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Record Payment</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={payoutDialogOpen} onOpenChange={setPayoutDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Process Payout
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Process Artist Payout</DialogTitle>
                <DialogDescription>Send earnings to an artist via their preferred payment method.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2 sm:grid-cols-4 sm:items-center">
                  <Label htmlFor="artist" className="text-right">
                    Artist
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select artist" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockArtists.map((artist) => (
                        <SelectItem key={artist.id} value={artist.id.toString()}>
                          {artist.name} - ${artist.totalEarnings} available
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2 sm:grid-cols-4 sm:items-center">
                  <Label htmlFor="amount" className="text-right">
                    Amount
                  </Label>
                  <Input id="amount" placeholder="$0.00" className="col-span-3" />
                </div>
                <div className="grid gap-2 sm:grid-cols-4 sm:items-center">
                  <Label htmlFor="method" className="text-right">
                    Method
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Payout method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="venmo">Venmo</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Process Payout</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Artist Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalArtistEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Available for payout</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Owed to Shop</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">${totalOwedToShop.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Commission + Rent due</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Commission Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageCommissionRate.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">Artist average</p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Alerts */}
      {overdueArtists.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Overdue Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overdueArtists.map((artist) => (
                <div key={artist.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={artist.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {artist.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{artist.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {artist.paymentStructure === "booth_rent" ? "Booth rent" : "Commission"} overdue
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-600">${artist.shopOwed}</p>
                    <p className="text-xs text-muted-foreground">Due: {artist.rentDueDate || "Now"}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="artists" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
          <TabsTrigger value="artists">Artist Earnings</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="shop-payments">Shop Payments</TabsTrigger>
          <TabsTrigger value="settings">Payment Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="artists" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Artist Financial Overview</CardTitle>
              <CardDescription>Track individual artist earnings, commissions, and payment structures</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="min-w-[900px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Artist</TableHead>
                    <TableHead>Payment Structure</TableHead>
                    <TableHead>Total Earnings</TableHead>
                    <TableHead>Owes Shop</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockArtists.map((artist) => (
                    <TableRow key={artist.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={artist.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {artist.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{artist.name}</p>
                            <p className="text-sm text-muted-foreground">Last payout: {artist.lastPayout}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <Badge variant={artist.paymentStructure === "percentage" ? "default" : "secondary"}>
                            {artist.paymentStructure === "percentage"
                              ? `${artist.commissionRate}% Commission`
                              : `$${artist.boothRent} Booth Rent`}
                          </Badge>
                          {artist.paymentStructure === "booth_rent" && artist.rentDueDate && (
                            <p className="text-xs text-muted-foreground mt-1">Due: {artist.rentDueDate}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">${artist.totalEarnings.toLocaleString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className={`font-medium ${artist.shopOwed > 0 ? "text-orange-600" : "text-green-600"}`}>
                          ${artist.shopOwed.toLocaleString()}
                          {artist.isOverdue && (
                            <Badge variant="destructive" className="ml-2 text-xs">
                              Overdue
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={artist.status === "active" ? "default" : "secondary"}>{artist.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                          <Button size="sm">Payout</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>All appointment payments with commission calculations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="min-w-[900px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Artist</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Artist Earnings</TableHead>
                    <TableHead>Shop Owed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>{transaction.artistName}</TableCell>
                      <TableCell>{transaction.clientName}</TableCell>
                      <TableCell>{transaction.service}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {transaction.paymentMethod === "cash" && <Banknote className="h-4 w-4" />}
                          {transaction.paymentMethod === "card" && <CreditCard className="h-4 w-4" />}
                          {(transaction.paymentMethod === "venmo" || transaction.paymentMethod === "cashapp") && (
                            <Smartphone className="h-4 w-4" />
                          )}
                          <span className="capitalize">{transaction.paymentMethod}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">${transaction.amount}</TableCell>
                      <TableCell className="text-green-600 font-medium">${transaction.artistEarnings}</TableCell>
                      <TableCell
                        className={`font-medium ${transaction.shopOwed > 0 ? "text-orange-600" : "text-green-600"}`}
                      >
                        {transaction.shopOwed > 0 ? `$${transaction.shopOwed}` : "$0"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shop-payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shop Payment History</CardTitle>
              <CardDescription>Payments received from artists (commissions and booth rent)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="min-w-[720px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Artist</TableHead>
                    <TableHead>Payment Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockShopPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell>{payment.artistName}</TableCell>
                      <TableCell>
                        <Badge variant={payment.paymentType === "commission" ? "default" : "secondary"}>
                          {payment.paymentType === "commission" ? "Commission" : "Booth Rent"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">${payment.amount}</TableCell>
                      <TableCell className="capitalize">{payment.paymentMethod.replace("_", " ")}</TableCell>
                      <TableCell>
                        <Badge variant={payment.status === "completed" ? "default" : "secondary"}>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {payment.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Structure Settings</CardTitle>
              <CardDescription>
                Configure how each artist pays the shop - percentage commission or booth rent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockArtists.map((artist) => (
                  <div key={artist.id} className="flex flex-col gap-4 p-4 border rounded-lg sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={artist.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {artist.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{artist.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Current:{" "}
                          {artist.paymentStructure === "percentage"
                            ? `${artist.commissionRate}% Commission`
                            : `$${artist.boothRent}/month Booth Rent`}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                      <Select defaultValue={artist.paymentStructure}>
                        <SelectTrigger className="w-full sm:w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Commission %</SelectItem>
                          <SelectItem value="booth_rent">Booth Rent</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        className="w-full sm:w-24"
                        placeholder={artist.paymentStructure === "percentage" ? "70%" : "$800"}
                        defaultValue={
                          artist.paymentStructure === "percentage" ? artist.commissionRate : artist.boothRent
                        }
                      />
                      <Button size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Update
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
