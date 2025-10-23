import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AJCC TNM Staging Calculator',
  description: 'Cancer staging calculator using TNM Classification System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}