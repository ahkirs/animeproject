'use client'

/* «Marcar todas como leídas».

   Cliente por el estado de espera: la llamada revalida la página entera
   y sin un aviso de que algo está pasando el botón parece muerto medio
   segundo. Se esconde solo cuando ya no queda nada sin leer. */

import { useState, useTransition } from 'react'
import { marcarTodasLeidas } from '@/lib/acciones'

export default function MarcarLeidas({ sinLeer }: { sinLeer: number }) {
  const [pendiente, empezar] = useTransition()
  const [error, setError] = useState<string | null>(null)

  if (sinLeer === 0) return null

  return (
    <span className="flex items-center gap-3">
      {error && (
        <span role="alert" className="text-xs font-semibold text-error">
          {error}
        </span>
      )}
      <button
        type="button"
        disabled={pendiente}
        onClick={() => {
          setError(null)
          empezar(async () => {
            const r = await marcarTodasLeidas()
            if (!r.ok) setError(r.error ?? 'No se pudo.')
          })
        }}
        className="cursor-pointer rounded-full border border-borde bg-tarjeta px-4 py-1.5 text-xs font-semibold text-tinta transition-colors duration-200 ease-sal hover:border-borde-vivo hover:bg-apagado disabled:cursor-wait disabled:opacity-60"
      >
        {pendiente ? 'Marcando…' : 'Marcar todas como leídas'}
      </button>
    </span>
  )
}
