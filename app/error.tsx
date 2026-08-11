'use client'

import { useEffect } from 'react'
import Marca from '@/components/Marca'
import Icono from '@/components/Icono'

/** Frontera de error de una ruta. Enseña un mensaje en el tono del sitio
 *  y deja reintentar, que suele bastar cuando el catálogo se cae.
 *
 *  Va con chrome mínimo por obligación: Next la pinta por encima de los
 *  layouts de grupo, y además es un componente de cliente, así que no
 *  puede montar el marco —que lee la sesión en el servidor—. */
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
    <div className="min-h-dvh">
      <header className="px-bleed py-4">
        <Marca />
      </header>

      <main className="mx-auto grid min-h-[70dvh] max-w-[52ch] place-items-center px-bleed text-center">
        <div>
          <span
            aria-hidden="true"
            className="mx-auto mb-5 grid size-14 place-items-center rounded-full border border-borde bg-tarjeta text-primario"
          >
            <Icono nombre="info" tam={24} />
          </span>

          <h1 className="font-titulo text-2xl font-extrabold tracking-[-0.02em]">
            Algo ha ido mal
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-tinta-tenue">
            No hemos podido cargar esta página. Casi siempre es que el
            proveedor del catálogo no responde en este momento.
          </p>

          <button
            type="button"
            onClick={() => retry()}
            className="mt-6 inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-primario px-5 text-sm font-semibold text-primario-tinta transition-opacity duration-200 ease-sal hover:opacity-85"
          >
            <Icono nombre="flecha" tam={16} />
            Volver a intentar
          </button>

          {/* El digest es lo único que permite encontrar este fallo
              concreto en los registros del servidor. */}
          {error.digest && (
            <p className="mt-6 font-mono text-xs text-tinta-tenue">
              {error.digest}
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
