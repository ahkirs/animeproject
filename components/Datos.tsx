import { Fragment, type ReactNode } from 'react'

/** Línea de metadatos separada por puntos: nota · año · episodios · edad. */
export default function Datos({ children }: { children: ReactNode[] }) {
  const visibles = children.filter(Boolean)
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-tinta-apagada">
      {visibles.map((hijo, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <span
              aria-hidden="true"
              className="size-[3px] rounded-full bg-tinta-tenue"
            />
          )}
          <span className="inline-flex items-center gap-1.5">{hijo}</span>
        </Fragment>
      ))}
    </div>
  )
}

export function Nota({ valor }: { valor: number }) {
  return (
    <span className="font-bold text-primario cifras">
      {valor.toLocaleString('es-ES', { minimumFractionDigits: 1 })}
    </span>
  )
}

/** Nota que puede no existir: se oculta en lugar de pintar un hueco. */
export function NotaOpcional({ valor }: { valor: number | null | undefined }) {
  if (valor == null) return null
  return <Nota valor={valor} />
}

export function Clasificacion({ valor }: { valor: string }) {
  return (
    <span className="rounded-[3px] border border-borde-vivo px-1.5 py-px text-xs font-bold tracking-[0.04em] text-tinta-apagada">
      {valor}
    </span>
  )
}
