import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** Rieles de miniaturas 16:9, que piden columnas más anchas. */
  ancho?: boolean
  /** Carátulas más grandes, para las filas que abren un bloque. */
  destacado?: boolean
  /** Deja sitio a la cifra del puesto, que va fuera de la carátula. */
  anchoNumerado?: boolean
}

/** Ancho de columna según el tipo de fila. Se declara aquí y no en cada
 *  llamada para que dos filas del mismo tipo no acaben con medidas
 *  distintas por descuido. */
function columnas({ ancho, destacado, anchoNumerado }: Omit<Props, 'children'>) {
  if (ancho) return '[grid-auto-columns:minmax(300px,1fr)]'
  if (anchoNumerado) return '[grid-auto-columns:minmax(210px,1fr)]'
  if (destacado) return '[grid-auto-columns:minmax(220px,1fr)]'
  return '[grid-auto-columns:minmax(172px,1fr)]'
}

/** Carrusel horizontal con anclaje de desplazamiento.
 *  Sangra hasta el borde de la ventana para que las tarjetas
 *  puedan salirse del margen al desplazarse. */
export default function Riel({ children, ancho, destacado, anchoNumerado }: Props) {
  return (
    <div
      className={`grid grid-flow-col gap-e3 overflow-x-auto pb-e3 [scroll-snap-type:x_mandatory] [margin-inline:calc(var(--spacing-margen)*-1)] [padding-inline:var(--spacing-margen)] [&>*]:[scroll-snap-align:start] ${columnas(
        { ancho, destacado, anchoNumerado },
      )}`}
    >
      {children}
    </div>
  )
}
