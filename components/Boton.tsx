import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

const BASE =
  'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-radio border text-paso-1 font-semibold no-underline transition-all duration-200 ease-sal active:translate-y-px'

const VARIANTES = {
  primario: 'border-transparent bg-ambar text-ambar-tinta hover:bg-ambar-claro',
  fantasma:
    'border-borde-vivo bg-hueso/6 text-hueso hover:border-hueso-45 hover:bg-hueso/12',
} as const

type Variante = keyof typeof VARIANTES

const RELLENO = 'px-[1.35rem] py-3'

interface BotonProps extends ComponentProps<'button'> {
  variante?: Variante
  children: ReactNode
}

export default function Boton({
  variante = 'fantasma',
  className = '',
  children,
  ...props
}: BotonProps) {
  return (
    <button
      className={`${BASE} ${RELLENO} ${VARIANTES[variante]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

interface EnlaceProps extends ComponentProps<typeof Link> {
  variante?: Variante
  children: ReactNode
}

export function BotonEnlace({
  variante = 'fantasma',
  className = '',
  children,
  ...props
}: EnlaceProps) {
  return (
    <Link className={`${BASE} ${RELLENO} ${VARIANTES[variante]} ${className}`} {...props}>
      {children}
    </Link>
  )
}

/** Botón circular de 44px, solo icono. */
export function BotonIcono({
  className = '',
  children,
  ...props
}: ComponentProps<'button'>) {
  return (
    <button
      className={`grid size-11 cursor-pointer place-items-center rounded-full border border-borde-vivo bg-hueso/6 text-hueso transition-colors duration-200 ease-sal hover:border-hueso-45 hover:bg-hueso/14 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
