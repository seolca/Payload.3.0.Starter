import { getCurrentUser } from '@/lib/payload/index'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  redirect('/profile')
}
