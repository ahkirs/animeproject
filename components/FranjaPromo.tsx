/* Franja ancha que corta la pila de filas.

   Existe por una razón estructural, no decorativa: seis filas seguidas
   de carátulas pesan todas lo mismo y la página se recorre sin que nada
   llame. Una franja a media altura da el respiro y marca dónde acaba un
   bloque y empieza otro. */

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
      className="relative isolate mt-16 overflow-hidden bg-tarjeta"
    >
      {arte && (
        <div className="absolute inset-0 -z-20">
          <Lamina arte={arte} />
        </div>
      )}

      {/* La imagen se recorta con una máscara hacia la izquierda en vez
          de taparse con un degradado de color: así el bloque funciona
          igual sobre el lienzo que sobre cualquier otra superficie, sin
          tener que repetir el valor del fondo en un gradiente. */}
      {arte && (
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-tarjeta [mask-image:linear-gradient(to_right,#000_30%,transparent_85%)]"
        />
      )}

      <div className="max-w-[46ch] px-bleed py-12">
        <h2
          id={`p-${promo.id}`}
          className="font-titulo text-3xl leading-tight font-extrabold tracking-[-0.03em] text-balance"
        >
          {promo.titulo}
        </h2>

        <p className="mt-3 text-sm text-tinta-apagada">{promo.gancho}</p>

        <Link
          href={promo.href}
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-primario px-5 text-sm font-semibold text-primario-tinta no-underline transition-opacity duration-200 ease-sal hover:opacity-85"
        >
          <Icono nombre="flecha" tam={16} />
          Ver ahora
        </Link>
      </div>
    </section>
  )
}
