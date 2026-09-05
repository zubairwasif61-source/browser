import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Browser Proxy',
  description: 'A web-based proxy to browse any website',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white">
        {children}
      </body>
    </html>
  )
}
