'use client'

/* La barra superior del marco.

   Tres zonas de ancho fijo para que el buscador quede centrado de verdad
   respecto a la ventana y no respecto a lo que le dejen los vecinos: si
   se reparte con `justify-between`, el centro se desplaza en cuanto la
   campana aparece o desaparece.

   Cliente por los dos cheurones de historial. Van deshabilitados hasta
   que hay algo a donde volver, y esa comprobación solo existe en el
   navegador. */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Icono from './Icono'
import PaletaBuscador from './PaletaBuscador'

export default function BarraSuperior({
  hayUsuario,
  noLeidas,
}: {
  hayUsuario: boolean
  noLeidas: number
}) {
  const router = useRouter()
  const [hayHistorial, setHayHistorial] = useState(false)

  // `history.length` no distingue hacia dónde se puede ir, pero sí dice
  // si esta pestaña se abrió directamente en esta página. Con una sola
  // entrada, el botón de atrás no lleva a ninguna parte del sitio.
  useEffect(() => {
    setHayHistorial(window.history.length > 1)
  }, [])

  const mando =
    'grid size-7 place-items-center rounded-radio text-tinta-apagada transition-colors duration-200 ease-sal hover:bg-tinta/10 hover:text-tinta disabled:pointer-events-none disabled:opacity-40'

  return (
    <header className="z-50 grid h-[var(--alto-barra)] grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-borde bg-fondo px-2 md:grid-cols-[20%_1fr_20%]">
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={!hayHistorial}
          aria-label="Atrás"
          className={mando}
        >
          <Icono nombre="cheuron-izq" tam={18} />
        </button>
        <button
          type="button"
          onClick={() => router.forward()}
          disabled={!hayHistorial}
          aria-label="Adelante"
          className={mando}
        >
          <Icono nombre="cheuron-der" tam={18} />
        </button>
      </div>

      <div className="flex w-full min-w-0 justify-center">
        <PaletaBuscador />
      </div>

      <div className="flex items-center justify-end gap-0.5">
        {hayUsuario && (
          <Link
            href="/notificaciones"
            aria-label={
              noLeidas > 0
                ? `Notificaciones, ${noLeidas} sin leer`
                : 'Notificaciones'
            }
            className={`relative ${mando} no-underline`}
          >
            <Icono nombre="campana" tam={18} />
            {noLeidas > 0 && (
              <span
                aria-hidden="true"
                className="absolute top-1 right-1 size-1.5 rounded-full bg-acento ring-2 ring-fondo"
              />
            )}
          </Link>
        )}
      </div>
    </header>
  )
}
