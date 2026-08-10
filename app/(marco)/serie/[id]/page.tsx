/* Ficha de una obra.

   El cabezal reproduce el esquema de la referencia (Shiroko): la
   panorámica al fondo, recortada con una máscara hacia abajo y un velo
   oscuro encima, la carátula de 180×260 apoyada a la izquierda con un
   zoom al pasar por encima y, a su derecha, todo lo que se lee. Debajo,
   el contenido se reparte en la misma rejilla que la referencia: dos
   tercios para los episodios y las obras relacionadas, un tercio para
   el reparto y los datos de la obra.

   Tres de esas secciones son nuevas y salen de endpoints que llevaban
   tiempo construidos sin que nadie los llamara: las relaciones vienen
   dentro de /anime/info, y la nota y los comentarios de /ratings y
   /comments. */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Icono from '@/components/Icono'
import Lamina from '@/components/Lamina'
import FichaSerie from '@/components/FichaSerie'
import Riel from '@/components/Riel'
import TituloSeccion from '@/components/TituloSeccion'
import ListaEpisodios from '@/components/ListaEpisodios'
import BotonFavorito from '@/components/BotonFavorito'
import NotaComunidad from '@/components/NotaComunidad'
import Comentarios from '@/components/Comentarios'
import { BotonEnlace, EnlaceIcono } from '@/components/Boton'
import { guardarEnFavoritos, guardarEnWatchlist } from '@/lib/acciones'
import { notaDe } from '@/lib/valoraciones'
import { haySesion } from '@/lib/sesion'
import { colorDeObra } from '@/lib/color'
import {
  obtenerSerie,
  obtenerTemporada,
  rutaReproductor,
  temporadaDe,
  tendencias,
  totalEpisodios,
} from '@/lib/catalogo'
import { nombreProveedor } from '@/lib/ids'
import type { Serie } from '@/lib/types'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const serie = await obtenerSerie(id)
  if (!serie) return {}
  return {
    title: serie.titulo,
    description: serie.sinopsisCorta || serie.sinopsis,
  }
}

/* ------------------------------------------------------------
   Piezas del cabezal
   ------------------------------------------------------------ */

/** Dato duro. El primero toma el color de la obra; el resto van en
 *  apagado, porque si todo va coloreado no destaca nada. */
function Chapa({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <span
      style={color ? { backgroundColor: color } : undefined}
      className={`inline-flex h-6 items-center rounded-radio px-2.5 text-xs font-semibold cifras ${
        color ? 'text-fondo' : 'bg-apagado text-tinta-apagada'
      }`}
    >
      {children}
    </span>
  )
}

function chapasDe(serie: Serie): string[] {
  const total = totalEpisodios(serie)
  return [
    serie.estado === 'en-emision'
      ? 'En emisión'
      : serie.estado === 'finalizada'
        ? 'Finalizada'
        : null,
    temporadaDe(serie.fechaInicio),
    total > 0 ? `${total} episodios` : null,
    serie.temporadaEtiqueta,
  ].filter(Boolean) as string[]
}

/** Estado vacío con su explicación. Decir por qué no hay nada vale más
 *  que un hueco: aquí la razón es siempre que el proveedor no lo manda. */
function Vacio({ children }: { children: ReactNode }) {
  return (
    <p className="mx-auto mt-10 max-w-[52ch] rounded-radio border border-dashed border-borde-vivo px-6 py-10 text-center text-sm text-tinta-tenue">
      {children}
    </p>
  )
}

/** Rótulo de sección de la rejilla de contenido, con el mismo aire que
 *  las pestañas que sustituye pero sin navegación. */
function Rotulo({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-4 text-xl font-semibold text-tinta">{children}</h2>
  )
}

/* ------------------------------------------------------------ */

