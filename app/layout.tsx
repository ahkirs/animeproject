import type { Metadata } from 'next'
import { Inter, Karla } from 'next/font/google'
import { ProveedorHora } from '@/components/PreferenciaHora'
import './globals.css'

// next/font autoaloja las fuentes: desaparece la petición a Google Fonts
// y con ella el salto de composición al cargar.
//
// Las dos son variables, así que se piden sin `weight`: llega un solo
// archivo por familia con todo el eje de peso dentro, en vez de cuatro
// archivos estáticos. Es más ligero y permite el 800 de los títulos sin
// pagar por él.
//
// Karla para titular. Sustituye a Archivo Black, que era una display de
// un solo peso: a cuerpo grande iba bien, pero no servía para un título
// de sección de 20px, así que había que saltar a la de texto y la
// jerarquía se rompía por el medio. Karla cubre de 200 a 800 y resuelve
// toda la escala con una sola familia.
const titulo = Karla({
  subsets: ['latin'],
  variable: '--fuente-titulo',
  display: 'swap',
})

// Inter para leer: cuerpo, datos y cifras. Es neutra a propósito — en
// este sistema el carácter lo pone el color, no la letra.
const texto = Inter({
  subsets: ['latin'],
  variable: '--fuente-texto',
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
    <html lang="es" className={`${texto.variable} ${titulo.variable}`}>
      <body>
        <ProveedorHora>{children}</ProveedorHora>
      </body>
    </html>
  )
}
