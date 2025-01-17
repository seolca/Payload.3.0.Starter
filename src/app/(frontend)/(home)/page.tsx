import { Card, CardContent } from '@/components/ui/Card'
import { ArrowRight, LogIn } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid w-full max-w-xl gap-6 sm:grid-cols-2">
        <Link href="/sign-in" className="group">
          <Card className="h-full transition-all duration-200 hover:border-zinc-400 dark:hover:border-zinc-700">
            <CardContent className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
              <LogIn className="h-8 w-8 text-zinc-600 transition-colors group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-zinc-200" />
              <div>
                <h2 className="text-xl font-semibold">Account Login</h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Access your account dashboard</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="https://seol.ca" className="group">
          <Card className="h-full transition-all duration-200 hover:border-zinc-400 dark:hover:border-zinc-700">
            <CardContent className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
              <ArrowRight className="h-8 w-8 text-zinc-600 transition-colors group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-zinc-200" />
              <div>
                <h2 className="text-xl font-semibold">Main Website</h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Visit seol.ca</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
