import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Marca } from '@/components/Cabecera'
import Pie from '@/components/Pie'
import Icono from '@/components/Icono'
import Lamina from '@/components/Lamina'
import Datos, { Clasificacion } from '@/components/Datos'
import Boton from '@/components/Boton'
import { obtenerSerie, obtenerTemporada, enlacesDeEpisodio } from '@/lib/catalogo'
import Reproductor from '@/components/Reproductor'

type Params = Promise<{ id: string; temporada: string; episodio: string }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { id, temporada, episodio } = await params
  const serie = await obtenerSerie(id)
  if (!serie) return {}
  return { title: `${serie.titulo} T${temporada} E${episodio}` }
}

export default async function PaginaVer({ params }: { params: Params }) {
  const { id, temporada, episodio } = await params
  const serie = await obtenerSerie(id)
  if (!serie) notFound()

  const temp = obtenerTemporada(serie, Number(temporada))
  const episodios = temp?.episodios ?? []
  const num = Number(episodio)
  const actual = episodios.find((e) => e.numero === num) ?? episodios[0]
  const siguiente = episodios.find((e) => e.numero === (actual?.numero ?? 0) + 1)

  if (!actual) notFound()

  let enlaces = null
  try {
    enlaces = (await enlacesDeEpisodio(serie, actual.numero)) ?? null
  } catch {
    enlaces = null
  }

  return (
    <div className="bg-[#060505]">
      <a
        href="#visor"
        className="absolute left-margen -top-[100px] z-100 rounded-radio bg-ambar px-[1.1rem] py-[0.7rem] font-bold text-ambar-tinta no-underline transition-all duration-200 ease-sal focus:top-e2"
      >
        Saltar al reproductor
      </a>

      {/* ---------- Barra superior ---------- */}
      <div className="sticky top-0 z-60 flex items-center gap-e3 border-b border-borde bg-sala-900 px-margen py-e2">
        <Link
          href={`/serie/${serie.id}`}
          className="inline-flex items-center gap-2 py-[0.35rem] text-paso-1 font-semibold text-hueso-70 no-underline hover:text-hueso"
        >
          <Icono nombre="atras" tam={18} />
          {serie.titulo}
        </Link>

        <Marca className="mx-auto !text-paso-2" />

        <p className="ml-auto text-right text-paso-1 text-hueso-45 max-[640px]:text-paso-0">
          <b className="font-semibold text-hueso">
            T{temporada} · E{String(actual.numero).padStart(2, '0')}
          </b>
          <br />
          {actual.titulo}
        </p>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_350px] items-start max-[1100px]:grid-cols-[minmax(0,1fr)]">
        <div>
          {/* ---------- Visor ---------- */}
          <Reproductor
            enlaces={enlaces}
            titulo={`${serie.titulo} · T${temporada} · E${String(actual.numero).padStart(2, '0')}`}
            proveedorUrl={actual.url}
            urlSiguiente={
              siguiente
                ? `/ver/${serie.id}/${temporada}/${siguiente.numero}`
                : undefined
            }
          />

          {/* ---------- Debajo del reproductor ---------- */}
          <div className="px-e4 pt-e4 pb-e6 max-[640px]:px-e3 max-[640px]:pt-e3 max-[640px]:pb-e5">
            <Link
              href={`/serie/${serie.id}`}
              className="text-paso-1 font-semibold text-ambar no-underline hover:underline"
            >
              {serie.titulo} · Temporada {temporada}
            </Link>

            <h1 className="mt-e2 mb-e2 font-display text-paso-4 tracking-[-0.03em]">
              E{String(actual.numero).padStart(2, '0')} — {actual.titulo}
            </h1>

            <Datos>
              {actual.duracionMin != null && <>{actual.duracionMin} min</>}
              <>Japonés con subtítulos</>
              {serie.clasificacion && <Clasificacion valor={serie.clasificacion} />}
            </Datos>

            {actual.sinopsis && (
              <p className="mt-e3 max-w-[68ch] text-hueso-70">{actual.sinopsis}</p>
            )}

            <div className="mt-e4 flex flex-wrap gap-e2">
              <Boton type="button">
                <Icono nombre="mas" tam={17} />
                Mi lista
              </Boton>
              <Boton type="button">
                <Icono nombre="descarga" tam={17} />
                Descargar
              </Boton>
              <Boton type="button">Denunciar un problema</Boton>
            </div>
          </div>
        </div>

        {/* ---------- Cola de episodios ---------- */}
        <aside
          aria-label="Episodios de la temporada"
          className="sticky top-[57px] max-h-[calc(100vh-57px)] min-h-full overflow-y-auto border-l border-borde bg-sala-900 max-[1100px]:static max-[1100px]:max-h-none max-[1100px]:border-t max-[1100px]:border-l-0"
        >
          <div className="sticky top-0 z-2 flex items-center justify-between gap-e2 border-b border-borde bg-sala-900 p-e3">
            <h2 className="text-paso-0 font-bold tracking-[0.11em] text-hueso-45 uppercase">
              Temporada {temporada}
            </h2>

            <label className="inline-flex cursor-pointer items-center gap-2 text-paso-0 text-hueso-70">
              <input type="checkbox" defaultChecked className="peer sr-only" />
              <span
                aria-hidden="true"
                className="relative h-[19px] w-[34px] shrink-0 rounded-full bg-sala-500 transition-colors duration-200 ease-sal after:absolute after:top-[2px] after:left-[2px] after:size-[15px] after:rounded-full after:bg-hueso-45 after:transition-all after:duration-200 after:ease-sal after:content-[''] peer-checked:bg-ambar peer-checked:after:left-[17px] peer-checked:after:bg-ambar-tinta peer-focus-visible:outline-2 peer-focus-visible:outline-offset-[3px] peer-focus-visible:outline-ambar"
              />
              Encadenar
            </label>
          </div>

          {episodios.map((ep) => {
            const esActual = ep.numero === actual.numero
            const bloqueado = ep.estado === 'bloqueado'

            const clases = `grid grid-cols-[118px_1fr] items-start gap-e2 border-b border-borde px-e3 py-e2 no-underline transition-colors duration-150 ease-sal ${
              bloqueado ? 'pointer-events-none opacity-50' : 'hover:bg-sala-800'
            } ${esActual ? 'bg-sala-800 shadow-[inset_3px_0_0_var(--color-ambar)]' : ''}`

            const contenido = (
              <>
                <span className="relative aspect-video overflow-hidden rounded-radio bg-sala-700">
                  <Lamina arte={ep.lamina} />
                </span>
                <span>
                  <b className="block text-paso-1 font-semibold tracking-[-0.01em]">
                    E{String(ep.numero).padStart(2, '0')} · {ep.titulo}
                  </b>
                  <small className="mt-[0.15rem] block text-paso-0 text-hueso-45">
                    {bloqueado
                      ? ep.disponible
                      : `${ep.duracionMin != null ? `${ep.duracionMin} min · ` : ''}${
                          esActual
                            ? 'viendo ahora'
                            : ep.estado === 'visto'
                              ? 'visto'
                              : (ep.disponible ?? 'disponible')
                        }`}
                  </small>
                </span>
              </>
            )

            if (bloqueado) {
              return (
                <div key={ep.numero} className={clases}>
                  {contenido}
                </div>
              )
            }

            return (
              <Link
                key={ep.numero}
                href={`/ver/${serie.id}/${temporada}/${ep.numero}`}
                aria-current={esActual ? true : undefined}
                className={clases}
              >
                {contenido}
              </Link>
            )
          })}

          {siguiente && (
            <div className="m-e3 rounded-radio border border-borde-vivo bg-sala-800 p-e3">
              <h3 className="mb-e2 text-paso-0 font-bold tracking-[0.11em] text-hueso-45 uppercase">
                A continuación
              </h3>
              <b className="block text-paso-2 font-semibold">
                E{String(siguiente.numero).padStart(2, '0')} — {siguiente.titulo}
              </b>
              <p className="mt-[0.3rem] mb-e3 text-paso-1 text-hueso-45">
                Se reproduce solo al terminar este episodio.
              </p>
              <Link
                href={`/ver/${serie.id}/${temporada}/${siguiente.numero}`}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-radio border border-transparent bg-ambar px-[1.35rem] py-3 text-paso-1 font-semibold whitespace-nowrap text-ambar-tinta no-underline transition-all duration-200 ease-sal hover:bg-ambar-claro active:translate-y-px"
              >
                <Icono nombre="play" tam={16} />
                Reproducir ahora
              </Link>
            </div>
          )}
        </aside>
      </div>

      <Pie
        pegado
        aviso="La reproducción se incrusta desde el proveedor de origen y depende de él: el catálogo no almacena ni distribuye vídeo."
      />
    </div>
  )
}
