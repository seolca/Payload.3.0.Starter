import { Skeleton } from '@/components/ui/Skeleton'

export default function RootLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </header>
      <main className="flex grow flex-col">
        <div className="flex grow items-center justify-center">
          <Skeleton className="h-32 w-32" />
        </div>
      </main>
    </div>
  )
}
