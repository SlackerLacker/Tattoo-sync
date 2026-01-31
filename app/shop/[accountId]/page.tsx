
import { stripe } from "@/lib/stripe"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// NOTE: In a production app, you should use a custom slug or database ID
// instead of exposing the Stripe Account ID directly in the URL.
export default async function Storefront({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params

  let products = []
  let error = null

  try {
    const result = await stripe.products.list({
      limit: 20,
      active: true,
      expand: ['data.default_price'],
    }, {
      stripeAccount: accountId,
    })
    products = result.data
  } catch (e: any) {
    error = e.message
  }

  if (error) {
    return <div className="p-10 text-red-500">Error loading store: {error}</div>
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Storefront</h1>

      {products.length === 0 ? (
        <p className="text-muted-foreground">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product) => {
            const price = product.default_price as any
            const priceString = price
              ? new Intl.NumberFormat('en-US', { style: 'currency', currency: price.currency }).format(price.unit_amount / 100)
              : "Price not set"

            return (
              <Card key={product.id}>
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{priceString}</div>
                  {product.images && product.images.length > 0 && (
                    <img src={product.images[0]} alt={product.name} className="mt-4 rounded-md h-48 w-full object-cover" />
                  )}
                </CardContent>
                <CardFooter>
                  <form action="/api/stripe/checkout/product" method="POST">
                    <input type="hidden" name="accountId" value={accountId} />
                    <input type="hidden" name="priceId" value={price.id} />
                    <Button type="submit" className="w-full">Buy Now</Button>
                  </form>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
