'use client'

/* El riel horizontal.

   Es la unidad de la portada: una fila que se desplaza de lado y sangra
   hasta el borde de la ventana, para que las tarjetas se salgan del
   margen en vez de morir contra él.

   Es de cliente por las flechas, y las flechas existen porque la barra
   de desplazamiento está oculta: sin ellas, en un ratón sin rueda
   horizontal no habría forma de llegar al final de la fila. Se esconden
   solas cuando no queda nada hacia ese lado, así que nunca hay un botón
   que no haga nada.

   El difuminado del borde derecho es una máscara sobre el propio riel,
   no un degradado pintado encima: así funciona igual sobre cualquiera de
   las tres superficies del sistema sin tener que acertar el color. */

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import Icono from './Icono'

export default function Riel({
  children,
  /** Etiqueta para el lector de pantalla: «Tendencias», «Seguir viendo». */
  etiqueta,
}: {
  children: ReactNode
  etiqueta?: string
}) {
  const carril = useRef<HTMLDivElement>(null)
  const [puedeIzquierda, setPuedeIzquierda] = useState(false)
  const [puedeDerecha, setPuedeDerecha] = useState(false)

  const medir = useCallback(() => {
    const nodo = carril.current
    if (!nodo) return
    // El margen de un píxel evita que un redondeo deje la flecha
    // encendida cuando ya no queda nada que desplazar.
    setPuedeIzquierda(nodo.scrollLeft > 1)
    setPuedeDerecha(nodo.scrollLeft + nodo.clientWidth < nodo.scrollWidth - 1)
  }, [])

  useEffect(() => {
    const nodo = carril.current
    if (!nodo) return
    medir()
    nodo.addEventListener('scroll', medir, { passive: true })
    // El ancho del riel cambia con la ventana y también cuando entran
    // tarjetas nuevas (las filas cargan dentro de un Suspense).
    const observador = new ResizeObserver(medir)
    observador.observe(nodo)
    return () => {
      nodo.removeEventListener('scroll', medir)
      observador.disconnect()
    }
  }, [medir])

  function desplazar(sentido: -1 | 1) {
    const nodo = carril.current
    if (!nodo) return
    // Un poco menos de una pantalla, para que quede a la vista dónde se
    // estaba y no dé la sensación de haber saltado.
    nodo.scrollBy({ left: sentido * nodo.clientWidth * 0.85, behavior: 'smooth' })
  }

  const flecha =
    'absolute top-0 bottom-0 z-30 hidden w-[4.5rem] cursor-pointer place-items-center opacity-0 transition-opacity duration-200 ease-sal group-hover/riel:opacity-100 focus-visible:opacity-100 md:grid'

  return (
    <div className="group/riel relative isolate">
      {puedeIzquierda && (
        <button
          type="button"
          aria-label="Desplazar a la izquierda"
          onClick={() => desplazar(-1)}
          className={`${flecha} left-0`}
        >
          <span className="grid size-9 place-items-center rounded-full bg-black/70 text-white transition-colors duration-150 hover:bg-black/90">
            <Icono nombre="cheuron-izq" tam={20} />
          </span>
        </button>
      )}

      <div
        ref={carril}
        role={etiqueta ? 'group' : undefined}
        aria-label={etiqueta}
        className={`sin-barra flex gap-2 overflow-x-auto px-bleed py-2 [scroll-padding-inline:var(--spacing-bleed)] [&>*]:[scroll-snap-align:start] ${
          puedeDerecha ? 'velo-derecha' : ''
        }`}
        style={{ scrollSnapType: 'x proximity' }}
      >
        {children}
      </div>

      {puedeDerecha && (
        <button
          type="button"
          aria-label="Desplazar a la derecha"
          onClick={() => desplazar(1)}
          className={`${flecha} right-0`}
        >
          <span className="grid size-9 place-items-center rounded-full bg-black/70 text-white transition-colors duration-150 hover:bg-black/90">
            <Icono nombre="cheuron-der" tam={20} />
          </span>
        </button>
      )}
    </div>
  )
}
