import type { Metadata } from 'next'
import { Archivo, Archivo_Black } from 'next/font/google'
import './globals.css'

// next/font autoaloja las fuentes: desaparece la petición a Google Fonts
// y con ella el salto de composición al cargar.
const texto = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--fuente-texto',
  display: 'swap',
})

const display = Archivo_Black({
  subsets: ['latin'],
  weight: '400',
  variable: '--fuente-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'KUROBA',
    template: '%s — KUROBA',
  },
  description:
    'Catálogo de anime con emisión simultánea y subtítulos en cinco idiomas.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${texto.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  )
}
