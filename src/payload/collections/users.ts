import { ADMIN_ACCESS_ROLES, DEFAULT_USER_ROLE } from '@/lib/auth/config'
import { findAuthJsCookie, getCurrentUser } from '@/lib/auth/edge'
import { revalidateUser } from '@/lib/payload/actions'
import { isAdmin, isAdminOrCurrentUser } from '@/payload/access'
import parseCookieString from '@/utils/parseCookieString'
import type { CollectionConfig } from 'payload/types'
import { COLLECTION_SLUG_SESSIONS, COLLECTION_SLUG_USER } from './config'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-04-10'
})

const ADMIN_AUTH_GROUP = 'Auth'

export const users: CollectionConfig = {
  slug: COLLECTION_SLUG_USER,
  admin: {
    group: ADMIN_AUTH_GROUP,
    useAsTitle: 'email'
  },
  endpoints: [
    {
      path: '/refresh-token',
      method: 'post',
      async handler(request) {
        if (!request?.url) return new Response('No request URL provided', { status: 400 })

        const requestUrl = new URL(request.url)
        requestUrl.pathname = '/api/auth/session'

        const newRequest = new Request(requestUrl.toString(), {
          method: 'GET',
          headers: new Headers(request.headers)
        })

        try {
          const response = await fetch(newRequest)
          const data = await response.json()

          if (!response.ok) {
            throw new Error('Failed to refresh token')
          }

          if (!data?.user) return new Response('No user found', { status: 401 })

          const responseCookies = parseCookieString(String(response.headers.get('Set-Cookie') || ''))
          const authCookie = findAuthJsCookie(responseCookies)
          if (!authCookie) return new Response('No auth cookie found', { status: 401 })
          const cookieValue = authCookie.value
          const responseBody = JSON.stringify({
            message: 'Token refresh successful',
            refreshToken: cookieValue?.value,
            exp: cookieValue && cookieValue?.expires ? Math.floor(cookieValue.expires.getTime() / 1000) : null,
            user: data.user
          })

          return new Response(responseBody, {
            status: response.status,
            headers: response.headers
          })
        } catch (error) {
          console.log(error)
          return new Response(JSON.stringify({ message: 'Token refresh failed' }), { status: 401 })
        }
      }
    }
  ],
  auth: {
    strategies: [
      {
        name: 'next-auth',
        authenticate: async ({ headers, payload }) => {
          const currentUser = await getCurrentUser({ headers, payload, cache: true })
          if (!currentUser) return null
          return {
            ...currentUser,
            collection: COLLECTION_SLUG_USER
          }
        }
      }
    ]
  },
  hooks: {
    afterChange: [
      async ({ doc, req, operation }) => {
        const payload = req.payload
        await revalidateUser(doc, payload)

        // Create Stripe customer if UID exists but no Stripe customer exists
        if (doc.uid && !doc.stripeCustomerId) {
          try {
            const customer = await stripe.customers.create({
              name: doc.name || undefined,
              email: doc.email || undefined,
              phone: doc.phone || undefined,
              address: doc.address
                ? {
                    line1: doc.address.line1 || undefined,
                    line2: doc.address.line2 || undefined,
                    city: doc.address.city || undefined,
                    state: doc.address.state || undefined,
                    postal_code: doc.address.postalCode || undefined,
                    country: doc.address.country || undefined
                  }
                : undefined,
              metadata: {
                uid: doc.uid,
                company_name: doc.companyName || undefined
              }
            })

            // Update user with Stripe customer ID
            await payload.update({
              collection: COLLECTION_SLUG_USER,
              id: doc.id,
              data: {
                stripeCustomerId: customer.id
              }
            })
          } catch (error) {
            console.error('Error creating Stripe customer:', error)
          }
        }

        // Update Stripe customer metadata if UID changed and customer exists
        if (operation === 'update' && doc.stripeCustomerId) {
          try {
            await stripe.customers.update(doc.stripeCustomerId, {
              name: doc.name || undefined,
              email: doc.email || undefined,
              phone: doc.phone || undefined,
              address: doc.address
                ? {
                    line1: doc.address.line1 || undefined,
                    line2: doc.address.line2 || undefined,
                    city: doc.address.city || undefined,
                    state: doc.address.state || undefined,
                    postal_code: doc.address.postalCode || undefined,
                    country: doc.address.country || undefined
                  }
                : undefined,
              metadata: {
                uid: doc.uid,
                company_name: doc.companyName || undefined
              }
            })
          } catch (error) {
            console.error('Error updating Stripe customer metadata:', error)
          }
        }
      }
    ]
  },
  access: {
    admin: async ({ req }) => {
      return ADMIN_ACCESS_ROLES.includes(req?.user?.role || DEFAULT_USER_ROLE)
    },
    read: isAdminOrCurrentUser,
    create: isAdmin,
    update: isAdminOrCurrentUser,
    delete: isAdminOrCurrentUser
  },
  fields: [
    { name: 'name', type: 'text', saveToJWT: true },
    { name: 'companyName', type: 'text', saveToJWT: true },
    { name: 'phone', type: 'text', saveToJWT: true },
    {
      name: 'address',
      type: 'group',
      saveToJWT: true,
      fields: [
        { name: 'line1', type: 'text' },
        { name: 'line2', type: 'text' },
        { name: 'city', type: 'text' },
        { name: 'state', type: 'text' },
        { name: 'postalCode', type: 'text' },
        { name: 'country', type: 'text' }
      ]
    },
    { name: 'imageUrl', type: 'text', saveToJWT: true },
    { name: 'role', type: 'select', options: ['admin', 'user'], saveToJWT: true },
    { name: 'emailVerified', type: 'date' },
    { name: 'stripeCustomerId', type: 'text', saveToJWT: true, admin: { readOnly: true, position: 'sidebar' } },
    {
      name: 'uid',
      type: 'text',
      saveToJWT: true,
      admin: {
        description: 'Unique identifier used to link multiple Stripe customers',
        position: 'sidebar'
      },
      unique: true,
      index: true
    },
    {
      name: 'accounts',
      type: 'array',
      saveToJWT: false,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'provider', type: 'text', admin: { readOnly: true } },
            { name: 'providerAccountId', type: 'text', admin: { readOnly: true } }
          ]
        }
      ]
    },
    {
      name: 'verificationTokens',
      type: 'array',
      saveToJWT: false,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'identifier', type: 'text', admin: { readOnly: true } },
            { name: 'token', type: 'text', admin: { readOnly: true } },
            { name: 'expires', type: 'date', admin: { readOnly: true } }
          ]
        }
      ]
    }
  ]
} as const

export const sessions: CollectionConfig = {
  slug: COLLECTION_SLUG_SESSIONS,
  admin: {
    group: ADMIN_AUTH_GROUP
  },
  access: {
    read: isAdminOrCurrentUser,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin
  },
  fields: [
    { name: 'user', type: 'relationship', relationTo: COLLECTION_SLUG_USER, required: true, admin: { readOnly: false } },
    { name: 'sessionToken', type: 'text', required: true, index: true, admin: { readOnly: false } },
    { name: 'expires', type: 'date', admin: { readOnly: false, date: { pickerAppearance: 'dayAndTime' } }, required: false }
  ]
} as const
