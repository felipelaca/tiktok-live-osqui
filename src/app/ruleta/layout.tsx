import type { Metadata } from 'next'
import './transparent.css'

export const metadata: Metadata = {
  title: 'Ruleta - TikTok Live',
  description: 'Ruleta transparente para overlay de streaming',
}

export default function RuletaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="transparent-html">
      <body className="transparent-body">
        {children}
      </body>
    </html>
  )
}
