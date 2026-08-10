'use client'

/* Dar de baja la cuenta.

   Va detrás de un desplegable y pide la contraseña, no porque el backend
   lo exija —que también— sino porque esto no se deshace: un botón
   directo en una lista de ajustes se pulsa sin querer.

   Al terminar se va a la portada con `refresh` por delante, para que los
   componentes de servidor dejen de creer que hay sesión. */

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Campo from './Campo'
import { borrarCuenta } from '@/lib/acciones-cuenta'

export default function BorrarCuenta({ alias }: { alias: string }) {
  const [contrasena, setContrasena] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pendiente, empezar] = useTransition()
  const router = useRouter()

  // Teclear el propio alias es la última barrera. Es fricción a
  // propósito: obliga a leer qué se está borrando.
  const puede = contrasena.length > 0 && confirmacion === alias

  function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (!puede) return
    setError(null)
    empezar(async () => {
      const r = await borrarCuenta(contrasena)
      if (r.ok) {
        // La cookie local sigue puesta aunque la cuenta ya no exista.
        await fetch('/api/auth/salir', { method: 'POST' }).catch(() => {})
        router.refresh()
        router.push('/')
      } else {
        setError(r.error ?? 'No se pudo borrar la cuenta.')
      }
    })
  }

  return (
    <details className="group/baja">
      <summary className="cursor-pointer list-none text-sm font-semibold text-tinta-tenue transition-colors duration-150 hover:text-error [&::-webkit-details-marker]:hidden">
        Borrar mi cuenta
      </summary>

      <form onSubmit={enviar} className="mt-4 grid max-w-md gap-4">
        <p className="rounded-radio border border-error/40 bg-error/10 px-4 py-3 text-sm text-tinta-apagada">
          Se borran tu perfil, tu historial, tus listas y tus comentarios. No
          hay forma de recuperarlo.
        </p>

        <Campo
          id="baja-pass"
          etiqueta="Tu contraseña"
          type="password"
          autoComplete="current-password"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
        />

        <Campo
          id="baja-confirmar"
          etiqueta={`Escribe «${alias}» para confirmar`}
          autoComplete="off"
          value={confirmacion}
          onChange={(e) => setConfirmacion(e.target.value)}
        />

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pendiente || !puede}
            className="inline-flex h-8 cursor-pointer items-center rounded-full border border-error/50 bg-error/15 px-4 text-xs font-semibold text-tinta transition-colors duration-200 ease-sal hover:bg-error/25 disabled:pointer-events-none disabled:opacity-40"
          >
            {pendiente ? 'Borrando…' : 'Borrar la cuenta para siempre'}
          </button>
          {error && (
            <span role="alert" className="text-xs font-semibold text-error">
              {error}
            </span>
          )}
        </div>
      </form>
    </details>
  )
}
