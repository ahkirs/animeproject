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

/** Marco compartido por acceder y registro: la lÃ¡mina panorÃ¡mica al
 *  fondo, apagada, y el formulario centrado encima. Es la misma sala a
 *  oscuras del resto del sitio, con el foco en una sola tarea. */
export default function MarcoCuenta({ titulo, entradilla, children, pie }: Props) {
  return (
    <div className="relative isolate flex min-h-screen flex-col">
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <Lamina arte="panoramica-escena" />
      </div>
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,#0b0a09_18%,rgba(11,10,9,0.94)_55%,rgba(11,10,9,0.82)_100%)]" />

      <header className="px-margen py-e3">
        <Marca />
      </header>

      <main
        id="principal"
        className="flex flex-1 items-center justify-center px-margen py-e5"
      >
        <div className="w-full max-w-[26rem]">
          <h1 className="font-display text-paso-5 leading-[0.96] tracking-[-0.035em]">
            {titulo}
          </h1>
          <p className="mt-e2 mb-e4 text-hueso-70">{entradilla}</p>

          {children}

          <p className="mt-e4 border-t border-borde pt-e3 text-paso-1 text-hueso-45">
            {pie.texto}{' '}
            <Link href={pie.href} className="font-semibold text-ambar hover:underline">
              {pie.enlace}
            </Link>
          </p>

          <p className="mt-e3 rounded-radio border border-borde bg-sala-800/80 px-e3 py-e2 text-paso-0 text-hueso-45">
            Pantalla de diseÃ±o. El formulario todavÃ­a no envÃ­a nada: el registro y el
            inicio de sesiÃ³n llegan cuando se conecte la base de datos.
          </p>
        </div>
      </main>
    </div>
  )
}
