"use client"

import {
  Calendar,
  Users,
  MessageSquare,
  Package,
  Settings,
  Palette,
  BarChart3,
  Home,
  Share2,
  DollarSign,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Schedule",
    url: "/schedule",
    icon: Calendar,
  },
  {
    title: "Artists",
    url: "/artists",
    icon: Palette,
  },
  {
    title: "Clients",
    url: "/clients",
    icon: Users,
  },
  {
    title: "Messages",
    url: "/messages",
    icon: MessageSquare,
  },
  {
    title: "Services & Products",
    url: "/services",
    icon: Package,
  },
  {
    title: "Financials",
    url: "/financials",
    icon: DollarSign,
  },
  {
    title: "Social",
    url: "/social",
    icon: Share2,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: BarChart3,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 text-white">
            <Palette className="size-5" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">InkSchedule</h2>
            <p className="text-xs text-gray-500">Tattoo Shop Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Navigation</p>
          {navigationItems.map((item) => {
            const isActive = pathname === item.url
            return (
              <Link
                key={item.title}
                href={item.url}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-purple-100 text-purple-700" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <item.icon className="size-4" />
                {item.title}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" />
            <AvatarFallback>JS</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">John Smith</p>
            <p className="text-xs text-gray-500 truncate">Shop Owner</p>
          </div>
        </div>
      </div>
    </div>
  )
}
