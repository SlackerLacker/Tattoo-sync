import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AppSidebar } from "@/components/app-sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "InkSchedule - Tattoo Shop Management",
  description: "Professional scheduling platform for tattoo shops",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen bg-gray-100">
          <AppSidebar />
          <main className="flex-1 flex flex-col overflow-hidden">
            <header className="bg-white border-b border-gray-200 px-6 py-4">
              <h1 className="text-xl font-semibold text-gray-800">InkSchedule</h1>
            </header>
            <div className="flex-1 overflow-auto p-6 bg-gray-50">{children}</div>
          </main>
        </div>
      </body>
    </html>
  )
}
