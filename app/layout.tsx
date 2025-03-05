import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from "@/components/AuthProvider";
import dynamic from 'next/dynamic';
import { AccountExecDebug } from "@/components/AccountExecDebug";
import { Providers } from './providers'

// Dynamically import the debug component with no SSR
const AccountExecDebugComponent = dynamic(
  () => import('@/components/AccountExecDebug'),
  { ssr: false }
);

export const metadata: Metadata = {
  title: 'ProposalHero',
  description: 'Create professional proposals with ease',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AuthProvider>
            {children}
            <AccountExecDebug />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}
