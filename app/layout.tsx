export const metadata = {
  title: 'POS de Alitas',
  description: 'Sistema de Punto de Venta',
}

import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
