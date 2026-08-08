import Link from 'next/link'
import Icono from './Icono'
import Buscador from './Buscador'
import MenuUsuario, { type OpcionMenu } from './MenuUsuario'
import { USUARIO } from '@/lib/catalogo'

type Seccion = 'inicio' | 'explorar'

const ENLACES: { id: Seccion; texto: string; href: string }[] = [
  { id: 'inicio', texto: 'Inicio', href: '/' },
  { id: 'explorar', texto: 'Explorar', href: '/explorar' },
]

/* Lo que hay dentro del menú del avatar. Las listas guardadas entran
   aquí cuando existan, con `separada` si conviene despegarlas. */
const OPCIONES_CUENTA: OpcionMenu[] = [
  { href: '/mi-lista', texto: 'Historial', icono: 'cinta' },
  { href: '/mi-lista?v=favoritos', texto: 'Favoritos', icono: 'check' },
  { href: '/mi-lista?v=despues', texto: 'Ver después', icono: 'marcador' },
  { href: `/u/${USUARIO.alias}`, texto: 'Mi perfil público', icono: 'compartir', separada: true },
  { href: '/mi-lista?v=perfil', texto: 'Ajustes de cuenta', icono: 'ajustes' },
]

export function Marca({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-flex shrink-0 items-center gap-[0.55rem] font-display text-paso-3 tracking-[-0.03em] no-underline ${className}`}
    >
      <Icono nombre="cinta" tam={26} className="text-ambar" />
      KUROBA
    </Link>
  )
}

export default function Cabecera({ activa }: { activa?: Seccion }) {
  return (
    <header className="sticky top-0 z-60 flex items-center gap-e4 bg-[linear-gradient(to_bottom,#0b0a09_55%,rgba(11,10,9,0))] px-margen py-e3">
      <Marca />

      <nav aria-label="Principal" className="ml-e2 hidden gap-e3 min-[900px]:flex">
        {ENLACES.map((e) => {
          const actual = e.id === activa
          return (
            <Link
              key={e.id}
              href={e.href}
              aria-current={actual ? 'page' : undefined}
              className={`border-b-2 py-1 text-paso-1 font-medium no-underline transition-colors duration-200 ease-sal ${
                actual
                  ? 'border-ambar text-hueso'
                  : 'border-transparent text-hueso-70 hover:text-hueso'
              }`}
            >
              {e.texto}
            </Link>
          )
        })}
      </nav>

      <div className="ml-auto flex items-center gap-e2">
        <Buscador />

        {/* Ver después: acceso directo, sin pasar por el menú. Es lo que
            más se toca de la cuenta, así que no se esconde dentro. */}
        <Link
          href="/mi-lista?v=despues"
          aria-label="Ver después"
          title="Ver después"
          className="grid size-9 place-items-center rounded-full text-hueso-45 no-underline transition-colors duration-200 ease-sal hover:text-hueso"
        >
          <Icono nombre="marcador" tam={19} />
        </Link>

        <MenuUsuario
          iniciales={USUARIO.iniciales}
          alias={USUARIO.alias}
          opciones={OPCIONES_CUENTA}
        />
      </div>
    </header>
  )
}
