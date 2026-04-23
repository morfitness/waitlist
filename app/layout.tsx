import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'Morpit - AI-Powered Nutrition & Fitness Transformation',
  description: 'Join the Morpit waitlist for early access to AI-powered nutrition and fitness transformation. Transform your body with intelligent guidance.',
  keywords: ['morpit', 'nutrition', 'fitness', 'ai', 'transformation', 'waitlist'],
  authors: [{ name: 'Morpit Team' }],
  openGraph: {
    title: 'Morpit - AI-Powered Transformation',
    description: 'Transform your body with AI-powered nutrition and fitness guidance',
    url: 'https://morpit.fit',
    siteName: 'Morpit',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Morpit - AI-Powered Transformation',
    description: 'Join the waitlist for early access',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sf-pro">
        {children}
      </body>
    </html>
  )
}
