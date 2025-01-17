import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import Stripe from 'stripe'
import { EventEmitter } from 'events'

// Increase the limit of listeners to prevent warning
EventEmitter.defaultMaxListeners = 20

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-04-10'
})

export async function GET() {
  try {
    const session = await auth()
    console.log('Session:', {
      user: session?.user
        ? {
            id: session.user.id,
            email: session.user.email,
            stripeCustomerId: session.user.stripeCustomerId,
            uid: session.user.uid
          }
        : null
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user
    let customerIds: string[] = []

    // If user has a uid, find all customers with that uid
    if (user.uid) {
      console.log('Searching customers with UID:', user.uid)
      const customers = await stripe.customers.search({
        query: `metadata['uid']:'${user.uid}'`
      })
      console.log('Found customers:', customers.data)
      customerIds = customers.data.map((customer) => customer.id)
    }
    // Otherwise just use their direct stripeCustomerId if it exists
    else if (user.stripeCustomerId) {
      console.log('Using direct stripeCustomerId:', user.stripeCustomerId)
      customerIds = [user.stripeCustomerId]
    }

    console.log('Customer IDs to fetch:', customerIds)

    if (customerIds.length === 0) {
      console.log('No customer IDs found, returning empty payments')
      return NextResponse.json({ payments: [] })
    }

    // Fetch charges and invoices for all customer IDs
    const [charges, invoices] = await Promise.all([
      Promise.all(customerIds.map((customerId) => stripe.charges.list({ customer: customerId }))),
      Promise.all(customerIds.map((customerId) => stripe.invoices.list({ customer: customerId })))
    ])

    console.log(
      'Charges found:',
      charges.map((c) => c.data.length)
    )
    console.log(
      'Invoices found:',
      invoices.map((i) => i.data.length)
    )

    // Flatten and format the payment data
    const payments = [
      ...charges.flatMap((chargeList) =>
        chargeList.data.map((charge) => ({
          id: charge.id,
          amount: charge.amount,
          currency: charge.currency,
          status: charge.status,
          created: charge.created,
          receiptUrl: charge.receipt_url,
          description: charge.description
        }))
      ),
      ...invoices.flatMap((invoiceList) =>
        invoiceList.data.map((invoice) => ({
          id: invoice.id,
          amount: invoice.amount_paid,
          currency: invoice.currency,
          status: invoice.status,
          created: invoice.created,
          invoiceUrl: invoice.hosted_invoice_url,
          description: invoice.description
        }))
      )
    ].sort((a, b) => b.created - a.created)

    console.log('Total payments found:', payments.length)
    return NextResponse.json({ payments })
  } catch (error) {
    console.error('Error fetching payment history:', error)
    return NextResponse.json({ error: 'Failed to fetch payment history' }, { status: 500 })
  }
}
