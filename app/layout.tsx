import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import AuthLayout from "@/components/AuthLayout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "InkSchedule - Tattoo Shop Management",
  description: "Professional scheduling platform for tattoo shops",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthLayout>{children}</AuthLayout>
      </body>
    </html>
  )
}