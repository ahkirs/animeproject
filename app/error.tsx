'use client'

import { useEffect } from 'react'
import Marca from '@/components/Marca'
import Pie from '@/components/Pie'
import Icono from '@/components/Icono'

/** Frontera de error de una ruta. Muestra un mensaje en tono con el
 *  diseño y deja reintentar, que suele bastar cuando la API se cae. */
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <>
      <a
        href="#principal"
        className="absolute left-margen -top-[100px] z-100 rounded-radio bg-ambar px-[1.1rem] py-[0.7rem] font-bold text-ambar-tinta no-underline transition-all duration-200 ease-sal focus:top-e2"
      >
        Saltar al contenido
      </a>

      {/* Cabecera reducida: la normal lee la sesión en el servidor, y
          esto es un componente de cliente por obligación. En una página
          de error tampoco hace falta el buscador ni el menú. */}
      <header className="flex items-center px-margen py-e3">
        <Marca />
      </header>

      <main
        id="principal"
        className="mx-auto grid min-h-[70vh] max-w-[1600px] place-items-center px-margen"
      >
        <div className="max-w-[52ch] text-center">
          <p className="mb-e2 text-paso-0 font-bold tracking-[0.12em] text-ambar uppercase">
            Se ha caído la sala
          </p>
          <h1 className="font-display text-paso-5 tracking-[-0.035em]">
            Algo ha ido mal
          </h1>
          <p className="mt-e3 text-paso-1 text-hueso-70">
            No hemos podido cargar esta página. Suele ser porque el catálogo
            no responde en este momento.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            className="mt-e4 inline-flex cursor-pointer items-center gap-2 rounded-radio border border-transparent bg-ambar px-[1.35rem] py-3 text-paso-1 font-semibold text-ambar-tinta transition-all duration-200 ease-sal hover:bg-ambar-claro active:translate-y-px"
          >
            <Icono nombre="flecha" tam={16} />
            Volver a intentar
          </button>
        </div>
      </main>

      <Pie />
    </>
  )
}
