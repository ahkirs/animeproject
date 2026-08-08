/* Perfil y colecciones del usuario.

   La estructura sigue al backend, no al revés. `/user/*` guarda tres
   colecciones con formas distintas —favoritos y watchlist son conjuntos
   planos, el historial va por episodio y paginado—, así que cada una
   recibe la topología que le corresponde: el historial en filas, porque
   es un registro que se recorre de arriba abajo, y los conjuntos en
   rejilla, porque sin progreso que enseñar lo único que distingue una
   entrada de otra es la carátula.

   No hay estado por serie. La versión anterior ofrecía «viendo», «en
   pausa» y «abandonada», que la base de datos no puede almacenar. */

import Link from 'next/link'
import type { Metadata } from 'next'
import Cabecera from '@/components/Cabecera'
import Pie from '@/components/Pie'
import Lamina from '@/components/Lamina'
import Icono from '@/components/Icono'
import TarjetaEpisodio from '@/components/TarjetaEpisodio'
import { USUARIO, resumenLista } from '@/lib/catalogo'
import {
  favoritos,
  grupoDeDia,
  haceCuanto,
  historial,
  perfil,
  seriesDe,
  verDespues,
  type ObraGuardada,
  type VistaEpisodio,
} from '@/lib/perfil'
import type { Serie } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Mi cuenta',
  description: 'Tu historial, tus favoritos y lo que dejaste para después.',
}

/* ------------------------------------------------------------
   Vistas
   ------------------------------------------------------------ */

const VISTAS = [
  { id: 'historial', texto: 'Historial' },
  { id: 'favoritos', texto: 'Favoritos' },
  { id: 'despues', texto: 'Ver después' },
  { id: 'perfil', texto: 'Perfil' },
] as const

type Vista = (typeof VISTAS)[number]['id']

/** Cuando el catálogo no resuelve un id —el proveedor cambió la URL, o
 *  está caído— la entrada sigue siendo cierta. Se enseña con el nombre
 *  sacado del propio identificador en lugar de desaparecer. */
