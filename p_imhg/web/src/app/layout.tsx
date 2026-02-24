import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import GlobalNavbar from '@/components/public/Navbar'
import './globals.css'

export const metadata: Metadata = {
  title: 'ABC Polytechnic — Digital Platform',
  description: 'Official student and admin portal for ABC Polytechnic Institute',
  keywords: ['polytechnic', 'college portal', 'student results', 'abc polytechnic'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning>
        <GlobalNavbar />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#111827',
              color: '#f1f5f9',
              border: '1px solid #1e2d40',
              borderRadius: '0.75rem',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#111827' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#111827' } },
          }}
        />
      </body>
    </html>
  )
}
