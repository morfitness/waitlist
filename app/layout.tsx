import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'Morfit - Personalized Nutrition & Fitness Transformation',
  description: 'Join the Morfit waitlist for early access to personalized nutrition and fitness transformation. Transform your body with intelligent guidance.',
  keywords: ['morfit', 'nutrition', 'fitness', 'transformation', 'waitlist'],
  authors: [{ name: 'Morfit Team' }],
  openGraph: {
    title: 'Morfit - Personalized Transformation',
    description: 'Transform your body with personalized nutrition and fitness guidance',
    url: 'https://morfit.fit',
    siteName: 'Morfit',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Morfit - Personalized Transformation',
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
