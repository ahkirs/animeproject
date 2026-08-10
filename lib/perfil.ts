/* Datos de la cuenta.

   Las formas son las del backend, no las que le venían bien a la
   maqueta. Cuando no hay sesión, todo devuelve vacío en lugar de fallar:
   para una página, «no has entrado» es un estado que se pinta.

   Un detalle que condiciona el diseño entero: el backend NO guarda un
   estado por serie. No existe «viendo», «en pausa» ni «abandonada».
   Guarda tres cosas distintas —favoritos, watchlist e historial por
   episodio—, y la página está montada sobre eso.

   Otro detalle que ahorra mucho: favoritos, watchlist e historial ya
   traen el título y la imagen incrustados. No hay que resolver cada
   serie contra el catálogo, que eran veinte llamadas por pantalla. */

import { pedirConSesion } from './sesion'
import { urlImagenProxy } from './api'
import type { EnCurso } from './types'

/* ------------------------------------------------------------
   Formas del backend
   ------------------------------------------------------------ */

/** Valores del backend, en mayúsculas. El de partida es `PRIVATE`. */
export type Visibilidad = 'PUBLIC' | 'FRIENDS' | 'PRIVATE'

/** Esquema `User` de la API. */
export interface PerfilUsuario {
  id: string
  email: string
  username: string
  avatarUrl?: string
  bio?: string
  subscriptionStatus: string
  isEmailVerified: boolean
  createdAt: string
  profileVisibility: Visibilidad
  /** Si la cuenta tiene 2FA activo. Va opcional porque el backend no
   *  documenta el esquema de /user/profile y el nombre puede variar; la
   *  página de cuenta lo trata como «apagado» si no llega. */
  twoFactorEnabled?: boolean
}

/** Una entrada de `/user/favorites` o `/user/watchlist`. Las dos
 *  colecciones son planas: no llevan progreso. */
export interface ObraGuardada {
  animeId: string
  title: string
  /** Ya resuelta a absoluta y lista para un <img>. */
  imagen: string | null
  rating?: number
  type?: string
  addedAt: string
}

/** Una fila de `/user/history`. El backend hace upsert por episodio. */
export interface VistaEpisodio {
  episodeId: string
  animeId: string
  animeTitle: string
  episodeTitle: string
  imagen: string | null
  /** Segundos vistos. */
  segundo: number
  /** Duración total. Opcional: sin ella no se puede decir cuánto queda. */
  duracionSeg?: number
  watchedAt: string
}

export interface PaginaHistorial {
  filas: VistaEpisodio[]
  total: number
  pagina: number
  paginas: number
}

/** Lo que devuelve `GET /users/{username}`. `stats` viene nulo cuando el
 *  perfil no es público y no eres su dueño. */
export interface PerfilPublico {
  username: string
  avatarUrl?: string
  bio?: string
  createdAt: string
  visibilidad: Visibilidad
  cifras: { series: number; episodios: number; horas: number } | null
}

/* ------------------------------------------------------------
   Lecturas
   ------------------------------------------------------------ */

export async function perfil(): Promise<PerfilUsuario | null> {
  return pedirConSesion<PerfilUsuario>('/user/profile')
}

/** Las dos colecciones planas comparten forma, así que comparten mapeo. */
function aGuardada(fila: Record<string, unknown>): ObraGuardada {
  return {
    animeId: String(fila.animeId ?? ''),
    title: String(fila.title ?? fila.animeTitle ?? ''),
    imagen: urlImagenProxy(fila.image as string | undefined),
    rating: typeof fila.rating === 'number' ? fila.rating : undefined,
    type: typeof fila.type === 'string' ? fila.type : undefined,
    addedAt: String(fila.createdAt ?? fila.addedAt ?? new Date().toISOString()),
  }
}

async function coleccion(ruta: string): Promise<ObraGuardada[]> {
  const datos = await pedirConSesion<unknown>(ruta)
  if (!datos) return []
  const filas = Array.isArray(datos)
    ? datos
    : ((datos as { items?: unknown[] }).items ?? [])
  return (filas as Record<string, unknown>[]).map(aGuardada)
}

export function favoritos(): Promise<ObraGuardada[]> {
  return coleccion('/user/favorites')
}

export function verDespues(): Promise<ObraGuardada[]> {
  return coleccion('/user/watchlist')
}

export async function historial(pagina = 1, porPagina = 24): Promise<PaginaHistorial> {
  const vacio: PaginaHistorial = { filas: [], total: 0, pagina: 1, paginas: 1 }

  const datos = await pedirConSesion<Record<string, unknown>>(
    `/user/history?page=${pagina}&limit=${porPagina}`,
  )
  if (!datos) return vacio

  const crudas = (Array.isArray(datos) ? datos : (datos.items ?? datos.results ?? [])) as Record<
    string,
    unknown
  >[]

  const filas: VistaEpisodio[] = crudas.map((f) => ({
    episodeId: String(f.episodeId ?? ''),
    animeId: String(f.animeId ?? ''),
    animeTitle: String(f.animeTitle ?? ''),
    episodeTitle: String(f.episodeTitle ?? ''),
    imagen: urlImagenProxy(f.image as string | undefined),
    segundo: Number(f.progress ?? 0),
    duracionSeg: typeof f.duration === 'number' && f.duration > 0 ? f.duration : undefined,
    watchedAt: String(f.updatedAt ?? f.watchedAt ?? f.createdAt ?? new Date().toISOString()),
  }))

  const total = Number(datos.total ?? filas.length)
  return {
    filas,
    total,
    pagina: Number(datos.page ?? pagina),
    paginas: Number(datos.pages ?? Math.max(1, Math.ceil(total / porPagina))),
  }
}

