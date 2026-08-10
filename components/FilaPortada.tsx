/* Una fila de la portada.

   La forma la decide la definición, no este componente: es lo que evita
   que veinte filas seguidas pesen todas lo mismo. Una pila de carátulas
   idénticas al mismo tamaño no tiene jerarquía, y sin jerarquía la
   página se recorre sin que nada llame. */

import Link from 'next/link'
import Riel from './Riel'
import FichaSerie from './FichaSerie'
import Lamina from './Lamina'
import TituloSeccion from './TituloSeccion'
import { colorDeObra } from '@/lib/color'
import type { DefinicionFila } from '@/lib/portada'
import type { Serie } from '@/lib/types'

/** Tarjeta con el puesto en cifra grande. El número se sale por abajo a
 *  la izquierda y la carátula lo tapa en parte: así se lee como un
 *  ranking y no como una lista numerada. */
function FichaNumerada({ serie, puesto }: { serie: Serie; puesto: number }) {
  return (
    <Link
      href={`/serie/${serie.id}`}
      className="group/card block w-[190px] shrink-0 no-underline lg:w-[230px]"
      style={{ '--color-obra': colorDeObra(serie.id) } as React.CSSProperties}
    >
      <div className="flex items-end gap-1">
        <span
          aria-hidden="true"
          className="-mb-2 shrink-0 font-titulo text-[clamp(3.2rem,6vw,4.6rem)] leading-[0.72] font-extrabold tracking-[-0.06em] text-apagado transition-colors duration-300 ease-sal group-hover/card:text-tinta-tenue cifras"
        >
          {puesto}
        </span>

        <div className="relative aspect-2/3 min-w-0 flex-1 overflow-hidden rounded-radio bg-tarjeta">
          <Lamina
            arte={serie.lamina}
            className="size-full object-cover transition-all duration-200 ease-out group-hover/card:opacity-75 group-hover/card:brightness-[0.7]"
          />
        </div>
      </div>

      <p className="tinte-obra mt-2 truncate text-sm font-semibold text-tinta">
        <span className="sr-only">Puesto {puesto}: </span>
        {serie.titulo}
      </p>
    </Link>
  )
}

export default function FilaPortada({
  fila,
  series,
}: {
  fila: DefinicionFila
  series: Serie[]
}) {
  // Una fila sin datos no se enseña vacía: el proveedor falla a menudo y
  // un hueco con título y nada dentro se lee como que el sitio está roto.
  if (series.length === 0) return null

  return (
    <section aria-labelledby={`t-${fila.id}`} className="mt-8">
      <TituloSeccion
        id={`t-${fila.id}`}
        titulo={fila.titulo}
        enlace="Ver todo"
        href={fila.href}
        grande={fila.forma === 'destacada' || fila.forma === 'numerada'}
      />

      <Riel etiqueta={fila.titulo}>
        {fila.forma === 'numerada'
          ? series.map((s, i) => (
              <FichaNumerada key={s.id} serie={s} puesto={i + 1} />
            ))
          : series.map((s) => (
              <FichaSerie
                key={s.id}
                id={s.id}
                href={`/serie/${s.id}`}
                titulo={s.titulo}
                arte={s.lamina}
                generos={s.generos}
                anio={s.anio}
                episodios={s.totalEpisodios || undefined}
                etiqueta={s.genero}
              />
            ))}
      </Riel>
    </section>
  )
}
