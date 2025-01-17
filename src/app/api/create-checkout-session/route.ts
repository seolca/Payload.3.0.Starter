import { NextResponse } from 'next/server'
import { createCheckoutSession } from '@/payload/stripe/actions/createPaymentIntent'
import { getCurrentUser } from '@/lib/payload'

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!user.stripeCustomerId) {
      return NextResponse.json({ error: 'No Stripe customer ID found' }, { status: 400 })
    }

    const { priceId, redirects } = await req.json()
    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 })
    }

    const result = await createCheckoutSession(priceId, user.stripeCustomerId, redirects)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ sessionId: result.sessionId })
  } catch (error) {
    console.error('Error in create-checkout-session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
