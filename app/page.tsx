import Link from 'next/link'
import Cabecera from '@/components/Cabecera'
import Pie from '@/components/Pie'
import Icono from '@/components/Icono'
import Lamina from '@/components/Lamina'
import Riel from '@/components/Riel'
import FichaSerie, { Cartel } from '@/components/FichaSerie'
import Datos, { Clasificacion, Nota } from '@/components/Datos'
import { BotonEnlace, BotonIcono } from '@/components/Boton'
import {
  EMISIONES,
  EN_CURSO,
  GENEROS,
  SERIES,
  SERIE_DESTACADA,
  episodioDeEntrada,
  rutaReproductor,
} from '@/lib/catalogo'

function CabezaSeccion({
  titulo,
  enlace,
  id,
}: {
  titulo: string
  enlace?: string
  id: string
}) {
  return (
    <div className="mb-e4 flex items-baseline justify-between gap-e3">
      <h2 id={id} className="font-display text-paso-4 tracking-[-0.03em]">
        {titulo}
      </h2>
      {enlace && (
        <Link
          href="#"
          className="group inline-flex shrink-0 items-center gap-[0.3rem] text-paso-1 font-semibold text-hueso-70 no-underline hover:text-ambar"
        >
          {enlace}
          <Icono
            nombre="flecha"
            tam={16}
            className="transition-transform duration-200 ease-sal group-hover:translate-x-[3px]"
          />
        </Link>
      )}
    </div>
  )
}

