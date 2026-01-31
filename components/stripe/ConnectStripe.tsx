"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Loader } from "lucide-react"
import { toast } from "sonner"

export default function ConnectStripe({
  studio,
}: {
  studio: { stripe_account_id: string; id: string }
}) {
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/stripe/account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ studio_id: studio.id }),
      })

      const data = await response.json()

      if (response.ok) {
        window.location.href = data.url
      } else {
        toast.error(data.error || "An unexpected error occurred.")
      }
    } catch (error) {
      console.error(error)
      toast.error("An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  const handleManageAccount = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/stripe/account-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stripeAccountId: studio.stripe_account_id }),
      })

      const data = await response.json()

      if (response.ok) {
        window.location.href = data.url
      } else {
        toast.error(data.error || "An unexpected error occurred.")
      }
    } catch (error) {
      console.error(error)
      toast.error("An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Connect your Stripe account</h3>
          <p className="text-sm text-gray-500">
            Securely connect your Stripe account to start accepting payments.
          </p>
        </div>
        {studio.stripe_account_id ? (
          <Button onClick={handleManageAccount} disabled={loading}>
            {loading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                <span>Redirecting...</span>
              </>
            ) : (
              <span>Manage Stripe Account</span>
            )}
          </Button>
        ) : (
          <Button onClick={handleConnect} disabled={loading}>
            {loading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                <span>Redirecting...</span>
              </>
            ) : (
              <span>Connect with Stripe</span>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
