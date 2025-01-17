import Container from '@/components/Container'
import { getCurrentUser } from '@/lib/payload'
import { CreditCard, UserRound, Receipt } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { usePathname } from 'next/navigation'

const ProfileMenu = [
  {
    label: 'Profile',
    path: '/profile',
    icon: <UserRound className="h-5 w-5" />
  },
  {
    label: 'Subscriptions',
    path: '/profile/subscriptions',
    icon: <CreditCard className="h-5 w-5" />
  },
  {
    label: 'Payment History',
    path: '/profile/payments',
    icon: <Receipt className="h-5 w-5" />
  }
]

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) return redirect('/sign-in')
  return (
    <Container>
      <div className="min-h-[calc(100vh-100px)] pb-10 pt-[100px]">
        <div className="relative grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-4">
          <nav className="sticky top-6 h-fit">
            <div className="rounded-lg border bg-white/50 p-2 shadow-sm backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="mb-2 border-b px-3 pb-2">
                <h2 className="font-semibold text-zinc-900 dark:text-white">Account Settings</h2>
              </div>
              <ul className="flex gap-x-8 gap-y-1 sm:flex-col">
                {ProfileMenu.map(({ label, path, icon }) => (
                  <li key={label}>
                    <Link
                      href={path}
                      className="flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition-all duration-200 hover:bg-zinc-100
                        hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white">
                      {icon}
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
          <div className="col-span-1 sm:col-span-3">{children}</div>
        </div>
      </div>
    </Container>
  )
}
