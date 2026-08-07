import Link from 'next/link'
import type { Metadata } from 'next'
import Cabecera from '@/components/Cabecera'
import Pie from '@/components/Pie'
import Lamina from '@/components/Lamina'
import Icono from '@/components/Icono'
import {
  ESTADOS,
  ORDENES,
  aniosDisponibles,
  estaEnEmision,
  explorar,
  generosDisponibles,
  totalEpisodios,
  type EstadoSerie,
  type OrdenSerie,
} from '@/lib/catalogo'
import type { Serie } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Explorar',
  description:
    'Recorre el catálogo completo filtrando por género, año y estado de emisión.',
}

type Busqueda = {
  genero?: string
  anio?: string
  estado?: string
  orden?: string
}

/** Construye la URL resultante de cambiar un filtro, conservando el resto.
 *  Pasar null en un campo lo quita. */
function conFiltro(actual: Busqueda, cambios: Partial<Record<keyof Busqueda, string | null>>) {
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
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      aria-current={activa ? 'true' : undefined}
      className={`inline-flex items-center gap-2 rounded-full border px-[0.85rem] py-[0.3rem] text-paso-0 font-bold tracking-[0.05em] uppercase no-underline transition-colors duration-200 ease-sal ${
        activa
          ? 'border-ambar bg-ambar text-ambar-tinta'
          : 'border-borde-vivo text-hueso-70 hover:border-hueso-45 hover:text-hueso'
      }`}
    >
      {children}
    </Link>
  )
}

function GrupoFiltro({
  titulo,
  children,
}: {
  titulo: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] items-baseline gap-e3 border-b border-borde py-e3 max-[640px]:grid-cols-1 max-[640px]:gap-e2">
      <h2 className="text-paso-0 font-bold tracking-[0.12em] text-hueso-45 uppercase">
        {titulo}
      </h2>
      <div className="flex flex-wrap gap-e1">{children}</div>
    </div>
  )
}

function Tarjeta({ serie }: { serie: Serie }) {
  const emitiendo = estaEnEmision(serie)
  const episodios = totalEpisodios(serie)

  return (
    <Link href={`/serie/${serie.id}`} className="group block no-underline">
      <div className="relative aspect-2/3 overflow-hidden rounded-radio bg-sala-700 shadow-baja transition-all duration-300 ease-sal group-hover:-translate-y-[5px] group-hover:shadow-alta group-focus-visible:-translate-y-[5px] group-focus-visible:shadow-alta">
        <Lamina arte={serie.lamina} />
        {emitiendo && (
          <span className="absolute top-e2 left-e2 rounded-full bg-ambar px-[0.5rem] py-[0.1rem] text-[0.65rem] font-bold tracking-[0.08em] text-ambar-tinta uppercase">
            En emisión
          </span>
        )}
      </div>

      <h3 className="mt-e2 text-paso-1 font-semibold tracking-[-0.01em]">
        {serie.titulo}
      </h3>

      <p className="mt-[0.15rem] flex flex-wrap items-center gap-x-[0.4rem] text-paso-0 text-hueso-45 tabular-nums">
        <span className="font-bold text-ambar">
          {serie.nota.toLocaleString('es-ES', { minimumFractionDigits: 1 })}
        </span>
        <span aria-hidden="true">·</span>
        <span>{serie.anio}</span>
        {episodios > 0 && (
          <>
            <span aria-hidden="true">·</span>
            <span>{episodios} ep</span>
          </>
        )}
      </p>

      <p className="mt-[0.1rem] truncate text-paso-0 text-hueso-45">{serie.genero}</p>
    </Link>
  )
}

