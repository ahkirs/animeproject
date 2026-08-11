/* Tarjeta del historial: fotograma 16:9, progreso y borrado.

   Dos decisiones de estructura que no se ven pero mandan:

   1. La tarjeta NO es un enlace envolvente. El botón de borrar iría
      dentro de un <a>, y un botón anidado en un enlace es marcado
      inválido: el navegador decide cuál gana. Se usa el enlace del
      título estirado con ::after sobre toda la tarjeta, y el botón se
      levanta por encima. Así hay dos destinos de teclado, en el orden
      correcto, y un solo objetivo de ratón.

   2. La barra de progreso va soldada al borde inferior de la imagen, no
      flotando debajo del título: describe el fotograma, así que se pega
      a él. */

import Link from 'next/link'
import Icono from './Icono'
import BotonQuitar from './BotonQuitar'
import { quitarDelHistorial } from '@/lib/acciones'
import type { VistaEpisodio } from '@/lib/perfil'
import { haceCuanto } from '@/lib/fechas'

export default function TarjetaEpisodio({ vista }: { vista: VistaEpisodio }) {
  // Sin duración guardada no se puede decir cuánto queda. Se dice lo que
  // sí se sabe —que está empezado— en lugar de fingir un porcentaje.
  const hayDuracion = typeof vista.duracionSeg === 'number' && vista.duracionSeg > 0
  const fraccion = hayDuracion ? vista.segundo / vista.duracionSeg! : 0
  const visto = hayDuracion && fraccion >= 0.95
  const restanMin = hayDuracion
    ? Math.max(1, Math.round((vista.duracionSeg! - vista.segundo) / 60))
    : null

  const insignia = !hayDuracion ? 'Empezado' : visto ? 'Visto' : `quedan ${restanMin} min`

  return (
    <article className="group relative">
      <div className="relative aspect-video overflow-hidden rounded-radio bg-tarjeta">
        {vista.imagen && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={vista.imagen}
            alt=""
            loading="lazy"
            className="size-full object-cover"
          />
        )}

        {/* Oscurecer el pie del fotograma es lo que hace legible la
            insignia y la barra de progreso, que van encima de la imagen.
            En negro y no en el color del fondo: así funciona igual sobre
            cualquier superficie. */}
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.1)_58%)]" />

        {/* Reanudar: aparece al apuntar, y siempre en pantallas sin ratón */}
        <span
          aria-hidden="true"
          className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-200 ease-sal group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100"
        >
          <span className="grid size-11 place-items-center rounded-full bg-fondo/80 text-tinta">
            <Icono nombre="play" tam={18} />
          </span>
        </span>

        <span
          className={`absolute right-3 bottom-3 rounded-[2px] px-[0.4rem] py-[0.1rem] text-xs font-semibold cifras ${
            visto
              ? 'bg-fondo/85 text-tinta-apagada'
              : hayDuracion
                ? 'bg-tinta text-fondo'
                : 'bg-fondo/85 text-tinta-tenue'
          }`}
        >
          {insignia}
        </span>

        {/* Soldada al borde inferior del fotograma */}
        {hayDuracion && (
          <span className="absolute inset-x-0 bottom-0 h-[3px] bg-tinta/20">
            <span
              className="block h-full bg-primario"
              style={{ width: `${Math.round(fraccion * 100)}%` }}
            />
          </span>
        )}
      </div>

      <h3 className="mt-3 text-sm leading-snug font-semibold tracking-[-0.01em]">
        <Link
          href={`/serie/${vista.animeId}`}
          className="text-tinta-apagada no-underline transition-colors duration-150 ease-sal after:absolute after:inset-0 group-hover:text-tinta"
        >
          {/* El historial guarda el título del episodio, no su número.
              Se enseña lo que hay en vez de derivar un «E12» del id, que
              no siempre lleva el número dentro. */}
          {vista.episodeTitle || 'Episodio'}
        </Link>
      </h3>

      <p className="mt-[0.15rem] flex items-baseline gap-[0.4rem] text-xs text-tinta-tenue">
        <span className="min-w-0 truncate">{vista.animeTitle}</span>
        <span aria-hidden="true" className="shrink-0">
          ·
        </span>
        <span className="shrink-0">{haceCuanto(vista.watchedAt)}</span>
      </p>

      {/* Por encima del enlace estirado, si no sería inalcanzable */}
      <div className="absolute top-3 right-3 opacity-0 transition-opacity duration-200 ease-sal group-hover:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100">
        <BotonQuitar
          accion={quitarDelHistorial.bind(null, vista.episodeId)}
          etiqueta={`Quitar ${vista.episodeTitle || 'este episodio'} del historial`}
        />
      </div>
    </article>
  )
}
