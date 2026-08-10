import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

/* Los botones.

   Van redondeados del todo, no con el radio de 6px del resto del
   sistema. Es deliberado: en una página cubierta de rectángulos —
   carátulas, tarjetas, píldoras— la única forma que hay que poder
   distinguir a un golpe de vista es la que se pulsa.

   Las variantes se declaran en un mapa y no en cada llamada para que dos
   botones del mismo peso no acaben con estilos distintos por descuido. */

const BASE =
  'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full border text-sm font-semibold no-underline transition-colors duration-200 ease-sal disabled:pointer-events-none disabled:opacity-50'

/* El primario es campo de acento con tinta oscura encima: es lo único
   saturado de la página y por eso no hace falta que sea grande.
   El secundario es una superficie más, con su filete casi invisible.
   El fantasma no tiene campo: para lo que acompaña, no para lo que
   se quiere que se pulse. */
const VARIANTES = {
  primario: 'border-transparent bg-acento text-acento-tinta hover:opacity-85',
  secundario: 'border-borde bg-tarjeta text-tinta hover:border-borde-vivo hover:bg-apagado',
  fantasma: 'border-transparent bg-transparent text-tinta-apagada hover:bg-tinta/10 hover:text-tinta',
} as const

type Variante = keyof typeof VARIANTES

const RELLENOS = {
  normal: 'h-10 px-5',
  compacto: 'h-8 px-3.5 text-xs',
} as const

type Tam = keyof typeof RELLENOS

interface BotonProps extends ComponentProps<'button'> {
  variante?: Variante
  tam?: Tam
  children: ReactNode
}

export default function Boton({
  variante = 'secundario',
  tam = 'normal',
  className = '',
  children,
  ...props
}: BotonProps) {
  return (
    <button
      className={`${BASE} ${RELLENOS[tam]} ${VARIANTES[variante]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

interface EnlaceProps extends ComponentProps<typeof Link> {
  variante?: Variante
  tam?: Tam
  children: ReactNode
}

export function BotonEnlace({
  variante = 'secundario',
  tam = 'normal',
  className = '',
  children,
  ...props
}: EnlaceProps) {
  return (
    <Link
      className={`${BASE} ${RELLENOS[tam]} ${VARIANTES[variante]} ${className}`}
      {...props}
    >
      {children}
    </Link>
  )
}

/** Botón circular de 40px, solo icono. Es el de la fila de acciones de
 *  la ficha: guardar, compartir, enlaces externos. Necesita `aria-label`
 *  siempre — sin texto dentro, es lo único que lo nombra. */
export function BotonIcono({
  className = '',
  children,
  ...props
}: ComponentProps<'button'>) {
  return (
    <button
      className={`grid size-10 shrink-0 cursor-pointer place-items-center rounded-full border border-borde bg-tarjeta text-tinta transition-colors duration-200 ease-sal hover:border-borde-vivo hover:bg-apagado disabled:pointer-events-none disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

/** La versión enlace del anterior, para lo que lleva fuera del sitio
 *  (MyAnimeList) o a otra ruta. */
export function EnlaceIcono({
  className = '',
  children,
  ...props
}: ComponentProps<typeof Link>) {
  return (
    <Link
      className={`grid size-10 shrink-0 place-items-center rounded-full border border-borde bg-tarjeta text-tinta no-underline transition-colors duration-200 ease-sal hover:border-borde-vivo hover:bg-apagado ${className}`}
      {...props}
    >
      {children}
    </Link>
  )
}
