'use client'

/* Un comentario, con sus respuestas colgando.

   Cliente porque casi todo lo que hace es local: abrir el editor, abrir
   el formulario de respuesta, y el «me gusta», que se pinta al momento y
   se corrige si el servidor dice que no. Sin ese optimismo, dar like en
   una conversación larga se sentiría como pulsar un botón muerto durante
   medio segundo.

   Las respuestas se anidan un solo nivel. El backend acepta `parentId`
   sobre cualquier comentario, así que podría anidarse indefinidamente,
   pero a partir del segundo nivel en móvil no queda ancho para el texto:
   responder a una respuesta cuelga del mismo hilo. */

import { useState, useTransition } from 'react'
import Icono from './Icono'
import FormularioComentario from './FormularioComentario'
import {
  borrarComentario,
  editarComentario,
  marcarMeGusta,
} from '@/lib/acciones'
import { haceCuanto } from '@/lib/fechas'
import type { Comentario as Datos } from '@/lib/comentarios'

function Avatar({ alias, url }: { alias: string; url: string | null }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={url}
        alt=""
        className="size-8 shrink-0 rounded-full object-cover"
        loading="lazy"
      />
    )
  }
  return (
    <span
      aria-hidden="true"
      className="grid size-8 shrink-0 place-items-center rounded-full border border-borde bg-apagado text-[0.7rem] font-bold text-tinta-apagada"
    >
      {alias.slice(0, 2).toUpperCase()}
    </span>
  )
}

