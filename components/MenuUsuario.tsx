'use client'

/* Avatar con menú desplegable.

   Cliente porque abre y cierra, y porque un menú sin teclado resuelto no
   es un menú: Escape cierra y devuelve el foco al avatar, las flechas
   recorren las opciones, Inicio y Fin saltan a los extremos, y un clic
   fuera lo cierra. Sin eso queda inalcanzable para quien no usa ratón.

   Las opciones vienen de fuera para que la cabecera decida qué hay: hoy
   favoritos e historial, mañana las listas guardadas. */

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import Icono, { type NombreIcono } from './Icono'

export interface OpcionMenu {
  href: string
  texto: string
  icono: NombreIcono
  /** Traza una línea encima: separa lo destructivo o lo de cuenta. */
  separada?: boolean
}

export default function MenuUsuario({
  iniciales,
  alias,
  opciones,
}: {
  iniciales: string
  alias: string
  opciones: OpcionMenu[]
}) {
  const [abierto, setAbierto] = useState(false)
  const [activa, setActiva] = useState(-1)
  const envoltorio = useRef<HTMLDivElement>(null)
  const disparador = useRef<HTMLButtonElement>(null)
  const opcionesRef = useRef<(HTMLAnchorElement | null)[]>([])
  const idMenu = useId()

  // Un clic fuera cierra. Se escucha en 'pointerdown' y no en 'click'
  // para que cerrar no cancele el clic que lo cerró.
  useEffect(() => {
    if (!abierto) return
    function fuera(e: PointerEvent) {
      if (!envoltorio.current?.contains(e.target as Node)) setAbierto(false)
    }
    document.addEventListener('pointerdown', fuera)
    return () => document.removeEventListener('pointerdown', fuera)
  }, [abierto])

  // Al abrir con teclado el foco entra en la primera opción.
  useEffect(() => {
    if (abierto && activa >= 0) opcionesRef.current[activa]?.focus()
  }, [abierto, activa])

  function cerrar(devolverFoco = true) {
    setAbierto(false)
    setActiva(-1)
    if (devolverFoco) disparador.current?.focus()
  }

  function tecla(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      cerrar()
      return
    }

    if (e.key === 'Tab') {
      // Salir con el tabulador cierra, pero sin robar el foco: el
      // navegador ya lo está llevando al siguiente elemento.
      setAbierto(false)
      setActiva(-1)
      return
    }

    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return
    e.preventDefault()

    if (!abierto) {
      setAbierto(true)
      setActiva(e.key === 'ArrowUp' ? opciones.length - 1 : 0)
      return
    }

    if (e.key === 'Home') return setActiva(0)
    if (e.key === 'End') return setActiva(opciones.length - 1)

    const paso = e.key === 'ArrowDown' ? 1 : -1
    setActiva((n) => (n + paso + opciones.length) % opciones.length)
  }

  return (
    <div ref={envoltorio} className="relative" onKeyDown={tecla}>
      <button
        ref={disparador}
        type="button"
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-controls={abierto ? idMenu : undefined}
        aria-label={`Cuenta de ${alias}`}
        onClick={() => {
          setAbierto((v) => !v)
          setActiva(-1)
        }}
        className="flex cursor-pointer items-center gap-[0.3rem] rounded-full border-0 bg-transparent p-0 text-hueso-45 transition-colors duration-200 ease-sal hover:text-hueso"
      >
        <span
          aria-hidden="true"
          className={`grid size-[34px] shrink-0 place-items-center rounded-full border bg-sala-600 text-paso-0 font-bold text-hueso-70 transition-colors duration-200 ease-sal ${
            abierto ? 'border-hueso-45 text-hueso' : 'border-borde-vivo'
          }`}
        >
          {iniciales}
        </span>
        <span
          aria-hidden="true"
          className={`transition-transform duration-200 ease-sal ${
            abierto ? 'rotate-180' : ''
          }`}
        >
          <Icono nombre="cheuron" tam={12} />
        </span>
      </button>

      {abierto && (
        <div
          id={idMenu}
          role="menu"
          aria-label={`Cuenta de ${alias}`}
          className="absolute top-[calc(100%+0.55rem)] right-0 z-70 min-w-[13.5rem] rounded-radio border border-borde-vivo bg-sala-800 py-[0.3rem] shadow-alta"
        >
          <p className="truncate px-e3 pt-[0.35rem] pb-e2 text-paso-0 text-hueso-45">
            @{alias}
          </p>

          {opciones.map((o, i) => (
            <Link
              key={o.href}
              href={o.href}
              role="menuitem"
              tabIndex={activa === i ? 0 : -1}
              ref={(nodo) => {
                opcionesRef.current[i] = nodo
              }}
              onClick={() => cerrar(false)}
              className={`flex items-center gap-e2 px-e3 py-[0.5rem] text-paso-1 text-hueso-70 no-underline transition-colors duration-150 ease-sal hover:bg-sala-700 hover:text-hueso focus-visible:bg-sala-700 focus-visible:text-hueso ${
                o.separada ? 'mt-[0.3rem] border-t border-borde pt-e2' : ''
              }`}
            >
              <span className="text-hueso-45">
                <Icono nombre={o.icono} tam={16} />
              </span>
              {o.texto}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
