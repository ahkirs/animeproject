import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import Cabecera from '@/components/Cabecera'
import Pie from '@/components/Pie'
import Icono from '@/components/Icono'
import Lamina from '@/components/Lamina'
import Datos, { Clasificacion, Nota } from '@/components/Datos'
import Boton, { BotonEnlace, BotonIcono } from '@/components/Boton'
import { SERIES, episodioDeEntrada, obtenerSerie, rutaReproductor } from '@/lib/catalogo'
import type { Episodio } from '@/lib/types'

export function generateStaticParams() {
  return SERIES.map((s) => ({ id: s.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const serie = obtenerSerie(id)
  if (!serie) return {}
  return {
    title: serie.titulo,
    description: serie.sinopsisCorta,
  }
}

function FilaEpisodio({
  ep,
  serieId,
  temporada,
}: {
  ep: Episodio
  serieId: string
  temporada: number
}) {
  const bloqueado = ep.estado === 'bloqueado'

  const clases = `grid grid-cols-[200px_1fr_auto] items-start gap-e3 border-b border-borde py-e3 no-underline transition-colors duration-150 ease-sal max-[900px]:grid-cols-[130px_1fr] max-[560px]:grid-cols-1 ${
    bloqueado ? 'pointer-events-none opacity-55' : 'hover:bg-sala-800'
  }`

  const contenido = (
    <>
      <div
        className={`relative aspect-video overflow-hidden rounded-radio bg-sala-700 shadow-baja ${
          bloqueado ? '[&_svg]:grayscale' : ''
        }`}
      >
        <Lamina arte={ep.lamina} />
      </div>

      <div>
        <span className="font-display text-paso-1 tracking-[0.02em] text-hueso-45 tabular-nums">
          E{String(ep.numero).padStart(2, '0')}
        </span>
        <h3 className="mt-[0.2rem] mb-[0.35rem] text-paso-2 font-semibold tracking-[-0.015em]">
          {ep.titulo}
        </h3>
        <p className="max-w-[58ch] text-paso-1 text-hueso-45">{ep.sinopsis}</p>
        {ep.progreso !== undefined && (
          <div className="mt-2 h-[3px] bg-sala-600">
            <span className="block h-full bg-ambar" style={{ width: `${ep.progreso}%` }} />
          </div>
        )}
      </div>

      <div className="text-right text-paso-0 whitespace-nowrap text-hueso-45 tabular-nums max-[900px]:col-start-2 max-[900px]:text-left max-[560px]:col-start-1">
        {ep.estado === 'visto' && (
          <span className="inline-flex items-center gap-[0.3rem] font-semibold text-ambar">
            <Icono nombre="check" tam={14} /> Visto
          </span>
        )}
        {ep.estado === 'en-curso' && (
          <span className="font-semibold text-ambar">
            {Math.round((ep.duracionMin * (100 - (ep.progreso ?? 0))) / 100)} min restantes
          </span>
        )}
        {ep.estado === 'disponible' && <span>{ep.disponible}</span>}
        {bloqueado && (
          <span className="inline-flex items-center gap-[0.3rem]">
            <Icono nombre="candado" tam={13} /> {ep.disponible}
          </span>
        )}
        <br />
        {!bloqueado && <>{ep.duracionMin} min</>}
      </div>
    </>
  )

  if (bloqueado) return <div className={clases}>{contenido}</div>

  return (
    <Link href={`/ver/${serieId}/${temporada}/${ep.numero}`} className={clases}>
      {contenido}
    </Link>
  )
}

export default async function PaginaSerie({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const serie = obtenerSerie(id)
  if (!serie) notFound()

  const temporada = serie.temporadas?.[0]
  const entrada = episodioDeEntrada(serie)
  const relacionadas = SERIES.filter((s) => s.id !== serie.id).slice(0, 3)

  return (
    <>
      <a
        href="#principal"
        className="absolute left-margen -top-[100px] z-100 rounded-radio bg-ambar px-[1.1rem] py-[0.7rem] font-bold text-ambar-tinta no-underline transition-all duration-200 ease-sal focus:top-e2"
      >
        Saltar al contenido
      </a>

      <Cabecera activa="explorar" />

      <main id="principal">
        {/* ---------- Cabecera de la obra ---------- */}
        <section
          aria-labelledby="titulo-obra"
          className="relative isolate -mt-[calc(var(--spacing-e6)+var(--spacing-e3))] px-margen pt-e6 pb-e5"
        >
          <div className="absolute inset-0 -z-20 overflow-hidden">
            <Lamina arte={serie.panoramica ?? 'panoramica-obra'} />
          </div>
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,#0b0a09_8%,rgba(11,10,9,0.86)_52%,rgba(11,10,9,0.55)_100%)]" />

          <div className="mx-auto grid max-w-[1600px] grid-cols-[260px_1fr] items-end gap-e5 max-[900px]:grid-cols-[150px_1fr] max-[900px]:items-start max-[900px]:gap-e3 max-[560px]:grid-cols-1">
            <div className="relative aspect-2/3 overflow-hidden rounded-radio bg-sala-700 shadow-baja max-[560px]:max-w-[160px]">
              <Lamina arte={serie.lamina} />
            </div>

            <div>
              <h1
                id="titulo-obra"
                className="mb-e3 font-display text-paso-5 leading-[0.94] tracking-[-0.035em] max-[900px]:text-[clamp(2rem,8vw,2.75rem)]"
              >
                {serie.titulo}
              </h1>

              {serie.tituloOriginal && (
                <p className="mb-e3 text-paso-1 text-hueso-45">
                  {serie.tituloOriginal} · {serie.romaji}
                </p>
              )}

              <Datos>
                <Nota valor={serie.nota} />
                <>de {serie.votos.toLocaleString('es-ES')} votos</>
                <>{serie.anio}</>
                <>{serie.temporadas?.length ?? 1} temporadas</>
                <>{serie.duracionMin} min/ep</>
                <Clasificacion valor={serie.clasificacion} />
              </Datos>

              <p className="mt-e3 mb-e4 max-w-[62ch] text-hueso-70">{serie.sinopsis}</p>

              <div className="flex flex-wrap items-center gap-e2">
                <BotonEnlace
                  href={rutaReproductor(serie.id) ?? '#'}
                  variante="primario"
                >
                  <Icono nombre="play" tam={17} />
                  {entrada?.episodio.estado === 'en-curso' ? 'Continuar' : 'Ver'} T
                  {entrada?.temporada.numero} · E
                  {String(entrada?.episodio.numero ?? 1).padStart(2, '0')}
                </BotonEnlace>
                <Boton type="button">
                  <Icono nombre="mas" tam={17} />
                  Mi lista
                </Boton>
                <BotonIcono aria-label="Compartir">
                  <Icono nombre="compartir" tam={18} />
                </BotonIcono>
              </div>

              <div className="mt-e3 flex flex-wrap gap-[0.4rem]">
                {serie.generos.map((g) => (
                  <Link
                    key={g}
                    href="#"
                    className="rounded-full border border-borde-vivo px-[0.7rem] py-[0.25rem] text-paso-0 font-semibold text-hueso-70 no-underline transition-colors duration-200 ease-sal hover:border-hueso-45 hover:text-hueso"
                  >
                    {g}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Cuerpo ---------- */}
        <div className="mx-auto mt-e6 grid max-w-[1600px] grid-cols-[minmax(0,1fr)_320px] items-start gap-e6 px-margen max-[1100px]:grid-cols-[minmax(0,1fr)] max-[1100px]:gap-e5">
          <div>
            <div
              role="tablist"
              aria-label="Temporadas"
              className="mb-e4 flex gap-e3 overflow-x-auto border-b border-borde"
            >
              {(serie.temporadas ?? []).map((t, i) => (
                <button
                  key={t.numero}
                  role="tab"
                  aria-selected={i === 0}
                  className={`cursor-pointer border-0 border-b-2 bg-transparent pb-e2 text-paso-2 font-semibold whitespace-nowrap transition-colors duration-200 ease-sal ${
                    i === 0
                      ? 'border-ambar text-hueso'
                      : 'border-transparent text-hueso-45 hover:text-hueso'
                  }`}
                >
                  {t.etiqueta}
                </button>
              ))}
              <button
                role="tab"
                aria-selected={false}
                className="cursor-pointer border-0 border-b-2 border-transparent bg-transparent pb-e2 text-paso-2 font-semibold whitespace-nowrap text-hueso-45 hover:text-hueso"
              >
                Especiales
              </button>
            </div>

            <div role="tabpanel">
              {(temporada?.episodios ?? []).map((ep) => (
                <FilaEpisodio
                  key={ep.numero}
                  ep={ep}
                  serieId={serie.id}
                  temporada={temporada?.numero ?? 1}
                />
              ))}
            </div>
          </div>

          {/* ---------- Lateral ---------- */}
          <aside>
            {serie.ficha && (
              <section>
                <h2 className="mb-e3 border-b border-borde pb-e2 text-paso-0 font-bold tracking-[0.11em] text-hueso-45 uppercase">
                  Ficha técnica
                </h2>
                <dl className="grid gap-[0.65rem] text-paso-1">
                  {(
                    [
                      ['Estudio', serie.ficha.estudio],
                      ['Dirección', serie.ficha.direccion],
                      ['Guion', serie.ficha.guion],
                      ['Música', serie.ficha.musica],
                      ['Emisión', serie.ficha.emision],
                      ['Origen', serie.ficha.origen],
                      ['Audio', serie.ficha.audio],
                      ['Subtítulos', serie.ficha.subtitulos],
                    ] as const
                  ).map(([k, v]) => (
                    <div
                      key={k}
                      className="grid grid-cols-[8.5rem_1fr] gap-e2 max-[560px]:grid-cols-1 max-[560px]:gap-0"
                    >
                      <dt className="text-hueso-45">{k}</dt>
                      <dd className="m-0 text-hueso">{v}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {serie.reparto && (
              <section className="mt-e5">
                <h2 className="mb-e3 border-b border-borde pb-e2 text-paso-0 font-bold tracking-[0.11em] text-hueso-45 uppercase">
                  Reparto principal
                </h2>
                <div className="grid gap-e3">
                  {serie.reparto.map((p) => (
                    <div key={p.nombre} className="flex items-center gap-e2">
                      <span
                        aria-hidden="true"
                        className="grid size-11 shrink-0 place-items-center rounded-full border border-borde-vivo bg-sala-600 font-display text-paso-1 text-hueso-70"
                      >
                        {p.iniciales}
                      </span>
                      <span>
                        <b className="block text-paso-1 font-semibold">{p.nombre}</b>
                        <span className="text-paso-0 text-hueso-45">Voz: {p.voz}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-e5">
              <h2 className="mb-e3 border-b border-borde pb-e2 text-paso-0 font-bold tracking-[0.11em] text-hueso-45 uppercase">
                Si te gustó esta
              </h2>
              <div className="grid gap-e3">
                {relacionadas.map((r) => (
                  <Link
                    key={r.id}
                    href={`/serie/${r.id}`}
                    className="flex items-center gap-e2 no-underline"
                  >
                    <span
                      aria-hidden="true"
                      className="grid size-11 shrink-0 place-items-center rounded-full border border-borde-vivo bg-sala-600 font-display text-paso-1 text-hueso-70"
                    >
                      {r.titulo.slice(0, 2).toUpperCase()}
                    </span>
                    <span>
                      <b className="block text-paso-1 font-semibold">{r.titulo}</b>
                      <span className="text-paso-0 text-hueso-45">
                        {r.genero} · {r.temporadaEtiqueta}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </main>

      <Pie />
    </>
  )
}
