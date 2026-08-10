import Link from 'next/link'
import Icono, { type NombreIcono } from './Icono'

/* Estado «esto todavía no existe».

   Se usa en las dos secciones que el riel anuncia y el backend aún no
   puede alimentar. La regla que sigue: decir qué falta y de quién
   depende, no un «próximamente» que no informa de nada. Y ofrecer
   siempre una salida, que es lo único útil que puede hacer una página
   vacía.

   Cuando aparezcan los endpoints, estas dos páginas se rellenan y este
   componente se borra. */
export default function Pronto({
  titulo,
  explicacion,
  icono,
}: {
  titulo: string
  explicacion: string
  icono: NombreIcono
}) {
  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-[46ch] flex-col items-center justify-center px-bleed text-center">
      <span
        aria-hidden="true"
        className="mb-5 grid size-14 place-items-center rounded-full border border-borde bg-tarjeta text-tinta-tenue"
      >
        <Icono nombre={icono} tam={24} />
      </span>

      <h1 className="font-titulo text-2xl font-extrabold tracking-[-0.02em]">
        {titulo}
      </h1>

      <p className="mt-3 text-sm leading-relaxed text-tinta-tenue">{explicacion}</p>

      <Link
        href="/explorar"
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-acento px-5 text-sm font-semibold text-acento-tinta no-underline transition-opacity duration-200 ease-sal hover:opacity-85"
      >
        <Icono nombre="brujula" tam={16} />
        Explorar el catálogo
      </Link>
    </div>
  )
}
