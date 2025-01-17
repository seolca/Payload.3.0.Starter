'use client'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card'
import { CheckoutButton } from '@/components/CheckoutButton'
import type { Product, Price } from '~/payload-types'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  console.log('Product:', product)
  console.log('Prices:', product.prices)

  // First try to find a monthly recurring price
  let displayPrice = product.prices?.find((p: { price: Price | string }) => {
    const price = p.price as Price
    return typeof price !== 'string' && price?.active && price?.type === 'recurring' && price?.interval === 'month'
  })?.price as Price | undefined

  // If no monthly price found, look for a one-time price
  if (!displayPrice) {
    displayPrice = product.prices?.find((p: { price: Price | string }) => {
      const price = p.price as Price
      return typeof price !== 'string' && price?.active && price?.type === 'one_time'
    })?.price as Price | undefined
  }

  console.log('Found display price:', displayPrice)

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <h2 className="text-xl font-semibold">{product.name}</h2>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-gray-600">{product.description}</p>
        {Array.isArray(product.features) && product.features.length > 0 && (
          <ul className="mt-4 space-y-2">
            {product.features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <svg
                  className="mr-2 h-5 w-5 text-green-500"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path d="M5 13l4 4L19 7" />
                </svg>
                {feature.title}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <CardFooter>
        {displayPrice ? (
          <div className="w-full">
            <div className="mb-4 text-center">
              <span className="text-3xl font-bold">${((displayPrice.unitAmount || 0) / 100).toFixed(2)}</span>
              {displayPrice.type === 'recurring' && displayPrice.interval && <span className="text-gray-600">/{displayPrice.interval}</span>}
            </div>
            <CheckoutButton price={displayPrice} />
          </div>
        ) : (
          <p className="text-center text-gray-500">No pricing available</p>
        )}
      </CardFooter>
    </Card>
  )
}
