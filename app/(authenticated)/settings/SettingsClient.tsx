
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Studio } from "@/types"

interface SettingsClientProps {
  studio: Studio
}

export default function SettingsClient({ studio }: SettingsClientProps) {
  const [stripeAccountId, setStripeAccountId] = useState(studio.stripe_account_id || "")
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/studios/${studio.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stripe_account_id: stripeAccountId }),
      })

      if (response.ok) {
        toast.success("Settings saved successfully!")
      } else {
        const errorData = await response.json()
        toast.error(`Failed to save settings: ${errorData.message}`)
      }
    } catch (error) {
      toast.error("An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Shop Settings</h1>
        <p className="text-muted-foreground">Manage your shop's integrations and settings.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Stripe Integration</CardTitle>
          <CardDescription>
            Connect your shop's Stripe account to receive payments. Find your Account ID in your Stripe Dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stripe-account-id">Stripe Account ID</Label>
            <Input
              id="stripe-account-id"
              placeholder="acct_..."
              value={stripeAccountId}
              onChange={(e) => setStripeAccountId(e.target.value)}
            />
          </div>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
