import type { Metadata, Viewport } from 'next'
import './globals.css'
import Navigation from '@/components/Navigation'

export const metadata: Metadata = {
  title: 'Daily Sport Tracker',
  description: 'Seguimiento deportivo personal - Natación y ejercicios de hombro',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Daily Sport',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body style={{ background: '#f1f5f9' }} className="text-slate-900 min-h-screen">
        <div className="max-w-md mx-auto min-h-screen flex flex-col relative">
          {/* Main content with bottom padding for navigation */}
          <main className="flex-1 pb-20 overflow-x-hidden">
            {children}
          </main>
          {/* Fixed bottom navigation */}
          <Navigation />
        </div>
      </body>
    </html>
  )
}
