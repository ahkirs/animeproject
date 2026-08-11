'use client'

import { useState } from 'react'
import Link from 'next/link'
import Icono from './Icono'
import Lamina from './Lamina'
import type { Episodio } from '@/lib/types'

/* ============================================================
   ListaEpisodios — grid estilo AnimEx
   Tarjetas horizontales más altas, animaciones de entrada
   escalonadas, y numerado inteligente que evita "0. Episodio 0".
   ============================================================ */

/** Evita "1. Episodio 1" — si el título ya contiene el número,
 *  devuelve solo el título tal cual. */
function tituloFormateado(ep: Episodio): string {
  const num = ep.numero
  const t = ep.titulo

  /* Si el título ya arranca con el número (e.g. "1 - Nombre") no duplicar */
  if (/^\d/.test(t) && t.startsWith(String(num))) return t

  /* Si el título es genérico ("Episodio 3") mostrar solo eso */
  const generico = /^(episodio|episode|ep\.?)\s*\d+/i
  if (generico.test(t)) return t

  return `${num}. ${t}`
}

function TarjetaEpisodio({
  ep,
  serieId,
  temporada,
  indice,
}: {
  ep: Episodio
  serieId: string
  temporada: number
  /** Para la animación escalonada */
  indice: number
}) {
  return (
    <Link
      href={`/ver/${serieId}/${temporada}/${ep.numero}`}
      className="group grid grid-cols-[140px_1fr] gap-5 rounded-radio bg-tarjeta/30 p-5 no-underline transition-all duration-200 ease-sal hover:bg-tarjeta/70 max-[640px]:grid-cols-[110px_1fr] max-[480px]:grid-cols-[95px_1fr]"
      style={{
        animation: `entradaEp 0.4s ${indice * 0.04}s both ease-out`,
      }}
    >
      {/* Thumbnail — más alto con aspect-[16/10] */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-radio bg-tarjeta">
        <Lamina arte={ep.lamina} />

        {/* Badge de duración */}
        {ep.duracionMin != null && (
          <span className="absolute bottom-[5px] left-[5px] rounded-[3px] bg-fondo/85 px-[0.35rem] py-[2px] text-[0.65rem] font-bold cifras text-tinta">
            {ep.duracionMin}m
          </span>
        )}

        {/* Hover: play overlay */}
        <span
          aria-hidden="true"
          className="absolute inset-0 grid place-items-center bg-fondo/50 opacity-0 transition-opacity duration-200 ease-sal group-hover:opacity-100"
        >
          <span className="grid size-9 place-items-center rounded-full bg-primario text-primario-tinta transition-transform duration-200 ease-sal group-hover:scale-110">
            <Icono nombre="play" tam={16} />
          </span>
        </span>
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-col justify-center gap-[4px]">
        <h3 className="line-clamp-1 text-sm font-bold leading-snug tracking-[-0.01em] text-tinta transition-colors duration-200 ease-sal group-hover:text-primario">
          {tituloFormateado(ep)}
        </h3>

        {ep.sinopsis ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-tinta-tenue transition-colors duration-200 ease-sal group-hover:text-tinta-apagada">
            {ep.sinopsis}
          </p>
        ) : (
          <p className="text-xs text-tinta-tenue/50 italic">
            Sin sinopsis disponible
          </p>
        )}

        {/* Iconos */}
        <div className="mt-auto flex items-center gap-3 pt-[2px] text-tinta-tenue transition-colors duration-200 group-hover:text-tinta-apagada">
          <Icono nombre="cc" tam={15} />
          <Icono nombre="descarga" tam={15} />
        </div>
      </div>
    </Link>
  )
}

interface Props {
  episodios: Episodio[]
  serieId: string
  temporada: number
  etiquetaTemporada?: string | null
}

export default function ListaEpisodios({
  episodios,
  serieId,
  temporada,
  etiquetaTemporada,
}: Props) {
  const [busqueda, setBusqueda] = useState('')

  const filtrados = busqueda.trim()
    ? episodios.filter((ep) => {
        const q = busqueda.toLowerCase()
        return (
          ep.titulo.toLowerCase().includes(q) ||
          String(ep.numero).includes(q)
        )
      })
    : episodios

  const totalStr = episodios.length
  const mostrando = filtrados.length

  return (
    <div>
      {/* Etiqueta de temporada */}
      {etiquetaTemporada &&
        etiquetaTemporada.toLowerCase() !== 'episodios' && (
          <p className="mb-5 text-xs font-bold tracking-[0.11em] text-tinta-tenue uppercase">
            {etiquetaTemporada}
          </p>
        )}

      {/* Barra de búsqueda */}
      <div className="mb-5 flex items-center gap-3 rounded-radio border border-borde bg-tarjeta px-5 py-[0.5rem] transition-colors duration-200 ease-sal focus-within:border-tinta-tenue">
        <Icono nombre="buscar" tam={16} className="shrink-0 text-tinta-tenue" />
        <input
          type="text"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="min-w-0 flex-1 border-0 bg-transparent text-sm text-tinta outline-none placeholder:text-tinta-tenue"
        />
        {busqueda && (
          <button
            onClick={() => setBusqueda('')}
            className="grid size-6 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-tinta/10 text-tinta-tenue transition-colors duration-150 hover:bg-tinta/20 hover:text-tinta"
            aria-label="Limpiar búsqueda"
          >
            ✕
          </button>
        )}
      </div>

      {/* Grid de episodios */}
      {filtrados.length > 0 ? (
        <div className="grid grid-cols-2 gap-5 max-[900px]:grid-cols-1">
          {filtrados.map((ep, i) => (
            <TarjetaEpisodio
              key={ep.numero}
              ep={ep}
              serieId={serieId}
              temporada={temporada}
              indice={i}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-radio border border-dashed border-borde-vivo px-8 py-13 text-center text-sm text-tinta-tenue">
          {busqueda
            ? `Sin resultados para "${busqueda}"`
            : 'Todavía no hay episodios cargados para esta obra.'}
        </p>
      )}

      {/* Contador */}
      {episodios.length > 0 && (
        <p className="mt-3 text-xs text-tinta-tenue">
          Mostrando{' '}
          <span className="font-semibold text-primario">
            {mostrando === totalStr
              ? totalStr
              : `${mostrando} de ${totalStr}`}
          </span>{' '}
          episodios
        </p>
      )}
    </div>
  )
}
