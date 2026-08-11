import type { ReactNode } from 'react'

/* La página de documento: las legales y el registro de cambios.

   Es el contenedor que comparten Privacidad, Términos, DMCA y Changelog:
   cabecera con título y subtítulo, y debajo el cuerpo. Las cuatro páginas
   arrancan en la misma vertical y cierran con el mismo pie, así que el
   contenedor se declara una vez. */

export default function PaginaDocumento({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string
  subtitulo?: string
  children: ReactNode
}) {
  return (
    <div className="mx-auto max-w-[820px] px-bleed pb-16">
      <header className="pt-8 pb-6">
        <h1 className="font-titulo text-2xl font-extrabold tracking-[-0.02em] sm:text-3xl">
          {titulo}
        </h1>
        {subtitulo && (
          <p className="mt-2 max-w-[60ch] text-sm text-tinta-tenue">{subtitulo}</p>
        )}
      </header>
      {children}
    </div>
  )
}
