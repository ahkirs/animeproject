'use client'

/* Botón de quitar, para el historial y para las listas.

   Cliente porque tiene tres estados que se ven —normal, borrando y
   error— y porque usa la transición de React para no bloquear la
   interfaz mientras el servidor revalida la lista.

   Con `useTransition` la fila se queda atenuada durante la espera en vez
   de desaparecer de golpe: si la petición falla, vuelve donde estaba y
   nadie se queda mirando un hueco preguntándose si se borró o no. */

import { useState, useTransition } from 'react'
import Icono from './Icono'

export default function BotonQuitar({
  accion,
  etiqueta,
  className = '',
}: {
  /** Devuelve `{ ok }` o `{ ok:false, error }`. */
  accion: () => Promise<{ ok: boolean; error?: string }>
  /** Para lectores de pantalla: «Quitar Frieren E1 del historial». */
  etiqueta: string
  className?: string
}) {
  const [pendiente, empezar] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function pulsar() {
    setError(null)
    empezar(async () => {
      const r = await accion()
      if (!r.ok) setError(r.error ?? 'No se pudo quitar.')
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={pulsar}
        disabled={pendiente}
        aria-label={etiqueta}
        title={etiqueta}
        className={`z-1 grid size-8 cursor-pointer place-items-center rounded-full border border-borde bg-black/70 text-tinta-apagada backdrop-blur-sm transition-colors duration-200 ease-sal hover:border-borde-vivo hover:text-tinta disabled:cursor-wait disabled:opacity-50 ${className}`}
      >
        <Icono nombre={pendiente ? 'ajustes' : 'cerrar'} tam={14} />
      </button>

      {error && (
        <span
          role="alert"
          className="absolute inset-x-0 bottom-0 z-1 rounded-b-radio bg-error px-2 py-0.5 text-center text-xs font-semibold text-fondo"
        >
          {error}
        </span>
      )}
    </>
  )
}
