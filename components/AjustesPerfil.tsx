'use client'

/* Editar el perfil: alias, avatar y biografía.

   Donde antes había un botón desactivado con un comentario diciendo que
   detrás estaba `PUT /user/profile`. Estaba, en efecto. */

import { useState, useTransition } from 'react'
import Campo from './Campo'
import Boton from './Boton'
import { guardarPerfil } from '@/lib/acciones-cuenta'

export default function AjustesPerfil({
  alias,
  avatar,
  bio,
}: {
  alias: string
  avatar: string
  bio: string
}) {
  const [valores, setValores] = useState({ alias, avatar, bio })
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pendiente, empezar] = useTransition()

  const cambiado =
    valores.alias !== alias || valores.avatar !== avatar || valores.bio !== bio

  function enviar(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMensaje(null)
    empezar(async () => {
      const r = await guardarPerfil(valores)
      if (r.ok) setMensaje('Guardado.')
      else setError(r.error ?? 'No se pudo guardar.')
    })
  }

  return (
    <form onSubmit={enviar} className="grid gap-4">
      <Campo
        id="perfil-alias"
        etiqueta="Nombre de usuario"
        value={valores.alias}
        onChange={(e) => setValores((v) => ({ ...v, alias: e.target.value }))}
        ayuda="Es el que sale en tus comentarios y en tu perfil público."
      />

      <Campo
        id="perfil-avatar"
        etiqueta="Avatar"
        type="url"
        placeholder="https://…"
        value={valores.avatar}
        onChange={(e) => setValores((v) => ({ ...v, avatar: e.target.value }))}
        ayuda="Dirección de una imagen. Sin ella se usan tus dos iniciales."
      />

      <div className="grid gap-1.5">
        <label htmlFor="perfil-bio" className="text-sm font-medium text-tinta-apagada">
          Biografía
        </label>
        <textarea
          id="perfil-bio"
          rows={3}
          maxLength={300}
          value={valores.bio}
          onChange={(e) => setValores((v) => ({ ...v, bio: e.target.value }))}
          className="w-full resize-none rounded-radio border border-borde bg-fondo px-3 py-2.5 text-base text-tinta transition-colors duration-200 ease-sal outline-none placeholder:text-tinta-tenue focus:border-primario"
        />
        <p className="text-xs text-tinta-tenue cifras">
          {300 - valores.bio.length} caracteres
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Boton
          type="submit"
          variante="primario"
          tam="compacto"
          disabled={pendiente || !cambiado}
        >
          {pendiente ? 'Guardando…' : 'Guardar cambios'}
        </Boton>

        {mensaje && <span className="text-xs font-semibold text-exito">{mensaje}</span>}
        {error && (
          <span role="alert" className="text-xs font-semibold text-error">
            {error}
          </span>
        )}
      </div>
    </form>
  )
}
