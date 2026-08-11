/* Historial y colecciones del usuario.

   La estructura sigue al backend, no al revés. `/user/*` guarda tres
   colecciones con formas distintas —favoritos y watchlist son conjuntos
   planos, el historial va por episodio y paginado—, así que cada una
   recibe la topología que le corresponde: el historial en filas, porque
   es un registro que se recorre de arriba abajo, y los conjuntos en
   rejilla, porque sin progreso que enseñar lo único que distingue una
   entrada de otra es la carátula.

   No hay estado por serie. Una versión anterior ofrecía «viendo», «en
   pausa» y «abandonada», que la base de datos no puede almacenar.

   La pestaña de perfil se ha ido a /cuenta, que es una página entera con
   contraseña, correo, doble factor y sesiones abiertas. */

import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Icono from '@/components/Icono'
import TarjetaEpisodio from '@/components/TarjetaEpisodio'
import BotonQuitar from '@/components/BotonQuitar'
import VaciarHistorial from '@/components/VaciarHistorial'
import { quitarDeFavoritos, quitarDeWatchlist, vaciarHistorial } from '@/lib/acciones'
import {
  favoritos,
  historial,
  perfil,
  verDespues,
  type ObraGuardada,
  type VistaEpisodio,
} from '@/lib/perfil'
import { grupoDeDia, haceCuanto } from '@/lib/fechas'

export const metadata: Metadata = {
  title: 'Mi lista',
  description: 'Tu historial, tus favoritos y lo que dejaste para después.',
}

const VISTAS = [
  { id: 'historial', texto: 'Historial' },
  { id: 'favoritos', texto: 'Favoritos' },
  { id: 'despues', texto: 'Ver después' },
] as const

type Vista = (typeof VISTAS)[number]['id']

/* ------------------------------------------------------------
   Estado vacío
   ------------------------------------------------------------ */

function Vacio({ titulo, detalle }: { titulo: string; detalle: string }) {
  return (
    <div className="rounded-radio border border-dashed border-borde-vivo px-8 py-16 text-center">
      <p className="text-lg font-semibold">{titulo}</p>
      <p className="mx-auto mt-2 max-w-[46ch] text-sm text-tinta-tenue">{detalle}</p>
      <Link
        href="/explorar"
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-primario px-5 text-sm font-semibold text-primario-tinta no-underline transition-opacity duration-200 ease-sal hover:opacity-85"
      >
        <Icono nombre="brujula" tam={16} />
        Explorar el catálogo
      </Link>
    </div>
  )
}

/* ------------------------------------------------------------
   Historial
   ------------------------------------------------------------ */

