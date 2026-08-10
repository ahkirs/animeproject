'use client'

/* Escribir un comentario, o responder a uno.

   El mismo componente sirve para los dos casos: lo único que cambia es
   si lleva `parentId` y el texto del botón. Así no hay dos formularios
   que mantener en paralelo.

   El área de texto crece con el contenido en vez de traer su propia
   barra de desplazamiento: un cajón de tres líneas con scroll dentro de
   una página que ya se desplaza es una trampa para el ratón. */

import { useRef, useState, useTransition } from 'react'
import { publicarComentario } from '@/lib/acciones'

const LIMITE = 2000

export default function FormularioComentario({
  animeId,
  episodeId,
  parentId,
  autoFoco = false,
  alPublicar,
  alCancelar,
}: {
  animeId: string
  episodeId?: string
  /** Si va, esto es una respuesta. */
  parentId?: string
  autoFoco?: boolean
  alPublicar?: () => void
  alCancelar?: () => void
}) {
  const [texto, setTexto] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pendiente, empezar] = useTransition()
  const area = useRef<HTMLTextAreaElement>(null)

  function crecer() {
    const nodo = area.current
    if (!nodo) return
    nodo.style.height = 'auto'
    nodo.style.height = `${nodo.scrollHeight}px`
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault()
    const limpio = texto.trim()
    if (!limpio) return

    setError(null)
    empezar(async () => {
      const r = await publicarComentario({ animeId, episodeId, parentId, texto: limpio })
      if (r.ok) {
        setTexto('')
        if (area.current) area.current.style.height = 'auto'
        alPublicar?.()
      } else {
        setError(r.error ?? 'No se pudo publicar.')
      }
    })
  }

  return (
    <form onSubmit={enviar} className={parentId ? 'mt-3' : ''}>
      <textarea
        ref={area}
        value={texto}
        autoFocus={autoFoco}
        maxLength={LIMITE}
        rows={parentId ? 2 : 3}
        onChange={(e) => {
          setTexto(e.target.value)
          crecer()
        }}
        onKeyDown={(e) => {
          // Ctrl/⌘+Enter publica: es lo que espera quien escribe mucho.
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') enviar(e)
          if (e.key === 'Escape' && alCancelar) alCancelar()
        }}
        placeholder={parentId ? 'Escribe tu respuesta…' : '¿Qué te ha parecido?'}
        className="w-full resize-none rounded-radio border border-borde bg-fondo px-3 py-2.5 text-sm text-tinta transition-colors duration-200 ease-sal outline-none placeholder:text-tinta-tenue focus:border-borde-vivo"
      />

      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-xs text-tinta-tenue" role={error ? 'alert' : undefined}>
          {error ? (
            <span className="font-semibold text-error">{error}</span>
          ) : texto.length > LIMITE - 200 ? (
            <span className="tabular-nums">
              {LIMITE - texto.length} caracteres
            </span>
          ) : null}
        </p>

        <div className="flex shrink-0 items-center gap-2">
          {alCancelar && (
            <button
              type="button"
              onClick={alCancelar}
              className="cursor-pointer rounded-full border-0 bg-transparent px-3 py-1.5 text-xs font-semibold text-tinta-tenue transition-colors duration-150 hover:text-tinta"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={pendiente || !texto.trim()}
            className="cursor-pointer rounded-full border-0 bg-primario px-4 py-1.5 text-xs font-semibold text-primario-tinta transition-opacity duration-200 ease-sal hover:opacity-85 disabled:pointer-events-none disabled:opacity-40"
          >
            {pendiente ? 'Publicando…' : parentId ? 'Responder' : 'Publicar'}
          </button>
        </div>
      </div>
    </form>
  )
}
