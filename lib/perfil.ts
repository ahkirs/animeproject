/* Datos de la cuenta.

   Las formas de este archivo son las del backend, no las que le venían
   bien a la maqueta. Están copiadas del esquema `User` y de las rutas
   `/user/*`, así que cuando haya sesión solo hay que cambiar el cuerpo de
   las funciones por un `fetch`: lo que consume la página no se entera.

   Un detalle que condiciona el diseño entero: el backend NO guarda un
   estado por serie. No existe «viendo», «en pausa» ni «abandonada».
   Guarda tres cosas distintas —favoritos, watchlist e historial por
   episodio—, y la página está montada sobre eso. */

import { MI_LISTA, USUARIO, obtenerSerie, resumenLista } from './catalogo'
import type { Serie } from './types'

/* ------------------------------------------------------------
   Formas del backend
   ------------------------------------------------------------ */

/** Quién puede ver un perfil. No existe todavía en el esquema `User`:
 *  hace falta añadirlo antes de que ningún perfil sea público, porque
 *  enseñar los favoritos de alguien sin que haya podido elegirlo no es
 *  un ajuste pendiente, es publicar sus datos sin permiso.
 *  El valor por defecto tiene que ser `privado`. */
export type Visibilidad = 'publico' | 'amigos' | 'privado'

/** Esquema `User` de la API, tal cual, más el campo de visibilidad que
 *  falta. */
export interface PerfilUsuario {
  id: string
  email: string
  username: string
  avatarUrl?: string
  bio?: string
  subscriptionStatus: string
  isEmailVerified: boolean
  /** ISO. */
  createdAt: string
  /** PENDIENTE en el backend. */
  profileVisibility: Visibilidad
}

/** Lo que devolvería `GET /users/{username}` — sin correo, sin estado de
 *  verificación y sin suscripción. Un perfil público enseña lo que su
 *  dueño quiere enseñar, no su ficha de cuenta. */
export interface PerfilPublico {
  username: string
  avatarUrl?: string
  bio?: string
  createdAt: string
  visibilidad: Visibilidad
  cifras: { series: number; episodios: number; horas: number }
}

/** Una entrada de `/user/favorites` o `/user/watchlist`. Las dos
 *  colecciones son planas: no llevan progreso ni puntuación. */
export interface ObraGuardada {
  animeId: string
  /** ISO. */
  addedAt: string
}

/** Una fila de `/user/history`. El backend hace upsert por episodio, así
 *  que hay como mucho una por episodio visto.
 *
 *  `POST /user/history` acepta hoy `animeId`, `episodeId`, `episodeTitle`
 *  y `progress` en segundos. La duración total NO se guarda, y por eso
 *  `duracionSeg` es opcional: sin ella se sabe cuánto se vio pero no
 *  cuánto queda, así que la interfaz enseña «empezado» en lugar de
 *  inventarse un porcentaje. Añadir `durationSeconds` al upsert es lo
 *  único que hace falta para que salga la barra. */
export interface VistaEpisodio {
  episodeId: string
  animeId: string
  episodio: number
  episodeTitle: string
  /** Segundo por el que se quedó. */
  segundo: number
  duracionSeg?: number
  /** ISO. */
  watchedAt: string
}

/** `/user/history` viene paginado. */
export interface PaginaHistorial {
  filas: VistaEpisodio[]
  total: number
  pagina: number
  paginas: number
}

/* ------------------------------------------------------------
   Datos de ejemplo mientras no hay sesión

   Se derivan de MI_LISTA para que la página se vea con contenido real
   del catálogo. Nada de esto sobrevive a la primera llamada autenticada.
   ------------------------------------------------------------ */

const AHORA = Date.parse('2026-08-08T21:00:00Z')
const HORA = 3_600_000

export async function perfil(): Promise<PerfilUsuario> {
  return {
    id: 'demo',
    email: 'adrian@ejemplo.com',
    username: USUARIO.alias,
    bio: 'Shōnen largo y ciencia ficción de los noventa. Llevo One Piece al día desde 2019.',
    subscriptionStatus: 'free',
    isEmailVerified: false,
    createdAt: '2026-08-01T10:00:00Z',
    profileVisibility: 'publico',
  }
}

/**
 * Perfil público de alguien, por su alias.
 *
 * Sería `GET /users/{username}`, que todavía no existe: hoy todas las
 * rutas de `/user` devuelven las del usuario autenticado. Devuelve nulo
 * cuando el alias no corresponde a nadie, para que la página responda
 * 404 en vez de enseñar un perfil vacío.
 */
