import Link from 'next/link'
import type { ReactNode } from 'react'
import Icono from './Icono'

/* Cabecera de sección.

   Antes llevaba un filete de color a la izquierda y dos flechas a la
   derecha, una de las cuales estaba permanentemente desactivada porque
   era decorativa. Las flechas de recorrer el riel viven ahora en el
   propio riel, que es quien sabe si puede desplazarse; aquí solo queda
   el título y, si hay a dónde, un enlace. */
export default function TituloSeccion({
  id,
  titulo,
  enlace,
  href,
  grande = false,
  accion,
}: {
  id: string
  titulo: string
  /** Texto del enlace de la derecha: «Ver todo», «Tu historial»… */
  enlace?: string
  href?: string
  /** Para las filas que abren un bloque: mismo sitio, más peso. */
  grande?: boolean
  /** Lo que va a la derecha cuando no es un enlace. */
  accion?: ReactNode
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-4 px-bleed">
      <h2
        id={id}
        className={`font-semibold tracking-[-0.01em] text-tinta ${
          grande ? 'text-2xl' : 'text-xl'
        }`}
      >
        {titulo}
      </h2>

      {enlace && href ? (
        <Link
          href={href}
          className="group flex shrink-0 items-center gap-1 text-sm text-tinta-apagada no-underline transition-colors duration-150 ease-sal hover:text-tinta"
        >
          {enlace}
          <Icono
            nombre="flecha"
            tam={14}
            className="transition-transform duration-200 ease-sal group-hover:translate-x-0.5"
          />
        </Link>
      ) : (
        accion
      )}
    </div>
  )
}
