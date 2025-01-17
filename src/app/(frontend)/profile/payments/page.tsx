import { getCurrentUser } from '@/lib/payload'
import { redirect } from 'next/navigation'
import PaymentHistorySection from '@/components/ProfileForm/PaymentHistorySection'

export default async function PaymentsPage() {
  const user = await getCurrentUser()
  if (!user) return redirect('/sign-in')

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h2 className="text-3xl font-bold">Payment History</h2>
        <p className="text-zinc-500 dark:text-zinc-400">View all your past transactions and payment details.</p>
      </div>
      <PaymentHistorySection user={user} />
    </div>
  )
}
