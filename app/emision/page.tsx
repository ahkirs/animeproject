import Link from 'next/link'
import type { Metadata } from 'next'
import Cabecera from '@/components/Cabecera'
import Pie from '@/components/Pie'
import Lamina from '@/components/Lamina'
import Icono from '@/components/Icono'
import {
  DIAS,
  HOY,
  PARRILLA,
  parrillaDe,
  resolverEmision,
  rutaReproductor,
} from '@/lib/catalogo'
import type { Programacion } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Emisión',
  description:
    'Calendario semanal de emisión: qué se estrena cada día, a qué hora y cuánto falta.',
}

function Tarjeta({ p }: { p: Programacion }) {
  const { serie, episodio } = resolverEmision(p)
  if (!serie) return null

  const destino = rutaReproductor(serie.id) ?? `/serie/${serie.id}`

  return (
    <Link href={destino} className="group block no-underline">
      <article className="relative aspect-2/3 overflow-hidden rounded-radio bg-sala-700 shadow-baja transition-all duration-300 ease-sal group-hover:-translate-y-[5px] group-hover:shadow-alta group-focus-visible:-translate-y-[5px] group-focus-visible:shadow-alta">
        <Lamina arte={serie.lamina} />

        {/* Degradado de legibilidad: sólido abajo, no un velo uniforme */}
        <div className="absolute inset-0 bg-[linear-gradient(to_top,#0b0a09_2%,rgba(11,10,9,0.82)_28%,rgba(11,10,9,0.1)_62%)]" />

        <div className="absolute inset-x-0 bottom-0 p-e3">
          <h3 className="font-display text-paso-2 leading-[1.05] tracking-[-0.03em] uppercase">
            {serie.titulo}
          </h3>

          <p className="mt-[0.45rem] flex flex-wrap items-center gap-x-[0.45rem] gap-y-1 text-paso-0 tabular-nums">
            <span className="font-semibold text-hueso">
              EP {p.proximoEpisodio}
            </span>
            <span aria-hidden="true" className="size-[3px] rounded-full bg-hueso-45" />
            <span className="font-bold text-ambar">{p.hora}</span>
            <span aria-hidden="true" className="size-[3px] rounded-full bg-hueso-45" />
            <span className="text-hueso-45">{p.cuentaAtras}</span>
            <span className="ml-auto tracking-[0.08em] text-hueso-45 uppercase">
              {serie.genero}
            </span>
          </p>

          {episodio && (
            <p className="mt-[0.3rem] truncate text-paso-0 text-hueso-70">
              {episodio.titulo}
            </p>
          )}
        </div>
      </article>
    </Link>
  )
}

export default function Emision() {
  const totalSemana = PARRILLA.length
  const hoyNombre = DIAS.find((d) => d.n === HOY)?.nombre ?? ''

  return (
    <>
      <a
        href="#principal"
        className="absolute left-margen -top-[100px] z-100 rounded-radio bg-ambar px-[1.1rem] py-[0.7rem] font-bold text-ambar-tinta no-underline transition-all duration-200 ease-sal focus:top-e2"
      >
        Saltar al contenido
      </a>

      <Cabecera activa="emision" />

      <main id="principal" className="mx-auto max-w-[1600px] px-margen">
        <div className="pt-e4 pb-e3">
          <h1 className="font-display text-paso-5 tracking-[-0.035em]">
            Emisión
          </h1>
          <p className="mt-e2 max-w-[60ch] text-hueso-70">
            Qué se estrena cada día de la semana, a qué hora y cuánto falta.
            Semana del 7 de agosto de 2026.
          </p>
        </div>

        {/* ---------- Pestañas de día ---------- */}
        <div className="sticky top-[72px] z-50 -mx-margen mb-e5 border-y border-borde bg-sala-900/95 px-margen py-e2 backdrop-blur-sm">
          <div className="flex flex-wrap items-center gap-e2">
            <nav aria-label="Días de la semana" className="flex flex-wrap gap-e1">
              {DIAS.map((d) => {
                const cuantos = parrillaDe(d.n).length
                const esHoy = d.n === HOY
                return (
                  <a
                    key={d.n}
                    href={`#dia-${d.n}`}
                    className={`relative inline-flex items-center gap-2 rounded-full border px-[0.9rem] py-[0.35rem] text-paso-0 font-bold tracking-[0.06em] uppercase no-underline transition-colors duration-200 ease-sal ${
                      esHoy
                        ? 'border-hueso bg-hueso text-sala-900'
                        : 'border-borde-vivo text-hueso-70 hover:border-hueso-45 hover:text-hueso'
                    }`}
                  >
                    {d.nombre}
                    <span
                      className={
                        esHoy ? 'text-sala-900/60 tabular-nums' : 'text-hueso-45 tabular-nums'
                      }
                    >
                      {cuantos}
                    </span>
                    {esHoy && (
                      <span
                        aria-hidden="true"
                        className="absolute -top-[3px] -right-[3px] size-[7px] rounded-full bg-ambar"
                      />
                    )}
                  </a>
                )
              })}
            </nav>

            <p className="ml-auto text-paso-0 tracking-[0.08em] text-hueso-45 uppercase tabular-nums">
              {totalSemana} series con horario · hoy es {hoyNombre}
            </p>
          </div>
        </div>

        {/* ---------- Un bloque por día ---------- */}
        {DIAS.map((d) => {
          const emisiones = parrillaDe(d.n)
          const esHoy = d.n === HOY

          return (
            <section
              key={d.n}
              id={`dia-${d.n}`}
              aria-labelledby={`t-dia-${d.n}`}
              className="mb-e6 scroll-mt-[140px]"
            >
              <div className="mb-e4 flex items-baseline gap-e3 border-b border-borde pb-e2">
                <h2
                  id={`t-dia-${d.n}`}
                  className={`font-display text-paso-4 tracking-[-0.03em] ${
                    esHoy ? 'text-ambar' : ''
                  }`}
                >
                  {d.nombre}
                </h2>
                {esHoy && (
                  <span className="text-paso-0 font-bold tracking-[0.12em] text-ambar uppercase">
                    Hoy
                  </span>
                )}
                <span className="ml-auto text-paso-1 text-hueso-45 tabular-nums">
                  {emisiones.length === 1
                    ? '1 estreno'
                    : `${emisiones.length} estrenos`}
                </span>
              </div>

              {emisiones.length > 0 ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-e3">
                  {emisiones.map((p) => (
                    <Tarjeta key={`${p.serieId}-${p.dia}`} p={p} />
                  ))}
                </div>
              ) : (
                <p className="flex items-center gap-e2 rounded-radio border border-dashed border-borde-vivo px-e3 py-e4 text-paso-1 text-hueso-45">
                  <Icono nombre="cinta" tam={18} />
                  Ningún estreno este día. El catálogo todavía es pequeño.
                </p>
              )}
            </section>
          )
        })}
      </main>

      <Pie />
    </>
  )
}
