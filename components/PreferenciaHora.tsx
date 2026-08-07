'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ZonaHoraria } from '@/lib/types'

const CLAVE = 'kuroba:zona-horaria'

interface Valor {
  zona: ZonaHoraria
  /** Falso durante el render del servidor y el primero del cliente.
   *  Mientras es falso se muestra UTC, que es la única lectura que
   *  ambos lados calculan igual. La local depende del navegador. */
  montado: boolean
  cambiar: (z: ZonaHoraria) => void
}

const Contexto = createContext<Valor>({
  zona: 'utc',
  montado: false,
  cambiar: () => {},
})

export function ProveedorHora({ children }: { children: React.ReactNode }) {
  const [zona, setZona] = useState<ZonaHoraria>('utc')
  const [montado, setMontado] = useState(false)

  useEffect(() => {
    const guardada = window.localStorage.getItem(CLAVE) as ZonaHoraria | null
    // Por defecto la local: es lo que quiere saber quien va a ver el episodio.
    setZona(guardada === 'utc' ? 'utc' : 'local')
    setMontado(true)
  }, [])

  const cambiar = useCallback((z: ZonaHoraria) => {
    setZona(z)
    try {
      window.localStorage.setItem(CLAVE, z)
    } catch {
      // Modo privado o almacenamiento lleno: la preferencia dura la sesión.
    }
  }, [])

  return (
    <Contexto.Provider value={{ zona, montado, cambiar }}>{children}</Contexto.Provider>
  )
}

export function usarZona() {
  return useContext(Contexto)
}

/** Nombre de la zona horaria del navegador, p. ej. «Europe/Madrid». */
function zonaDelNavegador(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return ''
  }
}

const OPCIONES: { id: ZonaHoraria; texto: string }[] = [
  { id: 'local', texto: 'Tu hora' },
  { id: 'utc', texto: 'UTC' },
]

export function SelectorHora() {
  const { zona, montado, cambiar } = usarZona()
  const [nombreZona, setNombreZona] = useState('')

  useEffect(() => setNombreZona(zonaDelNavegador()), [])

  return (
    <div className="flex flex-wrap items-center gap-e2">
      <span className="text-paso-0 font-bold tracking-[0.12em] text-hueso-45 uppercase">
        Horario
      </span>

      <div role="group" aria-label="Zona horaria de los estrenos" className="flex gap-e1">
        {OPCIONES.map((o) => {
          const activa = montado && zona === o.id
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => cambiar(o.id)}
              aria-pressed={activa}
              className={`cursor-pointer rounded-full border px-[0.9rem] py-[0.3rem] text-paso-0 font-bold tracking-[0.06em] uppercase transition-colors duration-200 ease-sal ${
                activa
                  ? 'border-ambar bg-ambar text-ambar-tinta'
                  : 'border-borde-vivo text-hueso-70 hover:border-hueso-45 hover:text-hueso'
              }`}
            >
              {o.texto}
            </button>
          )
        })}
      </div>

      <span className="text-paso-0 text-hueso-45 tabular-nums">
        {montado && zona === 'local' && nombreZona ? nombreZona : 'UTC+0'}
      </span>
    </div>
  )
}
