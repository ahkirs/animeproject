'use client'

/* El buscador, ahora como paleta.

   Antes era un campo fijo en el centro de la cabecera. En un marco de
   48px de alto no cabe, y tampoco hace falta: lo que se busca se busca de
   golpe y con el teclado. Así que la barra lleva un disparador que
   anuncia su atajo, y la búsqueda de verdad ocurre en un diálogo centrado.

   La lógica de consulta es la misma que tenía el campo anterior —espera
   de 300 ms, /api/buscar, flechas y Enter— y el mínimo de letras lo sigue
   decidiendo `minimoParaBuscar`, que baja a una sola letra en japonés.

   Atajos: Ctrl/⌘+K desde cualquier sitio, y «/» cuando no se está
   escribiendo en otro campo. */

import { useCallback, useEffect, useId, useRef, useState } from 'react'
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

/** ¿El foco está en algo donde «/» significa una barra y no un atajo? */
function escribiendo(destino: EventTarget | null): boolean {
  const nodo = destino as HTMLElement | null
  if (!nodo) return false
  const etiqueta = nodo.tagName
  return (
    etiqueta === 'INPUT' ||
    etiqueta === 'TEXTAREA' ||
    etiqueta === 'SELECT' ||
    nodo.isContentEditable
  )
}

export default function PaletaBuscador() {
  const [abierta, setAbierta] = useState(false)
  const [texto, setTexto] = useState('')
  const [activo, setActivo] = useState(0)
  const [cargando, setCargando] = useState(false)
  const [resultados, setResultados] = useState<Resultado[]>([])
  const campo = useRef<HTMLInputElement>(null)
  const disparador = useRef<HTMLButtonElement>(null)
  const router = useRouter()
  const idLista = useId()

  const minimo = minimoParaBuscar(texto)
  const consulta = texto.trim()
  const corto = consulta.length > 0 && consulta.length < minimo

  const cerrar = useCallback((devolverFoco = true) => {
    setAbierta(false)
    setTexto('')
    setResultados([])
    if (devolverFoco) disparador.current?.focus()
  }, [])

  // Atajos globales. Se escuchan siempre, esté abierta o no.
  useEffect(() => {
    function tecla(e: KeyboardEvent) {
      const conModificador = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'
      if (conModificador || (e.key === '/' && !escribiendo(e.target))) {
        e.preventDefault()
        setAbierta(true)
      }
    }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [])

  // Al abrir, el foco entra en el campo y el fondo deja de desplazarse.
  useEffect(() => {
    if (!abierta) return
    campo.current?.focus()
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previo
    }
  }, [abierta])

  // Al cambiar la consulta, el resaltado vuelve al primero.
  useEffect(() => setActivo(0), [texto])

  // Búsqueda con espera: no se llama a la API por cada tecla.
  useEffect(() => {
    if (consulta.length < minimo) {
      setResultados([])
      setCargando(false)
      return
    }
    setCargando(true)
    const id = setTimeout(() => {
      fetch(`/api/buscar?q=${encodeURIComponent(consulta)}`)
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
  }, [consulta, minimo])

  function teclasCampo(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      e.preventDefault()
      cerrar()
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
        cerrar(false)
        router.push(`/serie/${elegida.id}`)
      }
    }
  }

  return (
    <>
      <button
        ref={disparador}
        type="button"
        onClick={() => setAbierta(true)}
        className="group flex h-8 w-full max-w-sm min-w-0 cursor-pointer items-center justify-between gap-1 rounded-radio border border-borde bg-lienzo px-1 py-1 text-tinta-apagada transition-colors duration-200 ease-sal hover:border-borde-vivo hover:text-tinta"
      >
        <span className="ml-1 flex min-w-0 items-center gap-2">
          <Icono nombre="buscar" tam={14} className="shrink-0" />
          <span className="line-clamp-1 text-xs">Buscar anime…</span>
        </span>
        <kbd className="hidden h-5 shrink-0 items-center rounded border border-borde bg-apagado px-1.5 font-mono text-[10px] font-medium sm:inline-flex">
          Ctrl K
        </kbd>
      </button>

      {abierta && (
        <div
          className="fixed inset-0 z-100 flex items-start justify-center px-4 pt-[12vh]"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault()
              cerrar()
            }
          }}
        >
          <button
            type="button"
            aria-label="Cerrar la búsqueda"
            tabIndex={-1}
            onClick={() => cerrar()}
            className="absolute inset-0 cursor-default border-0 bg-black/60 backdrop-blur-[2px]"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Buscar en el catálogo"
            className="animar-entrada relative w-full max-w-xl overflow-hidden rounded-radio-lg border border-borde bg-tarjeta"
          >
            <div className="flex items-center gap-3 border-b border-borde px-4">
              <Icono nombre="buscar" tam={17} className="shrink-0 text-tinta-tenue" />
              <input
                ref={campo}
                type="text"
                role="combobox"
                autoComplete="off"
                aria-expanded={resultados.length > 0}
                aria-controls={idLista}
                aria-activedescendant={
                  resultados.length ? `${idLista}-${activo}` : undefined
                }
                placeholder="Buscar anime…"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={teclasCampo}
                className="w-full min-w-0 flex-1 border-0 bg-transparent py-3.5 text-base text-tinta outline-none placeholder:text-tinta-tenue"
              />
              <kbd className="hidden h-5 shrink-0 items-center rounded border border-borde bg-apagado px-1.5 font-mono text-[10px] text-tinta-tenue sm:inline-flex">
                Esc
              </kbd>
            </div>

            <div id={idLista} role="listbox" aria-label="Resultados">
              {consulta.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-tinta-tenue">
                  Escribe para buscar en todo el catálogo.
                </p>
              ) : corto ? (
                <p className="px-4 py-6 text-center text-sm text-tinta-tenue">
                  Escribe al menos {minimo} letras.
                </p>
              ) : cargando ? (
                <p className="px-4 py-6 text-center text-sm text-tinta-tenue">
                  Buscando…
                </p>
              ) : resultados.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-tinta-tenue">
                  Nada para «{consulta}».
                </p>
              ) : (
                <ul className="m-0 max-h-[52vh] list-none overflow-y-auto p-1.5">
                  {resultados.map((r, i) => (
                    <li key={r.id}>
                      <Link
                        href={`/serie/${r.id}`}
                        id={`${idLista}-${i}`}
                        role="option"
                        aria-selected={i === activo}
                        onMouseEnter={() => setActivo(i)}
                        onClick={() => cerrar(false)}
                        className={`flex items-center gap-3 rounded-radio px-2.5 py-2 no-underline transition-colors duration-100 ${
                          i === activo ? 'bg-apagado' : ''
                        }`}
                      >
                        <span className="relative block aspect-2/3 w-9 shrink-0 overflow-hidden rounded-[3px] bg-apagado">
                          <Lamina arte={r.imagen} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <b className="block truncate text-sm font-semibold">
                            {r.titulo}
                          </b>
                          <span className="block truncate text-xs text-tinta-tenue">
                            {r.anio ?? 'Año desconocido'}
                          </span>
                        </span>
                        {r.nota != null && (
                          <span className="shrink-0 text-xs font-bold text-acento tabular-nums">
                            {r.nota.toLocaleString('es-ES', {
                              minimumFractionDigits: 1,
                            })}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Link
              href="/explorar"
              onClick={() => cerrar(false)}
              className="flex items-center justify-between gap-3 border-t border-borde px-4 py-2.5 text-xs font-semibold text-tinta-tenue no-underline transition-colors duration-150 ease-sal hover:text-tinta"
            >
              Ver todo el catálogo
              <Icono nombre="flecha" tam={14} />
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
