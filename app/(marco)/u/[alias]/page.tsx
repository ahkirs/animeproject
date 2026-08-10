/* Perfil público de un usuario: /u/{alias}

   Es la pieza que hace que un agregador se pegue —enseñar lo que ves y
   mirar lo que ven otros— y no cuesta ancho de banda porque no sirve
   vídeo, solo listas.

   Las dos rutas que necesita, `GET /users/{username}` y
   `GET /users/{username}/favorites`, ya existen en el backend, igual que
   el campo `profileVisibility` del esquema User. El valor por defecto es
   privado y esta página lo respeta: sin `PUBLIC` explícito solo se
   enseña el alias y la fecha de alta. */

import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Icono from '@/components/Icono'
import {
  favoritosPublicos,
  perfilPublico,
} from '@/lib/perfil'
import { haceCuanto } from '@/lib/fechas'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ alias: string }>
}): Promise<Metadata> {
  const { alias } = await params
  const p = await perfilPublico(alias)
  if (!p) return {}

  // Un perfil que no es público no se indexa ni se resume.
  if (p.visibilidad !== 'PUBLIC') {
    return { title: `@${p.username}`, robots: { index: false, follow: false } }
  }

  return {
    title: `@${p.username}`,
    description: p.bio || `Lo que ve @${p.username} en KUROBA.`,
  }
}

export default async function PerfilPublicoPagina({
  params,
}: {
  params: Promise<{ alias: string }>
}) {
  const { alias } = await params
  const p = await perfilPublico(alias)
  if (!p) notFound()

  const publico = p.visibilidad === 'PUBLIC'
  const favs = publico ? await favoritosPublicos(alias) : []

  const desde = new Date(p.createdAt).toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })

  /* `stats` llega nulo cuando el perfil no es público y no eres su
     dueño. En ese caso no se enseña la tira: un cero no es lo mismo que
     «no te lo puedo decir». */
  const cifras = p.cifras
    ? [
        { etiqueta: 'series', valor: String(p.cifras.series) },
        { etiqueta: 'episodios', valor: p.cifras.episodios.toLocaleString('es-ES') },
        { etiqueta: 'horas', valor: String(p.cifras.horas) },
      ]
    : []

  return (
    <div className="mx-auto max-w-[1120px] px-bleed pb-16">
      <header className="flex items-start gap-4 border-b border-borde pt-8 pb-6">
        <span
          aria-hidden="true"
          className="grid size-16 shrink-0 place-items-center rounded-full border border-borde bg-apagado font-titulo text-xl font-extrabold text-tinta-apagada"
        >
          {p.username.slice(0, 2).toUpperCase()}
        </span>

        <div className="min-w-0">
          <h1 className="font-titulo text-2xl leading-none font-extrabold tracking-[-0.02em]">
            @{p.username}
          </h1>
          <p className="mt-1.5 text-sm text-tinta-tenue">En KUROBA desde {desde}</p>

          {publico && p.bio && (
            <p className="mt-3 max-w-[62ch] text-sm text-tinta-apagada">{p.bio}</p>
          )}

          {publico && cifras.length > 0 && (
            <dl className="mt-4 flex flex-wrap items-baseline gap-x-5 gap-y-2">
              {cifras.map((c, i) => (
                <div
                  key={c.etiqueta}
                  className={`flex items-baseline gap-1.5 ${
                    i > 0 ? 'border-l border-borde pl-5' : ''
                  }`}
                >
                  <dd className="m-0 text-base font-semibold text-tinta tabular-nums">
                    {c.valor}
                  </dd>
                  <dt className="text-xs text-tinta-tenue">{c.etiqueta}</dt>
                </div>
              ))}
            </dl>
          )}
        </div>
      </header>

      {publico ? (
        <section aria-labelledby="t-favoritos" className="mt-8">
          <h2 id="t-favoritos" className="mb-4 text-xl font-semibold text-tinta">
            Favoritos
          </h2>

          {favs.length > 0 ? (
            <ul className="grid list-none grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-x-4 gap-y-6 p-0">
              {favs.map((f) => (
                <li key={f.animeId}>
                  <Link
                    href={`/serie/${f.animeId}`}
                    className="group block no-underline"
                  >
                    <span className="relative block aspect-2/3 overflow-hidden rounded-radio bg-tarjeta">
                      {f.imagen && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={f.imagen}
                          alt=""
                          loading="lazy"
                          className="size-full object-cover"
                        />
                      )}
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 bg-black/0 transition-colors duration-200 ease-sal group-hover:bg-black/25"
                      />
                    </span>
                    <b className="mt-2 block truncate text-sm font-semibold text-tinta">
                      {f.title}
                    </b>
                    <span className="block text-xs text-tinta-tenue">
                      {haceCuanto(f.addedAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-radio border border-dashed border-borde-vivo px-8 py-12 text-center text-sm text-tinta-tenue">
              @{p.username} todavía no ha marcado ningún favorito.
            </p>
          )}
        </section>
      ) : (
        <section className="mt-8">
          <div className="mx-auto max-w-[46ch] rounded-radio border border-dashed border-borde-vivo px-8 py-14 text-center">
            <span
              aria-hidden="true"
              className="mx-auto mb-4 grid size-12 place-items-center rounded-full border border-borde bg-tarjeta text-tinta-tenue"
            >
              <Icono nombre="candado" tam={20} />
            </span>
            <p className="text-lg font-semibold">Este perfil es privado</p>
            <p className="mt-2 text-sm text-tinta-tenue">
              @{p.username} no ha hecho públicas sus listas. Solo se ve el alias y
              desde cuándo tiene cuenta.
            </p>
          </div>
        </section>
      )}
    </div>
  )
}
