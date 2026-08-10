'use client'

/* El riel de navegación.

   Una columna de 48px que no se mueve nunca. Sustituye al cajón lateral
   que había antes, que había que abrir para ver a dónde se podía ir: aquí
   los destinos están siempre a la vista y a un clic, y el estado activo
   se lee sin abrir nada.

   Es de cliente por una sola razón —`usePathname`, para marcar el activo—
   así que la sesión se le pasa ya resuelta desde el marco, que sí es de
   servidor. En móvil desaparece y su sitio lo ocupa BarraInferior.

   Ojo con el recorte: las etiquetas emergentes de Consejo salen fuera de
   los 48px, así que este contenedor no puede llevar `overflow: hidden`. */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Icono, { type NombreIcono } from './Icono'
import Consejo from './Consejo'
import Marca from './Marca'
import MenuUsuario, { type OpcionMenu } from './MenuUsuario'

export interface DestinoRiel {
  href: string
  texto: string
  icono: NombreIcono
  /** Traza una línea encima: separa el catálogo de lo que es tuyo. */
  separado?: boolean
}

/** Un destino está activo si la ruta es exactamente esa o cuelga de ella.
 *  La raíz se compara entera o marcaría todas. */
function esActivo(href: string, ruta: string): boolean {
  const base = href.split('?')[0]
  if (base === '/') return ruta === '/'
  return ruta === base || ruta.startsWith(`${base}/`)
}

export default function RielLateral({
  destinos,
  usuario,
  opcionesCuenta,
}: {
  destinos: DestinoRiel[]
  usuario: { alias: string; iniciales: string } | null
  opcionesCuenta: OpcionMenu[]
}) {
  const ruta = usePathname()

  return (
    <nav
      aria-label="Navegación principal"
      className="z-50 hidden h-dvh w-[var(--ancho-riel)] shrink-0 grid-rows-[auto_1fr_auto] border-r border-borde bg-fondo md:grid"
    >
      <div className="grid h-[var(--alto-barra)] place-items-center">
        <Marca soloIcono />
      </div>

      <ul className="m-0 flex list-none flex-col items-center gap-1 p-0 pt-2">
        {destinos.map((d) => {
          const activo = esActivo(d.href, ruta)
          /* El separado ocupa todo el ancho para poder trazar la línea, y por
             eso tiene que centrar lo suyo por su cuenta: el `items-center` del
             ul solo centra a los que se encogen. */
          return (
            <li
              key={d.href}
              className={
                d.separado ? 'mt-2 flex w-full flex-col items-center pt-2' : ''
              }
            >
              {d.separado && (
                <span
                  aria-hidden="true"
                  className="mx-auto mb-3 block h-px w-5 bg-apagado"
                />
              )}
              <Consejo texto={d.texto}>
                <Link
                  href={d.href}
                  aria-label={d.texto}
                  aria-current={activo ? 'page' : undefined}
                  className={`grid size-8 place-items-center rounded-radio no-underline transition-colors duration-200 ease-sal hover:bg-tinta/10 hover:text-tinta ${
                    activo ? 'bg-tinta/10 text-tinta' : 'text-tinta-apagada'
                  }`}
                >
                  <Icono nombre={d.icono} tam={19} />
                </Link>
              </Consejo>
            </li>
          )
        })}
      </ul>

      <div className="grid h-14 place-items-center">
        {usuario ? (
          <MenuUsuario
            iniciales={usuario.iniciales}
            alias={usuario.alias}
            opciones={opcionesCuenta}
          />
        ) : (
          <Consejo texto="Acceder">
            <Link
              href="/acceder"
              aria-label="Acceder"
              className="grid size-8 place-items-center rounded-full border border-borde text-tinta-apagada no-underline transition-colors duration-200 ease-sal hover:border-borde-vivo hover:text-tinta"
            >
              <Icono nombre="usuario" tam={17} />
            </Link>
          </Consejo>
        )}
      </div>
    </nav>
  )
}
