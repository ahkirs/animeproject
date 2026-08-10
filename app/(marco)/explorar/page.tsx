/* Explorar: el catálogo entero.

   Los filtros viven en la URL y no en estado de React. Es una decisión
   vieja del proyecto y se mantiene: así una búsqueda concreta se puede
   compartir, el botón de atrás hace lo que se espera y la página se
   pinta entera en el servidor sin hidratar nada.

   El cabezal de filtros va pegado arriba dentro del panel, que es lo
   único que se desplaza: al bajar por doscientas carátulas los filtros
   siguen ahí sin necesidad de volver al principio. */

import Link from 'next/link'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Icono from '@/components/Icono'
import FichaSerie from '@/components/FichaSerie'
import {
  ESTADOS,
  ORDENES,
  estaEnEmision,
  explorar,
  generosDisponibles,
  totalEpisodios,
  type EstadoSerie,
  type OrdenSerie,
} from '@/lib/catalogo'

export const metadata: Metadata = {
  title: 'Explorar',
  description:
    'Recorre el catálogo completo filtrando por género y orden de emisión.',
}

type Busqueda = {
  genero?: string
  estado?: string
  orden?: string
}

/** Construye la URL resultante de cambiar un filtro, conservando el
 *  resto. Pasar null en un campo lo quita. */
function conFiltro(
  actual: Busqueda,
  cambios: Partial<Record<keyof Busqueda, string | null>>,
) {
  const params = new URLSearchParams()
  const combinado = { ...actual, ...cambios }
  for (const [clave, valor] of Object.entries(combinado)) {
    if (valor) params.set(clave, valor)
  }
  const cadena = params.toString()
  return cadena ? `/explorar?${cadena}` : '/explorar'
}

function Pastilla({
  href,
  activa,
  children,
}: {
  href: string
  activa: boolean
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      aria-current={activa ? 'true' : undefined}
      className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap no-underline transition-colors duration-200 ease-sal ${
        activa
          ? 'border-transparent bg-acento text-acento-tinta'
          : 'border-borde bg-tarjeta text-tinta-apagada hover:border-borde-vivo hover:text-tinta'
      }`}
    >
      {children}
    </Link>
  )
}

/** Una fila de filtros. Se desplaza de lado en vez de partirse en varias
 *  líneas: con veinte géneros, envolver empuja la rejilla media pantalla
 *  hacia abajo y en móvil no se ve ni un resultado sin desplazar. */
function FilaFiltro({
  etiqueta,
  children,
}: {
  etiqueta: string
  children: ReactNode
}) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="sr-only">{etiqueta}</h2>
      <div className="sin-barra flex gap-1.5 overflow-x-auto py-0.5">{children}</div>
    </div>
  )
}

export default async function Explorar({
  searchParams,
}: {
  searchParams: Promise<Busqueda>
}) {
  const sp = await searchParams
  const generos = await generosDisponibles()

  const genero = generos.some((g) => g.slug === sp.genero) ? sp.genero : undefined
  const estado = ESTADOS.some((e) => e.id === sp.estado)
    ? (sp.estado as EstadoSerie)
    : undefined
  const orden = ORDENES.some((o) => o.id === sp.orden)
    ? (sp.orden as OrdenSerie)
    : 'titulo'

  const actual: Busqueda = {
    ...(genero && { genero }),
    ...(estado && { estado }),
    ...(orden !== 'titulo' && { orden }),
  }

  const resultados = await explorar({ genero, orden })
  const hayFiltros = Boolean(genero || estado)

  // El scraper no filtra por estado, así que se hace aquí con lo que
  // haya llegado.
  const visibles = estado
    ? resultados.filter((s) =>
        estado === 'emision' ? estaEnEmision(s) : !estaEnEmision(s),
      )
    : resultados

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-borde bg-lienzo/95 backdrop-blur-sm">
        <div className="space-y-2 px-bleed py-3">
          <h1 className="sr-only">Explorar el catálogo</h1>

          <FilaFiltro etiqueta="Género">
            <Pastilla href={conFiltro(actual, { genero: null })} activa={!genero}>
              Todos
            </Pastilla>
            {generos.map((g) => (
              <Pastilla
                key={g.slug}
                href={conFiltro(actual, { genero: g.slug })}
                activa={genero === g.slug}
              >
                {g.nombre}
              </Pastilla>
            ))}
          </FilaFiltro>

          <FilaFiltro etiqueta="Estado y orden">
            <Pastilla href={conFiltro(actual, { estado: null })} activa={!estado}>
              Cualquier estado
            </Pastilla>
            {ESTADOS.map((e) => (
              <Pastilla
                key={e.id}
                href={conFiltro(actual, { estado: e.id })}
                activa={estado === e.id}
              >
                {e.texto}
              </Pastilla>
            ))}

            <span aria-hidden="true" className="mx-1 w-px shrink-0 bg-borde" />

            {ORDENES.map((o) => (
              <Pastilla
                key={o.id}
                href={conFiltro(actual, { orden: o.id === 'titulo' ? null : o.id })}
                activa={orden === o.id}
              >
                {o.texto}
              </Pastilla>
            ))}
          </FilaFiltro>
        </div>
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-3 px-bleed pt-5">
        <p className="text-sm text-tinta-tenue cifras">
          {visibles.length === 1 ? '1 serie' : `${visibles.length} series`}
          {hayFiltros && ' con estos filtros'}
        </p>

        {hayFiltros && (
          <Link
            href="/explorar"
            className="text-sm font-semibold text-tinta-apagada no-underline transition-colors duration-150 hover:text-acento"
          >
            Limpiar filtros
          </Link>
        )}
      </div>

      {visibles.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-x-2 gap-y-6 px-bleed py-5 lg:grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
          {visibles.map((s) => (
            <FichaSerie
              key={s.id}
              id={s.id}
              href={`/serie/${s.id}`}
              titulo={s.titulo}
              arte={s.lamina}
              generos={s.generos}
              anio={s.anio}
              episodios={totalEpisodios(s) || undefined}
              etiqueta={s.genero}
            />
          ))}
        </div>
      ) : (
        <div className="mx-bleed my-10 rounded-radio border border-dashed border-borde-vivo px-8 py-16 text-center">
          <p className="text-lg font-semibold">Ninguna serie con estos filtros</p>
          <p className="mt-2 text-sm text-tinta-tenue">
            Prueba a quitar alguno. El catálogo se actualiza desde el proveedor.
          </p>
          <Link
            href="/explorar"
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-primario px-5 text-sm font-semibold text-primario-tinta no-underline transition-opacity duration-200 ease-sal hover:opacity-85"
          >
            <Icono nombre="flecha" tam={16} />
            Ver todo el catálogo
          </Link>
        </div>
      )}
    </>
  )
}
