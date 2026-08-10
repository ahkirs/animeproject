import Link from 'next/link'
import type { ReactNode } from 'react'
import Lamina from './Lamina'
import Icono from './Icono'
import { colorDeObra } from '@/lib/color'
import type { Arte } from '@/lib/types'

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
  /** Géneros. Se pintan los dos primeros: con tres, la línea no cabe en los
   *  140px de la tarjeta pequeña y se corta por la mitad de una palabra. */
  generos?: string[]
  /** Año de estreno. El catálogo lo devuelve a nulo y solo llega con ficha,
   *  así que se omite cuando falta en vez de escribir un hueco. */
  anio?: number | null
  /** Número de episodios, si se sabe. */
  episodios?: number
  /** Tipo de obra («TV», «Película», «OVA»). Es lo único que el catálogo
   *  devuelve siempre, así que abre la línea cuando no hay géneros: sin él,
   *  en /explorar la línea entera se quedaría vacía. */
  etiqueta?: string
  /** Lo que va en la esquina de la carátula al pasar por encima: guardar
   *  en la lista. Se pasa desde fuera porque necesita sesión y acciones
   *  de servidor, y esta tarjeta se pinta en el servidor. */
  accion?: ReactNode
}

/** Tarjeta de una obra dentro de un riel o una rejilla. Clon de la
 *  tarjeta de Shiroko, con el grupo `group/card` y el color de la obra
 *  en `--color-obra` (ahí es `--media-color`). */
export default function FichaSerie({
  href,
  titulo,
  arte,
  id,
  generos,
  anio,
  episodios,
  etiqueta,
  accion,
}: Props) {
  const color = id ? colorDeObra(id) : undefined

  /* Una sola línea con todo lo que se sabe, separado por puntos medios. Se
     construye filtrando en vez de encadenando condicionales en el marcado:
     así el separador nunca queda suelto al principio ni al final cuando la
     API no manda el año, que es lo normal fuera de las obras con ficha. */
  const generosVisibles = (generos ?? []).slice(0, 2)
  const meta = [
    ...(generosVisibles.length > 0 ? generosVisibles : [etiqueta]),
    anio != null ? String(anio) : null,
    episodios ? `${episodios} eps` : null,
  ].filter(Boolean) as string[]

  return (
    <div
      className="group/card transition-opacity duration-200"
      style={color ? ({ '--color-obra': color } as React.CSSProperties) : undefined}
    >
      <Link
        href={href}
        className="relative flex w-[140px] shrink-0 cursor-pointer flex-col gap-2 text-start xs:w-[160px] lg:w-[180px]"
      >
        <div className="relative z-20 h-[200px] w-[140px] shrink-0 overflow-hidden rounded bg-tarjeta xs:h-[220px] xs:w-[160px] lg:h-[260px] lg:w-[180px]">
          {/* La carátula no se apaga al pasar por encima. El realce lo lleva
              el texto de abajo, que se tiñe del color de la obra: oscurecer
              además el arte deja la tarjeta más apagada que sus vecinas justo
              cuando se está mirando. */}
          <Lamina
            arte={arte}
            className="size-full object-cover transition-all duration-200 ease-out"
          />

          {/* Guardar en ver después. Aparece al pasar por encima con la
              misma animación de la tarjeta de Shiroko: fundido y
              encogido hasta que la tarjeta se observa, y al hover propio
              crece. */}
          <div className="absolute top-2 right-2 z-20 opacity-0 scale-75 transition-all duration-200 ease-out group-hover/card:scale-100 group-hover/card:opacity-100 focus-within:scale-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100 [@media(hover:none)]:scale-100">
            {accion ?? (
              <span className="pointer-events-none flex size-7 items-center justify-center rounded-full bg-fondo shadow group-hover/card:text-(--color-obra)">
                <Icono nombre="mas" tam={15} />
              </span>
            )}
          </div>
        </div>

        {/* Título y píldoras: todo el bloque se tiñe del color de la
            obra al pasar por encima, como el de la referencia. */}
        <div className="pointer-events-none flex w-full flex-col transition-all duration-200 ease-out group-hover/card:text-(--color-obra)">
          {/* Una línea y puntos suspensivos. Con dos líneas, las tarjetas de
              una fila acaban con el bloque de texto a alturas distintas según
              lo largo que sea cada título, y la fila pierde su base común.
              El título entero sigue estando en el `title`. */}
          <p className="truncate text-sm leading-6 font-semibold" title={titulo}>
            {titulo}
          </p>

          {meta.length > 0 && (
            <p className="truncate text-xs text-tinta-apagada">
              {meta.join(' · ')}
            </p>
          )}
        </div>
      </Link>
    </div>
  )
}