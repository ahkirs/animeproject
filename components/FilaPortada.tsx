/* Una fila de la portada.

   La forma la decide la definición, no este componente: es lo que evita
   que veinte filas seguidas pesen todas lo mismo. Una pila de carátulas
   idénticas al mismo tamaño no tiene jerarquía, y sin jerarquía la
   página se recorre sin que nada llame. */

import Link from 'next/link'
import Icono from './Icono'
import Riel from './Riel'
import FichaSerie from './FichaSerie'
import Lamina from './Lamina'
import { nombreProveedor } from '@/lib/ids'
import type { DefinicionFila } from '@/lib/portada'
import type { Serie } from '@/lib/types'

function Cabeza({ fila }: { fila: DefinicionFila }) {
  const grande = fila.forma === 'destacada' || fila.forma === 'numerada'

  return (
    <div className="mb-e3 flex items-baseline justify-between gap-e3">
      <h2
        id={`t-${fila.id}`}
        className={`tracking-[-0.03em] ${
          grande ? 'font-display text-paso-4' : 'text-paso-3 font-semibold'
        }`}
      >
        {fila.titulo}
      </h2>

      <Link
        href={fila.href}
        className="group inline-flex shrink-0 items-center gap-[0.3rem] text-paso-0 font-semibold text-hueso-45 no-underline transition-colors duration-200 ease-sal hover:text-ambar"
      >
        Ver todo
        <Icono
          nombre="flecha"
          tam={14}
          className="transition-transform duration-200 ease-sal group-hover:translate-x-[3px]"
        />
      </Link>
    </div>
  )
}

/** Tarjeta con el puesto en cifra grande. El número se sale por abajo a
 *  la izquierda y la carátula lo tapa en parte: así se lee como un
 *  ranking y no como una lista numerada. */
function FichaNumerada({ serie, puesto }: { serie: Serie; puesto: number }) {
  return (
    <Link href={`/serie/${serie.id}`} className="group block no-underline">
      <div className="flex items-end gap-[0.2rem]">
        <span
          aria-hidden="true"
          className="-mb-[0.6rem] shrink-0 font-display text-[clamp(3.2rem,6vw,4.6rem)] leading-[0.72] tracking-[-0.06em] text-sala-500 transition-colors duration-300 ease-sal group-hover:text-hueso-45 tabular-nums"
        >
          {puesto}
        </span>

        <div className="relative aspect-2/3 min-w-0 flex-1 overflow-hidden rounded-radio bg-sala-700 shadow-baja transition-all duration-300 ease-sal group-hover:-translate-y-[5px] group-hover:shadow-alta">
          <Lamina arte={serie.lamina} />
        </div>
      </div>

      <p className="mt-e2 truncate text-paso-1 font-semibold text-hueso-70 transition-colors duration-150 ease-sal group-hover:text-hueso">
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
    <section aria-labelledby={`t-${fila.id}`} className="mt-e5">
      <Cabeza fila={fila} />

      {fila.forma === 'numerada' ? (
        <Riel anchoNumerado>
          {series.map((s, i) => (
            <FichaNumerada key={s.id} serie={s} puesto={i + 1} />
          ))}
        </Riel>
      ) : (
        <Riel destacado={fila.forma === 'destacada'}>
          {series.map((s) => (
            <FichaSerie
              key={s.id}
              href={`/serie/${s.id}`}
              titulo={s.titulo}
              subtitulo={`${s.genero} · ${nombreProveedor(s.proveedor)}`}
              arte={s.lamina}
            />
          ))}
        </Riel>
      )}
    </section>
  )
}
