import Link from 'next/link'
import Lamina from './Lamina'
import Marca from './Marca'

interface Props {
  titulo: string
  entradilla: string
  children: React.ReactNode
  /** Enlace al otro lado del par acceder / registro. */
  pie: { texto: string; enlace: string; href: string }
}

/** Marco compartido por acceder y registro: la lámina panorámica al
 *  fondo, apagada, y el formulario centrado encima.
 *
 *  Estas dos páginas quedan fuera del marco de la aplicación a propósito:
 *  no llevan riel ni barra porque en ellas no hay nada más que hacer que
 *  entrar, y una navegación completa solo invita a irse a otro sitio. */
export default function MarcoCuenta({ titulo, entradilla, children, pie }: Props) {
  return (
    <div className="relative isolate flex min-h-screen flex-col">
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <Lamina arte="panoramica-escena" />
      </div>
      {/* La lámina se apaga casi del todo: está para que la pantalla no
          sea un rectángulo vacío, no para mirarla. */}
      <div className="absolute inset-0 -z-10 bg-fondo/92" />

      <header className="px-bleed py-5">
        <Marca />
      </header>

      <main
        id="principal"
        className="flex flex-1 items-center justify-center px-bleed py-13"
      >
        <div className="w-full max-w-[26rem]">
          <h1 className="font-titulo text-5xl leading-[0.96] tracking-[-0.035em]">
            {titulo}
          </h1>
          <p className="mt-3 mb-8 text-tinta-apagada">{entradilla}</p>

          {children}

          <p className="mt-8 border-t border-borde pt-5 text-sm text-tinta-tenue">
            {pie.texto}{' '}
            <Link href={pie.href} className="font-semibold text-primario hover:underline">
              {pie.enlace}
            </Link>
          </p>

          <p className="mt-5 rounded-radio border border-borde bg-tarjeta/80 px-5 py-3 text-xs text-tinta-tenue">
            Tu sesión se guarda en una cookie de este sitio, no del proveedor, y
            el token nunca pasa por JavaScript.
          </p>
        </div>
      </main>
    </div>
  )
}
