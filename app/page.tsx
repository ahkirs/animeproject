import Link from 'next/link'
import Cabecera from '@/components/Cabecera'
import Pie from '@/components/Pie'
import Icono from '@/components/Icono'
import Riel from '@/components/Riel'
import FichaSerie, { Cartel } from '@/components/FichaSerie'
import HoraEmision from '@/components/HoraEmision'
import CarruselDestacado, { type Diapositiva } from '@/components/CarruselDestacado'
import {
  DIAS,
  EN_CURSO,
  HOY,
  SERIES,
  diaJst,
  fechaJst,
  generosDisponibles,
  horaUtc,
  proximasEmisiones,
  resolverEmision,
  rutaReproductor,
} from '@/lib/catalogo'

function CabezaSeccion({
  titulo,
  enlace,
  href = '#',
  id,
}: {
  titulo: string
  enlace?: string
  href?: string
  id: string
}) {
  return (
    <div className="mb-e4 flex items-baseline justify-between gap-e3">
      <h2 id={id} className="font-display text-paso-4 tracking-[-0.03em]">
        {titulo}
      </h2>
      {enlace && (
        <Link
          href={href}
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

/** Las próximas emisiones convertidas en diapositivas del destacado.
 *  Cada una lleva su propia etiqueta según cuándo se emite. */
function construirDestacados(): Diapositiva[] {
  return proximasEmisiones(4).flatMap((p) => {
    const { serie, temporada, episodio } = resolverEmision(p)
    if (!serie || !temporada || !episodio) return []

    const dia = DIAS.find((d) => d.n === diaJst(p))
    const etiqueta =
      diaJst(p) === HOY
        ? 'Episodio nuevo esta noche'
        : `Nuevo episodio el ${dia?.nombre.toLowerCase() ?? 'próximo día'}`

    return [
      {
        id: serie.id,
        titulo: serie.titulo,
        sinopsis: serie.sinopsisCorta,
        nota: serie.nota,
        anio: serie.anio,
        clasificacion: serie.clasificacion,
        lamina: serie.panoramica ?? 'panoramica-escena',
        etiqueta,
        temporada: temporada.numero,
        episodio: episodio.numero,
        episodiosTotales: temporada.episodios.length,
        hrefVer: `/ver/${serie.id}/${temporada.numero}/${episodio.numero}`,
        hrefFicha: `/serie/${serie.id}`,
      },
    ]
  })
}

export default function Inicio() {
  const destacados = construirDestacados()

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
        <CarruselDestacado slides={destacados} />

        <div className="mx-auto max-w-[1600px] px-margen">
          {/* ---------- Parrilla semanal ---------- */}
          <section id="semana" aria-labelledby="t-semana" className="mt-e6">
            <CabezaSeccion
              id="t-semana"
              titulo="Se emite esta semana"
              enlace="Calendario completo"
              href="/emision"
            />
            <div className="border-t border-borde">
              {proximasEmisiones().map((p) => {
                const { serie, temporada, episodio } = resolverEmision(p)
                if (!serie) return null
                const diaDeLaSemana = diaJst(p)
                const esHoy = diaDeLaSemana === HOY
                const dia = DIAS.find((d) => d.n === diaDeLaSemana)

                return (
                  <Link
                    key={`${p.serieId}-${p.emitidoUtc}`}
                    href={rutaReproductor(p.serieId) ?? `/serie/${p.serieId}`}
                    className="grid grid-cols-[7.5rem_1fr_auto] items-center gap-e3 border-b border-borde py-e3 no-underline transition-all duration-150 ease-sal hover:bg-sala-800 hover:pl-e2 max-[900px]:grid-cols-[4.5rem_1fr]"
                  >
                    <span
                      className={`text-paso-0 font-bold tracking-[0.1em] uppercase tabular-nums ${
                        esHoy ? 'text-ambar' : 'text-hueso-45'
                      }`}
                    >
                      {esHoy ? 'Hoy' : dia?.corto}
                      <strong
                        className={`mt-[0.2rem] block font-display text-paso-4 leading-none tracking-[-0.02em] max-[900px]:text-paso-3 ${
                          esHoy ? 'text-ambar' : 'text-hueso'
                        }`}
                      >
                        {fechaJst(p)}
                      </strong>
                    </span>

                    <span>
                      <h3 className="mb-[0.2rem] text-paso-3 font-semibold tracking-[-0.015em]">
                        {serie.titulo} — T{temporada?.numero} E
                        {String(p.proximoEpisodio).padStart(2, '0')}
                      </h3>
                      {episodio && (
                        <p className="text-paso-1 text-hueso-45">«{episodio.titulo}»</p>
                      )}
                    </span>

                    <span className="flex items-center gap-2 text-paso-1 font-semibold text-hueso-70 tabular-nums max-[900px]:col-start-2 max-[900px]:text-paso-0">
                      <HoraEmision iso={p.emitidoUtc} utc={horaUtc(p)} />
                    </span>
                  </Link>
                )
              })}
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
              {generosDisponibles().map((g) => (
                <Link
                  key={g.nombre}
                  href={`/explorar?genero=${encodeURIComponent(g.nombre)}`}
                  className="font-display text-[clamp(1.5rem,3.4vw,2.5rem)] tracking-[-0.035em] text-sala-500 no-underline transition-colors duration-200 ease-sal hover:text-hueso"
                >
                  {g.nombre}
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
