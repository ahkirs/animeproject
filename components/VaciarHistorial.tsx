'use client'

/* Vaciar el historial.

   Pide confirmación en el sitio, sin diálogo: es una acción destructiva
   e irreversible, pero no necesita interrumpir ni proteger el foco, y un
   modal para esto sobra. El botón se convierte en la pregunta y en las
   dos respuestas, que además deja el «no» a mano.

   El aviso dice cuántos se van a borrar. «Borrar historial» a secas no
   informa de nada; «borrar los 148 episodios» sí. */

import { useState, useTransition } from 'react'

export default function VaciarHistorial({
  cuantos,
  accion,
}: {
  cuantos: number
  accion: () => Promise<{ ok: boolean; error?: string }>
}) {
  const [confirmando, setConfirmando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendiente, empezar] = useTransition()

  if (cuantos === 0) return null

  function borrar() {
    setError(null)
    empezar(async () => {
      const r = await accion()
      if (!r.ok) setError(r.error ?? 'No se pudo borrar.')
      setConfirmando(false)
    })
  }

  if (error) {
    return (
      <p role="alert" className="text-xs font-semibold text-error">
        {error}
      </p>
    )
  }

  if (!confirmando) {
    return (
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className="cursor-pointer border-0 bg-transparent p-0 text-xs font-semibold tracking-[0.06em] text-tinta-tenue uppercase transition-colors duration-200 ease-sal hover:text-error"
      >
        Borrar historial
      </button>
    )
  }

  return (
    <span className="flex flex-wrap items-center gap-3 text-xs">
      <span className="text-tinta-apagada">
        ¿Borrar {cuantos === 1 ? 'el episodio' : `los ${cuantos} episodios`}? No se
        puede deshacer.
      </span>
      <button
        type="button"
        onClick={borrar}
        disabled={pendiente}
        className="cursor-pointer rounded-radio border border-error/50 bg-error/12 px-[0.7rem] py-[0.2rem] font-semibold text-tinta transition-colors duration-200 ease-sal hover:bg-error/20 disabled:cursor-wait disabled:opacity-60"
      >
        {pendiente ? 'Borrando…' : 'Sí, borrar'}
      </button>
      <button
        type="button"
        onClick={() => setConfirmando(false)}
        disabled={pendiente}
        className="cursor-pointer border-0 bg-transparent p-0 font-semibold text-tinta-tenue transition-colors duration-200 ease-sal hover:text-tinta"
      >
        Cancelar
      </button>
    </span>
  )
}
