import Link from 'next/link'
import Icono from './Icono'

/* La página que no existe.

   Hasta ahora el sitio no tenía ninguna, así que un enlace roto sacaba
   el 404 por defecto de Next: fondo blanco, tipografía del sistema y
   ninguna forma de volver. Es la pantalla que más se ve sin haberla
   diseñado nunca.

   Se comparte entre la raíz —direcciones que no encajan con ninguna
   ruta— y el interior del marco —una serie o un episodio que el
   proveedor ya no sirve—, porque el mensaje útil es el mismo. */
export default function NoEncontrado({ conMarco }: { conMarco?: boolean }) {
  return (
    <div
      className={`mx-auto flex max-w-[46ch] flex-col items-center justify-center px-bleed text-center ${
        conMarco ? 'min-h-[60dvh]' : 'min-h-dvh'
      }`}
    >
      <p
        aria-hidden="true"
        className="font-titulo text-6xl leading-none font-extrabold text-apagado tabular-nums"
      >
        404
      </p>

      <h1 className="mt-4 font-titulo text-2xl font-extrabold tracking-[-0.02em]">
        Esto no está aquí
      </h1>

      <p className="mt-3 text-sm leading-relaxed text-tinta-tenue">
        La dirección no existe, o la obra que buscas ya no la sirve el
        proveedor. El catálogo cambia a menudo.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Link
          href="/explorar"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-acento px-5 text-sm font-semibold text-acento-tinta no-underline transition-opacity duration-200 ease-sal hover:opacity-85"
        >
          <Icono nombre="brujula" tam={16} />
          Explorar el catálogo
        </Link>
        <Link
          href="/"
          className="inline-flex h-10 items-center gap-2 rounded-full border border-borde bg-tarjeta px-5 text-sm font-semibold text-tinta no-underline transition-colors duration-200 ease-sal hover:border-borde-vivo hover:bg-apagado"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
