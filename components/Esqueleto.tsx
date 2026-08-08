/** Bloques grises que imitan el contorno de la página mientras carga.
 *  Componente de servidor: no necesita hidratación. */
function Bloque({
  className = '',
}: {
  className?: string
}) {
  return (
    <div
      aria-hidden="true"
      className={`esqueleto rounded-radio bg-sala-700 ${className}`}
    />
  )
}

/** Portada: el bloque grande del destacado y dos filas de tarjetas. */
export function EsqueletoPortada() {
  return (
    <div>
      <div className="flex min-h-[min(88vh,780px)] items-end overflow-hidden px-margen pt-e6 pb-e5">
        <div className="w-full max-w-[1600px]">
          <Bloque className="mb-e3 h-4 w-[180px]" />
          <Bloque className="mb-e3 h-[72px] w-[min(48ch,80%)]" />
          <Bloque className="mb-e4 h-4 w-[40ch] max-w-full" />
          <div className="flex gap-e2">
            <Bloque className="h-12 w-[170px]" />
            <Bloque className="h-12 w-[170px]" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-margen">
        <Bloque className="mb-e3 h-9 w-[260px]" />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-e3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <Bloque className="aspect-2/3" />
              <Bloque className="mt-e2 h-4 w-[85%]" />
              <Bloque className="mt-[0.35rem] h-3 w-[60%]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Explorar: titular, filtros y rejilla de tarjetas. */
export function EsqueletoExplorar() {
  return (
    <div className="mx-auto max-w-[1600px] px-margen">
      <div className="pt-e4 pb-e3">
        <Bloque className="h-[64px] w-[240px]" />
        <Bloque className="mt-e2 h-4 w-[46ch] max-w-full" />
      </div>

      <div className="border-t border-borde">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[6.5rem_1fr] items-baseline gap-e3 border-b border-borde py-e3 max-[640px]:grid-cols-1"
          >
            <Bloque className="h-4 w-[70px]" />
            <div className="flex flex-wrap gap-e1">
              {Array.from({ length: 5 }).map((_, j) => (
                <Bloque key={j} className="h-8 w-[92px] rounded-full" />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-e4 grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-e3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i}>
            <Bloque className="aspect-2/3" />
            <Bloque className="mt-e2 h-4 w-[85%]" />
            <Bloque className="mt-[0.35rem] h-3 w-[60%]" />
          </div>
        ))}
      </div>
    </div>
  )
}

/** Reproductor: visor ancho y cola de episodios a la derecha. */
export function EsqueletoReproductor() {
  return (
    <div className="bg-[#060505]">
      <div className="flex items-center gap-e3 border-b border-borde bg-sala-900 px-margen py-e2">
        <Bloque className="h-5 w-[160px]" />
        <Bloque className="mx-auto h-5 w-[90px]" />
        <Bloque className="ml-auto h-5 w-[140px]" />
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_350px] max-[1100px]:grid-cols-[minmax(0,1fr)]">
        <div>
          <Bloque className="aspect-video rounded-none bg-black" />
          <div className="px-e4 pt-e4">
            <Bloque className="h-4 w-[200px]" />
            <Bloque className="mt-e2 h-[44px] w-[60%] max-w-[420px]" />
            <Bloque className="mt-e3 h-4 w-[80%] max-w-[520px]" />
            <Bloque className="mt-e4 h-10 w-[130px]" />
          </div>
        </div>

        <div className="border-l border-borde bg-sala-900">
          <Bloque className="m-e3 h-4 w-[120px]" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-e2 border-b border-borde px-e3 py-e2">
              <Bloque className="aspect-video w-[118px]" />
              <div className="w-full">
                <Bloque className="h-4 w-[85%]" />
                <Bloque className="mt-2 h-3 w-[60%]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Ficha de serie: cabecera con carátula y episodios debajo. */
export function EsqueletoFicha() {
  return (
    <div>
      <div className="relative isolate px-margen pt-e6 pb-e5">
        <div className="absolute inset-0 -z-10 bg-sala-700" />
        <div className="mx-auto grid max-w-[1600px] grid-cols-[260px_1fr] items-end gap-e5 max-[900px]:grid-cols-[150px_1fr] max-[900px]:gap-e3 max-[560px]:grid-cols-1">
          <Bloque className="aspect-2/3" />
          <div>
            <Bloque className="h-[76px] w-[70%] max-[900px]:h-[56px]" />
            <Bloque className="mt-e3 h-4 w-[340px] max-w-full" />
            <Bloque className="mt-e4 h-12 w-[170px]" />
            <div className="mt-e3 flex gap-[0.4rem]">
              {Array.from({ length: 4 }).map((_, i) => (
                <Bloque key={i} className="h-7 w-[90px] rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-e6 max-w-[1600px] px-margen">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[200px_1fr] gap-e3 border-b border-borde py-e3 max-[560px]:grid-cols-1"
          >
            <Bloque className="aspect-video" />
            <div>
              <Bloque className="h-4 w-[120px]" />
              <Bloque className="mt-2 h-[26px] w-[70%]" />
              <Bloque className="mt-e2 h-4 w-[60%]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
