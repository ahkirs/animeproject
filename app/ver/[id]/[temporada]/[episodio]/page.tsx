import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Marca } from '@/components/Cabecera'
import Pie from '@/components/Pie'
import Icono, { type NombreIcono } from '@/components/Icono'
import Lamina from '@/components/Lamina'
import Datos, { Clasificacion } from '@/components/Datos'
import Boton from '@/components/Boton'
import { obtenerSerie, obtenerTemporada } from '@/lib/catalogo'

type Params = Promise<{ id: string; temporada: string; episodio: string }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { id, temporada, episodio } = await params
  const serie = obtenerSerie(id)
  if (!serie) return {}
  return { title: `${serie.titulo} T${temporada} E${episodio}` }
}

function Mando({
  icono,
  etiqueta,
  grande,
}: {
  icono: NombreIcono
  etiqueta: string
  grande?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={etiqueta}
      className={`inline-grid cursor-pointer place-items-center rounded-radio border-0 bg-transparent text-hueso transition-colors duration-150 ease-sal hover:bg-hueso/14 ${
        grande ? 'p-[0.55rem]' : 'p-[0.4rem]'
      }`}
    >
      <Icono nombre={icono} tam={grande ? 24 : 21} />
    </button>
  )
}

export default async function PaginaVer({ params }: { params: Params }) {
  const { id, temporada, episodio } = await params
  const serie = obtenerSerie(id)
  if (!serie) notFound()

  const temp = obtenerTemporada(serie, Number(temporada))
  const episodios = temp?.episodios ?? []
  const num = Number(episodio)
  const actual = episodios.find((e) => e.numero === num) ?? episodios[0]
  const siguiente = episodios.find((e) => e.numero === (actual?.numero ?? 0) + 1)

  if (!actual) notFound()

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
          <div
            id="visor"
            role="region"
            aria-label="Reproductor de vídeo"
            className="relative aspect-video cursor-pointer overflow-hidden bg-black"
          >
            <Lamina arte="panoramica-player" />

            <p className="pointer-events-none absolute bottom-[15%] left-1/2 max-w-[74%] -translate-x-1/2 text-center text-[clamp(1rem,1.9vw,1.6rem)] leading-[1.35] font-semibold text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.9)]">
              No se cayó del cielo. Alguien lo bajó, pieza por pieza.
            </p>

            <button
              type="button"
              className="absolute right-e3 bottom-24 cursor-pointer rounded-radio border border-borde-vivo bg-sala-900/86 px-[1.1rem] py-[0.6rem] text-paso-1 font-semibold text-hueso backdrop-blur-[4px] transition-colors duration-150 ease-sal hover:border-ambar hover:bg-ambar hover:text-ambar-tinta max-[640px]:bottom-[84px] max-[640px]:px-[0.85rem] max-[640px]:py-2 max-[640px]:text-paso-0"
            >
              Saltar cabecera
            </button>

            {/* Mandos */}
            <div className="absolute inset-x-0 bottom-0 grid gap-e2 bg-[linear-gradient(to_top,rgba(0,0,0,0.92),rgba(0,0,0,0.55)_45%,rgba(0,0,0,0))] px-e3 pt-e5 pb-e3 max-[640px]:px-e2 max-[640px]:pt-e4 max-[640px]:pb-e2">
              <div
                role="slider"
                tabIndex={0}
                aria-label="Progreso del episodio"
                aria-valuemin={0}
                aria-valuemax={1440}
                aria-valuenow={548}
                aria-valuetext="9 minutos 8 segundos de 24 minutos"
                className="group relative flex h-5 cursor-pointer items-center"
              >
                <div className="relative h-1 w-full rounded-full bg-hueso/22">
                  <div className="absolute inset-y-0 left-0 w-[62%] rounded-full bg-hueso/35" />
                  <div className="absolute inset-y-0 left-0 w-[38%] rounded-full bg-ambar" />
                  <div
                    title="Cabecera"
                    className="absolute -top-[3px] h-[10px] w-[3px] rounded-sm bg-hueso-45"
                    style={{ left: '6%' }}
                  />
                  <div
                    title="Cierre"
                    className="absolute -top-[3px] h-[10px] w-[3px] rounded-sm bg-hueso-45"
                    style={{ left: '91%' }}
                  />
                  <div className="absolute top-1/2 -ml-[7px] size-[14px] -translate-y-1/2 scale-[0.85] rounded-full bg-ambar shadow-baja transition-transform duration-150 ease-sal group-hover:scale-125 left-[38%]" />
                </div>
              </div>

              <div className="flex items-center gap-e2">
                <Mando icono="pausa" etiqueta="Pausar" grande />
                <Mando icono="atras-10" etiqueta="Retroceder 10 segundos" />
                <Mando icono="alante-10" etiqueta="Avanzar 10 segundos" />
                <Mando icono="siguiente" etiqueta="Siguiente episodio" />

                <div className="flex items-center gap-2">
                  <Mando icono="volumen" etiqueta="Silenciar" />
                  <div
                    role="slider"
                    tabIndex={0}
                    aria-label="Volumen"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={70}
                    className="relative h-1 w-[74px] rounded-full bg-hueso/22 max-[640px]:hidden"
                  >
                    <span className="absolute inset-y-0 left-0 w-[70%] rounded-full bg-hueso" />
                  </div>
                </div>

                <span className="ml-[0.35rem] text-paso-0 tracking-[0.02em] text-hueso-70 tabular-nums">
                  9:08 / {actual.duracionMin}:00
                </span>

                <div className="ml-auto flex items-center gap-e1">
                  <Mando icono="cc" etiqueta="Subtítulos y audio" />
                  <Mando icono="ajustes" etiqueta="Calidad y velocidad" />
                  <Mando icono="emitir" etiqueta="Emitir en otro dispositivo" />
                  <Mando icono="pantalla" etiqueta="Pantalla completa" />
                </div>
              </div>
            </div>
          </div>

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
              <>{actual.duracionMin} min</>
              <>Emitido el 7 de agosto de 2026</>
              <>Japonés con subtítulos</>
              <Clasificacion valor={serie.clasificacion} />
            </Datos>

            <p className="mt-e3 max-w-[68ch] text-hueso-70">{actual.sinopsis}</p>

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
                      : `${ep.duracionMin} min · ${
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
        aviso="Maqueta de diseño. Títulos, sinopsis, diálogos, fechas y fotogramas son material sintético creado para esta demostración: ninguna obra ni marca real aparece en la página. El reproductor es una maqueta estática, sin vídeo."
      />
    </div>
  )
}
