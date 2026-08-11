'use client'

/* El pie.

   La barra delgada de abajo del todo: cuatro enlaces legales separados por
   puntos y el copyright empujado a la derecha. Es la versión de KUROBA del
   pie de Shiroko — misma idea (enlaces + copyright en una línea), traducida
   a los tokens del sistema.

   Vive dentro del panel con scroll del marco. Va «pegado» al fondo con
   `sticky bottom-0`, así que se ve siempre sin que ninguna página tenga que
   montarlo. Es de cliente porque marca el enlace activo con `usePathname`,
   como hacen el riel y la barra de móvil. */

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ENLACES = [
  { texto: 'Privacidad', href: '/privacidad' },
  { texto: 'Términos', href: '/terminos' },
  { texto: 'DMCA', href: '/dmca' },
  { texto: 'Changelog', href: '/changelog' },
]

export default function Pie() {
  const ruta = usePathname()

  return (
    <footer className="flex flex-wrap items-center gap-x-2.5 gap-y-1 border-t border-borde bg-fondo px-bleed py-1 text-sm text-tinta-tenue md:sticky md:bottom-0 md:z-30">
      <nav aria-label="Legal" className="flex flex-wrap items-center gap-2.5">
        {ENLACES.map((e, i) => (
          <span key={e.href} className="flex items-center gap-2.5">
            {i > 0 && (
              <span
                aria-hidden="true"
                className="size-[3px] rounded-full bg-tinta-tenue/60"
              />
            )}
            <Link
              href={e.href}
              aria-current={ruta === e.href ? 'page' : undefined}
              className={`no-underline transition-colors duration-150 ease-sal ${
                ruta === e.href ? 'text-tinta' : 'hover:text-tinta'
              }`}
            >
              {e.texto}
            </Link>
          </span>
        ))}
      </nav>
      <p className="ml-auto hidden whitespace-nowrap sm:block">
        © 2026 KUROBA. Todos los derechos reservados.
      </p>
    </footer>
  )
}
