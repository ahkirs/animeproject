import Link from 'next/link'
import type { ReactNode } from 'react'
import Lamina from './Lamina'
import Icono from './Icono'
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
      className="group/ficha w-[140px] shrink-0 xs:w-[160px] lg:w-[180px]"
      style={color ? ({ '--color-obra': color } as React.CSSProperties) : undefined}
    >
      <Link href={href} className="flex flex-col gap-2 no-underline">
        <div className="relative w-full overflow-hidden rounded-radio bg-tarjeta h-[200px] xs:h-[220px] lg:h-[260px]">
          {/* El hover lo lleva la propia imagen —apagarse y bajar el
              brillo—, como en la referencia: así se funde con el bloque
              de texto que se enciende debajo. */}
          <Lamina
            arte={arte}
            className="size-full object-cover transition-all duration-200 ease-out group-hover/ficha:opacity-75 group-hover/ficha:brightness-[0.7]"
          />

          {/* Guardar en ver después. Aparece al pasar por encima con la
              misma curva de la referencia: se encoge y se funde hasta
              que la tarjeta se observa, y al hover propio crece. */}
          <div className="absolute top-2 right-2 z-20 scale-75 opacity-0 transition-all duration-200 ease-out group-hover/ficha:scale-100 group-hover/ficha:opacity-100 group-hover/ficha:text-(--color-obra) focus-within:scale-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100 [@media(hover:none)]:scale-100">
            {accion ?? (
              <span className="pointer-events-none grid size-7 place-items-center rounded-full bg-fondo shadow-[0_2px_10px_rgb(0_0_0/0.4)]">
                <Icono nombre="mas" tam={15} />
              </span>
            )}
          </div>
        </div>

        {/* Título con el interlineado de la referencia y el tinte al
            color de la obra al pasar por encima. */}
        <h3
          className="tinte-obra line-clamp-2 text-sm leading-6 font-semibold text-balance text-tinta"
          title={titulo}
        >
          {titulo}
        </h3>

        {(estado || episodios || etiqueta) && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {estado === 'en-emision' && (
              <span className="pill-obra rounded bg-exito/20 px-2 py-0.5 text-[10px] font-medium text-exito xs:text-xs">
                En emisión
              </span>
            )}
            {estado === 'finalizada' && (
              <span className="pill-obra rounded bg-apagado/60 px-2 py-0.5 text-[10px] font-medium text-tinta-apagada xs:text-xs">
                Completa
              </span>
            )}
            {episodios ? (
              <span className="pill-obra rounded bg-apagado/60 px-2 py-0.5 text-[10px] font-medium text-tinta-apagada tabular-nums xs:text-xs">
                {episodios} ep
              </span>
            ) : null}
            {!estado && !episodios && etiqueta && (
              <span className="pill-obra rounded bg-apagado/60 px-2 py-0.5 text-[10px] font-medium text-tinta-apagada xs:text-xs">
                {etiqueta}
              </span>
            )}
          </div>
        )}
      </Link>
    </div>
  )
}