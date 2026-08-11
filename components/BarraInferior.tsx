'use client'

/* La navegación en móvil.

   Debajo de 768px el riel lateral desaparece —48px de columna sobre una
   pantalla de 390 es un 12% del ancho gastado en iconos— y su sitio lo
   ocupa esta barra pegada abajo, que es donde llega el pulgar.

   Lleva los mismos destinos que el riel y en el mismo orden, así que
   recibe la misma lista: dos navegaciones que no coincidan son dos
   navegaciones que mantener.

   El `pb` con `safe-area-inset-bottom` es obligatorio: sin él, en un
   iPhone la barra queda debajo del indicador de inicio. */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Icono from './Icono'
import type { DestinoRiel } from './RielLateral'

function esActivo(href: string, ruta: string): boolean {
  const base = href.split('?')[0]
  if (base === '/') return ruta === '/'
  return ruta === base || ruta.startsWith(`${base}/`)
}

export default function BarraInferior({
  destinos,
  hayUsuario,
}: {
  destinos: DestinoRiel[]
  hayUsuario: boolean
}) {
  const ruta = usePathname()

  const items = [
    ...destinos,
    hayUsuario
      ? ({ href: '/cuenta', texto: 'Cuenta', icono: 'usuario' } as DestinoRiel)
      : ({ href: '/acceder', texto: 'Acceder', icono: 'usuario' } as DestinoRiel),
  ]

  return (
    <nav
      aria-label="Navegación"
      className="z-50 border-t border-borde bg-fondo pb-[env(safe-area-inset-bottom,0px)] md:hidden"
    >
      <ul className="m-0 flex list-none items-stretch justify-around p-0">
        {items.map((d) => {
          const activo = esActivo(d.href, ruta)
          return (
            <li key={d.href} className="flex-1">
              <Link
                href={d.href}
                aria-current={activo ? 'page' : undefined}
                className={`flex flex-col items-center gap-1 py-2 text-[0.625rem] font-medium no-underline transition-colors duration-200 ease-sal ${
                  activo ? 'text-primario' : 'text-tinta-tenue'
                }`}
              >
                <Icono nombre={d.icono} tam={20} />
                {d.texto}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
