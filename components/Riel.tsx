import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** Rieles de miniaturas 16:9, que piden columnas más anchas. */
  ancho?: boolean
}

/** Carrusel horizontal con anclaje de desplazamiento.
 *  Sangra hasta el borde de la ventana para que las tarjetas
 *  puedan salirse del margen al desplazarse. */
export default function Riel({ children, ancho }: Props) {
  return (
    <div
      className={`grid grid-flow-col gap-e3 overflow-x-auto pb-e3 [scroll-snap-type:x_mandatory] [margin-inline:calc(var(--spacing-margen)*-1)] [padding-inline:var(--spacing-margen)] [&>*]:[scroll-snap-align:start] ${
        ancho
          ? '[grid-auto-columns:minmax(300px,1fr)]'
          : '[grid-auto-columns:minmax(172px,1fr)]'
      }`}
    >
      {children}
    </div>
  )
}