export default async function Explorar({
  searchParams,
}: {
  searchParams: Promise<Busqueda>
}) {
  const sp = await searchParams

  // Se validan contra las listas conocidas: un parámetro inventado en la
  // URL se ignora en lugar de romper la página.
  const genero = generosDisponibles().some((g) => g.nombre === sp.genero)
    ? sp.genero
    : undefined
  const anio = aniosDisponibles().includes(Number(sp.anio))
    ? Number(sp.anio)
    : undefined
  const estado = ESTADOS.some((e) => e.id === sp.estado)
    ? (sp.estado as EstadoSerie)
    : undefined
  const orden = ORDENES.some((o) => o.id === sp.orden)
    ? (sp.orden as OrdenSerie)
    : 'nota'

  const actual: Busqueda = {
    ...(genero && { genero }),
    ...(anio && { anio: String(anio) }),
    ...(estado && { estado }),
    ...(orden !== 'nota' && { orden }),
  }

  const resultados = explorar({ genero, anio, estado, orden })
  const hayFiltros = Boolean(genero || anio || estado)

  return (
    <>
      <a
        href="#principal"
        className="absolute left-margen -top-[100px] z-100 rounded-radio bg-ambar px-[1.1rem] py-[0.7rem] font-bold text-ambar-tinta no-underline transition-all duration-200 ease-sal focus:top-e2"
      >
        Saltar al contenido
      </a>

      <Cabecera activa="explorar" />

      <main id="principal" className="mx-auto max-w-[1600px] px-margen">
        <div className="pt-e4 pb-e3">
          <h1 className="font-display text-paso-5 tracking-[-0.035em]">Explorar</h1>
          <p className="mt-e2 max-w-[60ch] text-hueso-70">
            Todo el catálogo, filtrado por género, año y estado de emisión.
          </p>
        </div>

        {/* ---------- Filtros ---------- */}
        <section aria-label="Filtros" className="border-t border-borde">
          <GrupoFiltro titulo="Género">
            <Pastilla href={conFiltro(actual, { genero: null })} activa={!genero}>
              Todos
            </Pastilla>
            {generosDisponibles().map((g) => (
              <Pastilla
                key={g.nombre}
                href={conFiltro(actual, { genero: g.nombre })}
                activa={genero === g.nombre}
              >
                {g.nombre}
                <span
                  className={genero === g.nombre ? 'text-ambar-tinta/60' : 'text-hueso-45'}
                >
                  {g.cuantas}
                </span>
              </Pastilla>
            ))}
          </GrupoFiltro>

          <GrupoFiltro titulo="Año">
            <Pastilla href={conFiltro(actual, { anio: null })} activa={!anio}>
              Cualquiera
            </Pastilla>
            {aniosDisponibles().map((a) => (
              <Pastilla
                key={a}
                href={conFiltro(actual, { anio: String(a) })}
                activa={anio === a}
              >
                {a}
              </Pastilla>
            ))}
          </GrupoFiltro>

          <GrupoFiltro titulo="Estado">
            <Pastilla href={conFiltro(actual, { estado: null })} activa={!estado}>
              Cualquiera
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
          </GrupoFiltro>

          <GrupoFiltro titulo="Orden">
            {ORDENES.map((o) => (
              <Pastilla
                key={o.id}
                href={conFiltro(actual, { orden: o.id === 'nota' ? null : o.id })}
                activa={orden === o.id}
              >
                {o.texto}
              </Pastilla>
            ))}
          </GrupoFiltro>
        </section>

        {/* ---------- Resultados ---------- */}
        <div className="mt-e4 mb-e4 flex flex-wrap items-baseline justify-between gap-e2">
          <p className="text-paso-1 text-hueso-70 tabular-nums">
            {resultados.length === 1
              ? '1 serie'
              : `${resultados.length} series`}
            {hayFiltros && ' con estos filtros'}
          </p>

          {hayFiltros && (
            <Link
              href="/explorar"
              className="inline-flex items-center gap-[0.35rem] text-paso-1 font-semibold text-hueso-70 no-underline hover:text-ambar"
            >
              Limpiar filtros
            </Link>
          )}
        </div>

        {resultados.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-e3">
            {resultados.map((s) => (
              <Tarjeta key={s.id} serie={s} />
            ))}
          </div>
        ) : (
          <div className="rounded-radio border border-dashed border-borde-vivo px-e4 py-e6 text-center">
            <p className="text-paso-3 font-semibold">Ninguna serie con estos filtros</p>
            <p className="mt-e2 text-paso-1 text-hueso-45">
              Prueba a quitar alguno. El catálogo todavía es pequeño.
            </p>
            <Link
              href="/explorar"
              className="mt-e3 inline-flex items-center gap-2 rounded-radio bg-ambar px-[1.35rem] py-3 text-paso-1 font-semibold text-ambar-tinta no-underline transition-colors duration-200 ease-sal hover:bg-ambar-claro"
            >
              <Icono nombre="flecha" tam={16} />
              Ver todo el catálogo
            </Link>
          </div>
        )}
      </main>

      <Pie />
    </>
  )
}
