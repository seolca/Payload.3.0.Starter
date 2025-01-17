import { isAdmin, isAdminOrCurrentUser, isAdminOrStripeActive, isAdminOrUserFieldMatchingCurrentUser } from '@/payload/access'
import { COLLECTION_SLUG_PRICES, COLLECTION_SLUG_PRODUCTS, COLLECTION_SLUG_SUBSCRIPTIONS, COLLECTION_SLUG_USER } from '@/payload/collections/config'
import { ensurePriceExist } from '@/payload/stripe/webhooks/price'
import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload/types'
import Stripe from 'stripe'
import type { Price } from '~/payload-types'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })

const populateProductRelationshipFieldFromStripeProductId: CollectionBeforeChangeHook = async ({ req, data }) => {
  if (!data?.stripeProductId) return data
  if (!data.stripeProductId.startsWith('prod_')) return data

  const { docs } = await req.payload.find({
    collection: COLLECTION_SLUG_PRODUCTS,
    where: { stripeID: { equals: data.stripeProductId } }
  })

  const productId = docs?.at(0)?.id || null

  if (productId) {
    data.product = productId
  }

  return data
}

const populatePrices: CollectionBeforeChangeHook = async ({ data, req }) => {
  if (!data?.stripeID) return data
  if (!data.stripeID.startsWith('prod_')) return data

  const { data: prices } = await stripe.prices.list({
    limit: 100,
    product: data.stripeID
  })

  const priceIds = prices.map((price) => price.id)

  const result = await req.payload.find({
    collection: COLLECTION_SLUG_PRICES,
    where: { stripeID: { in: priceIds } }
  })

  const docs = result.docs as unknown as Price[]
  const existingPriceIds = new Set(docs.map((doc) => doc.stripeID))

  const missingPrices = prices.filter((price) => !existingPriceIds.has(price.id))

  if (missingPrices.length > 0) {
    const newDocs = await Promise.all(
      missingPrices.map(async (price) => {
        const newPriceDoc = await ensurePriceExist(price)
        return newPriceDoc
      })
    )
    docs.push(...(newDocs.filter((doc) => doc != null) as Price[]))
  }

  data.prices = docs.map((doc) => ({ price: doc.id }))

  return data
}

const group = 'Stripe'

const access = {
  read: isAdminOrStripeActive,
  create: isAdmin,
  update: isAdmin,
  delete: isAdmin
}

export const PricingType = {
  one_time: 'One Time',
  recurring: 'Recurring'
} as const

export const PricingPlanInterval = {
  day: 'Day',
  week: 'Week',
  month: 'Month',
  year: 'Year'
} as const

export const SubscriptionStatus = {
  trialing: 'Trialing',
  active: 'Active',
  canceled: 'Canceled',
  incomplete: 'Incomplete',
  incomplete_expired: 'Incomplete Expired',
  past_due: 'Past Due',
  unpaid: 'Unpaid',
  paused: 'Paused'
} as const

const formatOptions = (obj: Record<string, string>) => Object.entries(obj).map(([key, value]) => ({ value: key, label: value }))

export const products: CollectionConfig = {
  slug: COLLECTION_SLUG_PRODUCTS,
  admin: {
    useAsTitle: 'name',
    group
  },
  access,
  hooks: {
    beforeChange: [populatePrices]
  },
  fields: [
    { name: 'active', type: 'checkbox', required: true, admin: { position: 'sidebar' } },
    { name: 'name', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'image', type: 'text' },
    {
      name: 'prices',
      type: 'array',
      fields: [
        {
          type: 'row',
          fields: [{ name: 'price', type: 'relationship', relationTo: COLLECTION_SLUG_PRICES, required: true }]
        }
      ]
    },
    {
      type: 'array',
      name: 'features',
      fields: [
        {
          type: 'text',
          name: 'title'
        }
      ]
    }
  ]
}