export default async function Ficha({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const serie = await obtenerSerie(id)
  if (!serie) notFound()

  const [ruta, recomendaciones, nota, conSesion] = await Promise.all([
    rutaReproductor(serie.id),
    tendencias(12, 0),
    notaDe(serie.id),
    haySesion(),
  ])

  const temporada = obtenerTemporada(serie)
  const relacionadas = serie.relacionadas ?? []
  const color = colorDeObra(serie.id)
  const chapas = chapasDe(serie)
  const sinopsis = serie.sinopsis || serie.sinopsisCorta

  const paraGuardar = {
    animeId: serie.id,
    titulo: serie.titulo,
    imagen: typeof serie.lamina === 'string' ? serie.lamina : undefined,
    tipo: serie.temporadaEtiqueta,
  }

  return (
    <>
      {/* ========== Cabezal ==========
          La panorámica va de fondo con dos velos: la máscara la desvanece
          hacia abajo y el velo oscuro la apaga para que lo escrito se
          lea. En móvil todo se centra (carátula arriba, título, botones)
          como hace la referencia; en escritorio la carátula se apoya a la
          izquierda y el texto se justifica contra ella. */}
      <section
        aria-labelledby="titulo-obra"
        data-heroe=""
        className="bajo-barra relative isolate overflow-hidden pt-[var(--alto-barra)]"
      >
        <div aria-hidden="true" className="absolute inset-0 z-0 h-[420px] lg:h-[360px]">
          <div className="velo-abajo size-full opacity-60 blur-[2px]">
            <Lamina arte={serie.panoramica ?? 'panoramica-obra'} />
          </div>
          <div className="absolute inset-0 z-10 bg-fondo/55" />
        </div>

        <div className="relative z-20 mx-auto w-full max-w-[1440px] px-bleed pt-[max(4.5rem,env(safe-area-inset-top,0px))] pb-6 lg:pt-36">
          {/* ---- Móvil: todo centrado ---- */}
          <div className="flex flex-col items-center gap-4 lg:hidden">
            <div className="relative aspect-2/3 w-[180px] overflow-hidden rounded-radio bg-tarjeta shadow-[0_10px_40px_rgb(0_0_0/0.45)]">
              <Lamina arte={serie.lamina} />
            </div>

            {serie.tituloOriginal && serie.tituloOriginal !== serie.titulo && (
              <p className="line-clamp-1 text-xs text-tinta-tenue">
                {serie.tituloOriginal}
              </p>
            )}
            <h1
              id="titulo-obra"
              className="text-center font-titulo text-2xl leading-tight font-extrabold tracking-[-0.02em] text-balance"
            >
              {serie.titulo}
            </h1>

            {chapas.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {serie.nota != null && (
                  <Chapa color={color}>{Math.round(serie.nota * 10)}%</Chapa>
                )}
                {chapas.map((c) => (
                  <Chapa key={c}>{c}</Chapa>
                ))}
              </div>
            )}

            {/* ---- Acciones ---- */}
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              {ruta ? (
                <BotonEnlace href={ruta} variante="primario" className="w-44">
                  <Icono nombre="play" tam={15} />
                  Ver ahora
                </BotonEnlace>
              ) : (
                <BotonEnlace href="#episodios" variante="secundario">
                  Sin episodios reproducibles
                </BotonEnlace>
              )}

              {conSesion && (
                <>
                  <BotonFavorito
                    accion={guardarEnFavoritos.bind(null, paraGuardar)}
                    titulo={`${serie.titulo} en favoritos`}
                  />
                  <BotonFavorito
                    accion={guardarEnWatchlist.bind(null, paraGuardar)}
                    titulo={`${serie.titulo} en ver después`}
                    icono="marcador"
                    iconoGuardado="check"
                  />
                </>
              )}

              {serie.malId && (
                <EnlaceIcono
                  href={`https://myanimelist.net/anime/${serie.malId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Ver en MyAnimeList"
                  title="Ver en MyAnimeList"
                >
                  <Icono nombre="compartir" tam={17} />
                </EnlaceIcono>
              )}
            </div>

            {sinopsis && (
              <details className="group/sinopsis mt-1 w-full">
                <summary className="cursor-pointer list-none text-center [&::-webkit-details-marker]:hidden">
                  <span className="line-clamp-2 text-sm leading-relaxed text-tinta-apagada group-open/sinopsis:line-clamp-none">
                    {sinopsis}
                  </span>
                  <span className="mt-1 inline-block text-xs font-semibold text-acento">
                    <span className="group-open/sinopsis:hidden">Leer más</span>
                    <span className="hidden group-open/sinopsis:inline">Leer menos</span>
                  </span>
                </summary>
              </details>
            )}
          </div>

          {/* ---- Escritorio: carátula a la izquierda, texto a la derecha ---- */}
          <div className="hidden lg:flex gap-8">
            <div className="group relative aspect-2/3 w-[220px] shrink-0 overflow-hidden rounded-radio bg-tarjeta shadow-[0_16px_50px_rgb(0_0_0/0.5)]">
              <Lamina arte={serie.lamina} />
              {/* Zoom de carátula: como el maximizador de la referencia,
                  un velo que se enciende y un icono que crece. */}
              <span
                aria-hidden="true"
                className="absolute inset-0 grid place-items-center bg-black/0 transition-colors duration-300 ease-sal group-hover:bg-black/45"
              >
                <Icono
                  nombre="compartir"
                  tam={28}
                  className="scale-75 text-white opacity-0 transition-all duration-300 ease-sal group-hover:scale-100 group-hover:opacity-100"
                />
              </span>
            </div>

            <div className="flex min-w-0 flex-1 flex-col justify-end">
              {serie.tituloOriginal && serie.tituloOriginal !== serie.titulo && (
                <p className="mb-1 line-clamp-1 text-xs text-tinta-tenue">
                  {serie.tituloOriginal}
                </p>
              )}

              <h1
                id="titulo-obra"
                className="font-titulo text-4xl leading-tight font-extrabold tracking-[-0.02em] text-balance"
              >
                {serie.titulo}
              </h1>

              {chapas.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  {serie.nota != null && (
                    <Chapa color={color}>{Math.round(serie.nota * 10)}%</Chapa>
                  )}
                  {chapas.map((c) => (
                    <Chapa key={c}>{c}</Chapa>
                  ))}
                </div>
              )}

              {serie.generos.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {serie.generos.map((g) => (
                    <Link
                      key={g}
                      href={`/explorar?genero=${encodeURIComponent(
                        g.toLowerCase().replace(/\s+/g, '-'),
                      )}`}
                      className="inline-flex h-6 items-center rounded-radio border border-borde px-2.5 text-xs text-tinta-apagada no-underline transition-colors duration-200 ease-sal hover:border-borde-vivo hover:text-tinta"
                    >
                      {g}
                    </Link>
                  ))}
                </div>
              )}

              {/* Sinopsis a dos líneas con «leer más»: un <details> sin
                  JavaScript, que además cede al teclado por sí solo. */}
              {sinopsis && (
                <details className="group/sinopsis mt-5 max-w-[80ch]">
                  <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                    <span className="line-clamp-2 text-sm leading-relaxed text-tinta-apagada group-open/sinopsis:line-clamp-none">
                      {sinopsis}
                    </span>
                    <span className="mt-1 inline-block text-xs font-semibold text-acento">
                      <span className="group-open/sinopsis:hidden">Leer más</span>
                      <span className="hidden group-open/sinopsis:inline">Leer menos</span>
                    </span>
                  </summary>
                </details>
              )}

              {/* ---- Acciones ---- */}
              <div className="mt-6 flex flex-wrap items-center gap-2">
                {ruta ? (
                  <BotonEnlace href={ruta} variante="primario" className="w-44">
                    <Icono nombre="play" tam={15} />
                    Ver ahora
                  </BotonEnlace>
                ) : (
                  <BotonEnlace href="#episodios" variante="secundario">
                    Sin episodios reproducibles
                  </BotonEnlace>
                )}

                {conSesion && (
                  <>
                    <BotonFavorito
                      accion={guardarEnFavoritos.bind(null, paraGuardar)}
                      titulo={`${serie.titulo} en favoritos`}
                    />
                    <BotonFavorito
                      accion={guardarEnWatchlist.bind(null, paraGuardar)}
                      titulo={`${serie.titulo} en ver después`}
                      icono="marcador"
                      iconoGuardado="check"
                    />
                  </>
                )}

                {serie.malId && (
                  <EnlaceIcono
                    href={`https://myanimelist.net/anime/${serie.malId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Ver en MyAnimeList"
                    title="Ver en MyAnimeList"
                  >
                    <Icono nombre="compartir" tam={17} />
                  </EnlaceIcono>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== Contenido ==========
          La rejilla de la referencia: dos tercios de contenido, un tercio
          de ficha lateral. Las secciones van todas visibles, sin pestañas
          que las escondan. */}
      <div className="mx-auto w-full max-w-[1440px] px-bleed pt-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* ---- Columna principal ---- */}
          <div id="episodios" className="min-w-0 scroll-mt-24 lg:col-span-2">
            <Rotulo>{temporada?.etiqueta ?? 'Episodios'}</Rotulo>

            {temporada && temporada.episodios.length > 0 ? (
              <ListaEpisodios
                episodios={temporada.episodios}
                serieId={serie.id}
                temporada={temporada.numero}
                etiquetaTemporada={temporada.etiqueta}
              />
            ) : (
              <Vacio>
                El proveedor no publica episodios de esta obra todavía.
              </Vacio>
            )}

            {relacionadas.length > 0 && (
              <div className="mt-12">
                <Rotulo>Relacionadas</Rotulo>
                <ul className="m-0 grid list-none gap-3 p-0 md:grid-cols-2">
                  {relacionadas.map((r) => {
                    const contenido = (
                      <>
                        <span className="text-xs font-bold text-tinta-tenue">
                          {r.vinculo}
                        </span>
                        <span className="line-clamp-2 text-sm font-semibold text-tinta">
                          {r.titulo}
                        </span>
                        <span className="text-xs text-tinta-tenue cifras">
                          {r.anio ?? '—'}
                        </span>
                      </>
                    )
                    return (
                      <li key={`${r.titulo}-${r.anio}`}>
                        {r.id ? (
                          <Link
                            href={`/serie/${r.id}`}
                            className="flex h-full flex-col gap-1 rounded-radio border border-borde bg-tarjeta px-4 py-3 no-underline transition-colors duration-200 ease-sal hover:border-borde-vivo hover:bg-apagado"
                          >
                            {contenido}
                          </Link>
                        ) : (
                          // Sin URL no hay id canónico, así que no hay
                          // ficha a la que ir. Se enseña igual —que exista
                          // ya es dato— pero sin fingir que se puede abrir.
                          <div className="flex h-full flex-col gap-1 rounded-radio border border-dashed border-borde px-4 py-3 opacity-70">
                            {contenido}
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* ---- Columna lateral ---- */}
          <aside className="min-w-0">
            {/* Reparto */}
            <Rotulo>Reparto</Rotulo>
            <Vacio>
              El reparto todavía no llega: el proveedor del catálogo no
              publica personajes ni actores de doblaje. Cuando lo haga,
              esta columna se rellena sola.
            </Vacio>

            {/* Alternativas */}
            {serie.alternativas.length > 0 && (
              <div className="mt-12">
                <Rotulo>También en</Rotulo>
                <div className="flex flex-wrap gap-1.5">
                  {serie.alternativas.map((a) => (
                    <span
                      key={a.url}
                      className="inline-flex h-6 items-center rounded-full border border-borde px-2.5 text-xs text-tinta-apagada"
                    >
                      {nombreProveedor(a.proveedor)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* ========== Nota y conversación ========== */}
      <div className="mx-auto w-full max-w-[1440px]">
        <NotaComunidad
          animeId={serie.id}
          media={nota.media}
          votos={nota.votos}
          miNota={nota.miNota}
          haySesion={conSesion}
        />

        <Comentarios animeId={serie.id} />
      </div>

      {/* ========== Recomendaciones ========== */}
      {recomendaciones.length > 0 && (
        <section aria-labelledby="t-reco" className="mx-auto mt-12 w-full max-w-[1440px]">
          <TituloSeccion
            id="t-reco"
            titulo="También te puede interesar"
            enlace="Ver todo"
            href="/explorar"
          />
          <Riel etiqueta="También te puede interesar">
            {recomendaciones
              .filter((s) => s.id !== serie.id)
              .map((s) => (
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
      )}
    </>
  )
}
