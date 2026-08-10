'use client'

/* Sesiones abiertas.

   Cada fila es un refresh token vigente: un navegador donde la cuenta
   sigue entrada. Poder cerrarlos de uno en uno es lo que convierte «me
   dejé la sesión abierta en el ordenador de clase» en algo que se
   arregla desde aquí. */

import { useState, useTransition } from 'react'
import Boton from './Boton'
import { cerrarLasDemasSesiones, cerrarSesionRemota } from '@/lib/acciones-cuenta'
import { haceCuanto } from '@/lib/fechas'
import type { SesionActiva } from '@/lib/cuenta'

export default function AjustesSesiones({ sesiones }: { sesiones: SesionActiva[] }) {
  const [cerradas, setCerradas] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [pendiente, empezar] = useTransition()

  const vivas = sesiones.filter((s) => !cerradas.has(s.id))
  const otras = vivas.filter((s) => !s.actual).length

  function cerrarUna(id: string) {
    setError(null)
    empezar(async () => {
      const r = await cerrarSesionRemota(id)
      if (r.ok) setCerradas((s) => new Set(s).add(id))
      else setError(r.error ?? 'No se pudo cerrar.')
    })
  }

  function cerrarTodas() {
    setError(null)
    empezar(async () => {
      const r = await cerrarLasDemasSesiones()
      if (r.ok) {
        setCerradas(new Set(sesiones.filter((s) => !s.actual).map((s) => s.id)))
      } else {
        setError(r.error ?? 'No se pudo cerrar.')
      }
    })
  }

  if (sesiones.length === 0) {
    return (
      <p className="text-sm text-tinta-tenue">
        No hay más sesiones abiertas que esta.
      </p>
    )
  }

  return (
    <div>
      <ul className="m-0 list-none divide-y divide-borde p-0">
        {vivas.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-tinta">
                {s.dispositivo}
                {s.actual && (
                  <span className="ml-2 rounded-full bg-acento-tenue px-2 py-0.5 text-xs font-semibold text-acento">
                    esta
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-xs text-tinta-tenue">
                {s.ip && <span className="tabular-nums">{s.ip} · </span>}
                {s.ultimoUso ? `activa ${haceCuanto(s.ultimoUso)}` : 'sin uso reciente'}
              </p>
            </div>

            {!s.actual && (
              <Boton
                type="button"
                tam="compacto"
                onClick={() => cerrarUna(s.id)}
                disabled={pendiente}
              >
                Cerrar
              </Boton>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {otras > 0 && (
          <Boton type="button" tam="compacto" onClick={cerrarTodas} disabled={pendiente}>
            {pendiente ? 'Cerrando…' : 'Cerrar las demás'}
          </Boton>
        )}
        {error && (
          <span role="alert" className="text-xs font-semibold text-error">
            {error}
          </span>
        )}
      </div>
    </div>
  )
}