async function Historial() {
  const pagina = await historial()

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

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-xs text-tinta-tenue cifras">
          {pagina.total} episodios registrados
          {pagina.paginas > 1 && (
            <>
              {' '}
              · página {pagina.pagina} de {pagina.paginas}
            </>
          )}
        </p>
        {/* Solo puede vaciar lo que tiene cargado: el backend no ofrece
            un borrado en bloque, así que va episodio por episodio. */}
        <VaciarHistorial
          cuantos={pagina.filas.length}
          accion={vaciarHistorial.bind(
            null,
            pagina.filas.map((f) => f.episodeId),
          )}
        />
      </div>

      {grupos.map((g) => (
        <section key={g.dia} className="mt-10 first:mt-0">
          <h3 className="mb-4 text-xs font-bold tracking-[0.11em] text-tinta-tenue uppercase">
            {g.dia}
          </h3>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-x-4 gap-y-6">
            {g.filas.map((f) => (
              <TarjetaEpisodio key={f.episodeId} vista={f} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------
   Conjuntos: favoritos y ver después
   ------------------------------------------------------------ */

/* El título y la imagen vienen dentro de la propia entrada, así que no
   hace falta resolver cada serie contra el catálogo: eran veinte llamadas
   por pantalla para datos que la API ya mandaba. */
function Carta({
  guardada,
  lista,
}: {
  guardada: ObraGuardada
  lista: 'favoritos' | 'despues'
}) {
  const quitar =
    lista === 'favoritos'
      ? quitarDeFavoritos.bind(null, guardada.animeId)
      : quitarDeWatchlist.bind(null, guardada.animeId)

  return (
    // El enlace no envuelve la tarjeta: el botón de quitar quedaría
    // dentro de un <a>, que es marcado inválido. Enlace estirado y botón
    // levantado por encima.
    <li className="group relative">
      <span className="relative block aspect-2/3 overflow-hidden rounded-radio bg-tarjeta">
        {guardada.imagen ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={guardada.imagen}
            alt=""
            loading="lazy"
            className="size-full object-cover transition-all duration-200 ease-out group-hover:opacity-75 group-hover:brightness-[0.7]"
          />
        ) : (
          <span className="block size-full bg-tarjeta" />
        )}
      </span>

      <b className="mt-2 block truncate text-sm font-semibold text-tinta">
        <Link
          href={`/serie/${guardada.animeId}`}
          className="text-inherit no-underline after:absolute after:inset-0"
        >
          {guardada.title}
        </Link>
      </b>
      <span className="block text-xs text-tinta-tenue">
        {haceCuanto(guardada.addedAt)}
      </span>

      <div className="absolute top-2 right-2 opacity-0 transition-opacity duration-200 ease-sal group-hover:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100">
        <BotonQuitar
          accion={quitar}
          etiqueta={`Quitar ${guardada.title} de ${
            lista === 'favoritos' ? 'favoritos' : 'ver después'
          }`}
        />
      </div>
    </li>
  )
}

function Conjunto({
  entradas,
  lista,
  vacio,
}: {
  entradas: ObraGuardada[]
  lista: 'favoritos' | 'despues'
  vacio: { titulo: string; detalle: string }
}) {
  if (entradas.length === 0) return <Vacio {...vacio} />

  return (
    <ul className="grid list-none grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-x-2 gap-y-6 p-0">
      {entradas.map((e) => (
        <Carta key={e.animeId} guardada={e} lista={lista} />
      ))}
    </ul>
  )
}

/* ------------------------------------------------------------ */

export default async function MiLista({
  searchParams,
}: {
  searchParams: Promise<{ v?: string }>
}) {
  const { v } = await searchParams
  const vista: Vista = VISTAS.some((x) => x.id === v) ? (v as Vista) : 'historial'

  // Sin sesión esta página no tiene nada que enseñar. Se manda a entrar
  // con el destino puesto, para volver aquí después.
  const p = await perfil()
  if (!p) redirect('/acceder?destino=%2Fmi-lista')

  const [favs, despues] = await Promise.all([favoritos(), verDespues()])

  const cuenta: Record<Vista, number | null> = {
    historial: null,
    favoritos: favs.length,
    despues: despues.length,
  }

  const alta = new Date(p.createdAt).toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })

  return (
    <div className="mx-auto max-w-[1120px] px-bleed pb-16">
      <header className="flex items-start gap-4 pt-8 pb-6">
        <span
          aria-hidden="true"
          className="grid size-14 shrink-0 place-items-center rounded-full border border-borde bg-apagado font-titulo text-base font-extrabold text-tinta-apagada"
        >
          {p.username.slice(0, 2).toUpperCase()}
        </span>

        <div className="min-w-0">
          <h1 className="font-titulo text-2xl leading-none font-extrabold tracking-[-0.02em]">
            {p.username}
          </h1>
          <p className="mt-1.5 flex flex-wrap items-baseline gap-x-3 text-sm text-tinta-tenue">
            <span>desde {alta}</span>
            <Link
              href={`/u/${p.username}`}
              className="font-semibold text-tinta-apagada no-underline transition-colors duration-150 ease-sal hover:text-tinta"
            >
              Ver mi perfil público
            </Link>
            <Link
              href="/cuenta"
              className="font-semibold text-tinta-apagada no-underline transition-colors duration-150 ease-sal hover:text-tinta"
            >
              Ajustes
            </Link>
          </p>

          {p.bio && (
            <p className="mt-3 max-w-[62ch] text-sm text-tinta-apagada">{p.bio}</p>
          )}
        </div>
      </header>

      {/* El correo sin verificar es lo único de esta página que pide una
          acción, así que se dice donde se ve y no escondido en un ajuste. */}
      {!p.isEmailVerified && (
        <p className="mb-6 flex flex-wrap items-center gap-2 rounded-radio border border-borde bg-tarjeta px-4 py-3 text-sm">
          <Icono nombre="candado" tam={15} className="text-tinta" />
          <span className="text-tinta-apagada">
            Tu correo todavía no está verificado.
          </span>
          <Link
            href="/cuenta"
            className="font-semibold text-primario no-underline hover:underline"
          >
            Ir a los ajustes
          </Link>
        </p>
      )}

      <nav
        aria-label="Secciones de la lista"
        className="flex flex-wrap gap-1 border-b border-borde"
      >
        {VISTAS.map((x) => {
          const activa = x.id === vista
          const n = cuenta[x.id]
          return (
            <Link
              key={x.id}
              href={x.id === 'historial' ? '/mi-lista' : `/mi-lista?v=${x.id}`}
              aria-current={activa ? 'page' : undefined}
              className={`-mb-px inline-flex items-baseline gap-2 border-b-2 px-4 py-3 text-sm font-medium no-underline transition-colors duration-200 ease-sal ${
                activa
                  ? 'border-primario text-tinta'
                  : 'border-transparent text-tinta-tenue hover:text-tinta'
              }`}
            >
              {x.texto}
              {n !== null && n > 0 && (
                <span className="text-xs font-normal text-tinta-tenue cifras">
                  {n}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <section className="mt-8">
        {vista === 'historial' && <Historial />}

        {vista === 'favoritos' && (
          <Conjunto
            entradas={favs}
            lista="favoritos"
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
            lista="despues"
            vacio={{
              titulo: 'Nada guardado para después',
              detalle:
                'Cuando encuentres algo que no te da tiempo a empezar, guárdalo y aparece aquí.',
            }}
          />
        )}
      </section>
    </div>
  )
}
