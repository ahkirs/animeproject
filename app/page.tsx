import { Suspense } from 'react'
import Link from 'next/link'
import Cabecera from '@/components/Cabecera'
import Pie from '@/components/Pie'
import Icono from '@/components/Icono'
import Riel from '@/components/Riel'
import { Cartel } from '@/components/FichaSerie'
import CarruselDestacado, { type Diapositiva } from '@/components/CarruselDestacado'
import FilaPortada from '@/components/FilaPortada'
import FranjaPromo from '@/components/FranjaPromo'
import { EN_CURSO, episodioDeEntrada, generosDisponibles, tendencias } from '@/lib/catalogo'
import { FILAS, PROMOCIONES, serieDeFila, type DefinicionFila } from '@/lib/portada'

/* Cada fila carga por su cuenta dentro de un Suspense. Sin eso, la
   portada entera espera a la fila más lenta del scraper, que medido son
   casi cinco segundos con seis filas encadenadas. Así la cabecera y el
   destacado pintan enseguida y las filas van entrando según llegan. */
async function Fila({ fila }: { fila: DefinicionFila }) {
  const series = await serieDeFila(fila)
  return <FilaPortada fila={fila} series={series} />
}

/** Hueco de la fila mientras carga. Mantiene la altura para que lo que
 *  hay debajo no dé un salto cuando llegue el contenido. */
function EsqueletoFila() {
  return (
    <div className="mt-e5" aria-hidden="true">
      <div className="mb-e3 h-[1.6rem] w-[18rem] max-w-[60%] rounded-radio bg-sala-800" />
      <div className="grid grid-flow-col gap-e3 overflow-hidden [grid-auto-columns:minmax(172px,1fr)]">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="aspect-2/3 rounded-radio bg-sala-800" />
        ))}
      </div>
    </div>
  )
}

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

export default async function Inicio() {
  const catalogo = await tendencias(10)
  const destacadas = catalogo.slice(0, 4)

  const diapositivas: Diapositiva[] = destacadas.map((serie) => {
    const entrada = episodioDeEntrada(serie)
    return {
      id: serie.id,
      titulo: serie.titulo,
      sinopsis: serie.sinopsisCorta || serie.sinopsis,
      nota: serie.nota,
      anio: serie.anio,
      clasificacion: serie.clasificacion,
      lamina: serie.panoramica ?? serie.lamina,
      etiqueta: serie.genero || 'Tendencias',
      temporada: entrada?.temporada.numero,
      episodio: entrada?.episodio.numero,
      episodiosTotales: serie.totalEpisodios || undefined,
      hrefVer: entrada
        ? `/ver/${serie.id}/${entrada.temporada.numero}/${entrada.episodio.numero}`
        : `/serie/${serie.id}`,
      hrefFicha: `/serie/${serie.id}`,
    }
  })

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
        <CarruselDestacado slides={diapositivas} />

        <div className="mx-auto max-w-[1600px] px-margen">
          {/* ---------- Seguir viendo ---------- */}
          <section aria-labelledby="t-reanudar" className="mt-e6">
            <CabezaSeccion id="t-reanudar" titulo="Seguir viendo" enlace="Tu historial" />
            <Riel ancho>
              {EN_CURSO.map((c) => (
                <Link
                  key={c.serieId}
                  href={`/serie/${c.serieId}`}
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

          {/* ---------- Las filas temáticas ----------
              Se recorren los datos, no se repite el marcado: añadir una
              fila es una línea en lib/portada.ts. */}
          {FILAS.map((fila) => {
            const promo = PROMOCIONES.find((p) => p.trasFila === fila.id)
            return (
              <div key={fila.id}>
                <Suspense fallback={<EsqueletoFila />}>
                  <Fila fila={fila} />
                </Suspense>
                {promo && <FranjaPromo promo={promo} arte="panoramica-escena" />}
              </div>
            )
          })}

          {/* ---------- Géneros ---------- */}
          <section id="generos" aria-labelledby="t-generos" className="mt-e6">
            <CabezaSeccion id="t-generos" titulo="Por dónde entrar" />
            <nav
              aria-label="Géneros"
              className="flex flex-wrap gap-x-e4 gap-y-e2 border-t border-borde pt-e4"
            >
              {generosDisponibles().map((g) => (
                <Link
                  key={g.slug}
                  href={`/explorar?genero=${g.slug}`}
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
