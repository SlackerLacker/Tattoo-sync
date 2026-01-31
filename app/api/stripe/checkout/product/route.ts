
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const accountId = formData.get("accountId") as string
    const priceId = formData.get("priceId") as string

    if (!accountId || !priceId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    const baseUrl = appUrl?.startsWith("http") ? appUrl : `https://${appUrl}`

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: 123, // Sample fee in cents
      },
      success_url: `${baseUrl}/shop/${accountId}?success=true`,
      cancel_url: `${baseUrl}/shop/${accountId}?canceled=true`,
    }, {
      stripeAccount: accountId,
    })

    if (session.url) {
      return NextResponse.redirect(session.url, 303)
    } else {
      throw new Error("Failed to create session URL")
    }
  } catch (error: any) {
    console.error("Product Checkout Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
