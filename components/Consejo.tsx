import type { ReactNode } from 'react'

/* Etiqueta emergente para los iconos del riel.

   El riel es una columna de símbolos sin texto, así que cada uno necesita
   decir su nombre al pasar por encima. Se resuelve con CSS puro —hermano
   en `group-hover`, sin estado ni portal— en vez de traer una librería de
   superposiciones. A cambio se acepta una limitación: la etiqueta se
   recorta si el ancestro tiene `overflow: hidden`, así que el riel se
   deja explícitamente sin recortar.

   No sustituye a la etiqueta accesible: el elemento que envuelve sigue
   necesitando su `aria-label`. Esto es solo lo que se ve; por eso va
   `aria-hidden`, para que un lector de pantalla no lo lea dos veces. */
export default function Consejo({
  texto,
  children,
  className = '',
}: {
  texto: string
  children: ReactNode
  className?: string
}) {
  return (
    <span className={`group/consejo relative flex ${className}`}>
      {children}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-[calc(100%+0.6rem)] z-90 -translate-y-1/2 scale-95 rounded-radio border border-borde bg-tarjeta px-2 py-1 text-xs font-medium whitespace-nowrap text-tinta opacity-0 transition-[opacity,transform] duration-150 ease-sal group-hover/consejo:scale-100 group-hover/consejo:opacity-100 group-focus-within/consejo:scale-100 group-focus-within/consejo:opacity-100"
      >
        {texto}
      </span>
    </span>
  )
}
