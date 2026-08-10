'use client'

/* El destacado de la portada.

   Ocupa la primera pantalla entera y es lo único de la página que puede
   permitírselo. Encima de la imagen no se pinta ningún degradado: la
   propia lámina lleva una máscara que la desvanece hacia abajo y, en
   pantallas anchas, también hacia la izquierda (ver `.velo-heroe` en
   globals.css). La diferencia importa —un degradado tiene que acertar el
   color del fondo y deja de funcionar en cuanto el fondo cambia; una
   máscara recorta la imagen y funciona sobre cualquier superficie.

   El tráiler se carga aparte, con retraso y solo si la obra lo tiene:
   primero entra la imagen, que es instantánea, y el vídeo la sustituye
   cuando está. Con `prefers-reduced-motion` no se carga nunca. */

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import Lamina from './Lamina'
import Icono from './Icono'
import { colorDeObra } from '@/lib/color'
import type { Arte, EstadoEmision } from '@/lib/types'

export interface Diapositiva {
  id: string
  titulo: string
  sinopsis: string
  nota: number | null
  estado?: EstadoEmision
  anio?: number | null
  generos?: string[]
  episodio?: number
  clasificacion?: string
  lamina: Arte
  /** Como lo devuelve la API: una URL cuyo último segmento es el
   *  identificador del vídeo. Nulo en la mayoría de obras. */
  trailer?: string | null
  hrefVer: string
  hrefFicha: string
}

const INTERVALO = 7000

/** Cuánto se espera antes de pedir el tráiler. Lo justo para que la
 *  imagen y el texto hayan entrado: cargar un iframe de YouTube a la vez
 *  que la portada retrasa todo lo demás. */
const ESPERA_TRAILER = 1200

/** Identificador del vídeo a partir de lo que manda la API.
 *
 *  El scraper devuelve cosas como `https://animeav1.com/-tviZNY6CSw`:
 *  el dominio es suyo, pero el último segmento es un id de YouTube. Se
 *  aceptan también las URLs completas de YouTube por si algún proveedor
 *  las manda tal cual. */
function idDeVideo(trailer: string | null | undefined): string | null {
  if (!trailer) return null
  try {
    const url = new URL(trailer)
    const porParametro = url.searchParams.get('v')
    if (porParametro) return porParametro
    const ultimo = url.pathname.split('/').filter(Boolean).pop()
    // Los identificadores de YouTube son once caracteres.
    return ultimo && /^[\w-]{11}$/.test(ultimo) ? ultimo : null
  } catch {
    return null
  }
}

/** Una píldora de las que van bajo el título. */
function Pastilla({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-primario/15 bg-primario/10 px-3 py-1 text-xs backdrop-blur-sm">
      {children}
    </span>
  )
}