/** Cuenta rápida para las pestañas, sin traerse las listas enteras. */
export async function resumenCuenta() {
  const [favs, despues, hist] = await Promise.all([
    favoritos(),
    verDespues(),
    historial(1, 1),
  ])
  return { favoritos: favs.length, despues: despues.length, episodios: hist.total }
}

/**
 * Perfil público de alguien por su alias.
 *
 * No pide sesión, pero se manda igualmente si la hay: el backend enseña
 * más cosas al dueño que a un desconocido.
 */
export async function perfilPublico(alias: string): Promise<PerfilPublico | null> {
  const datos = await pedirSinSesion<Record<string, unknown>>(
    `/users/${encodeURIComponent(alias)}`,
  )
  if (!datos) return null

  const stats = datos.stats as Record<string, number> | null | undefined

  return {
    username: String(datos.username ?? alias),
    avatarUrl: (datos.avatarUrl as string) || undefined,
    bio: (datos.bio as string) || undefined,
    createdAt: String(datos.createdAt ?? new Date().toISOString()),
    visibilidad: (datos.profileVisibility as Visibilidad) ?? 'PRIVATE',
    cifras: stats
      ? {
          series: Number(stats.series ?? stats.favorites ?? 0),
          episodios: Number(stats.episodes ?? stats.episodios ?? 0),
          horas: Number(stats.hours ?? stats.horas ?? 0),
        }
      : null,
  }
}

/** Favoritos públicos de alguien. Devuelve vacío si su perfil no lo es:
 *  el backend responde 403 y eso no es un error que enseñar. */
export async function favoritosPublicos(alias: string): Promise<ObraGuardada[]> {
  const datos = await pedirSinSesion<unknown>(
    `/users/${encodeURIComponent(alias)}/favorites`,
  )
  if (!datos) return []
  const filas = Array.isArray(datos) ? datos : ((datos as { items?: unknown[] }).items ?? [])
  return (filas as Record<string, unknown>[]).map(aGuardada)
}

/* Estas dos rutas son públicas, pero se mandan las credenciales si las
   hay. Se hace aquí y no en sesion.ts porque allí «sin token» significa
   «no hay nada que pedir», y aquí significa «pídelo igual». */
async function pedirSinSesion<T>(ruta: string): Promise<T | null> {
  const { API_CUENTA } = await import('./api')
  const { tokenDeAcceso } = await import('./sesion')
  const token = await tokenDeAcceso()

  try {
    const respuesta = await fetch(`${API_CUENTA}${ruta}`, {
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: 'no-store',
    })
    if (!respuesta.ok) return null
    const cuerpo = (await respuesta.json()) as { success: boolean; data: T }
    return cuerpo.success ? cuerpo.data : null
  } catch {
    return null
  }
}

/* ------------------------------------------------------------
   SEGUIR VIENDO

   Vive aquí y no en lib/catalogo.ts —que es donde estaba— por dos
   razones. La de fondo: esto lee el historial, así que pertenece a los
   datos de la cuenta, no al catálogo. La práctica: catalogo.ts lo
   importan componentes de cliente (el buscador usa `minimoParaBuscar`),
   y en cuanto tiraba de perfil.ts arrastraba lib/sesion.ts —que lleva
   `server-only`— al paquete del navegador y la compilación se caía.
   ------------------------------------------------------------ */

/** Las últimas obras empezadas y sin terminar, para el riel de la
 *  portada.
 *
 *  El historial llega por episodio, y una serie que se está viendo tiene
 *  una fila por cada capítulo visto. Aquí se agrupa por obra y se
 *  conserva solo la vista más reciente de cada una: enseñar tres
 *  episodios seguidos de la misma serie sería tres veces la misma
 *  tarjeta.
 *
 *  Se descarta lo que está prácticamente terminado (>92%): quien acaba
 *  de ver los créditos no quiere «seguir viendo» eso, y si no se filtra,
 *  el riel se llena de episodios acabados. */
export async function enCurso(limite = 12): Promise<EnCurso[]> {
  // Se piden más filas de las que caben porque muchas colapsarán al
  // agrupar por serie.
  const pagina = await historial(1, limite * 4)

  const porSerie = new Map<string, EnCurso>()

  for (const fila of pagina.filas) {
    if (porSerie.has(fila.animeId)) continue

    const progreso =
      fila.duracionSeg && fila.duracionSeg > 0
        ? Math.min(100, Math.round((fila.segundo / fila.duracionSeg) * 100))
        : 0
    if (progreso > 92) continue

    porSerie.set(fila.animeId, {
      serieId: fila.animeId,
      serieTitulo: fila.animeTitle,
      episodio: fila.episodeTitle,
      restanteMin: fila.duracionSeg
        ? Math.max(0, Math.round((fila.duracionSeg - fila.segundo) / 60))
        : null,
      progreso,
      lamina: fila.imagen ?? 'panoramica-obra',
    })

    if (porSerie.size >= limite) break
  }

  return [...porSerie.values()]
}
