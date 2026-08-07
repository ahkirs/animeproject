import Link from 'next/link'
import Lamina from './Lamina'
import type { ClaveLamina } from '@/lib/types'

/** Marco de una carátula: 2:3 por defecto, 16:9 si es panorámica. */
export function Cartel({
  arte,
  ancho,
  className = '',
  children,
}: {
  arte: ClaveLamina
  ancho?: boolean
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-radio bg-sala-700 shadow-baja ${
        ancho ? 'aspect-video' : 'aspect-2/3'
      } ${className}`}
    >
      <Lamina arte={arte} />
      {children}
    </div>
  )
}

interface Props {
  href: string
  titulo: string
  subtitulo: string
  arte: ClaveLamina
}

/** Tarjeta de serie dentro de un riel. */
export default function FichaSerie({ href, titulo, subtitulo, arte }: Props) {
  return (
    <Link href={href} className="group block no-underline">
      <div className="relative aspect-2/3 overflow-hidden rounded-radio bg-sala-700 shadow-baja transition-all duration-300 ease-sal group-hover:-translate-y-[5px] group-hover:shadow-alta group-focus-visible:-translate-y-[5px] group-focus-visible:shadow-alta">
        <Lamina arte={arte} />
      </div>
      <h3 className="mt-e2 text-paso-1 font-semibold tracking-[-0.01em]">{titulo}</h3>
      <p className="mt-[0.15rem] text-paso-0 text-hueso-45">{subtitulo}</p>
    </Link>
  )
}
