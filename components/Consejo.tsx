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
      {/* Campo blanco con tinta oscura, como la referencia. Es la única pieza
          del sistema que invierte el color, y por eso funciona: flota sobre
          contenido cualquiera y no hay superficie oscura contra la que se
          pueda perder.

          Los tiempos también son los suyos, y son asimétricos a propósito:
          entra en 300 ms y se va en 100. Al recorrer el riel, una etiqueta que
          desaparece despacio se solapa con la siguiente. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-[calc(100%+0.4rem)] z-90 -translate-x-1 -translate-y-1/2 rounded-radio bg-tinta px-3 py-0.5 text-sm whitespace-nowrap text-primario-tinta opacity-0 transition-[opacity,translate] duration-100 ease-sal group-hover/consejo:translate-x-0 group-hover/consejo:opacity-100 group-hover/consejo:duration-300 group-focus-within/consejo:translate-x-0 group-focus-within/consejo:opacity-100"
      >
        {texto}
      </span>
    </span>
  )
}
