/* Franja ancha que corta la pila de filas.

   Existe por una razón estructural, no decorativa: seis filas seguidas
   de carátulas pesan todas lo mismo y la página se recorre sin que nada
   llame. Una franja a media altura da el respiro y marca dónde acaba un
   bloque y empieza otro.

   Va sangrada hasta el borde de la ventana, que es lo que la distingue
   de una fila: rompe el margen en vez de respetarlo. */

import Link from 'next/link'
import Icono from './Icono'
import Lamina from './Lamina'
import type { Promocion } from '@/lib/portada'
import type { Arte } from '@/lib/types'

export default function FranjaPromo({
  promo,
  arte,
}: {
  promo: Promocion
  /** Fondo. Si no llega ninguno se queda el campo sólido, que es
   *  preferible a un hueco gris esperando una imagen que no viene. */
  arte?: Arte
}) {
  return (
    <section
      aria-labelledby={`p-${promo.id}`}
      className="relative isolate mt-e6 overflow-hidden rounded-radio bg-sala-800 [margin-inline:calc(var(--spacing-margen)*-1)] max-[560px]:rounded-none"
    >
      {arte && (
        <div className="absolute inset-0 -z-20">
          <Lamina arte={arte} />
        </div>
      )}

      {/* El degradado hace legible el texto sobre cualquier ilustración.
          Es estructura: sin él dependes de que el arte tenga una zona
          oscura justo donde va la tipografía. */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#0b0a09_18%,rgba(11,10,9,0.82)_52%,rgba(11,10,9,0.35)_100%)]" />

      <div className="max-w-[46ch] px-margen py-e5">
        <h2
          id={`p-${promo.id}`}
          className="font-display text-paso-4 leading-[1.02] tracking-[-0.035em]"
        >
          {promo.titulo}
        </h2>

        <p className="mt-e2 text-paso-1 text-hueso-70">{promo.gancho}</p>

        <Link
          href={promo.href}
          className="mt-e3 inline-flex items-center gap-2 rounded-radio bg-ambar px-[1.35rem] py-3 text-paso-1 font-semibold text-ambar-tinta no-underline transition-colors duration-200 ease-sal hover:bg-ambar-claro"
        >
          <Icono nombre="flecha" tam={16} />
          Ver ahora
        </Link>
      </div>
    </section>
  )
}
