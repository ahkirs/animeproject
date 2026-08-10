/** Bloques grises que imitan el contorno de la página mientras carga.
 *  Componente de servidor: no necesita hidratación. */
function Bloque({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`esqueleto rounded-radio bg-tarjeta ${className}`} />
  )
}

/** Una tarjeta de catálogo: carátula, título y píldoras. */
function BloqueFicha() {
  return (
    <div>
      <Bloque className="aspect-2/3" />
      <Bloque className="mt-2 h-4 w-[85%]" />
      <Bloque className="mt-1.5 h-3 w-[55%]" />
    </div>
  )
}

/** Portada: el destacado a pantalla y una fila de tarjetas. */
export function EsqueletoPortada() {
  return (
    <div>
      <div className="flex h-[70dvh] max-h-[760px] min-h-[440px] flex-col justify-end px-bleed pb-16">
        <Bloque className="mb-3 h-4 w-44" />
        <Bloque className="mb-4 h-16 w-[min(48ch,80%)]" />
        <Bloque className="mb-6 h-4 w-[40ch] max-w-full" />
        <div className="flex gap-2">
          <Bloque className="h-10 w-36 rounded-full" />
          <Bloque className="h-10 w-44 rounded-full" />
        </div>
      </div>

      <div className="mt-8 px-bleed">
        <Bloque className="mb-4 h-7 w-64" />
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="w-[140px] shrink-0 sm:w-[160px] lg:w-[180px]">
              <BloqueFicha />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Explorar: cabezal de filtros y rejilla. */
export function EsqueletoExplorar() {
  return (
    <div>
      <div className="border-b border-borde px-bleed py-4">
        <Bloque className="h-9 w-full max-w-md rounded-full" />
        <div className="mt-4 flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Bloque key={i} className="h-9 w-24 rounded-full" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-x-4 gap-y-6 px-bleed py-6 lg:grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
        {Array.from({ length: 18 }).map((_, i) => (
          <BloqueFicha key={i} />
        ))}
      </div>
    </div>
  )
}

/** Reproductor: visor ancho y cola de episodios al lado. */
export function EsqueletoReproductor() {
  return (
    <div className="mx-auto max-w-[1800px] px-2 py-2">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <Bloque className="aspect-video rounded-radio-lg bg-black" />
          <Bloque className="mt-4 h-4 w-48" />
          <Bloque className="mt-3 h-8 w-[60%] max-w-md" />
          <Bloque className="mt-4 h-10 w-32 rounded-full" />
        </div>

        <div className="rounded-radio border border-borde p-3">
          <Bloque className="h-4 w-32" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="mt-3 flex gap-3">
              <Bloque className="aspect-video w-28 shrink-0" />
              <div className="w-full">
                <Bloque className="h-4 w-[85%]" />
                <Bloque className="mt-2 h-3 w-[55%]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Ficha de serie: cabezal con carátula y secciones debajo. */
export function EsqueletoFicha() {
  return (
    <div>
      <div className="relative isolate px-bleed pt-20 pb-8">
        <div className="absolute inset-0 -z-10 h-[360px] bg-tarjeta velo-abajo" />
        <div className="flex flex-wrap items-end gap-6">
          <Bloque className="h-[260px] w-[180px] shrink-0" />
          <div className="min-w-[280px] flex-1">
            <Bloque className="h-4 w-40" />
            <Bloque className="mt-3 h-9 w-[70%]" />
            <div className="mt-4 flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Bloque key={i} className="h-6 w-24 rounded-full" />
              ))}
            </div>
            <Bloque className="mt-4 h-4 w-[80%]" />
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <Bloque className="h-10 w-44 rounded-full" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Bloque key={i} className="size-10 rounded-full" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 px-bleed md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-3 rounded-radio border border-borde p-3">
            <Bloque className="aspect-video w-32 shrink-0" />
            <div className="w-full">
              <Bloque className="h-4 w-24" />
              <Bloque className="mt-2 h-4 w-[70%]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