export const prices: CollectionConfig = {
  slug: COLLECTION_SLUG_PRICES,
  admin: {
    useAsTitle: 'id',
    group,
    defaultColumns: ['stripeID', 'product', 'unitAmount', 'currency', 'type', 'interval']
  },
  access,
  hooks: {
    beforeChange: [
      async ({ req, data, operation }) => {
        // Only run on create
        if (operation !== 'create') return data

        // Create price in Stripe
        if (!data.stripeProductId?.startsWith('prod_')) {
          throw new Error('Invalid Stripe Product ID')
        }

        try {
          const stripePrice = await stripe.prices.create({
            product: data.stripeProductId,
            unit_amount: data.unitAmount,
            currency: data.currency,
            recurring:
              data.type === 'recurring'
                ? {
                    interval: data.interval,
                    interval_count: data.intervalCount || 1
                  }
                : undefined
          })

          // Set the Stripe ID from the created price
          data.stripeID = stripePrice.id
          return data
        } catch (error) {
          console.error('Error creating Stripe price:', error)
          throw error
        }
      },
      populateProductRelationshipFieldFromStripeProductId
    ]
  },
  fields: [
    {
      name: 'stripeID',
      type: 'text',
      required: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'This will be automatically generated when the price is created'
      }
    },
    {
      name: 'stripeProductId',
      type: 'text',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'The Stripe Product ID (starts with prod_)'
      }
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: COLLECTION_SLUG_PRODUCTS,
      admin: {
        description: 'This will be automatically populated based on the Stripe Product ID',
        readOnly: true
      }
    },
    { name: 'active', type: 'checkbox', required: true, defaultValue: true, admin: { position: 'sidebar' } },
    { name: 'description', type: 'textarea' },
    {
      type: 'row',
      fields: [
        {
          name: 'unitAmount',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            description: 'Amount in cents (e.g. 1000 for $10.00)'
          }
        },
        {
          name: 'currency',
          type: 'text',
          required: true,
          defaultValue: 'usd',
          admin: {
            description: 'Three-letter currency code (e.g. usd)'
          }
        },
        { name: 'type', type: 'select', options: formatOptions(PricingType), required: true }
      ]
    },
    {
      type: 'row',
      fields: [
        {
          name: 'interval',
          type: 'select',
          options: formatOptions(PricingPlanInterval),
          admin: {
            condition: (data) => data.type === 'recurring'
          }
        },
        {
          name: 'intervalCount',
          type: 'number',
          min: 1,
          admin: {
            description: 'Number of intervals between charges',
            condition: (data) => data.type === 'recurring'
          }
        },
        {
          name: 'trialPeriodDays',
          type: 'number',
          min: 0,
          admin: {
            description: 'Number of trial days (optional)',
            condition: (data) => data.type === 'recurring'
          }
        }
      ]
    }
  ]
}

export const subscriptions: CollectionConfig = {
  slug: COLLECTION_SLUG_SUBSCRIPTIONS,
  admin: { useAsTitle: 'id', group },
  access: {
    read: isAdminOrUserFieldMatchingCurrentUser,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'user', type: 'relationship', relationTo: COLLECTION_SLUG_USER, required: true },
        { name: 'product', type: 'relationship', relationTo: COLLECTION_SLUG_PRODUCTS, required: true },
        { name: 'status', type: 'select', options: formatOptions(SubscriptionStatus), required: true }
      ]
    },
    {
      type: 'row',
      fields: [
        { name: 'created', type: 'date', admin: { readOnly: true } },
        { name: 'currentPeriodStart', type: 'date', admin: { readOnly: true } },
        { name: 'currentPeriodEnd', type: 'date', admin: { readOnly: true } }
      ]
    },
    {
      type: 'row',
      fields: [
        { name: 'endedAt', type: 'date', admin: { readOnly: true } },
        { name: 'cancelAt', type: 'date', admin: { readOnly: true } },
        { name: 'canceledAt', type: 'date', admin: { readOnly: true } },
        { name: 'cancelAtPeriodEnd', type: 'checkbox' }
      ]
    },
    {
      type: 'row',
      fields: [
        { name: 'trialStart', type: 'date', admin: { readOnly: true } },
        { name: 'trialEnd', type: 'date', admin: { readOnly: true } }
      ]
    },
    {
      label: 'Stripe',
      type: 'collapsible',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'stripeID', type: 'text', label: 'Stripe ID', admin: { readOnly: true } },
            { name: 'stripeCustomerId', type: 'text', admin: { readOnly: true } }
          ]
        }
      ]
    },
    { name: 'metadata', type: 'json' }
  ]
}