function nombreDeReserva(animeId: string): string {
  const partes = animeId.split('-').slice(1)
  if (partes.length === 0) return animeId
  const texto = partes.join(' ')
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

/* ------------------------------------------------------------
   Cabecera de identidad

   Identidad y cifras van juntas y ancladas al mismo borde. Las cifras
   son una tira compacta y no cuatro números de titular: en una página
   que se abre para seguir viendo algo, el dato importa como contexto,
   no como portada.
   ------------------------------------------------------------ */

function TiraDeCifras({
  cifras,
}: {
  cifras: { etiqueta: string; valor: string }[]
}) {
  return (
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
  )
}

/* ------------------------------------------------------------
   Historial
   ------------------------------------------------------------ */

async function Historial() {
  const pagina = await historial()
  const series = await seriesDe(pagina.filas.map((f) => f.animeId))

  if (pagina.filas.length === 0) {
    return (
      <Vacio
        titulo="Todavía no has visto nada"
        detalle="Cuando empieces un episodio aparecerá aquí, con el minuto por el que ibas."
      />
    )
  }

  // Agrupar conservando el orden: las vistas ya llegan de más reciente a
  // más antigua, así que basta con cortar cuando cambia la etiqueta.
  const grupos: { dia: string; filas: VistaEpisodio[] }[] = []
  for (const fila of pagina.filas) {
    const dia = grupoDeDia(fila.watchedAt)
    const ultimo = grupos.at(-1)
    if (ultimo?.dia === dia) ultimo.filas.push(fila)
    else grupos.push({ dia, filas: [fila] })
  }

  const sinDuracion = pagina.filas.filter((f) => f.duracionSeg == null).length

  return (
    <div>
      <div className="mb-e4 flex flex-wrap items-baseline justify-between gap-e2">
        <p className="text-paso-0 text-hueso-45 tabular-nums">
          {pagina.total} episodios registrados
          {pagina.paginas > 1 && (
            <> · página {pagina.pagina} de {pagina.paginas}</>
          )}
        </p>
        <button
          type="button"
          className="cursor-pointer border-0 bg-transparent p-0 text-paso-0 font-semibold tracking-[0.06em] text-hueso-45 uppercase transition-colors duration-200 ease-sal hover:text-rojo"
        >
          Borrar historial
        </button>
      </div>

      {grupos.map((g) => (
        <section key={g.dia} className="mt-e5 first:mt-0">
          <h3 className="mb-e3 text-paso-0 font-bold tracking-[0.11em] text-hueso-45 uppercase">
            {g.dia}
          </h3>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-x-e3 gap-y-e4">
            {g.filas.map((f) => (
              <TarjetaEpisodio
                key={f.episodeId}
                vista={f}
                serie={series.get(f.animeId)}
                nombreDeReserva={nombreDeReserva(f.animeId)}
              />
            ))}
          </div>
        </section>
      ))}

      {/* Se dice en la propia pantalla, no en un comentario del código:
          las tarjetas marcadas «Empezado» son las que no pueden enseñar
          barra porque falta el dato. */}
      {sinDuracion > 0 && (
        <p className="mt-e5 border-t border-borde pt-e3 text-paso-0 text-hueso-45">
          {sinDuracion} de estos episodios salen como «empezado» y sin barra: el
          historial guarda los segundos vistos pero no la duración del episodio.
          Añadiendo <code className="text-hueso-70">durationSeconds</code> al upsert de{' '}
          <code className="text-hueso-70">POST /user/history</code> pasan a mostrar
          cuánto queda.
        </p>
      )}
    </div>
  )
}

/* ------------------------------------------------------------
   Conjuntos: favoritos y ver después
   ------------------------------------------------------------ */

function Carta({ guardada, serie }: { guardada: ObraGuardada; serie?: Serie }) {
  const titulo = serie?.titulo ?? nombreDeReserva(guardada.animeId)

  return (
    <li>
      <Link href={`/serie/${guardada.animeId}`} className="group block no-underline">
        <span className="relative block aspect-2/3 overflow-hidden rounded-radio bg-sala-700 shadow-baja transition-all duration-300 ease-sal group-hover:-translate-y-[4px] group-hover:shadow-alta">
          {serie && <Lamina arte={serie.lamina} />}
        </span>

        <b className="mt-e2 block truncate text-paso-1 font-semibold text-hueso-70 transition-colors duration-150 ease-sal group-hover:text-hueso">
          {titulo}
        </b>
        <span className="block text-paso-0 text-hueso-45">
          {haceCuanto(guardada.addedAt)}
        </span>
      </Link>
    </li>
  )
}

async function Conjunto({
  entradas,
  vacio,
}: {
  entradas: ObraGuardada[]
  vacio: { titulo: string; detalle: string }
}) {
  if (entradas.length === 0) return <Vacio {...vacio} />

  const series = await seriesDe(entradas.map((e) => e.animeId))

  return (
    <ul className="grid list-none grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-e3">
      {entradas.map((e) => (
        <Carta key={e.animeId} guardada={e} serie={series.get(e.animeId)} />
      ))}
    </ul>
  )
}

/* ------------------------------------------------------------
   Perfil
   ------------------------------------------------------------ */

async function FichaPerfil() {
  const p = await perfil()

  const campos = [
    { k: 'Nombre de usuario', v: p.username },
    { k: 'Correo', v: p.email },
    {
      k: 'Cuenta creada',
      v: new Date(p.createdAt).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }),
    },
    { k: 'Suscripción', v: p.subscriptionStatus === 'free' ? 'Gratuita' : p.subscriptionStatus },
  ]

  return (
    <div className="max-w-[62ch]">
      <dl className="grid gap-0">
        {campos.map((c) => (
          <div
            key={c.k}
            className="grid grid-cols-[12rem_minmax(0,1fr)] gap-e3 border-b border-borde py-e3 max-[560px]:grid-cols-1 max-[560px]:gap-[0.2rem]"
          >
            <dt className="text-paso-1 text-hueso-45">{c.k}</dt>
            <dd className="m-0 text-paso-1 text-hueso">{c.v}</dd>
          </div>
        ))}

        <div className="grid grid-cols-[12rem_minmax(0,1fr)] gap-e3 border-b border-borde py-e3 max-[560px]:grid-cols-1 max-[560px]:gap-[0.2rem]">
          <dt className="text-paso-1 text-hueso-45">Biografía</dt>
          <dd className="m-0 text-paso-1 text-hueso">
            {p.bio || <span className="text-hueso-45 italic">Sin escribir</span>}
          </dd>
        </div>
      </dl>

      <div className="mt-e4 flex flex-wrap gap-e2">
        <button
          type="button"
          disabled
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-radio border border-borde-vivo bg-hueso/6 px-[1.1rem] py-[0.6rem] text-paso-1 font-semibold text-hueso opacity-50"
        >
          <Icono nombre="ajustes" tam={15} />
          Editar perfil
        </button>
        <button
          type="button"
          disabled
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-radio border border-borde-vivo px-[1.1rem] py-[0.6rem] text-paso-1 font-semibold text-hueso-70 opacity-50"
        >
          <Icono nombre="candado" tam={15} />
          Cambiar contraseña
        </button>
      </div>

      <p className="mt-e3 text-paso-0 text-hueso-45">
        Los dos botones quedan desactivados hasta que haya sesión. Detrás están
        <code className="mx-[0.3rem] text-hueso-70">PUT /user/profile</code> y
        <code className="mx-[0.3rem] text-hueso-70">PUT /user/change-password</code>.
      </p>
    </div>
  )
}

