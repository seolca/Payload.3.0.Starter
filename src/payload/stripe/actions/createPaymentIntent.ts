'use server'

import { getPayload } from '@/lib/payload'
import { stripe } from '../client'

type CreateCheckoutSessionResponse = { success: true; sessionId: string } | { success: false; error: string }
type CreateCheckoutSessionRedirects = { success?: string; cancel?: string }

export const createCheckoutSession = async (
  priceId: string,
  customerId: string,
  redirects: CreateCheckoutSessionRedirects = {}
): Promise<CreateCheckoutSessionResponse> => {
  const successRedirectUrl = (redirects.success || `${process.env.NEXT_PUBLIC_SITE_URL}/subscription-success`) + '?session_id={CHECKOUT_SESSION_ID}'
  const cancelRedirectUrl = redirects.cancel || `${process.env.NEXT_PUBLIC_SITE_URL}`

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: successRedirectUrl,
      cancel_url: cancelRedirectUrl,
      customer: customerId
    })

    if (!session.id) {
      return { success: false, error: 'Checkout session creation failed' }
    }

    return { success: true, sessionId: session.id }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: message }
  }
}