export async function perfilPublico(alias: string): Promise<PerfilPublico | null> {
  const propio = await perfil()
  if (alias.toLowerCase() !== propio.username.toLowerCase()) return null

  const resumen = resumenLista()
  return {
    username: propio.username,
    avatarUrl: propio.avatarUrl,
    bio: propio.bio,
    createdAt: propio.createdAt,
    visibilidad: propio.profileVisibility,
    cifras: {
      series: resumen.series,
      episodios: resumen.episodios,
      horas: resumen.horas,
    },
  }
}

/** Favoritos: en la maqueta, lo que puntuaste alto. */
export async function favoritos(): Promise<ObraGuardada[]> {
  return MI_LISTA.filter((e) => (e.puntuacion ?? 0) >= 8).map((e, i) => ({
    animeId: e.serieId,
    addedAt: new Date(AHORA - (i + 2) * 24 * HORA).toISOString(),
  }))
}

/** Ver después: lo que está pendiente de empezar. */
export async function verDespues(): Promise<ObraGuardada[]> {
  return MI_LISTA.filter((e) => e.estado === 'pendiente' || e.estado === 'pausada').map(
    (e, i) => ({
      animeId: e.serieId,
      addedAt: new Date(AHORA - (i + 1) * 36 * HORA).toISOString(),
    }),
  )
}

/**
 * Historial paginado.
 *
 * Se inventa hacia atrás desde el último episodio visto de cada serie,
 * separando las vistas unas horas, para que la agrupación por día tenga
 * algo que agrupar. Es lo único de este archivo que no sale de MI_LISTA
 * tal cual, y desaparece en cuanto responda `/user/history`.
 */
export async function historial(pagina = 1, porPagina = 20): Promise<PaginaHistorial> {
  const todas: VistaEpisodio[] = []
  let desplazamiento = 0

  for (const entrada of MI_LISTA) {
    if (entrada.episodiosVistos === 0) continue
    const cuantas = Math.min(entrada.episodiosVistos, 4)

    for (let i = 0; i < cuantas; i++) {
      const numero = entrada.episodiosVistos - i
      desplazamiento += 5

      // La mitad van sin duración a propósito: es lo que devuelve el
      // backend hoy, y así se ve en pantalla qué se pierde sin ese campo.
      const conDuracion = numero % 2 === 0

      todas.push({
        episodeId: `${entrada.serieId}-${numero}`,
        animeId: entrada.serieId,
        episodio: numero,
        episodeTitle: `Episodio ${numero}`,
        segundo: i === 0 ? 640 : 1380,
        duracionSeg: conDuracion ? 1380 : undefined,
        watchedAt: new Date(AHORA - desplazamiento * HORA).toISOString(),
      })
    }
  }

  todas.sort((a, b) => b.watchedAt.localeCompare(a.watchedAt))

  const desde = (pagina - 1) * porPagina
  return {
    filas: todas.slice(desde, desde + porPagina),
    total: todas.length,
    pagina,
    paginas: Math.max(1, Math.ceil(todas.length / porPagina)),
  }
}

/* ------------------------------------------------------------
   Ayudas de presentación
   ------------------------------------------------------------ */

/** Resuelve las series de una tanda de una vez. Sin esto, una rejilla de
 *  veinte carátulas serían veinte llamadas encadenadas. */
export async function seriesDe(ids: string[]): Promise<Map<string, Serie>> {
  const unicos = [...new Set(ids)]
  const series = await Promise.all(unicos.map((id) => obtenerSerie(id)))

  const mapa = new Map<string, Serie>()
  unicos.forEach((id, i) => {
    const s = series[i]
    if (s) mapa.set(id, s)
  })
  return mapa
}

/** «hace 2 h», «ayer», «hace 3 días». Se calcula en el servidor, que es
 *  donde se pinta: esta página no hidrata nada. */
export function haceCuanto(iso: string, referencia = AHORA): string {
  const minutos = Math.round((referencia - Date.parse(iso)) / 60_000)
  if (minutos < 1) return 'ahora mismo'
  if (minutos < 60) return `hace ${minutos} min`

  const horas = Math.round(minutos / 60)
  if (horas < 24) return `hace ${horas} h`

  const dias = Math.round(horas / 24)
  if (dias === 1) return 'ayer'
  if (dias < 30) return `hace ${dias} días`

  const meses = Math.round(dias / 30)
  return meses === 1 ? 'hace un mes' : `hace ${meses} meses`
}

/** Etiqueta del grupo al que pertenece una vista: Hoy, Ayer, o la fecha. */
export function grupoDeDia(iso: string, referencia = AHORA): string {
  const dia = (t: number) => Math.floor(t / 86_400_000)
  const diferencia = dia(referencia) - dia(Date.parse(iso))

  if (diferencia <= 0) return 'Hoy'
  if (diferencia === 1) return 'Ayer'
  if (diferencia < 7) return 'Esta semana'
  if (diferencia < 30) return 'Este mes'
  return new Date(iso).toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