/* ------------------------------------------------------------
   Estado vacío
   ------------------------------------------------------------ */

function Vacio({ titulo, detalle }: { titulo: string; detalle: string }) {
  return (
    <div className="rounded-radio border border-dashed border-borde-vivo px-e4 py-e6 text-center">
      <p className="text-paso-3 font-semibold">{titulo}</p>
      <p className="mx-auto mt-e2 max-w-[46ch] text-paso-1 text-hueso-45">{detalle}</p>
      <Link
        href="/explorar"
        className="mt-e4 inline-flex items-center gap-2 rounded-radio bg-ambar px-[1.35rem] py-3 text-paso-1 font-semibold text-ambar-tinta no-underline transition-colors duration-200 ease-sal hover:bg-ambar-claro"
      >
        <Icono nombre="cinta" tam={16} />
        Explorar el catálogo
      </Link>
    </div>
  )
}

/* ------------------------------------------------------------
   Página
   ------------------------------------------------------------ */

export default async function MiCuenta({
  searchParams,
}: {
  searchParams: Promise<{ v?: string }>
}) {
  const { v } = await searchParams
  const vista: Vista = VISTAS.some((x) => x.id === v) ? (v as Vista) : 'historial'

  const p = await perfil()
  const resumen = resumenLista()
  const [favs, despues] = await Promise.all([favoritos(), verDespues()])

  const cuenta: Record<Vista, number | null> = {
    historial: null,
    favoritos: favs.length,
    despues: despues.length,
    perfil: null,
  }

  const cifras = [
    { etiqueta: 'series', valor: String(resumen.series) },
    { etiqueta: 'episodios', valor: resumen.episodios.toLocaleString('es-ES') },
    { etiqueta: 'horas', valor: String(resumen.horas) },
    {
      etiqueta: 'nota media',
      valor:
        resumen.media !== undefined
          ? resumen.media.toLocaleString('es-ES', {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })
          : '—',
    },
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
        <header className="flex items-start gap-e3 pt-e4 pb-e4">
          <span
            aria-hidden="true"
            className="grid size-14 shrink-0 place-items-center rounded-full border border-borde-vivo bg-sala-700 font-display text-paso-2 text-hueso-70"
          >
            {USUARIO.iniciales}
          </span>

          <div className="min-w-0">
            <h1 className="font-display text-paso-4 leading-none tracking-[-0.03em]">
              {USUARIO.nombre}
            </h1>
            <p className="mt-[0.35rem] flex flex-wrap items-baseline gap-x-e2 text-paso-1 text-hueso-45">
              <span>
                @{p.username} · desde {USUARIO.desde}
              </span>
              <Link
                href={`/u/${p.username}`}
                className="font-semibold text-hueso-70 underline underline-offset-2 transition-colors duration-150 ease-sal hover:text-ambar"
              >
                Ver mi perfil público
              </Link>
            </p>

            {p.bio && (
              <p className="mt-e2 max-w-[62ch] text-paso-1 text-hueso-70">{p.bio}</p>
            )}

            <TiraDeCifras cifras={cifras} />
          </div>
        </header>

        {/* El correo sin verificar es lo único de esta página que pide
            una acción, así que se dice donde se ve y no en un ajuste. */}
        {!p.isEmailVerified && (
          <p className="mb-e4 flex flex-wrap items-center gap-e2 rounded-radio border border-borde-vivo bg-sala-800 px-e3 py-e2 text-paso-1">
            <Icono nombre="candado" tam={15} className="text-ambar" />
            <span className="text-hueso-70">
              Tu correo todavía no está verificado.
            </span>
            <button
              type="button"
              className="cursor-pointer border-0 bg-transparent p-0 font-semibold text-ambar underline underline-offset-2 hover:text-ambar-claro"
            >
              Reenviar el correo
            </button>
          </p>
        )}

        {/* ---------- Colecciones ---------- */}
        <nav
          aria-label="Secciones de la cuenta"
          className="flex flex-wrap gap-e3 border-b border-borde"
        >
          {VISTAS.map((x) => {
            const activa = x.id === vista
            const n = cuenta[x.id]
            return (
              <Link
                key={x.id}
                href={x.id === 'historial' ? '/mi-lista' : `/mi-lista?v=${x.id}`}
                aria-current={activa ? 'page' : undefined}
                className={`-mb-px inline-flex items-baseline gap-2 border-b-2 pb-e2 text-paso-1 font-semibold no-underline transition-colors duration-200 ease-sal ${
                  activa
                    ? 'border-ambar text-hueso'
                    : 'border-transparent text-hueso-45 hover:text-hueso'
                }`}
              >
                {x.texto}
                {n !== null && n > 0 && (
                  <span className="text-paso-0 font-normal text-hueso-45 tabular-nums">
                    {n}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <section className="mt-e4 mb-e6">
          {vista === 'historial' && <Historial />}

          {vista === 'favoritos' && (
            <Conjunto
              entradas={favs}
              vacio={{
                titulo: 'Sin favoritos',
                detalle:
                  'Marca una serie como favorita y la tendrás aquí, sin buscarla otra vez.',
              }}
            />
          )}

          {vista === 'despues' && (
            <Conjunto
              entradas={despues}
              vacio={{
                titulo: 'Nada guardado para después',
                detalle:
                  'Cuando encuentres algo que no te da tiempo a empezar, guárdalo y aparece aquí.',
              }}
            />
          )}

          {vista === 'perfil' && <FichaPerfil />}
        </section>

        <p className="mb-e6 text-paso-0 text-hueso-45">
          Los datos son de ejemplo: todavía no hay sesión. Las formas ya son las de
          <code className="mx-[0.3rem] text-hueso-70">/user/history</code>,
          <code className="mr-[0.3rem] text-hueso-70">/user/favorites</code> y
          <code className="mr-[0.3rem] text-hueso-70">/user/watchlist</code>, así que
          conectarlas es cambiar el cuerpo de las funciones de
          <code className="ml-[0.3rem] text-hueso-70">lib/perfil.ts</code>.
        </p>
      </main>

      <Pie />
    </>
  )
}
