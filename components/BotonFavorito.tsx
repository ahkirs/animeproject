'use client'

/* Guardar una obra en una lista: favoritos desde la ficha, «ver después»
   desde la esquina de una tarjeta.

   Cliente porque hay tres estados que se ven —normal, guardando y
   guardado— y con `useTransition` el botón se queda atenuado durante la
   espera en vez de pegar un salto.

   Se rellena en cuanto la acción responde bien. No se consulta al entrar
   si la obra ya estaba guardada: eso costaría una petición más por cada
   tarjeta de la página, y la API ya va justa. El estado de verdad vive
   en /mi-lista, que es donde se va a mirar. */

import { useState, useTransition } from 'react'
import Icono, { type NombreIcono } from './Icono'

export default function BotonFavorito({
  accion,
  titulo,
  icono = 'estrella',
  iconoGuardado = 'estrella-llena',
  compacto = false,
}: {
  accion: () => Promise<{ ok: boolean; error?: string }>
  /** Para el lector de pantalla: «Guardar Bleach en favoritos». */
  titulo: string
  icono?: NombreIcono
  iconoGuardado?: NombreIcono
  /** El de la esquina de una tarjeta: más pequeño y sin hueco de error. */
  compacto?: boolean
}) {
  const [pendiente, empezar] = useTransition()
  const [guardado, setGuardado] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function pulsar(e: React.MouseEvent) {
    // En una tarjeta este botón va dentro del enlace de la carátula: sin
    // esto, guardar navegaría a la ficha.
    e.preventDefault()
    e.stopPropagation()
    if (guardado) return
    setError(null)
    empezar(async () => {
      const r = await accion()
      if (r.ok) setGuardado(true)
      else setError(r.error ?? 'No se pudo guardar.')
    })
  }

  const etiqueta = guardado ? `${titulo}: guardado` : `Guardar ${titulo}`

  const boton = (
    <button
      type="button"
      onClick={pulsar}
      disabled={pendiente || guardado}
      aria-pressed={guardado}
      aria-label={etiqueta}
      title={error ?? etiqueta}
      className={`grid cursor-pointer place-items-center rounded-full border transition-colors duration-200 ease-sal disabled:cursor-default ${
        compacto ? 'size-7' : 'size-10'
      } ${
        guardado
          ? 'border-transparent bg-primario text-primario-tinta'
          : error
            ? 'border-error bg-tarjeta text-error'
            : 'border-borde bg-tarjeta text-tinta hover:border-borde-vivo hover:bg-apagado'
      } ${pendiente ? 'opacity-60' : ''}`}
    >
      <Icono nombre={guardado ? iconoGuardado : icono} tam={compacto ? 15 : 18} />
    </button>
  )

  // En la tarjeta no cabe un mensaje: el fallo se cuenta con el color y
  // el `title`. En la ficha sí hay sitio para decirlo con palabras.
  if (compacto) return boton

  return (
    <span className="inline-flex items-center gap-3">
      {boton}
      {error && (
        <span role="alert" className="text-xs font-semibold text-error">
          {error}
        </span>
      )}
    </span>
  )
}
