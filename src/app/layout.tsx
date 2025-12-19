import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Fraccional - Gestión de Condominios',
  description: 'Plataforma SaaS para la administración de fraccionamientos y condominios',
  keywords: ['condominio', 'fraccionamiento', 'administración', 'gestión'],
  authors: [{ name: 'Fraccional Team' }],
  creator: 'Fraccional',
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'Fraccional - Gestión de Condominios',
    description: 'Plataforma SaaS para la administración de fraccionamientos y condominios',
    siteName: 'Fraccional',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fraccional - Gestión de Condominios',
    description: 'Plataforma SaaS para la administración de fraccionamientos y condominios',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={inter.className}>
        <div className="min-h-screen bg-brand-background">
          {children}
        </div>
      </body>
    </html>
  )
}