export default function CarruselDestacado({ slides }: { slides: Diapositiva[] }) {
  const [indice, setIndice] = useState(0)
  const [pausado, setPausado] = useState(false)
  const [conTrailer, setConTrailer] = useState(false)
  const temporizador = useRef<number | null>(null)

  const ir = useCallback(
    (n: number) => setIndice((n + slides.length) % slides.length),
    [slides.length],
  )

  // Avance automático. Se para al pasar el ratón por encima y con
  // movimiento reducido no arranca.
  useEffect(() => {
    if (pausado || slides.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const id = setInterval(() => setIndice((i) => (i + 1) % slides.length), INTERVALO)
    return () => clearInterval(id)
  }, [pausado, slides.length])

  // El tráiler entra con retraso y se cancela al cambiar de obra, para
  // que pasar rápido por cinco diapositivas no cargue cinco iframes.
  useEffect(() => {
    setConTrailer(false)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!idDeVideo(slides[indice]?.trailer)) return

    temporizador.current = window.setTimeout(
      () => setConTrailer(true),
      ESPERA_TRAILER,
    )
    return () => {
      if (temporizador.current) window.clearTimeout(temporizador.current)
    }
  }, [indice, slides])

  if (slides.length === 0) return null

  const actual = slides[indice]
  const video = idDeVideo(actual.trailer)

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Series destacadas"
      /* Le dice a la barra superior que aquí hay imagen debajo de ella, así
         que puede quedarse sin campo mientras no se baje. */
      data-heroe=""
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      className="bajo-barra relative isolate flex h-[70dvh] max-h-[760px] min-h-[440px] flex-col justify-end"
    >
      {/* --- Fondo --- */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className="velo-heroe absolute inset-0 transition-opacity duration-700 ease-sal"
            style={{ opacity: i === indice ? 1 : 0 }}
          >
            <Lamina arte={s.lamina} />
          </div>
        ))}

        {conTrailer && video && (
          <div className="velo-heroe animar-fundido absolute inset-0 overflow-hidden">
            <iframe
              key={video}
              title=""
              aria-hidden="true"
              tabIndex={-1}
              src={`https://www.youtube-nocookie.com/embed/${video}?autoplay=1&mute=1&controls=0&loop=1&playlist=${video}&playsinline=1&modestbranding=1&rel=0`}
              allow="autoplay; encrypted-media"
              // El vídeo se recorta para cubrir: 16:9 sobre una caja de
              // otra proporción deja franjas negras si no se sobredimensiona.
              className="pointer-events-none absolute top-1/2 left-1/2 h-[calc(100vw*9/16)] min-h-full w-[100vw] min-w-[calc(100vh*16/9)] -translate-x-1/2 -translate-y-1/2 border-0"
            />
          </div>
        )}
      </div>

      {/* --- Texto --- */}
      <div className="relative z-10 px-bleed pb-10 text-white lg:max-w-[62%]">
        <p className="mb-3 flex items-center gap-2 text-sm font-medium">
          <span
            aria-hidden="true"
            className="grid size-5 place-items-center rounded-full"
            style={{ background: colorDeObra(actual.id) }}
          />
          {indice + 1}.º en tendencia
        </p>

        <h1
          key={actual.id}
          className="animar-entrada font-titulo text-3xl leading-[1.05] font-extrabold text-balance lg:text-5xl xl:text-6xl"
        >
          {actual.titulo}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {actual.estado === 'en-emision' && (
            <Pastilla>
              <span className="text-exito">En emisión</span>
            </Pastilla>
          )}
          {actual.anio != null && <Pastilla>{actual.anio}</Pastilla>}
          {actual.nota != null && (
            <Pastilla>
              <span className="cifras">
                {actual.nota.toLocaleString('es-ES', { minimumFractionDigits: 1 })}
              </span>
            </Pastilla>
          )}
          {actual.episodio ? (
            <Pastilla>
              <span className="cifras">{actual.episodio}</span> episodios
            </Pastilla>
          ) : null}
          {(actual.generos ?? []).slice(0, 3).map((g) => (
            <Pastilla key={g}>{g}</Pastilla>
          ))}
        </div>

        {actual.sinopsis && (
          <p className="mt-4 line-clamp-2 max-w-[62ch] text-sm leading-relaxed text-white/80">
            {actual.sinopsis}
          </p>
        )}

        <div className="mt-6 flex items-center gap-2">
          <Link
            href={actual.hrefVer}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-primario px-6 text-sm font-semibold text-primario-tinta no-underline transition-opacity duration-200 ease-sal hover:opacity-85"
          >
            <Icono nombre="play" tam={16} />
            Ver ahora
          </Link>
          <Link
            href={actual.hrefFicha}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 text-sm font-semibold text-white no-underline backdrop-blur-sm transition-colors duration-200 ease-sal hover:bg-white/20"
          >
            <Icono nombre="info" tam={16} />
            Más información
          </Link>
        </div>
      </div>

      {/* --- Paginación ---
          Barritas en vez de puntos: la activa dice además cuánto queda
          para el salto, así que el avance automático deja de ser una
          sorpresa. */}
      {slides.length > 1 && (
        <div className="relative z-10 flex items-center gap-2 px-bleed pb-8">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => ir(i)}
              aria-label={`Ir a ${s.titulo}`}
              aria-current={i === indice ? 'true' : undefined}
              className={`h-1 cursor-pointer overflow-hidden rounded-full bg-white/30 transition-all duration-300 ease-sal ${
                i === indice ? 'w-10' : 'w-5 hover:bg-white/60'
              }`}
            >
              {i === indice && (
                <span className="block h-full w-full rounded-full bg-white" />
              )}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
