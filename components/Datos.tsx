import { Fragment, type ReactNode } from 'react'

/** Línea de metadatos separada por puntos: nota · año · episodios · edad. */
export default function Datos({ children }: { children: ReactNode[] }) {
  const visibles = children.filter(Boolean)
  return (
    <div className="flex flex-wrap items-center gap-[0.7rem] text-paso-1 text-hueso-70">
      {visibles.map((hijo, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <span aria-hidden="true" className="size-[3px] rounded-full bg-hueso-45" />
          )}
          <span className="inline-flex items-center gap-[0.35rem]">{hijo}</span>
        </Fragment>
      ))}
    </div>
  )
}

export function Nota({ valor }: { valor: number }) {
  return (
    <span className="font-bold text-ambar tabular-nums">
      {valor.toLocaleString('es-ES', { minimumFractionDigits: 1 })}
    </span>
  )
}

export function Clasificacion({ valor }: { valor: string }) {
  return (
    <span className="rounded-[2px] border border-borde-vivo px-[0.35rem] py-[0.05rem] text-xs font-bold tracking-[0.04em] text-hueso-70">
      {valor}
    </span>
  )
}