export default function Comentario({
  datos,
  animeId,
  episodeId,
  haySesion,
  anidado = false,
}: {
  datos: Datos
  animeId: string
  episodeId?: string
  haySesion: boolean
  anidado?: boolean
}) {
  const [meGusta, setMeGusta] = useState(datos.leHeDado)
  const [cuantos, setCuantos] = useState(datos.meGusta)
  const [respondiendo, setRespondiendo] = useState(false)
  const [editando, setEditando] = useState(false)
  const [texto, setTexto] = useState(datos.texto)
  const [borrado, setBorrado] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendiente, empezar] = useTransition()

  function alternarMeGusta() {
    const siguiente = !meGusta
    // Optimista: se pinta ya y se deshace si falla.
    setMeGusta(siguiente)
    setCuantos((n) => n + (siguiente ? 1 : -1))
    empezar(async () => {
      const r = await marcarMeGusta(datos.id, siguiente, animeId)
      if (!r.ok) {
        setMeGusta(!siguiente)
        setCuantos((n) => n + (siguiente ? -1 : 1))
        setError(r.error ?? 'No se pudo.')
      }
    })
  }

  function guardarEdicion(nuevo: string) {
    const limpio = nuevo.trim()
    if (!limpio) return
    setError(null)
    empezar(async () => {
      const r = await editarComentario(datos.id, limpio, animeId)
      if (r.ok) {
        setTexto(limpio)
        setEditando(false)
      } else {
        setError(r.error ?? 'No se pudo editar.')
      }
    })
  }

  function borrar() {
    setError(null)
    empezar(async () => {
      const r = await borrarComentario(datos.id, animeId)
      if (r.ok) setBorrado(true)
      else setError(r.error ?? 'No se pudo borrar.')
    })
  }

  if (borrado || datos.eliminado) {
    return (
      <article className={anidado ? 'mt-3 ml-11' : 'mt-5'}>
        <p className="text-sm text-tinta-tenue italic">Comentario eliminado.</p>
        {datos.respuestas.map((r) => (
          <Comentario
            key={r.id}
            datos={r}
            animeId={animeId}
            episodeId={episodeId}
            haySesion={haySesion}
            anidado
          />
        ))}
      </article>
    )
  }

  const accion =
    'inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-transparent px-0 py-0 text-xs font-medium transition-colors duration-150'

  return (
    <article className={anidado ? 'mt-4 ml-11' : 'mt-5'}>
      <div className="flex gap-3">
        <Avatar alias={datos.autor.alias} url={datos.autor.avatar} />

        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-baseline gap-2 text-sm">
            <b className="font-semibold text-tinta">{datos.autor.alias}</b>
            <span className="text-xs text-tinta-tenue">
              {haceCuanto(datos.creado)}
              {datos.editado && ' · editado'}
            </span>
          </p>

          {editando ? (
            <EditorEnLinea
              inicial={texto}
              pendiente={pendiente}
              alGuardar={guardarEdicion}
              alCancelar={() => setEditando(false)}
            />
          ) : (
            <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap text-tinta-apagada">
              {texto}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={alternarMeGusta}
              disabled={!haySesion || pendiente}
              aria-pressed={meGusta}
              aria-label={meGusta ? 'Quitar me gusta' : 'Me gusta'}
              className={`${accion} ${
                meGusta ? 'text-acento' : 'text-tinta-tenue hover:text-tinta'
              } disabled:pointer-events-none disabled:opacity-50`}
            >
              <Icono nombre={meGusta ? 'estrella-llena' : 'estrella'} tam={14} />
              {cuantos > 0 && <span className="cifras">{cuantos}</span>}
            </button>

            {haySesion && !anidado && (
              <button
                type="button"
                onClick={() => setRespondiendo((v) => !v)}
                className={`${accion} text-tinta-tenue hover:text-tinta`}
              >
                Responder
              </button>
            )}

            {datos.esMio && !editando && (
              <>
                <button
                  type="button"
                  onClick={() => setEditando(true)}
                  className={`${accion} text-tinta-tenue hover:text-tinta`}
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={borrar}
                  disabled={pendiente}
                  className={`${accion} text-tinta-tenue hover:text-error disabled:opacity-50`}
                >
                  Borrar
                </button>
              </>
            )}
          </div>

          {error && (
            <p role="alert" className="mt-2 text-xs font-semibold text-error">
              {error}
            </p>
          )}

          {respondiendo && (
            <FormularioComentario
              animeId={animeId}
              episodeId={episodeId}
              parentId={datos.id}
              autoFoco
              alPublicar={() => setRespondiendo(false)}
              alCancelar={() => setRespondiendo(false)}
            />
          )}
        </div>
      </div>

      {datos.respuestas.map((r) => (
        <Comentario
          key={r.id}
          datos={r}
          animeId={animeId}
          episodeId={episodeId}
          haySesion={haySesion}
          anidado
        />
      ))}
    </article>
  )
}

/** El área de edición en el sitio del comentario. Se escribe aparte del
 *  formulario de publicar porque aquí no se crea nada: se guarda sobre lo
 *  que ya hay, y el botón tiene que decir eso. */
function EditorEnLinea({
  inicial,
  pendiente,
  alGuardar,
  alCancelar,
}: {
  inicial: string
  pendiente: boolean
  alGuardar: (texto: string) => void
  alCancelar: () => void
}) {
  const [valor, setValor] = useState(inicial)

  return (
    <div className="mt-2">
      <textarea
        value={valor}
        autoFocus
        rows={3}
        onChange={(e) => setValor(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') alCancelar()
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') alGuardar(valor)
        }}
        className="w-full resize-none rounded-radio border border-borde bg-fondo px-3 py-2 text-sm text-tinta outline-none focus:border-borde-vivo"
      />
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => alGuardar(valor)}
          disabled={pendiente || !valor.trim()}
          className="cursor-pointer rounded-full border-0 bg-primario px-4 py-1.5 text-xs font-semibold text-primario-tinta transition-opacity duration-200 hover:opacity-85 disabled:pointer-events-none disabled:opacity-40"
        >
          Guardar
        </button>
        <button
          type="button"
          onClick={alCancelar}
          className="cursor-pointer rounded-full border-0 bg-transparent px-3 py-1.5 text-xs font-semibold text-tinta-tenue transition-colors duration-150 hover:text-tinta"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
