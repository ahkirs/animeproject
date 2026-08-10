import type { ReactNode } from 'react'
import RielLateral, { type DestinoRiel } from '@/components/RielLateral'
import BarraSuperior from '@/components/BarraSuperior'
import BarraInferior from '@/components/BarraInferior'
import Pie from '@/components/Pie'
import type { OpcionMenu } from '@/components/MenuUsuario'
import { usuarioActual } from '@/lib/sesion'
import { sinLeer } from '@/lib/notificaciones'

/* El marco de la aplicación.

   Aquí vive la estructura que antes montaba cada página por su cuenta:
   una cabecera, un pie y un contenedor con margen, repetidos once veces.
   Ahora se declara una vez y las páginas solo traen su contenido.

   La decisión que lo condiciona todo: **la ventana no se desplaza**. El
   contenedor exterior mide exactamente el alto de la pantalla y recorta;
   el que se desplaza es `#panel`. Por eso el riel y la barra se quedan
   quietos sin necesidad de `position: sticky` ni de un `z-index` que
   pelear. A cambio, cualquier cosa que quiera leer la posición del scroll
   tiene que mirar `#panel` y no `window`.

   Las páginas de cuenta (/acceder, /registro) quedan fuera de este grupo
   a propósito: van a sangre completa y sin navegación, porque en ellas no
   hay nada más que hacer que entrar. */

/** Los destinos del riel. Solo hay entradas de cosas que existen: una
 *  pestaña que abre una página vacía es peor que no tener la pestaña.
 *  `/emision` y `/manga` están porque el backend las tendrá, y mientras
 *  tanto dicen honestamente que aún no. */
const DESTINOS: DestinoRiel[] = [
  { href: '/', texto: 'Inicio', icono: 'casa' },
  { href: '/explorar', texto: 'Explorar', icono: 'brujula' },
  { href: '/emision', texto: 'Emisión', icono: 'calendario' },
  { href: '/manga', texto: 'Manga', icono: 'biblioteca' },
  { href: '/mi-lista', texto: 'Mi lista', icono: 'marcador', separado: true },
]

function opcionesCuenta(alias: string): OpcionMenu[] {
  return [
    { href: '/mi-lista', texto: 'Historial', icono: 'cinta' },
    { href: '/mi-lista?v=favoritos', texto: 'Favoritos', icono: 'estrella' },
    { href: '/mi-lista?v=despues', texto: 'Ver después', icono: 'marcador' },
    { href: '/notificaciones', texto: 'Notificaciones', icono: 'campana', separada: true },
    { href: `/u/${alias}`, texto: 'Mi perfil público', icono: 'compartir' },
    { href: '/cuenta', texto: 'Ajustes de cuenta', icono: 'ajustes' },
  ]
}

/** Dos letras del alias, para el hueco del avatar mientras no haya
 *  imagen subida. */
function inicialesDe(alias: string): string {
  return alias.slice(0, 2).toUpperCase()
}

export default async function MarcoLayout({ children }: { children: ReactNode }) {
  const usuario = await usuarioActual()

  // Sin sesión no hay campana que contar, y pedirlo sería una llamada
  // segura de fallar en cada carga.
  const noLeidas = usuario ? await sinLeer() : 0

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-fondo md:flex-row">
      <RielLateral
        destinos={DESTINOS}
        usuario={
          usuario
            ? { alias: usuario.username, iniciales: inicialesDe(usuario.username) }
            : null
        }
        opcionesCuenta={usuario ? opcionesCuenta(usuario.username) : []}
      />

      {/* La barra se sale del flujo y flota sobre el panel: arriba del todo
          es transparente, y para que eso enseñe algo tiene que haber
          contenido pasando por debajo. El panel recupera el hueco con un
          relleno superior, que las secciones a sangre anulan con
          `.bajo-barra`. */}
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-lienzo">
        <div className="absolute inset-x-0 top-0 z-50">
          <BarraSuperior hayUsuario={!!usuario} noLeidas={noLeidas} />
        </div>

        {/* El único elemento con scroll de la aplicación. `overscroll-none`
            evita que al llegar al final arrastre la página de debajo, que
            en móvil se nota como un rebote raro. */}
        <div
          id="panel"
          className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-none pt-[var(--alto-barra)]"
        >
          <a
            href="#principal"
            className="absolute top-2 left-2 z-100 -translate-y-[200%] rounded-radio bg-primario px-4 py-2 font-semibold text-primario-tinta no-underline transition-transform duration-200 ease-sal focus:translate-y-0"
          >
            Saltar al contenido
          </a>

          <main id="principal">{children}</main>

          <Pie />
        </div>
      </div>

      <BarraInferior destinos={DESTINOS} hayUsuario={!!usuario} />
    </div>
  )
}