export default function Inicio() {
  const d = SERIE_DESTACADA
  const entrada = episodioDeEntrada(d)

  return (
    <>
      <a
        href="#principal"
        className="absolute left-margen -top-[100px] z-100 rounded-radio bg-ambar px-[1.1rem] py-[0.7rem] font-bold text-ambar-tinta no-underline transition-all duration-200 ease-sal focus:top-e2"
      >
        Saltar al contenido
      </a>

      <Cabecera activa="inicio" />

      <main id="principal">
        {/* ---------- Destacado ---------- */}
        <section
          aria-labelledby="destacado"
          className="relative isolate -mt-[calc(var(--spacing-e6)+var(--spacing-e3))] flex min-h-[min(88vh,780px)] items-end px-margen pt-e6 pb-e5 max-[900px]:min-h-[76vh]"
        >
          <div className="absolute inset-0 -z-20 overflow-hidden">
            <Lamina arte="panoramica-escena" />
          </div>
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,#0b0a09_4%,rgba(11,10,9,0.72)_46%,rgba(11,10,9,0.15)_100%),linear-gradient(to_right,#0b0a09_0%,rgba(11,10,9,0.55)_42%,rgba(11,10,9,0)_78%)]" />

          <div className="mx-auto w-full max-w-[1600px] px-margen">
            <div className="max-w-[48ch]">
              <p className="mb-e3 inline-flex items-center gap-[0.45rem] text-paso-0 font-bold tracking-[0.12em] text-ambar uppercase before:h-[2px] before:w-[26px] before:bg-ambar before:content-['']">
                Episodio nuevo esta noche
              </p>

              <h1
                id="destacado"
                className="mb-e3 font-display text-paso-6 leading-[0.92] tracking-[-0.035em] max-[560px]:text-[clamp(2.6rem,13vw,3.4rem)]"
              >
                {d.titulo}
              </h1>

              <Datos>
                <Nota valor={d.nota} />
                <>{d.anio}</>
                <>Temporada {d.temporadas?.[0].numero ?? 1}</>
                <>{d.temporadas?.[0].episodios.length ?? 0} episodios</>
                <Clasificacion valor={d.clasificacion} />
              </Datos>

              <p className="mt-e3 mb-e4 max-w-[46ch] text-hueso-70">{d.sinopsisCorta}</p>

              <div className="flex flex-wrap items-center gap-e2 max-[560px]:[&>a]:flex-auto">
                <BotonEnlace href={rutaReproductor(d.id) ?? '#'} variante="primario">
                  <Icono nombre="play" tam={17} />
                  Ver T{entrada?.temporada.numero} · E
                  {String(entrada?.episodio.numero ?? 1).padStart(2, '0')}
                </BotonEnlace>
                <BotonEnlace href={`/serie/${d.id}`}>Ficha de la serie</BotonEnlace>
                <BotonIcono aria-label="Añadir a mi lista">
                  <Icono nombre="mas" tam={19} />
                </BotonIcono>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1600px] px-margen">
          {/* ---------- Parrilla semanal ---------- */}
          <section id="semana" aria-labelledby="t-semana" className="mt-e6">
            <CabezaSeccion
              id="t-semana"
              titulo="Se emite esta semana"
              enlace="Calendario completo"
            />
            <div className="border-t border-borde">
              {EMISIONES.map((e) => (
                <Link
                  key={e.diaNumero}
                  href={rutaReproductor(e.serieId) ?? `/serie/${e.serieId}`}
                  className="grid grid-cols-[7.5rem_1fr_auto] items-center gap-e3 border-b border-borde py-e3 no-underline transition-all duration-150 ease-sal hover:bg-sala-800 hover:pl-e2 max-[900px]:grid-cols-[4.5rem_1fr]"
                >
                  <span
                    className={`text-paso-0 font-bold tracking-[0.1em] uppercase tabular-nums ${
                      e.hoy ? 'text-ambar' : 'text-hueso-45'
                    }`}
                  >
                    {e.diaCorto}
                    <strong
                      className={`mt-[0.2rem] block font-display text-paso-4 leading-none tracking-[-0.02em] max-[900px]:text-paso-3 ${
                        e.hoy ? 'text-ambar' : 'text-hueso'
                      }`}
                    >
                      {e.diaNumero}
                    </strong>
                  </span>

                  <span>
                    <h3 className="mb-[0.2rem] text-paso-3 font-semibold tracking-[-0.015em]">
                      {e.serieTitulo} — {e.episodio}
                    </h3>
                    <p className="text-paso-1 text-hueso-45">«{e.tituloEpisodio}»</p>
                  </span>

                  <span className="flex items-center gap-2 text-paso-1 font-semibold text-hueso-70 tabular-nums max-[900px]:col-start-2 max-[900px]:text-paso-0">
                    {e.hora}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* ---------- Seguir viendo ---------- */}
          <section aria-labelledby="t-reanudar" className="mt-e6">
            <CabezaSeccion id="t-reanudar" titulo="Seguir viendo" enlace="Tu historial" />
            <Riel ancho>
              {EN_CURSO.map((c) => (
                <Link
                  key={c.serieId}
                  href={rutaReproductor(c.serieId) ?? `/serie/${c.serieId}`}
                  className="group block no-underline"
                >
                  <Cartel arte={c.lamina} ancho>
                    <span className="absolute inset-0 grid place-items-center bg-sala-900/32 opacity-0 transition-opacity duration-200 ease-sal group-hover:opacity-100 group-focus-visible:opacity-100">
                      <span className="grid size-[52px] place-items-center rounded-full bg-ambar text-ambar-tinta shadow-baja">
                        <Icono nombre="play" tam={20} />
                      </span>
                    </span>
                  </Cartel>
                  <div className="mt-e2 h-[3px] overflow-hidden bg-sala-600">
                    <span
                      className="block h-full bg-ambar"
                      style={{ width: `${c.progreso}%` }}
                    />
                  </div>
                  <div className="mt-[0.4rem] flex justify-between gap-e2 text-paso-0 text-hueso-45 tabular-nums">
                    <span>
                      {c.serieTitulo} · {c.episodio}
                    </span>
                    <span>{c.restanteMin} min restantes</span>
                  </div>
                </Link>
              ))}
            </Riel>
          </section>

          {/* ---------- Estrenos ---------- */}
          <section id="estrenos" aria-labelledby="t-estrenos" className="mt-e6">
            <CabezaSeccion
              id="t-estrenos"
              titulo="Estrenos de temporada"
              enlace="Ver los 42"
            />
            <Riel>
              {SERIES.map((s) => (
                <FichaSerie
                  key={s.id}
                  href={`/serie/${s.id}`}
                  titulo={s.titulo}
                  subtitulo={`${s.genero} · ${s.temporadaEtiqueta}`}
                  arte={s.lamina}
                />
              ))}
            </Riel>
          </section>

          {/* ---------- Géneros ---------- */}
          <section id="generos" aria-labelledby="t-generos" className="mt-e6">
            <CabezaSeccion id="t-generos" titulo="Por dónde entrar" />
            <nav
              aria-label="Géneros"
              className="flex flex-wrap gap-x-e4 gap-y-e2 border-t border-borde pt-e4"
            >
              {GENEROS.map((g) => (
                <Link
                  key={g}
                  href="#"
                  className="font-display text-[clamp(1.5rem,3.4vw,2.5rem)] tracking-[-0.035em] text-sala-500 no-underline transition-colors duration-200 ease-sal hover:text-hueso"
                >
                  {g}
                </Link>
              ))}
            </nav>
          </section>
        </div>
      </main>

      <Pie />
    </>
  )
}
