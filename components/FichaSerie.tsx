import Link from 'next/link'
import type { ReactNode } from 'react'
import Lamina from './Lamina'
import { colorDeObra } from '@/lib/color'
import type { Arte, EstadoEmision } from '@/lib/types'

/** Marco de una carátula: 2:3 por defecto, 16:9 si es panorámica.
 *  Se usa suelto donde hace falta el marco sin la tarjeta entera. */
export function Cartel({
  arte,
  ancho,
  className = '',
  children,
}: {
  arte: Arte | null | undefined
  ancho?: boolean
  className?: string
  children?: ReactNode
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-radio bg-tarjeta ${
        ancho ? 'aspect-video' : 'aspect-2/3'
      } ${className}`}
    >
      <Lamina arte={arte} />
      {children}
    </div>
  )
}

interface Props {
  href: string
  titulo: string
  arte: Arte | null | undefined
  /** Id canónico. De él sale el color de la obra para el hover. */
  id?: string
  /** Píldora de estado. Solo se pinta si se conoce: el catálogo devuelve
   *  `status` a nulo y no hay que inventarlo. */
  estado?: EstadoEmision
  /** Número de episodios, si se sabe. */
  episodios?: number
  /** Dato suelto para cuando no hay ni estado ni episodios: el tipo de
   *  obra («Película», «OVA»), que sí llega siempre. */
  etiqueta?: string
  /** Lo que va en la esquina de la carátula al pasar por encima: guardar
   *  en la lista. Se pasa desde fuera porque necesita sesión y acciones
   *  de servidor, y esta tarjeta se pinta en el servidor. */
  accion?: ReactNode
}

/** Tarjeta de una obra dentro de un riel o una rejilla.
 *
 *  Ancho fijo por diseño, no fluido: en un riel, las columnas elásticas
 *  hacen que cada fila tenga tarjetas de un tamaño distinto según cuántas
 *  quepan, y la página deja de tener una retícula reconocible. */
export default function FichaSerie({
  href,
  titulo,
  arte,
  id,
  estado,
  episodios,
  etiqueta,
  accion,
}: Props) {
  const color = id ? colorDeObra(id) : undefined

  return (
    <div
      className="group/ficha w-[140px] shrink-0 sm:w-[160px] lg:w-[180px]"
      style={color ? ({ '--color-obra': color } as React.CSSProperties) : undefined}
    >
      <Link href={href} className="block no-underline">
        <div className="relative overflow-hidden rounded-radio bg-tarjeta">
          <div className="aspect-2/3">
            <Lamina arte={arte} />
          </div>

          {/* Oscurecer al pasar por encima hace que el título de debajo,
              que es lo que se está leyendo, gane peso frente a la
              carátula. */}
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-black/0 transition-colors duration-200 ease-sal group-hover/ficha:bg-black/25"
          />

          {accion && (
            <div className="absolute top-2 right-2 z-20 scale-75 opacity-0 transition-[opacity,transform] duration-200 ease-sal group-hover/ficha:scale-100 group-hover/ficha:opacity-100 focus-within:scale-100 focus-within:opacity-100">
              {accion}
            </div>
          )}
        </div>

        <h3
          className="tinte-obra mt-2 line-clamp-2 text-sm leading-snug font-semibold text-balance text-tinta"
          title={titulo}
        >
          {titulo}
        </h3>
      </Link>

      {(estado || episodios || etiqueta) && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {estado === 'en-emision' && (
            <span className="rounded-radio bg-exito/15 px-2 py-0.5 text-[0.625rem] font-medium text-exito">
              En emisión
            </span>
          )}
          {estado === 'finalizada' && (
            <span className="rounded-radio bg-apagado px-2 py-0.5 text-[0.625rem] font-medium text-tinta-apagada">
              Completa
            </span>
          )}
          {episodios ? (
            <span className="rounded-radio bg-apagado px-2 py-0.5 text-[0.625rem] font-medium text-tinta-apagada tabular-nums">
              {episodios} ep
            </span>
          ) : null}
          {!estado && !episodios && etiqueta && (
            <span className="rounded-radio bg-apagado px-2 py-0.5 text-[0.625rem] font-medium text-tinta-apagada">
              {etiqueta}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
