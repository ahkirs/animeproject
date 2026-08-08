import Link from 'next/link'
import Icono from './Icono'
import Buscador from './Buscador'
import Marca from './Marca'
import MenuUsuario, { type OpcionMenu } from './MenuUsuario'
import { usuarioActual } from '@/lib/sesion'

type Seccion = 'inicio' | 'explorar'

const ENLACES: { id: Seccion; texto: string; href: string }[] = [
  { id: 'inicio', texto: 'Inicio', href: '/' },
  { id: 'explorar', texto: 'Explorar', href: '/explorar' },
]

/* Lo que hay dentro del menú del avatar. Las listas guardadas entran
   aquí cuando existan, con `separada` si conviene despegarlas. */
function opcionesCuenta(alias: string): OpcionMenu[] {
  return [
    { href: '/mi-lista', texto: 'Historial', icono: 'cinta' },
    { href: '/mi-lista?v=favoritos', texto: 'Favoritos', icono: 'check' },
    { href: '/mi-lista?v=despues', texto: 'Ver después', icono: 'marcador' },
    { href: `/u/${alias}`, texto: 'Mi perfil público', icono: 'compartir', separada: true },
    { href: '/mi-lista?v=perfil', texto: 'Ajustes de cuenta', icono: 'ajustes' },
  ]
}

/** Dos letras a partir del alias, para el hueco del avatar mientras no
 *  haya imagen subida. */
function inicialesDe(alias: string): string {
  return alias.slice(0, 2).toUpperCase()
}

export default async function Cabecera({ activa }: { activa?: Seccion }) {
  const usuario = await usuarioActual()
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

        {/* Sin sesión no se enseña ni el marcador ni el avatar: llevarían
            a páginas vacías. En su sitio, la puerta de entrada. */}
        {usuario ? (
          <>
            {/* Ver después: acceso directo, sin pasar por el menú. Es lo
                que más se toca de la cuenta, así que no se esconde. */}
            <Link
              href="/mi-lista?v=despues"
              aria-label="Ver después"
              title="Ver después"
              className="grid size-9 place-items-center rounded-full text-hueso-45 no-underline transition-colors duration-200 ease-sal hover:text-hueso"
            >
              <Icono nombre="marcador" tam={19} />
            </Link>

            <MenuUsuario
              iniciales={inicialesDe(usuario.username)}
              alias={usuario.username}
              opciones={opcionesCuenta(usuario.username)}
            />
          </>
        ) : (
          <Link
            href="/acceder"
            className="rounded-radio border border-borde-vivo px-[0.95rem] py-[0.45rem] text-paso-1 font-semibold whitespace-nowrap text-hueso no-underline transition-colors duration-200 ease-sal hover:border-hueso-45 hover:bg-hueso/8"
          >
            Acceder
          </Link>
        )}
      </div>
    </header>
  )
}
