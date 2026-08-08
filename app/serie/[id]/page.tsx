import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import Cabecera from '@/components/Cabecera'
import Pie from '@/components/Pie'
import Icono from '@/components/Icono'
import Lamina from '@/components/Lamina'
import Datos, { Clasificacion, NotaOpcional } from '@/components/Datos'
import { CapaVineteado } from '@/components/EfectosSala'
import { BotonEnlace } from '@/components/Boton'
import { episodioDeEntrada, obtenerSerie, rutaReproductor, tendencias } from '@/lib/catalogo'
import { nombreProveedor } from '@/lib/ids'
import type { Episodio } from '@/lib/types'

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

function FilaEpisodio({
  ep,
  serieId,
  temporada,
}: {
  ep: Episodio
  serieId: string
  temporada: number
}) {
  const clases = `grid grid-cols-[200px_1fr_auto] items-start gap-e3 border-b border-borde py-e3 no-underline transition-colors duration-150 ease-sal max-[900px]:grid-cols-[130px_1fr] max-[560px]:grid-cols-1`

  return (
    <Link
      href={`/ver/${serieId}/${temporada}/${ep.numero}`}
      className={`${clases} hover:bg-sala-800`}
    >
      <div className="relative aspect-video overflow-hidden rounded-radio bg-sala-700 shadow-baja">
        <Lamina arte={ep.lamina} />
      </div>

      <div>
        <span className="font-display text-paso-1 tracking-[0.02em] text-hueso-45 tabular-nums">
          E{String(ep.numero).padStart(2, '0')}
        </span>
        <h3 className="mt-[0.2rem] mb-[0.35rem] text-paso-2 font-semibold tracking-[-0.015em]">
          {ep.titulo}
        </h3>
        {ep.sinopsis && <p className="max-w-[58ch] text-paso-1 text-hueso-45">{ep.sinopsis}</p>}
      </div>

      <div className="text-right text-paso-0 whitespace-nowrap text-hueso-45 tabular-nums max-[900px]:col-start-2 max-[900px]:text-left max-[560px]:col-start-1">
        {ep.duracionMin ? `${ep.duracionMin} min` : 'Disponible'}
      </div>
    </Link>
  )
}

export default async function PaginaSerie({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const serie = await obtenerSerie(id)
  if (!serie) notFound()

  const temporada = serie.temporadas?.[0]
  const entrada = episodioDeEntrada(serie)
  const ruta = await rutaReproductor(serie.id)

  const relacionadas = await tendencias(10)
  const relacionadasDeEsta = relacionadas.filter((s) => s.id !== serie.id).slice(0, 3)

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
          <CapaVineteado />

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
                <p className="mb-e3 text-paso-1 text-hueso-45">{serie.tituloOriginal}</p>
              )}

              <Datos>
                <NotaOpcional valor={serie.nota} />
                {serie.votos != null && (
                  <>{serie.votos.toLocaleString('es-ES')} votos</>
                )}
                {serie.anio != null && <>{serie.anio}</>}
                {serie.temporadas?.length != null && (
                  <>{serie.temporadas.length} temporada(s)</>
                )}
                {serie.duracionMin != null && <>{serie.duracionMin} min/ep</>}
                {serie.clasificacion && <Clasificacion valor={serie.clasificacion} />}
              </Datos>

              {serie.sinopsis && (
                <p className="mt-e3 mb-e4 max-w-[62ch] text-hueso-70">{serie.sinopsis}</p>
              )}

              <div className="flex flex-wrap items-center gap-e2">
                <BotonEnlace href={ruta ?? '#'} variante="primario">
                  <Icono nombre="play" tam={17} />
                  Ver T{entrada?.temporada.numero ?? 1} · E
                  {String(entrada?.episodio.numero ?? 1).padStart(2, '0')}
                </BotonEnlace>
              </div>

              {serie.alternativas.length > 0 && (
                <div className="mt-e3 flex flex-wrap items-center gap-[0.4rem] text-paso-0">
                  <span className="text-hueso-45">También en</span>
                  {serie.alternativas.map((a) => (
                    <Link
                      key={a.url}
                      href={`/serie/${a.url}`}
                      className="rounded-full border border-borde-vivo px-[0.7rem] py-[0.25rem] font-semibold text-hueso-70 no-underline transition-colors duration-200 ease-sal hover:border-hueso-45 hover:text-hueso"
                    >
                      {nombreProveedor(a.proveedor)}
                    </Link>
                  ))}
                </div>
              )}

              {serie.generos.length > 0 && (
                <div className="mt-e3 flex flex-wrap gap-[0.4rem]">
                  {serie.generos.map((g) => (
                    <span
                      key={g}
                      className="rounded-full border border-borde-vivo px-[0.7rem] py-[0.25rem] text-paso-0 font-semibold text-hueso-70"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}
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
              <span
                role="tab"
                aria-selected="true"
                className="border-b-2 border-ambar pb-e2 text-paso-2 font-semibold whitespace-nowrap text-hueso"
              >
                {temporada?.etiqueta ?? 'Episodios'}
              </span>
            </div>

            <div role="tabpanel">
              {(temporada?.episodios ?? []).length > 0 ? (
                (temporada?.episodios ?? []).map((ep) => (
                  <FilaEpisodio
                    key={ep.numero}
                    ep={ep}
                    serieId={serie.id}
                    temporada={temporada?.numero ?? 1}
                  />
                ))
              ) : (
                <p className="py-e4 text-hueso-45">
                  Todavía no hay episodios cargados para esta obra.
                </p>
              )}
            </div>
          </div>

          {/* ---------- Lateral ---------- */}
          <aside>
            <section>
              <h2 className="mb-e3 border-b border-borde pb-e2 text-paso-0 font-bold tracking-[0.11em] text-hueso-45 uppercase">
                Datos
              </h2>
              <dl className="grid gap-[0.65rem] text-paso-1">
                {[
                  ['Proveedor', nombreProveedor(serie.proveedor)],
                  ['Tipo', serie.temporadaEtiqueta],
                  ['Género', serie.genero],
                ].map(([k, v]) => (
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

            <section className="mt-e5">
              <h2 className="mb-e3 border-b border-borde pb-e2 text-paso-0 font-bold tracking-[0.11em] text-hueso-45 uppercase">
                Si te gustó esta
              </h2>
              <div className="grid gap-e3">
                {relacionadasDeEsta.length > 0 ? (
                  relacionadasDeEsta.map((r) => (
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
                  ))
                ) : (
                  <p className="text-paso-0 text-hueso-45">Sin sugerencias por ahora.</p>
                )}
              </div>
            </section>
          </aside>
        </div>
      </main>

      <Pie />
    </>
  )
}
