/* Notificaciones.

   El backend las emitía desde el principio —respuestas a comentarios y
   episodios nuevos— y la web no las leía nunca. Esta página y el punto
   de la campana del marco son todo lo que hacía falta para estrenarlas.

   Sin sesión no hay nada que enseñar, así que se manda a entrar con el
   destino puesto, igual que /mi-lista. */

import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Icono, { type NombreIcono } from '@/components/Icono'
import MarcarLeidas from '@/components/MarcarLeidas'
import { notificaciones, type TipoNotificacion } from '@/lib/notificaciones'
import { haceCuanto } from '@/lib/fechas'
import { haySesion } from '@/lib/sesion'

export const metadata: Metadata = {
  title: 'Notificaciones',
  robots: { index: false, follow: false },
}

/** Un icono por tipo. El genérico existe porque el backend puede empezar
 *  a emitir tipos nuevos sin avisar, y una notificación sin icono se
 *  descuadra de la lista entera. */
const ICONO: Record<string, NombreIcono> = {
  COMMENT_REPLY: 'mensajes',
  COMMENT_LIKE: 'estrella-llena',
  NEW_EPISODE: 'cinta',
}

function iconoDe(tipo: TipoNotificacion): NombreIcono {
  return ICONO[tipo] ?? 'campana'
}

export default async function Notificaciones({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>
}) {
  if (!(await haySesion())) redirect('/acceder?destino=%2Fnotificaciones')

  const { p } = await searchParams
  const pagina = Math.max(1, Number(p) || 1)
  const datos = await notificaciones({ pagina })

  return (
    <div className="mx-auto max-w-[760px] px-bleed pb-16">
      <header className="flex flex-wrap items-center justify-between gap-3 pt-8 pb-6">
        <h1 className="font-titulo text-2xl font-extrabold tracking-[-0.02em]">
          Notificaciones
          {datos.sinLeer > 0 && (
            <span className="ml-2 align-middle text-sm font-normal text-tinta-tenue tabular-nums">
              {datos.sinLeer} sin leer
            </span>
          )}
        </h1>

        <MarcarLeidas sinLeer={datos.sinLeer} />
      </header>

      {datos.filas.length === 0 ? (
        <div className="rounded-radio border border-dashed border-borde-vivo px-8 py-16 text-center">
          <span
            aria-hidden="true"
            className="mx-auto mb-4 grid size-12 place-items-center rounded-full border border-borde bg-tarjeta text-tinta-tenue"
          >
            <Icono nombre="campana" tam={20} />
          </span>
          <p className="text-lg font-semibold">No hay nada nuevo</p>
          <p className="mx-auto mt-2 max-w-[46ch] text-sm text-tinta-tenue">
            Aquí aparecen las respuestas a tus comentarios y los episodios nuevos
            de lo que sigues.
          </p>
        </div>
      ) : (
        <ul className="m-0 list-none divide-y divide-borde p-0">
          {datos.filas.map((n) => {
            const contenido = (
              <>
                <span
                  aria-hidden="true"
                  className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-full ${
                    n.leida
                      ? 'bg-apagado text-tinta-tenue'
                      : 'bg-acento-tenue text-acento'
                  }`}
                >
                  <Icono nombre={iconoDe(n.tipo)} tam={17} />
                </span>

                <span className="min-w-0 flex-1">
                  <b
                    className={`block text-sm ${
                      n.leida ? 'font-medium text-tinta-apagada' : 'font-semibold text-tinta'
                    }`}
                  >
                    {n.titulo || 'Novedad'}
                  </b>
                  {n.cuerpo && (
                    <span className="mt-0.5 block text-sm text-tinta-tenue">
                      {n.cuerpo}
                    </span>
                  )}
                  <span className="mt-1 block text-xs text-tinta-tenue">
                    {haceCuanto(n.creada)}
                  </span>
                </span>

                {!n.leida && (
                  <span
                    aria-label="Sin leer"
                    className="mt-2 size-2 shrink-0 rounded-full bg-acento"
                  />
                )}
              </>
            )

            const clases = `flex items-start gap-3 px-2 py-4 no-underline transition-colors duration-150 ease-sal ${
              n.href ? 'hover:bg-tarjeta' : ''
            }`

            return (
              <li key={n.id}>
                {n.href ? (
                  <Link href={n.href} className={clases}>
                    {contenido}
                  </Link>
                ) : (
                  <div className={clases}>{contenido}</div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {datos.paginas > 1 && (
        <nav
          aria-label="Paginación"
          className="mt-8 flex items-center justify-between gap-3"
        >
          {pagina > 1 ? (
            <Link
              href={`/notificaciones?p=${pagina - 1}`}
              className="inline-flex h-9 items-center gap-2 rounded-full border border-borde bg-tarjeta px-4 text-sm font-semibold no-underline transition-colors duration-200 ease-sal hover:border-borde-vivo"
            >
              <Icono nombre="cheuron-izq" tam={15} />
              Anterior
            </Link>
          ) : (
            <span />
          )}

          <span className="text-xs text-tinta-tenue tabular-nums">
            {pagina} de {datos.paginas}
          </span>

          {pagina < datos.paginas ? (
            <Link
              href={`/notificaciones?p=${pagina + 1}`}
              className="inline-flex h-9 items-center gap-2 rounded-full border border-borde bg-tarjeta px-4 text-sm font-semibold no-underline transition-colors duration-200 ease-sal hover:border-borde-vivo"
            >
              Siguiente
              <Icono nombre="cheuron-der" tam={15} />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  )
}
