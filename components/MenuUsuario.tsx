'use client'

/* Avatar con menú desplegable.

   Cliente porque abre y cierra, y porque un menú sin teclado resuelto no
   es un menú: Escape cierra y devuelve el foco al avatar, las flechas
   recorren las opciones, Inicio y Fin saltan a los extremos, y un clic
   fuera lo cierra. Sin eso queda inalcanzable para quien no usa ratón.

   Las opciones vienen de fuera para que el marco decida qué hay: hoy
   favoritos e historial, mañana las listas guardadas. */

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Icono, { type NombreIcono } from './Icono'

export interface OpcionMenu {
  href: string
  texto: string
  icono: NombreIcono
  /** Traza una línea encima: separa lo destructivo o lo de cuenta. */
  separada?: boolean
}

/** Dónde se despliega el panel. El avatar vive al pie del riel lateral,
 *  así que allí el menú tiene que salir hacia arriba y hacia la derecha;
 *  `abajo` queda para cuando el disparador está en una barra superior. */
type Direccion = 'arriba-derecha' | 'abajo-derecha'

const PANEL: Record<Direccion, string> = {
  'arriba-derecha': 'bottom-0 left-[calc(100%+0.6rem)]',
  'abajo-derecha': 'top-[calc(100%+0.55rem)] right-0',
}

export default function MenuUsuario({
  iniciales,
  alias,
  opciones,
  direccion = 'arriba-derecha',
  /** En el riel el cheurón sobra: no hay sitio y el avatar ya se lee como
   *  algo pulsable. */
  conCheuron = false,
}: {
  iniciales: string
  alias: string
  opciones: OpcionMenu[]
  direccion?: Direccion
  conCheuron?: boolean
}) {
  const [abierto, setAbierto] = useState(false)
  const [activa, setActiva] = useState(-1)
  const [saliendo, setSaliendo] = useState(false)
  const envoltorio = useRef<HTMLDivElement>(null)
  const disparador = useRef<HTMLButtonElement>(null)
  const opcionesRef = useRef<(HTMLAnchorElement | null)[]>([])
  const idMenu = useId()
  const router = useRouter()

  /** Cerrar sesión borra las cookies en el servidor y refresca para que
   *  los componentes de servidor vuelvan a leerlas. Sin el refresh, el
   *  marco seguiría enseñando el avatar hasta la siguiente recarga. */
  async function salir() {
    if (saliendo) return
    setSaliendo(true)
    try {
      await fetch('/api/auth/salir', { method: 'POST' })
    } catch {
      // Aunque la llamada falle, se sigue: el servidor borra la cookie
      // antes de contestar, así que la sesión local ya no vale.
    }
    setAbierto(false)
    router.refresh()
    router.push('/')
  }

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
    <div ref={envoltorio} className="relative flex" onKeyDown={tecla}>
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
        className="flex cursor-pointer items-center gap-[0.3rem] rounded-full border-0 bg-transparent p-0 text-tinta-apagada transition-colors duration-200 ease-sal hover:text-tinta"
      >
        <span
          aria-hidden="true"
          className={`grid size-8 shrink-0 place-items-center rounded-full border bg-apagado text-[0.7rem] font-bold transition-colors duration-200 ease-sal ${
            abierto ? 'border-borde-vivo text-tinta' : 'border-borde text-tinta-apagada'
          }`}
        >
          {iniciales}
        </span>
        {conCheuron && (
          <span
            aria-hidden="true"
            className={`transition-transform duration-200 ease-sal ${
              abierto ? 'rotate-180' : ''
            }`}
          >
            <Icono nombre="cheuron" tam={12} />
          </span>
        )}
      </button>

      {abierto && (
        <div
          id={idMenu}
          role="menu"
          aria-label={`Cuenta de ${alias}`}
          className={`absolute z-90 min-w-[13.5rem] rounded-radio border border-borde bg-tarjeta py-[0.3rem] ${PANEL[direccion]}`}
        >
          <p className="truncate px-4 pt-[0.35rem] pb-2 text-xs text-tinta-tenue">
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
              className={`flex items-center gap-3 px-4 py-2 text-sm text-tinta-apagada no-underline transition-colors duration-150 ease-sal hover:bg-apagado hover:text-tinta focus-visible:bg-apagado focus-visible:text-tinta ${
                o.separada ? 'mt-[0.3rem] border-t border-borde pt-3' : ''
              }`}
            >
              <span className="text-tinta-tenue">
                <Icono nombre={o.icono} tam={16} />
              </span>
              {o.texto}
            </Link>
          ))}

          <button
            type="button"
            role="menuitem"
            tabIndex={-1}
            onClick={salir}
            disabled={saliendo}
            className="mt-[0.3rem] flex w-full cursor-pointer items-center gap-3 border-0 border-t border-borde bg-transparent px-4 py-2 pt-3 text-left text-sm text-tinta-tenue transition-colors duration-150 ease-sal hover:bg-apagado hover:text-tinta focus-visible:bg-apagado focus-visible:text-tinta disabled:cursor-wait disabled:opacity-60"
          >
            <span className="text-tinta-tenue">
              <Icono nombre="atras" tam={16} />
            </span>
            {saliendo ? 'Cerrando…' : 'Cerrar sesión'}
          </button>
        </div>
      )}
    </div>
  )
}
