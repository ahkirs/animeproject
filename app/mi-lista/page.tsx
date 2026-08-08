import Link from 'next/link'
import type { Metadata } from 'next'
import Cabecera from '@/components/Cabecera'
import Pie from '@/components/Pie'
import Lamina from '@/components/Lamina'
import Icono from '@/components/Icono'
import {
  ESTADOS_LISTA,
  MI_LISTA,
  USUARIO,
  cuantasEnEstado,
  miLista,
  obtenerSerie,
  resumenLista,
  rutaReproductor,
  totalEpisodios,
} from '@/lib/catalogo'
import type { EntradaLista, EstadoLista } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Mi lista',
  description: 'Las series que sigues, tu progreso y tus puntuaciones.',
}

const ETIQUETA: Record<EstadoLista, string> = {
  viendo: 'Viendo',
  pendiente: 'Pendiente',
  completada: 'Completada',
  pausada: 'En pausa',
  abandonada: 'Abandonada',
}

async function Fila({ entrada }: { entrada: EntradaLista }) {
  const serie = await obtenerSerie(entrada.serieId)
  if (!serie) return null

  const total = totalEpisodios(serie)
  const porcentaje = total > 0 ? Math.round((entrada.episodiosVistos / total) * 100) : 0
  const destino = (await rutaReproductor(serie.id)) ?? `/serie/${serie.id}`

  return (
    <div className="grid grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-e3 border-b border-borde py-e3 transition-colors duration-150 ease-sal hover:bg-sala-800 max-[640px]:grid-cols-[56px_minmax(0,1fr)]">
      <Link href={`/serie/${serie.id}`} className="block no-underline">
        <span className="relative block aspect-2/3 overflow-hidden rounded-radio bg-sala-700 shadow-baja">
          <Lamina arte={serie.lamina} />
        </span>
      </Link>

      <div className="min-w-0">
        <Link href={`/serie/${serie.id}`} className="no-underline hover:text-ambar">
          <h3 className="truncate text-paso-2 font-semibold tracking-[-0.015em]">
            {serie.titulo}
          </h3>
        </Link>

        <p className="mt-[0.15rem] text-paso-0 text-hueso-45">
          {serie.genero}
          {serie.anio != null && <> · {serie.anio}</>}
        </p>

        <div className="mt-e2 flex items-center gap-e2">
          <div className="h-[3px] w-full max-w-[260px] bg-sala-600">
            <span
              className="block h-full bg-ambar"
              style={{ width: `${porcentaje}%` }}
            />
          </div>
          <span className="shrink-0 text-paso-0 text-hueso-45 tabular-nums">
            {entrada.episodiosVistos} / {total || '?'} ep
          </span>
        </div>
      </div>

      <div className="flex items-center gap-e3 max-[640px]:col-start-2 max-[640px]:mt-e2">
        {entrada.puntuacion !== undefined ? (
          <span className="text-paso-3 font-bold text-ambar tabular-nums">
            {entrada.puntuacion}
          </span>
        ) : (
          <span className="text-paso-0 text-hueso-45">Sin puntuar</span>
        )}

        <Link
          href={destino}
          className="inline-flex items-center gap-2 rounded-radio border border-borde-vivo bg-hueso/6 px-[0.9rem] py-[0.5rem] text-paso-0 font-semibold whitespace-nowrap text-hueso no-underline transition-colors duration-200 ease-sal hover:border-hueso-45 hover:bg-hueso/12"
        >
          <Icono nombre="play" tam={13} />
          Seguir
        </Link>
      </div>
    </div>
  )
}

