'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { useEffect, useState } from 'react'
import type { User } from '~/payload-types'

type Payment = {
  id: string
  amount: number
  currency: string
  status: string
  created: number
  receiptUrl?: string
  invoiceUrl?: string
  description?: string
}

export default function PaymentHistorySection({ user }: { user: User & { uid?: string } }) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/payments')
        const data = await response.json()
        
        if (data.error) {
          setError(data.error)
          setPayments([])
        } else {
          setPayments(data.payments || [])
          setError(null)
        }
      } catch (error) {
        console.error('Error fetching payments:', error)
        setError('Failed to load payment history')
        setPayments([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPayments()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">Payment History</h2>
        </CardHeader>
        <CardContent>
          <p>Loading payment history...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">Payment History</h2>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">Payment History</h2>
        </CardHeader>
        <CardContent>
          <p>No payment history available.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-bold">Payment History</h2>
        {user.uid && (
          <p className="text-sm text-gray-500">
            Showing all payments associated with UID: {user.uid}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
              <div>
                <p className="font-medium">
                  {payment.description || 'Payment'} - {(payment.amount / 100).toFixed(2)} {payment.currency.toUpperCase()}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(payment.created * 1000).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    payment.status === 'succeeded'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                  {payment.status}
                </span>
                {(payment.receiptUrl || payment.invoiceUrl) && (
                  <a
                    href={payment.receiptUrl || payment.invoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                    View Receipt
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 