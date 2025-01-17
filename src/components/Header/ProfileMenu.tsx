import { SignOutButton } from '@/components/SignOutButton'
import { Avatar } from '@/components/ui/Avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu'
import { getCurrentUser } from '@/lib/payload'
import ArrowLeftOnRectangle from '@/public/icons/arrow-left-on-rectangle.svg'
import Cog8Tooth from '@/public/icons/cog-8-tooth.svg'
import Link from 'next/link'

const ProfileMenu = async () => {
  const user = await getCurrentUser()
  if (!user) return null
  const firstName = user?.name?.split(' ')[0]

  return (
    <div className="flex flex-row items-center gap-x-2">
      <DropdownMenu closeOnPathChange={true}>
        <DropdownMenuTrigger
          className="group inline-flex items-center gap-x-2.5 rounded-full border border-zinc-200 bg-white/50 px-3 py-1.5 text-sm font-medium outline-none
            backdrop-blur-sm transition-all hover:bg-white hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:bg-zinc-800">
          <div
            className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-500 to-purple-500
              ring-2 ring-white dark:ring-zinc-800">
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt={user.name || 'User'} className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs font-medium text-white">{(user?.name || 'U').charAt(0).toUpperCase()}</span>
            )}
          </div>
          <span className="max-w-[100px] truncate">{firstName}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-64 overflow-hidden rounded-xl border border-zinc-200 bg-white p-0 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
          align="end">
          <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/50">
            <div className="truncate text-sm font-medium text-zinc-900 dark:text-white">{user.name}</div>
            <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">{user.email}</div>
          </div>
          <div className="p-2">
            <DropdownMenuItem asChild>
              <Link
                href="/profile"
                className="flex w-full items-center gap-x-2.5 rounded-md px-2.5 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100
                  dark:text-zinc-300 dark:hover:bg-zinc-800">
                <Cog8Tooth className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                Profile Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <SignOutButton
                className="flex w-full items-center gap-x-2.5 rounded-md px-2.5 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100
                  dark:text-zinc-300 dark:hover:bg-zinc-800">
                <ArrowLeftOnRectangle className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                Sign Out
              </SignOutButton>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default ProfileMenu
