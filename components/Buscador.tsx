'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Icono from './Icono'
import Lamina from './Lamina'
import { minimoParaBuscar } from '@/lib/catalogo'

interface Resultado {
  id: string
  titulo: string
  anio: number | null
  nota: number | null
  imagen: string | null
  motivo: string
}

const ESPERA_MS = 300

export default function Buscador() {
  const [texto, setTexto] = useState('')
  const [abierto, setAbierto] = useState(false)
  const [activo, setActivo] = useState(0)
  const [cargando, setCargando] = useState(false)
  const [resultados, setResultados] = useState<Resultado[]>([])
  const envoltorio = useRef<HTMLDivElement>(null)
  const campo = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const idLista = useId()

  const minimo = minimoParaBuscar(texto)
  const corto = texto.trim().length > 0 && texto.trim().length < minimo
  const desplegado = abierto && texto.trim().length > 0

  // Al cambiar la consulta, el resaltado vuelve al primero.
  useEffect(() => setActivo(0), [texto])

  // Búsqueda con espera: no se llama a la API por cada tecla.
  useEffect(() => {
    if (texto.trim().length < minimo) {
      setResultados([])
      setCargando(false)
      return
    }
    setCargando(true)
    const id = setTimeout(() => {
      fetch(`/api/buscar?q=${encodeURIComponent(texto)}`)
        .then((r) => (r.ok ? r.json() : { resultados: [] }))
        .then((datos) => {
          setResultados(datos.resultados ?? [])
          setCargando(false)
        })
        .catch(() => {
          setResultados([])
          setCargando(false)
        })
    }, ESPERA_MS)
    return () => clearTimeout(id)
  }, [texto, minimo])

  // Cerrar al pulsar fuera.
  useEffect(() => {
    if (!desplegado) return
    const fuera = (e: MouseEvent) => {
      if (!envoltorio.current?.contains(e.target as Node)) setAbierto(false)
    }
    document.addEventListener('mousedown', fuera)
    return () => document.removeEventListener('mousedown', fuera)
  }, [desplegado])

  const cerrar = () => {
    setAbierto(false)
    setTexto('')
  }

  const teclas = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      cerrar()
      campo.current?.blur()
      return
    }
    if (!resultados.length) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActivo((i) => (i + 1) % resultados.length)
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActivo((i) => (i - 1 + resultados.length) % resultados.length)
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      const elegida = resultados[activo]
      if (elegida) {
        cerrar()
        campo.current?.blur()
        router.push(`/serie/${elegida.id}`)
      }
    }
  }

  return (
    <div ref={envoltorio} className="relative">
      <div
        className={`flex items-center gap-2 rounded-full border bg-sala-700 px-[0.9rem] py-2 transition-colors duration-200 ease-sal max-[560px]:px-[0.55rem] ${
          desplegado ? 'border-hueso-45' : 'border-borde'
        }`}
      >
        <Icono nombre="buscar" tam={17} className="shrink-0 text-hueso-45" />
        <label htmlFor={`${idLista}-campo`} className="sr-only">
          Buscar series
        </label>
        <input
          ref={campo}
          id={`${idLista}-campo`}
          type="search"
          role="combobox"
          autoComplete="off"
          aria-expanded={desplegado}
          aria-controls={idLista}
          aria-activedescendant={
            desplegado && resultados.length ? `${idLista}-${activo}` : undefined
          }
          placeholder="Buscar…"
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value)
            setAbierto(true)
          }}
          onFocus={() => setAbierto(true)}
          onKeyDown={teclas}
          className="w-[11ch] border-0 bg-transparent text-paso-1 text-hueso outline-none transition-[width] duration-300 ease-sal placeholder:text-hueso-45 focus:w-[18ch] max-[560px]:hidden"
        />
      </div>

      {desplegado && (
        <div
          id={idLista}
          role="listbox"
          aria-label="Resultados de la búsqueda"
          className="absolute top-[calc(100%+0.5rem)] right-0 z-70 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-radio border border-borde-vivo bg-sala-800 shadow-alta"
        >
          {corto ? (
            <p className="px-e3 py-e3 text-paso-1 text-hueso-45">
              Escribe al menos {minimo} letras.
            </p>
          ) : cargando ? (
            <p className="px-e3 py-e3 text-paso-1 text-hueso-45">
              Buscando en el catálogo…
            </p>
          ) : resultados.length === 0 ? (
            <p className="px-e3 py-e3 text-paso-1 text-hueso-45">
              Nada para «{texto.trim()}».
            </p>
          ) : (
            <>
              <ul className="m-0 list-none p-0">
                {resultados.map((r, i) => (
                  <li key={r.id}>
                    <Link
                      href={`/serie/${r.id}`}
                      id={`${idLista}-${i}`}
                      role="option"
                      aria-selected={i === activo}
                      onMouseEnter={() => setActivo(i)}
                      onClick={cerrar}
                      className={`flex items-center gap-e2 border-b border-borde px-e2 py-e2 no-underline transition-colors duration-150 ease-sal ${
                        i === activo ? 'bg-sala-700' : ''
                      }`}
                    >
                      <span className="relative block aspect-2/3 w-9 shrink-0 overflow-hidden rounded-[2px] bg-sala-700">
                        <Lamina arte={r.imagen} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <b className="block truncate text-paso-1 font-semibold">
                          {r.titulo}
                        </b>
                        <span className="block truncate text-paso-0 text-hueso-45">
                          {r.anio ?? 'Año desconocido'}
                        </span>
                      </span>
                      {r.nota != null && (
                        <span className="shrink-0 text-paso-0 font-bold text-ambar tabular-nums">
                          {r.nota.toLocaleString('es-ES', {
                            minimumFractionDigits: 1,
                          })}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>

              <Link
                href={`/explorar`}
                onClick={cerrar}
                className="flex items-center justify-between gap-e2 px-e3 py-e2 text-paso-0 font-bold tracking-[0.08em] text-hueso-45 uppercase no-underline transition-colors duration-150 ease-sal hover:bg-sala-700 hover:text-hueso"
              >
                Ver todo el catálogo
                <Icono nombre="flecha" tam={14} />
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  )
}
