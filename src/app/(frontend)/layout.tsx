import '@/app/style.css'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { Toaster } from '@/components/ui/Sonner'
import cn from '@/utils/cn'
import type { Viewport, Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { Inter as FontSans } from 'next/font/google'

const fontSans = FontSans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
  preload: true,
  adjustFontFallback: true
})

export const metadata: Metadata = {
  title: { default: 'Account | Seol.ca', template: '%s | Seol.ca' },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!)
}

export const viewport: Viewport = {
  themeColor: '#161616'
}

const Layout: React.FC<{ children: React.ReactNode }> = async ({ children }) => {
  return (
    <html lang="en" className={cn(fontSans.variable, 'font-feature-default h-full')} suppressHydrationWarning>
      <body className="overflow-x-hidden bg-zinc-50 font-sans text-base antialiased dark:bg-zinc-940 dark:text-white">
        <ThemeProvider attribute="class">
          <div className="app flex min-h-screen flex-col">
            <Header />
            <main className="flex grow flex-col">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

export default Layout
