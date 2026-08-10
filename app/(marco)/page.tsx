import { Suspense } from 'react'
import Link from 'next/link'
import Icono from '@/components/Icono'
import Riel from '@/components/Riel'
import { Cartel } from '@/components/FichaSerie'
import CarruselDestacado, { type Diapositiva } from '@/components/CarruselDestacado'
import FilaPortada from '@/components/FilaPortada'
import FranjaPromo from '@/components/FranjaPromo'
import TituloSeccion from '@/components/TituloSeccion'
import {
  episodioDeEntrada,
  generosDisponibles,
  tendencias,
} from '@/lib/catalogo'
import { enCurso } from '@/lib/perfil'
import { haySesion } from '@/lib/sesion'
import { FILAS, PROMOCIONES, serieDeFila, type DefinicionFila } from '@/lib/portada'

/** Cuántas obras enseña el destacado. Cada una cuesta una llamada a la
 *  ficha del scraper, que es de donde salen la sinopsis, el estado, los
 *  géneros y el tráiler. */
const DESTACADAS = 6

/* Cada fila carga por su cuenta dentro de un Suspense. Sin eso, la
   portada entera espera a la fila más lenta del scraper, que medido son
   casi cinco segundos con seis filas encadenadas. Así el destacado pinta
   enseguida y las filas van entrando según llegan. */
async function Fila({ fila }: { fila: DefinicionFila }) {
  const series = await serieDeFila(fila)
  return <FilaPortada fila={fila} series={series} />
}

/** Hueco de la fila mientras carga. Mantiene la altura para que lo que
 *  hay debajo no dé un salto cuando llegue el contenido. */
function EsqueletoFila() {
  return (
    <div className="mt-8" aria-hidden="true">
      <div className="mb-3 h-7 w-72 max-w-[60%] rounded-radio bg-tarjeta px-bleed" />
      <div className="flex gap-2 overflow-hidden px-bleed py-2">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="esqueleto h-[200px] w-[140px] shrink-0 rounded-radio bg-tarjeta xs:h-[220px] xs:w-[160px] lg:h-[260px] lg:w-[180px]"
          />
        ))}
      </div>
    </div>
  )
}

/* Seguir viendo.

   Va en su propio Suspense y no en el cuerpo de la página porque lee el
   historial de la cuenta, que es una llamada más y no se puede cachear:
   sin aislarlo, el destacado esperaría por él en cada carga. */
async function SeguirViendo() {
  const historial = await enCurso(12)
  if (historial.length === 0) return null

  return (
    <section aria-labelledby="t-reanudar" className="mt-8">
      <TituloSeccion
        id="t-reanudar"
        titulo="Seguir viendo"
        enlace="Tu historial"
        href="/mi-lista"
      />
      <Riel etiqueta="Seguir viendo">
        {historial.map((c) => (
          <Link
            key={c.serieId}
            href={`/serie/${c.serieId}`}
            className="group/card block w-[240px] shrink-0 no-underline lg:w-[300px]"
          >
            <Cartel arte={c.lamina} ancho>
              <span className="absolute inset-0 grid place-items-center bg-black/30 opacity-0 transition-opacity duration-200 ease-sal group-hover/ficha:opacity-100">
                <span className="grid size-12 place-items-center rounded-full bg-acento text-acento-tinta">
                  <Icono nombre="play" tam={20} />
                </span>
              </span>

              {/* La barra va soldada al borde inferior de la imagen, no
                  debajo: así se lee como parte del fotograma. */}
              <span className="absolute inset-x-0 bottom-0 h-1 bg-black/50">
                <span
                  className="block h-full bg-acento"
                  style={{ width: `${c.progreso}%` }}
                />
              </span>
            </Cartel>

            <p className="mt-2 truncate text-sm font-semibold text-tinta">
              {c.serieTitulo}
            </p>
            <p className="mt-0.5 flex justify-between gap-2 text-xs text-tinta-tenue cifras">
              <span className="truncate">{c.episodio}</span>
              {c.restanteMin != null && (
                <span className="shrink-0">quedan {c.restanteMin} min</span>
              )}
            </p>
          </Link>
        ))}
      </Riel>
    </section>
  )
}

export default async function Inicio() {
  const catalogo = await tendencias(10, DESTACADAS)
  const destacadas = catalogo.slice(0, DESTACADAS)
  const generos = await generosDisponibles()
  const conSesion = await haySesion()

  const diapositivas: Diapositiva[] = destacadas.map((serie) => {
    const entrada = episodioDeEntrada(serie)
    return {
      id: serie.id,
      titulo: serie.titulo,
      sinopsis: serie.sinopsisCorta || serie.sinopsis,
      nota: serie.nota,
      estado: serie.estado,
      anio: serie.anio,
      generos: serie.generos,
      // El scraper publica los episodios según salen, así que el total es
      // el último disponible.
      episodio: serie.totalEpisodios || undefined,
      clasificacion: serie.clasificacion,
      lamina: serie.panoramica ?? serie.lamina,
      trailer: serie.trailer,
      hrefVer: entrada
        ? `/ver/${serie.id}/${entrada.temporada.numero}/${entrada.episodio.numero}`
        : `/serie/${serie.id}`,
      hrefFicha: `/serie/${serie.id}`,
    }
  })

  return (
    <>
      <CarruselDestacado slides={diapositivas} />

      <div className="pb-4">
        {/* Sin sesión no hay historial que enseñar, y pedirlo sería una
            llamada segura de volver vacía. */}
        {conSesion && (
          <Suspense fallback={null}>
            <SeguirViendo />
          </Suspense>
        )}

        {/* Se recorren los datos, no se repite el marcado: añadir una
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

        <section id="generos" aria-labelledby="t-generos" className="mt-16">
          <TituloSeccion id="t-generos" titulo="Por dónde entrar" grande />
          <nav
            aria-label="Géneros"
            className="flex flex-wrap gap-2 px-bleed pt-2"
          >
            {generos.map((g) => (
              <Link
                key={g.slug}
                href={`/explorar?genero=${g.slug}`}
                className="rounded-full border border-borde bg-tarjeta px-4 py-2 text-sm font-medium text-tinta-apagada no-underline transition-colors duration-200 ease-sal hover:border-borde-vivo hover:bg-apagado hover:text-tinta"
              >
                {g.nombre}
              </Link>
            ))}
          </nav>
        </section>
      </div>
    </>
  )
}
