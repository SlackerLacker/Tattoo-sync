
import { stripe } from "@/lib/stripe"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"

interface PaymentSuccessPageProps {
  searchParams: {
    session_id?: string
  }
}

export default async function PaymentSuccessPage({ searchParams }: PaymentSuccessPageProps) {
  const sessionId = searchParams.session_id

  if (!sessionId) {
    return notFound()
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const amountTotal = session.amount_total ? session.amount_total / 100 : 0
    const currency = session.currency?.toUpperCase() || "USD"

    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto bg-green-100 rounded-full p-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="mt-4 text-2xl font-bold">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Thank you for your payment. Your appointment has been confirmed.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-lg font-semibold">
                Amount Paid: {amountTotal.toFixed(2)} {currency}
              </p>
              <p className="text-sm text-gray-500 mt-1">Transaction ID: {session.id}</p>
            </div>
            <Button asChild className="mt-6 w-full">
              <Link href="/schedule">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Schedule
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error("Error retrieving Stripe session:", error)
    return (
      <div className="text-center">
        <h1 className="text-xl font-bold text-red-600">Error</h1>
        <p>Could not retrieve payment details. Please check your records.</p>
        <Button asChild className="mt-4">
          <Link href="/schedule">Back to Schedule</Link>
        </Button>
      </div>
    )
  }
}
