
import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
<<<<<<< HEAD
  apiVersion: "2024-04-10",
=======
  apiVersion: "2025-09-30.clover",
>>>>>>> jules-5480036992904768726-6ad232be
  typescript: true,
})
