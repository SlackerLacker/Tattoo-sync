
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Studio } from "@/types"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface SettingsClientProps {
  studio: Studio
}

export default function SettingsClient({ studio }: SettingsClientProps) {
  const [accountStatus, setAccountStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/stripe/account_status")
      if (res.ok) {
        const data = await res.json()
        setAccountStatus(data)
      }
    } catch (error) {
      console.error("Failed to fetch status", error)
    } finally {
      setIsChecking(false)
    }
  }

  const handleCreateAccount = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/stripe/accounts", {
        method: "POST",
      })
      const data = await response.json()

      if (response.ok) {
        toast.success("Stripe account created!")
        fetchStatus()
      } else {
        toast.error(`Failed to create account: ${data.error || data.message}`)
      }
    } catch (error) {
      toast.error("An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOnboarding = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/stripe/account_link", {
        method: "POST",
      })
      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(`Failed to get onboarding link: ${data.error}`)
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
          <CardTitle>Stripe Integration (Connect)</CardTitle>
          <CardDescription>
            Connect your shop's Stripe account to receive payments directly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isChecking ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking status...
            </div>
          ) : (
            <>
              {(!accountStatus || accountStatus.status === 'not_created') && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    You haven't set up a payment account yet. Create one to start accepting card payments.
                  </p>
                  <Button onClick={handleCreateAccount} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Connected Account
                  </Button>
                </div>
              )}

              {accountStatus?.status === 'created' && !accountStatus.readyToProcessPayments && (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900">Action Required</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Your account has been created but needs more information to process payments.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={handleOnboarding} disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Onboard to collect payments
                    </Button>
                    <div className="text-xs text-muted-foreground">
                      ID: {accountStatus.accountId}
                    </div>
                  </div>
                </div>
              )}

              {accountStatus?.readyToProcessPayments && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900">Active</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Your account is fully set up and ready to accept payments.
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Connected Account ID: {accountStatus.accountId}
                  </div>
                  {/* Option to open dashboard could go here */}
                  <Button variant="outline" onClick={handleOnboarding}>
                    Update Payment Settings
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
