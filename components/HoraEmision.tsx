'use client'

import { useEffect, useState } from 'react'
import { usarZona } from './PreferenciaHora'

interface Props {
  /** Instante de emisión en UTC. */
  iso: string
  /** Hora UTC ya formateada en el servidor. Es la que se pinta en el
   *  primer render para que servidor y cliente coincidan; la local no
   *  puede calcularse hasta que el navegador dice en qué zona está. */
  utc: string
}

function horaLocal(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export default function HoraEmision({ iso, utc }: Props) {
  const { zona, montado } = usarZona()

  if (!montado || zona === 'utc') return <>{utc}</>
  return <>{horaLocal(iso)}</>
}

/** Cuenta atrás en vivo. Se refresca cada minuto. */
export function CuentaAtras({ iso }: { iso: string }) {
  const [texto, setTexto] = useState<string | null>(null)

  useEffect(() => {
    const calcular = () => {
      const ms = new Date(iso).getTime() - Date.now()
      if (ms <= 0) return 'emitido'
      const horas = Math.floor(ms / 3_600_000)
      const dias = Math.floor(horas / 24)
      return `${dias}D ${String(horas % 24).padStart(2, '0')}H`
    }

    setTexto(calcular())
    const id = setInterval(() => setTexto(calcular()), 60_000)
    return () => clearInterval(id)
  }, [iso])

  // Antes de montar se reserva el hueco para que no salte la maquetación.
  if (texto === null) {
    return (
      <span aria-hidden="true" className="invisible">
        0D 00H
      </span>
    )
  }
  return <>{texto}</>
}