export default async function MiLista({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>
}) {
  const sp = await searchParams
  const estado = ESTADOS_LISTA.some((e) => e.id === sp.estado)
    ? (sp.estado as EstadoLista)
    : undefined

  const entradas = miLista(estado)
  const resumen = resumenLista()
  const activo = ESTADOS_LISTA.find((e) => e.id === estado)

  return (
    <>
      <a
        href="#principal"
        className="absolute left-margen -top-[100px] z-100 rounded-radio bg-ambar px-[1.1rem] py-[0.7rem] font-bold text-ambar-tinta no-underline transition-all duration-200 ease-sal focus:top-e2"
      >
        Saltar al contenido
      </a>

      <Cabecera />

      <main id="principal" className="mx-auto max-w-[1600px] px-margen">
        {/* ---------- Perfil ---------- */}
        <section className="flex flex-wrap items-center gap-e4 border-b border-borde py-e5">
          <span
            aria-hidden="true"
            className="grid size-20 shrink-0 place-items-center rounded-full border border-borde-vivo bg-sala-600 font-display text-paso-4 text-hueso-70"
          >
            {USUARIO.iniciales}
          </span>

          <div>
            <h1 className="font-display text-paso-5 tracking-[-0.035em]">
              {USUARIO.nombre}
            </h1>
            <p className="mt-[0.2rem] text-paso-1 text-hueso-45">
              @{USUARIO.alias} · en KUROBA desde {USUARIO.desde}
            </p>
          </div>

          <dl className="ml-auto flex flex-wrap gap-e5 max-[640px]:ml-0 max-[640px]:gap-e4">
            {[
              { k: 'Series', v: resumen.series },
              { k: 'Episodios', v: resumen.episodios },
              { k: 'Horas', v: resumen.horas },
              {
                k: 'Media',
                v:
                  resumen.media !== undefined
                    ? resumen.media.toLocaleString('es-ES', {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })
                    : '—',
              },
            ].map((d) => (
              <div key={d.k}>
                <dt className="text-paso-0 font-bold tracking-[0.11em] text-hueso-45 uppercase">
                  {d.k}
                </dt>
                <dd className="m-0 mt-[0.15rem] font-display text-paso-4 leading-none tracking-[-0.02em] tabular-nums">
                  {d.v}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ---------- Pestañas de estado ---------- */}
        <nav
          aria-label="Estados de la lista"
          className="flex flex-wrap gap-e1 border-b border-borde py-e3"
        >
          <Link
            href="/mi-lista"
            aria-current={!estado ? 'page' : undefined}
            className={`inline-flex items-center gap-2 rounded-full border px-[0.9rem] py-[0.35rem] text-paso-0 font-bold tracking-[0.05em] uppercase no-underline transition-colors duration-200 ease-sal ${
              !estado
                ? 'border-ambar bg-ambar text-ambar-tinta'
                : 'border-borde-vivo text-hueso-70 hover:border-hueso-45 hover:text-hueso'
            }`}
          >
            Todas
            <span className={!estado ? 'text-ambar-tinta/60' : 'text-hueso-45'}>
              {MI_LISTA.length}
            </span>
          </Link>

          {ESTADOS_LISTA.map((e) => {
            const activa = estado === e.id
            return (
              <Link
                key={e.id}
                href={`/mi-lista?estado=${e.id}`}
                aria-current={activa ? 'page' : undefined}
                className={`inline-flex items-center gap-2 rounded-full border px-[0.9rem] py-[0.35rem] text-paso-0 font-bold tracking-[0.05em] uppercase no-underline transition-colors duration-200 ease-sal ${
                  activa
                    ? 'border-ambar bg-ambar text-ambar-tinta'
                    : 'border-borde-vivo text-hueso-70 hover:border-hueso-45 hover:text-hueso'
                }`}
              >
                {e.texto}
                <span className={activa ? 'text-ambar-tinta/60' : 'text-hueso-45'}>
                  {cuantasEnEstado(e.id)}
                </span>
              </Link>
            )
          })}
        </nav>

        {activo && (
          <p className="mt-e3 text-paso-1 text-hueso-45">{activo.descripcion}</p>
        )}

        {/* ---------- Entradas ---------- */}
        <section aria-label="Series de la lista" className="mt-e4 mb-e6">
          {entradas.length > 0 ? (
            entradas.map((e) => <Fila key={e.serieId} entrada={e} />)
          ) : (
            <div className="rounded-radio border border-dashed border-borde-vivo px-e4 py-e6 text-center">
              <p className="text-paso-3 font-semibold">
                Nada en {ETIQUETA[estado ?? 'viendo'].toLowerCase()}
              </p>
              <p className="mt-e2 text-paso-1 text-hueso-45">
                Las series que marques aparecerán aquí.
              </p>
              <Link
                href="/explorar"
                className="mt-e3 inline-flex items-center gap-2 rounded-radio bg-ambar px-[1.35rem] py-3 text-paso-1 font-semibold text-ambar-tinta no-underline transition-colors duration-200 ease-sal hover:bg-ambar-claro"
              >
                <Icono nombre="flecha" tam={16} />
                Explorar el catálogo
              </Link>
            </div>
          )}
        </section>

        <p className="mb-e6 rounded-radio border border-borde bg-sala-800 px-e3 py-e3 text-paso-0 text-hueso-45">
          Esta lista es de ejemplo. Todavía no hay cuentas: los datos están fijos en el
          código y marcar una serie no guarda nada. La base de datos y el registro
          llegan en el siguiente paso.
        </p>
      </main>

      <Pie />
    </>
  )
}
