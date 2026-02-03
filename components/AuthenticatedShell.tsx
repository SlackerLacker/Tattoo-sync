"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"

export default function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b bg-white px-4 py-3 md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} aria-label="Open navigation">
            <Menu className="size-5" />
          </Button>
          <span className="text-sm font-semibold text-gray-900">InkSync</span>
        </div>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  )
}
