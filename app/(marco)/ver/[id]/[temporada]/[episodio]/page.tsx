/* El reproductor.

   Vive dentro del marco de la aplicación como cualquier otra página: la
   barra propia que tenía antes desaparece, porque duplicaba lo que ya
   hace la de arriba.

   La cola de episodios va al lado en pantallas anchas y debajo en las
   estrechas. No se desplaza por su cuenta: el único elemento con scroll
   de la aplicación es el panel del marco, y meter otro dentro obliga a
   adivinar en cuál está el ratón. */

import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Icono from '@/components/Icono'
import Lamina from '@/components/Lamina'
import Datos, { Clasificacion } from '@/components/Datos'
import Comentarios from '@/components/Comentarios'
import Reproductor from '@/components/Reproductor'
import { obtenerSerie, obtenerTemporada, enlacesDeEpisodio } from '@/lib/catalogo'
import { nombreDeServidor } from '@/lib/api'

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

  const etiquetaEp = `E${String(actual.numero).padStart(2, '0')}`
  const idEpisodio = enlaces?.id != null ? String(enlaces.id) : undefined

  // Las descargas que publica el propio proveedor. No es lo mismo que el
  // encolado del backend (POST /v1/anime/download), que guarda el archivo
  // en su disco y no en el de quien mira: esto son los enlaces directos
  // que ya vienen con el episodio.
  const descargas = [
    ...(enlaces?.downloadLinks?.SUB ?? []),
    ...(enlaces?.downloadLinks?.DUB ?? []),
  ]

  return (
    <div className="mx-auto max-w-[1800px] px-2 pt-2">
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <Reproductor
            enlaces={enlaces}
            titulo={`${serie.titulo} · T${temporada} · ${etiquetaEp}`}
            proveedorUrl={actual.url}
            urlSiguiente={
              siguiente
                ? `/ver/${serie.id}/${temporada}/${siguiente.numero}`
                : undefined
            }
            serieId={serie.id}
            serieTitulo={serie.titulo}
            episodioId={idEpisodio}
            episodioTitulo={`${etiquetaEp} — ${actual.titulo}`}
            imagen={typeof serie.lamina === 'string' ? serie.lamina : undefined}
          />

          <div className="px-2 pt-5 lg:px-4">
            <Link
              href={`/serie/${serie.id}`}
              className="text-sm font-semibold text-primario no-underline hover:underline"
            >
              {serie.titulo}
            </Link>

            <h1 className="mt-1 font-titulo text-xl font-extrabold tracking-[-0.02em] text-balance lg:text-2xl">
              {etiquetaEp} — {actual.titulo}
            </h1>

            <div className="mt-3">
              <Datos>
                {actual.duracionMin != null && <>{actual.duracionMin} min</>}
                <>Japonés con subtítulos</>
                {serie.clasificacion && <Clasificacion valor={serie.clasificacion} />}
              </Datos>
            </div>

            {actual.sinopsis && (
              <p className="mt-4 max-w-[68ch] text-sm leading-relaxed text-tinta-apagada">
                {actual.sinopsis}
              </p>
            )}

            {descargas.length > 0 && (
              <details className="group/desc mt-5 max-w-md">
                <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full border border-borde bg-tarjeta px-4 py-2 text-sm font-semibold text-tinta transition-colors duration-200 ease-sal hover:border-borde-vivo hover:bg-apagado [&::-webkit-details-marker]:hidden">
                  <Icono nombre="descarga" tam={16} />
                  Descargar
                  <span className="text-xs text-tinta-tenue cifras">
                    {descargas.length}
                  </span>
                </summary>

                <ul className="m-0 mt-2 grid list-none gap-1 rounded-radio border border-borde bg-tarjeta p-1.5">
                  {descargas.map((d) => (
                    <li key={`${d.server}-${d.url}`}>
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="flex items-center justify-between gap-3 rounded-radio px-3 py-2 text-sm text-tinta-apagada no-underline transition-colors duration-150 hover:bg-apagado hover:text-tinta"
                      >
                        {nombreDeServidor(d.server)}
                        {d.quality && (
                          <span className="text-xs text-tinta-tenue">{d.quality}</span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>

                <p className="mt-2 text-xs text-tinta-tenue">
                  Los archivos los sirve el proveedor de origen, no este sitio.
                </p>
              </details>
            )}
          </div>
        </div>

        {/* ---------- Cola de episodios ---------- */}
        <aside
          aria-label="Episodios de la temporada"
          className="min-w-0 rounded-radio border border-borde"
        >
          <div className="flex items-center justify-between gap-3 border-b border-borde px-4 py-3">
            <h2 className="text-sm font-semibold text-tinta">
              {temp?.etiqueta ?? 'Episodios'}
            </h2>
            <span className="text-xs text-tinta-tenue cifras">
              {episodios.length}
            </span>
          </div>

          {/* Con mil episodios (One Piece) la lista completa son mil nodos
              en el HTML. Se recorta a una ventana alrededor del actual y
              para lo demás está la ficha, que tiene buscador. */}
          <ul className="m-0 max-h-[70dvh] list-none overflow-y-auto p-0">
            {ventanaDe(episodios, actual.numero).map((ep) => {
              const esActual = ep.numero === actual.numero
              return (
                <li key={ep.numero}>
                  <Link
                    href={`/ver/${serie.id}/${temporada}/${ep.numero}`}
                    aria-current={esActual ? true : undefined}
                    className={`grid grid-cols-[110px_1fr] items-start gap-3 border-b border-borde px-3 py-2.5 no-underline transition-colors duration-150 ease-sal hover:bg-apagado ${
                      esActual ? 'bg-apagado' : ''
                    }`}
                  >
                    <span className="relative aspect-video overflow-hidden rounded-radio bg-tarjeta">
                      <Lamina arte={ep.lamina} />
                      {esActual && (
                        <span className="absolute inset-0 grid place-items-center bg-black/50">
                          <Icono nombre="play" tam={16} className="text-primario" />
                        </span>
                      )}
                    </span>
                    <span className="min-w-0">
                      <b
                        className={`block truncate text-sm font-semibold ${
                          esActual ? 'text-primario' : 'text-tinta'
                        }`}
                      >
                        E{String(ep.numero).padStart(2, '0')} · {ep.titulo}
                      </b>
                      <small className="mt-0.5 block text-xs text-tinta-tenue">
                        {esActual ? 'viendo ahora' : (ep.disponible ?? 'disponible')}
                      </small>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>

          {episodios.length > VENTANA && (
            <Link
              href={`/serie/${serie.id}`}
              className="block px-4 py-3 text-center text-xs font-semibold text-tinta-tenue no-underline transition-colors duration-150 hover:text-tinta"
            >
              Ver los {episodios.length} episodios
            </Link>
          )}
        </aside>
      </div>

      {idEpisodio && (
        <Comentarios
          animeId={serie.id}
          episodeId={idEpisodio}
          titulo="Comentarios del episodio"
        />
      )}
    </div>
  )
}

/** Cuántos episodios caben en la cola lateral antes de que deje de ser
 *  una cola y pase a ser el catálogo entero. */
const VENTANA = 40

/** Recorta la lista a una ventana centrada en el episodio que se está
 *  viendo, para que los de alrededor —que son a los que se salta— queden
 *  siempre a la vista. */
function ventanaDe<T extends { numero: number }>(episodios: T[], actual: number): T[] {
  if (episodios.length <= VENTANA) return episodios
  const indice = Math.max(0, episodios.findIndex((e) => e.numero === actual))
  const desde = Math.max(0, Math.min(indice - 8, episodios.length - VENTANA))
  return episodios.slice(desde, desde + VENTANA)
}
