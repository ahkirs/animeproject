/* Perfil público de un usuario: /u/{alias}

   Es la pieza que hace que un agregador se pegue —enseñar lo que ves y
   mirar lo que ven otros— y no cuesta ancho de banda porque no sirve
   vídeo, solo listas.

   Depende de dos cosas que el backend todavía no tiene, y las dos están
   señaladas en la propia página en vez de escondidas aquí:

     GET /users/{username}
     GET /users/{username}/favorites

   más un `profileVisibility` en el esquema `User`. Mientras no exista,
   ningún perfil debería ser público: el valor por defecto es privado y
   esta página respeta esa decisión, no la supone. */

import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Cabecera from '@/components/Cabecera'
import Pie from '@/components/Pie'
import Lamina from '@/components/Lamina'
import Icono from '@/components/Icono'
import { favoritos, perfilPublico, seriesDe, haceCuanto } from '@/lib/perfil'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ alias: string }>
}): Promise<Metadata> {
  const { alias } = await params
  const p = await perfilPublico(alias)
  if (!p) return {}

  // Un perfil que no es público no se indexa ni se resume.
  if (p.visibilidad !== 'publico') {
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

  const publico = p.visibilidad === 'publico'
  const favs = publico ? await favoritos() : []
  const series = publico ? await seriesDe(favs.map((f) => f.animeId)) : new Map()

  const desde = new Date(p.createdAt).toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })

  const cifras = [
    { etiqueta: 'series', valor: String(p.cifras.series) },
    { etiqueta: 'episodios', valor: p.cifras.episodios.toLocaleString('es-ES') },
    { etiqueta: 'horas', valor: String(p.cifras.horas) },
  ]

  return (
    <>
      <a
        href="#principal"
        className="absolute left-margen -top-[100px] z-100 rounded-radio bg-ambar px-[1.1rem] py-[0.7rem] font-bold text-ambar-tinta no-underline transition-all duration-200 ease-sal focus:top-e2"
      >
        Saltar al contenido
      </a>

      <Cabecera />

      <main id="principal" className="mx-auto max-w-[1120px] px-margen">
        {/* ---------- Identidad ---------- */}
        <header className="flex items-start gap-e3 border-b border-borde pt-e4 pb-e4">
          <span
            aria-hidden="true"
            className="grid size-16 shrink-0 place-items-center rounded-full border border-borde-vivo bg-sala-700 font-display text-paso-3 text-hueso-70"
          >
            {p.username.slice(0, 2).toUpperCase()}
          </span>

          <div className="min-w-0">
            <h1 className="font-display text-paso-4 leading-none tracking-[-0.03em]">
              @{p.username}
            </h1>
            <p className="mt-[0.35rem] text-paso-1 text-hueso-45">En KUROBA desde {desde}</p>

            {publico && p.bio && (
              <p className="mt-e2 max-w-[62ch] text-paso-1 text-hueso-70">{p.bio}</p>
            )}

            {publico && (
              <dl className="mt-e3 flex flex-wrap items-baseline gap-x-e3 gap-y-e2">
                {cifras.map((c, i) => (
                  <div
                    key={c.etiqueta}
                    className={`flex items-baseline gap-[0.4rem] ${
                      i > 0 ? 'border-l border-borde pl-e3' : ''
                    }`}
                  >
                    <dd className="m-0 text-paso-2 font-semibold text-hueso tabular-nums">
                      {c.valor}
                    </dd>
                    <dt className="text-paso-0 text-hueso-45">{c.etiqueta}</dt>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </header>

        {/* ---------- Contenido, o el motivo de que no lo haya ---------- */}
        {publico ? (
          <section aria-labelledby="t-favoritos" className="mt-e5 mb-e6">
            <h2
              id="t-favoritos"
              className="mb-e3 text-paso-0 font-bold tracking-[0.11em] text-hueso-45 uppercase"
            >
              Favoritos
            </h2>

            {favs.length > 0 ? (
              <ul className="grid list-none grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-e3">
                {favs.map((f) => {
                  const serie = series.get(f.animeId)
                  return (
                    <li key={f.animeId}>
                      <Link
                        href={`/serie/${f.animeId}`}
                        className="group block no-underline"
                      >
                        <span className="relative block aspect-2/3 overflow-hidden rounded-radio bg-sala-700 shadow-baja transition-all duration-300 ease-sal group-hover:-translate-y-[4px] group-hover:shadow-alta">
                          {serie && <Lamina arte={serie.lamina} />}
                        </span>
                        <b className="mt-e2 block truncate text-paso-1 font-semibold text-hueso-70 transition-colors duration-150 ease-sal group-hover:text-hueso">
                          {serie?.titulo ?? f.animeId}
                        </b>
                        <span className="block text-paso-0 text-hueso-45">
                          {haceCuanto(f.addedAt)}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="rounded-radio border border-dashed border-borde-vivo px-e4 py-e5 text-center text-paso-1 text-hueso-45">
                @{p.username} todavía no ha marcado ningún favorito.
              </p>
            )}
          </section>
        ) : (
          <section className="mt-e5 mb-e6">
            <div className="mx-auto max-w-[46ch] rounded-radio border border-dashed border-borde-vivo px-e4 py-e6 text-center">
              <span
                aria-hidden="true"
                className="mx-auto mb-e3 grid size-12 place-items-center rounded-full border border-borde-vivo bg-sala-800 text-hueso-45"
              >
                <Icono nombre="candado" tam={20} />
              </span>
              <p className="text-paso-3 font-semibold">Este perfil es privado</p>
              <p className="mt-e2 text-paso-1 text-hueso-45">
                @{p.username} no ha hecho públicas sus listas. Solo se ve el alias y
                desde cuándo tiene cuenta.
              </p>
            </div>
          </section>
        )}

        <p className="mb-e6 border-t border-borde pt-e3 text-paso-0 text-hueso-45">
          Esta página necesita dos rutas que el backend todavía no expone —
          <code className="mx-[0.3rem] text-hueso-70">GET /users/{'{username}'}</code> y
          <code className="mx-[0.3rem] text-hueso-70">
            GET /users/{'{username}'}/favorites
          </code>
          — y un campo <code className="mx-[0.3rem] text-hueso-70">profileVisibility</code>{' '}
          en el esquema <code className="text-hueso-70">User</code>. Hasta que exista, el
          valor por defecto tiene que ser privado: publicar los favoritos de alguien que
          no ha podido elegirlo no es una función pendiente, es un descuido.
        </p>
      </main>

      <Pie />
    </>
  )
}
