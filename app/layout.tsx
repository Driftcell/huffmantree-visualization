import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/header'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: 'Visual Huffman Tree',
  description:
    'This is a final course work for data structure, created by Helio at 2023/12/26',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="relative flex flex-col min-h-screen space-y-2">
          <Header />
          <main className="flex flex-1">{children}</main>
          <Toaster richColors />
        </div>
      </body>
    </html>
  )
}
