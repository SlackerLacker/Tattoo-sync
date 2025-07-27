// components/AuthLayout.tsx
"use client"

import { usePathname } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideSidebar = ["/login", "/signup"].includes(pathname)

  return (
    <div className="flex h-screen bg-gray-100">
      {!hideSidebar && <AppSidebar />}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-800">InkSchedule</h1>
        </header>
        <div className="flex-1 overflow-auto p-6 bg-gray-50">{children}</div>
      </main>
    </div>
  )
}
