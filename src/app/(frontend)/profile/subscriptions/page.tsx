import { PaymentMethodIcon } from '@/components/PaymentMethodIcon'
import { Badge, BadgeProps } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { getCurrentUser, getPayload } from '@/lib/payload'
import { COLLECTION_SLUG_SUBSCRIPTIONS } from '@/payload/collections/config'
import { Button } from '@/components/ui/Button'
import { ArrowUpRightIcon } from 'lucide-react'
import Stripe from 'stripe'
import ManageSubscriptionButton from './ManageSubscriptionButton'
import { Alert } from '@/components/ui/Alert'
import { Subscription } from '~/payload-types'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })

export default async function SubscriptionsPage() {
  const user = await getCurrentUser()
  const payload = await getPayload()

  // Get subscription from our database
  const { docs: subscriptions } = await payload.find({
    collection: COLLECTION_SLUG_SUBSCRIPTIONS,
    where: {
      stripeCustomerId: { equals: user?.stripeCustomerId }
    }
  })
  const subscription = (subscriptions?.at(0) || null) as Subscription | null

  // Get subscription directly from Stripe for verification
  let stripeSubscription = null
  let stripePlan = null
  let stripeProduct = null
  if (user?.stripeCustomerId) {
    const stripeSubscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'all',
      expand: ['data.default_payment_method', 'data.items.data.price']
    })
    stripeSubscription = stripeSubscriptions.data[0]
    if (stripeSubscription) {
      stripePlan = stripeSubscription.items.data[0]?.price
      if (stripePlan?.product && typeof stripePlan.product === 'string') {
        stripeProduct = await stripe.products.retrieve(stripePlan.product)
      }
    }
    console.log('Stripe Subscription:', stripeSubscription)
    console.log('Database Subscription:', subscription)
  }

  // Use Stripe subscription data if available, fallback to database
  const activeSubscription = stripeSubscription?.status === 'active' ? stripeSubscription : subscription
  const productName = stripeProduct?.name || (subscription?.product && typeof subscription.product === 'object' ? subscription.product.name : null)
  const paymentMethodsList = user?.stripeCustomerId ? await stripe.paymentMethods.list({ customer: user?.stripeCustomerId }) : null
  const paymentMethods = paymentMethodsList?.data || []

  // Format price
  const formatPrice = (amount: number | null, currency: string) => {
    if (!amount) return null
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100)
  }

  const subscriptionPrice = stripePlan ? formatPrice(stripePlan.unit_amount, stripePlan.currency) : null
  const interval = stripePlan?.recurring?.interval
  const priceLabel = interval ? `${subscriptionPrice}/${interval}` : subscriptionPrice

  let subscriptionStatusColor: BadgeProps['color'] = 'green'
  const status = activeSubscription?.status
  switch (status) {
    case 'incomplete_expired':
    case 'incomplete':
    case 'paused':
    case 'past_due':
      subscriptionStatusColor = 'yellow'
      break
    case 'canceled':
    case 'unpaid':
      subscriptionStatusColor = 'red'
      break
  }

  // Helper function to format dates from either Stripe or database format
  const formatDate = (date: string | number | null | undefined) => {
    if (!date) return null
    const dateObj = typeof date === 'string' ? new Date(date) : new Date(date * 1000)
    return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  // Get the appropriate dates based on subscription type
  const renewalDate = stripeSubscription
    ? formatDate(stripeSubscription.current_period_end)
    : subscription?.currentPeriodEnd
      ? formatDate(subscription.currentPeriodEnd)
      : null

  const canceledDate = stripeSubscription ? formatDate(stripeSubscription.ended_at) : subscription?.endedAt ? formatDate(subscription.endedAt) : null

  return (
    <div className="space-y-4 md:space-y-8">
      {!activeSubscription ? (
        <Alert color="yellow" className="p-4 font-bold">
          You currently don&apos;t have a subscription.
        </Alert>
      ) : null}
      {!!activeSubscription ? (
        <Card className="dark:border-white/5 dark:bg-[#1e1e1e]">
          <CardHeader>
            <h2 className="text-2xl font-medium">Current Subscription</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <div>Plan:</div>
                <div className="text-right">
                  <div className="font-medium">{productName || 'Free'}</div>
                  {priceLabel && <div className="text-sm text-zinc-500 dark:text-zinc-400">{priceLabel}</div>}
                </div>
              </div>
              {status && (
                <div className="flex justify-between">
                  <div>Status:</div>
                  <div>
                    <Badge color={subscriptionStatusColor} duotone size="sm" className="capitalize">
                      {String(status || 'Free').replaceAll('_', ' ')}
                    </Badge>
                  </div>
                </div>
              )}
              {renewalDate && status !== 'canceled' && (
                <div className="flex justify-between">
                  <div>Renewal Date:</div>
                  <div>{renewalDate}</div>
                </div>
              )}
              {canceledDate && status === 'canceled' && (
                <div className="flex justify-between">
                  <div>Canceled Date:</div>
                  <div>{canceledDate}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}
      <Card className="dark:border-white/5 dark:bg-[#1e1e1e]">
        <CardHeader>
          <h2 className="text-2xl font-medium">Payment Methods</h2>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {paymentMethods.map((paymentMethod) => (
              <div
                key={paymentMethod.id}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md border border-zinc-200 p-4 dark:border-zinc-700 ">
                {paymentMethod?.type === 'card' && (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <PaymentMethodIcon
                        icon={paymentMethod?.card?.brand as any}
                        className="h-7 w-10 overflow-hidden rounded-md text-zinc-500 dark:text-zinc-400"
                      />
                    </div>
                    <div>
                      <div className="font-bold capitalize">{String(paymentMethod?.card?.display_brand).replace('_', ' ')}</div>
                      <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        **** {paymentMethod?.card?.last4} - Expires {paymentMethod?.card?.exp_month}/{paymentMethod?.card?.exp_year}
                      </div>
                    </div>
                    <div className="flex items-center gap-2"></div>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div>
        <ManageSubscriptionButton />
      </div>
    </div>
  )
}
