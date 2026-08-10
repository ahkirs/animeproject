'use client'

/* La nota que ponen los usuarios de este sitio.

   No confundirla con la que enseña la ficha arriba: esa viene del
   agregador que rasca el scraper (millón y medio de votos en One Piece)
   y es otra cosa. Esta empieza en cero y la construye quien entra aquí.

   Diez botones y no cinco estrellas: el backend guarda de 1 a 10, y una
   escala de estrellas con medias obliga a traducir entre lo que se pulsa
   y lo que se guarda, que es justo donde se cuelan los errores de
   redondeo. Diez cifras son diez cifras. */

import { useState, useTransition } from 'react'
import { calificar, quitarNota } from '@/lib/acciones'

const NOTAS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const

export default function NotaComunidad({
  animeId,
  media,
  votos,
  miNota,
  haySesion,
}: {
  animeId: string
  media: number | null
  votos: number
  miNota: number | null
  haySesion: boolean
}) {
  const [nota, setNota] = useState(miNota)
  const [encima, setEncima] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pendiente, empezar] = useTransition()

  function puntuar(valor: number) {
    setError(null)
    // Repetir la misma nota la quita: es el gesto que espera cualquiera
    // que ha pulsado sin querer.
    const quitar = nota === valor
    setNota(quitar ? null : valor)

    empezar(async () => {
      const r = quitar ? await quitarNota(animeId) : await calificar(animeId, valor)
      if (!r.ok) {
        setNota(nota)
        setError(r.error ?? 'No se pudo guardar la nota.')
      }
    })
  }

  const resaltado = encima ?? nota ?? 0

  return (
    <section aria-labelledby="t-nota" className="mt-12 px-bleed">
      <h2 id="t-nota" className="text-xl font-semibold text-tinta">
        Nota de la comunidad
      </h2>

      <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-4 rounded-radio border border-borde bg-tarjeta px-5 py-4">
        <div className="shrink-0">
          <p className="font-titulo text-4xl leading-none font-extrabold text-tinta cifras">
            {media != null ? media.toLocaleString('es-ES', { maximumFractionDigits: 1 }) : '—'}
          </p>
          <p className="mt-1 text-xs text-tinta-tenue cifras">
            {votos === 0
              ? 'Sin votos todavía'
              : votos === 1
                ? '1 voto'
                : `${votos} votos`}
          </p>
        </div>

        <div className="min-w-0 flex-1">
          {haySesion ? (
            <>
              <p className="mb-2 text-sm text-tinta-apagada">
                {nota != null ? (
                  <>
                    Tu nota:{' '}
                    <b className="font-semibold text-acento cifras">{nota}</b>{' '}
                    <span className="text-xs text-tinta-tenue">
                      (púlsala otra vez para quitarla)
                    </span>
                  </>
                ) : (
                  'Puntúa del 1 al 10'
                )}
              </p>

              <div
                className="flex flex-wrap gap-1"
                onMouseLeave={() => setEncima(null)}
              >
                {NOTAS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => puntuar(n)}
                    onMouseEnter={() => setEncima(n)}
                    onFocus={() => setEncima(n)}
                    onBlur={() => setEncima(null)}
                    disabled={pendiente}
                    aria-pressed={nota === n}
                    aria-label={`Puntuar con un ${n}`}
                    className={`size-8 cursor-pointer rounded-radio border text-xs font-semibold transition-colors duration-150 cifras disabled:opacity-60 ${
                      n <= resaltado
                        ? 'border-transparent bg-acento text-acento-tinta'
                        : 'border-borde bg-fondo text-tinta-apagada hover:border-borde-vivo'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>

              {error && (
                <p role="alert" className="mt-2 text-xs font-semibold text-error">
                  {error}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-tinta-apagada">
              Entra en tu cuenta para puntuar esta obra.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
