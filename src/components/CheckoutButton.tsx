'use client'

import { Button } from '@/components/ui/Button'
import { useState } from 'react'
import type { Price } from '~/payload-types'
import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe with the publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function CheckoutButton({ price }: { price: Price }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async () => {
    try {
      setIsLoading(true)
      console.log('Starting checkout with price:', price)

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: [
            {
              stripeProductId: price.stripeProductId,
              stripePriceId: price.stripeID,
              quantity: 1
            }
          ]
        })
      })

      const data = await response.json()
      console.log('Checkout response:', data)

      if (!response.ok) {
        const errorMessage = data.error || 'Failed to create checkout session'
        console.error('Server error:', errorMessage)
        throw new Error(errorMessage)
      }

      if (data.success && data.sessionId) {
        // Get Stripe instance
        const stripe = await stripePromise
        if (!stripe) {
          throw new Error('Failed to load Stripe')
        }

        // Redirect to Stripe Checkout
        const { error } = await stripe.redirectToCheckout({
          sessionId: data.sessionId
        })

        if (error) {
          throw error
        }
      } else {
        console.error('Invalid server response:', data)
        throw new Error('Invalid response from server')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      if (error instanceof Error) {
        alert(`Checkout failed: ${error.message}`)
      } else {
        alert('Failed to start checkout. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button className="w-full" onClick={handleCheckout} disabled={isLoading}>
      {isLoading ? 'Loading...' : 'Subscribe Now'}
    </Button>
  )
}
