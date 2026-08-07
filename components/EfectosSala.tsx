'use client'

import { useState } from 'react'
import Lamina from './Lamina'

/* ============================================================
   Los tres efectos, cada uno como una capa independiente.
   Todos son CSS puro: ni una imagen, ni un kilobyte de red.
   ============================================================ */

/** Ruido generado con feTurbulence y embebido como data URI.
 *  Es la textura de grano de una proyección. */
const GRANO =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='r'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23r)'/%3E%3C/svg%3E\")"

export function CapaGrano({ opacidad = 0.05 }: { opacidad?: number }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 mix-blend-overlay"
      style={{ backgroundImage: GRANO, opacity: opacidad }}
    />
  )
}

export function CapaVineteado() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20"
      style={{
        background:
          'radial-gradient(120% 90% at 50% 45%, transparent 40%, rgba(11,10,9,0.55) 78%, rgba(11,10,9,0.85) 100%)',
      }}
    />
  )
}

/** Silueta plana, en el mismo lenguaje vectorial que las láminas.
 *  Es lo que sí puedo dibujar: recorte, no ilustración. */
export function SiluetaMarca({ tam = 120 }: { tam?: number }) {
  return (
    <svg
      width={tam}
      height={tam}
      viewBox="0 0 120 120"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="60" cy="60" r="58" fill="#ffb03a" />
      {/* Cabeza y hombros recortados contra el disco del proyector */}
      <path
        d="M60 118a58 58 0 01-42-18c3-16 15-25 27-29 5 4 9 6 15 6s10-2 15-6c12 4 24 13 27 29a58 58 0 01-42 18z"
        fill="#0b0a09"
      />
      <path
        d="M60 22c11 0 19 8 19 20 0 13-8 24-19 24s-19-11-19-24c0-12 8-20 19-20z"
        fill="#0b0a09"
      />
      {/* Mechón que rompe la simetría del disco */}
      <path d="M41 40c6-10 16-14 26-12 8 2 12 7 12 14-6-6-14-8-22-6-6 2-11 4-16 4z" fill="#0b0a09" />
    </svg>
  )
}

/* ---------------- Demostración interactiva ---------------- */

interface Interruptor {
  id: 'grano' | 'vineteado'
  texto: string
  explicacion: string
}

const EFECTOS: Interruptor[] = [
  {
    id: 'vineteado',
    texto: 'Viñeteado',
    explicacion:
      'Oscurece los bordes y deja el centro limpio. Hace que la imagen parezca proyectada sobre una pantalla en vez de pegada al fondo, y empuja la mirada al centro sin tocar la composición.',
  },
  {
    id: 'grano',
    texto: 'Grano',
    explicacion:
      'Una capa de ruido finísimo sobre todo. Le quita la planitud digital al negro: sin él, un fondo oscuro grande se ve como un vacío liso; con él, parece una superficie con material.',
  },
]

export default function EfectosSala() {
  const [activos, setActivos] = useState<Record<Interruptor['id'], boolean>>({
    vineteado: true,
    grano: true,
  })

  const alternar = (id: Interruptor['id']) =>
    setActivos((a) => ({ ...a, [id]: !a[id] }))

  return (
    <>
      {/* Mandos */}
      <div className="mb-e4 flex flex-wrap items-center gap-e2">
        <span className="text-paso-0 font-bold tracking-[0.12em] text-hueso-45 uppercase">
          Capas
        </span>
        {EFECTOS.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => alternar(e.id)}
            aria-pressed={activos[e.id]}
            className={`cursor-pointer rounded-full border px-[0.9rem] py-[0.3rem] text-paso-0 font-bold tracking-[0.06em] uppercase transition-colors duration-200 ease-sal ${
              activos[e.id]
                ? 'border-ambar bg-ambar text-ambar-tinta'
                : 'border-borde-vivo text-hueso-70 hover:border-hueso-45 hover:text-hueso'
            }`}
          >
            {e.texto}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setActivos({ vineteado: false, grano: false })}
          className="ml-auto cursor-pointer text-paso-1 font-semibold text-hueso-70 underline-offset-4 hover:text-ambar hover:underline"
        >
          Quitar todo
        </button>
      </div>

      {/* Escenario */}
      <div className="relative isolate aspect-video overflow-hidden rounded-radio border border-borde">
        <span className="absolute inset-0 z-10">
          <Lamina arte="panoramica-escena" />
        </span>

        <span
          aria-hidden="true"
          className="absolute inset-0 z-10 bg-[linear-gradient(to_top,#0b0a09_4%,rgba(11,10,9,0.7)_46%,rgba(11,10,9,0.1)_100%)]"
        />

        {activos.vineteado && <CapaVineteado />}
        {activos.grano && <CapaGrano />}

        <div className="absolute inset-x-0 bottom-0 z-30 p-e4">
          <p className="mb-e2 inline-flex items-center gap-[0.45rem] text-paso-0 font-bold tracking-[0.12em] text-ambar uppercase before:h-[2px] before:w-[26px] before:bg-ambar before:content-['']">
            Episodio nuevo esta noche
          </p>
          <h3 className="font-display text-paso-5 leading-[0.92] tracking-[-0.035em]">
            Cielo de Hierro
          </h3>
        </div>
      </div>

      {/* Explicaciones */}
      <dl className="mt-e4 grid gap-e3">
        {EFECTOS.map((e) => (
          <div
            key={e.id}
            className={`grid grid-cols-[9rem_1fr] gap-e3 border-b border-borde pb-e3 transition-opacity duration-200 max-[640px]:grid-cols-1 max-[640px]:gap-e1 ${
              activos[e.id] ? '' : 'opacity-45'
            }`}
          >
            <dt className="text-paso-1 font-semibold">
              {e.texto}
              <span className="mt-[0.15rem] block text-paso-0 font-normal text-hueso-45">
                {activos[e.id] ? 'activo' : 'apagado'}
              </span>
            </dt>
            <dd className="m-0 max-w-[70ch] text-paso-1 text-hueso-70">
              {e.explicacion}
            </dd>
          </div>
        ))}
      </dl>
    </>
  )
}
