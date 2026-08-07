'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import Lamina from './Lamina'
import Icono from './Icono'
import Datos, { Clasificacion, Nota } from './Datos'
import { CapaVineteado } from './EfectosSala'
import type { ClaveLamina } from '@/lib/types'

export interface Diapositiva {
  id: string
  titulo: string
  sinopsis: string
  nota: number
  anio: number
  clasificacion: string
  lamina: ClaveLamina
  /** «Episodio nuevo esta noche», «Nuevo episodio el lunes»… */
  etiqueta: string
  temporada: number
  episodio: number
  episodiosTotales: number
  hrefVer: string
  hrefFicha: string
}

const INTERVALO = 7000

export default function CarruselDestacado({ slides }: { slides: Diapositiva[] }) {
  const [indice, setIndice] = useState(0)
  const [pausado, setPausado] = useState(false)
  const contenedor = useRef<HTMLElement>(null)

  const ir = useCallback(
    (n: number) => setIndice((n + slides.length) % slides.length),
    [slides.length],
  )

  // Avance automático. Se apaga si el sistema pide movimiento reducido,
  // y mientras el ratón o el foco están dentro.
  useEffect(() => {
    if (pausado || slides.length < 2) return
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducido) return

    const id = setInterval(() => setIndice((i) => (i + 1) % slides.length), INTERVALO)
    return () => clearInterval(id)
  }, [pausado, slides.length])

  const teclas = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      ir(indice + 1)
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      ir(indice - 1)
    }
  }

  if (slides.length === 0) return null

  return (
    <section
      ref={contenedor}
      aria-roledescription="carrusel"
      aria-label="Series destacadas"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocusCapture={() => setPausado(true)}
      onBlurCapture={() => setPausado(false)}
      onKeyDown={teclas}
      className="relative isolate -mt-[calc(var(--spacing-e6)+var(--spacing-e3))] flex min-h-[min(88vh,780px)] items-end overflow-hidden px-margen pt-e6 pb-e5 max-[900px]:min-h-[76vh]"
    >
      {/* Láminas, una por diapositiva, fundiéndose entre sí */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          aria-hidden="true"
          className="absolute inset-0 -z-20 overflow-hidden transition-opacity duration-700 ease-sal"
          style={{ opacity: i === indice ? 1 : 0 }}
        >
          <Lamina arte={s.lamina} />
        </div>
      ))}

      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,#0b0a09_4%,rgba(11,10,9,0.72)_46%,rgba(11,10,9,0.15)_100%),linear-gradient(to_right,#0b0a09_0%,rgba(11,10,9,0.55)_42%,rgba(11,10,9,0)_78%)]" />

      <CapaVineteado />

      <div className="relative z-30 mx-auto w-full max-w-[1600px] px-margen">
        <div className="flex items-end justify-between gap-e4 max-[900px]:flex-col max-[900px]:items-start">
          {/* Texto de la diapositiva activa */}
          <div className="max-w-[48ch]" aria-live="polite">
            {slides.map((s, i) =>
              i !== indice ? null : (
                <div key={s.id} className="animate-[aparecer_500ms_var(--ease-sal)]">
                  <p className="mb-e3 inline-flex items-center gap-[0.45rem] text-paso-0 font-bold tracking-[0.12em] text-ambar uppercase before:h-[2px] before:w-[26px] before:bg-ambar before:content-['']">
                    {s.etiqueta}
                  </p>

                  <h1 className="mb-e3 font-display text-paso-6 leading-[0.92] tracking-[-0.035em] max-[560px]:text-[clamp(2.6rem,13vw,3.4rem)]">
                    {s.titulo}
                  </h1>

                  <Datos>
                    <Nota valor={s.nota} />
                    <>{s.anio}</>
                    <>Temporada {s.temporada}</>
                    <>{s.episodiosTotales} episodios</>
                    <Clasificacion valor={s.clasificacion} />
                  </Datos>

                  <p className="mt-e3 mb-e4 max-w-[46ch] text-hueso-70">{s.sinopsis}</p>

                  <div className="flex flex-wrap items-center gap-e2 max-[560px]:[&>a]:flex-auto">
                    <Link
                      href={s.hrefVer}
                      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-radio border border-transparent bg-ambar px-[1.35rem] py-3 text-paso-1 font-semibold whitespace-nowrap text-ambar-tinta no-underline transition-all duration-200 ease-sal hover:bg-ambar-claro active:translate-y-px"
                    >
                      <Icono nombre="play" tam={17} />
                      Ver T{s.temporada} · E{String(s.episodio).padStart(2, '0')}
                    </Link>

                    <Link
                      href={s.hrefFicha}
                      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-radio border border-borde-vivo bg-hueso/6 px-[1.35rem] py-3 text-paso-1 font-semibold whitespace-nowrap text-hueso no-underline transition-all duration-200 ease-sal hover:border-hueso-45 hover:bg-hueso/12 active:translate-y-px"
                    >
                      Ficha de la serie
                    </Link>
                  </div>
                </div>
              ),
            )}
          </div>

          {/* Mandos */}
          <div className="flex shrink-0 items-center gap-e3 pb-e2">
            <div className="flex gap-e1" role="tablist" aria-label="Elegir destacado">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={i === indice}
                  aria-label={s.titulo}
                  onClick={() => setIndice(i)}
                  className="group cursor-pointer py-2"
                >
                  <span
                    className={`block h-[3px] transition-all duration-300 ease-sal ${
                      i === indice
                        ? 'w-10 bg-ambar'
                        : 'w-5 bg-hueso-45 group-hover:bg-hueso'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="flex gap-e1">
              <button
                type="button"
                onClick={() => ir(indice - 1)}
                aria-label="Destacado anterior"
                className="grid size-11 cursor-pointer place-items-center rounded-full border border-borde-vivo bg-hueso/6 text-hueso transition-colors duration-200 ease-sal hover:border-hueso-45 hover:bg-hueso/14"
              >
                <Icono nombre="atras" tam={18} />
              </button>
              <button
                type="button"
                onClick={() => ir(indice + 1)}
                aria-label="Destacado siguiente"
                className="grid size-11 cursor-pointer place-items-center rounded-full border border-borde-vivo bg-hueso/6 text-hueso transition-colors duration-200 ease-sal hover:border-hueso-45 hover:bg-hueso/14"
              >
                <Icono nombre="flecha" tam={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
