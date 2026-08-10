import type { Metadata } from 'next'
import Marca from '@/components/Marca'
import NoEncontrado from '@/components/NoEncontrado'

export const metadata: Metadata = {
  title: 'Página no encontrada',
  robots: { index: false, follow: false },
}

/* El 404 de la raíz: direcciones que no encajan con ninguna ruta.

   No lleva el marco de la aplicación porque Next lo pinta por encima de
   los layouts de grupo, así que se le pone lo mínimo para que no parezca
   otro sitio: la marca arriba y una salida. */
export default function NoEncontrada() {
  return (
    <div className="min-h-dvh">
      <header className="px-bleed py-4">
        <Marca />
      </header>
      <NoEncontrado />
    </div>
  )
}
