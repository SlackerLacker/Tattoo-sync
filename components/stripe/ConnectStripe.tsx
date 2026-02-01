"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Loader } from "lucide-react"
import { toast } from "sonner"

export default function ConnectStripe({
  studio,
}: {
  studio: { stripe_account_id: string; id: string; name?: string | null }
}) {
  const [loading, setLoading] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [requestSent, setRequestSent] = useState(false)

  const handleRequest = async () => {
    setRequesting(true)
    try {
      const response = await fetch("/api/stripe/connect-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ studio_id: studio.id }),
      })

      const data = await response.json()

      if (response.ok) {
        setRequestSent(true)
        toast.success("Request sent! We'll reach out shortly.")
      } else {
        toast.error(data.error || "An unexpected error occurred.")
      }
    } catch (error) {
      console.error(error)
      toast.error("An unexpected error occurred.")
    } finally {
      setRequesting(false)
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
          <h3 className="text-lg font-semibold">Stripe payouts</h3>
          <p className="text-sm text-gray-500">
            Request Stripe Connect access so your shop can accept card payments.
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
          <Button onClick={handleRequest} disabled={requesting || requestSent}>
            {requesting ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <span>{requestSent ? "Request sent" : "Request Stripe access"}</span>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
