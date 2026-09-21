export const metadata = {
  title: 'Alitas Rossy',
  description: 'Sistema de registro y control de ordenes - Alitas Rossy',
  icons: {
    icon: '/icon.jpg',
    apple: '/apple-icon.jpg',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

import './globals.css'

export default function RootLayout({
  children, 
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full antialiased bg-slate-50 overflow-x-hidden">{children}</body>
    </html>
  )
}

