/* Cliente del scraper (https://backend-anime-production-7f7c.up.railway.app).
   Es el único archivo que habla con la red; el resto del catálogo
   consume las funciones de aquí y no se entera de la API.

   Nota: en Next.js 16 el fetch no cachea por defecto. Estas funciones
   pasan revalidate para que las páginas del servidor se beneficien de
   ISR sin estropear los datos que cambian a menudo (episodios nuevos). */

import type {
  ApiAnimeInfo,
  ApiCatalogo,
  ApiEnlacesEpisodio,
  ApiResultado,
  ApiRespuesta,
  Proveedor,
  VarianteAudio,
} from './api-types'

export const API_BASE =
  process.env.API_BASE ?? 'https://backend-anime-production-7f7c.up.railway.app/api/v1'

/** Base de todo lo que NO es el scraper.
 *
 *  Solo el catálogo cuelga de /v1: `/api/v1/anime/*`. La cuenta, la
 *  autenticación, los perfiles públicos, los comentarios y las notas van
 *  directos bajo `/api`. Pedirlos con el /v1 delante devuelve 404, y un
 *  404 no se distingue de «no existe» sin mirarlo con lupa. */
export const API_CUENTA = API_BASE.replace(/\/v1\/?$/, '')

/** Segundos que se conserva en caché una respuesta. */
export const REVALIDAR_CATALOGO = 60 * 60 // 1 h
export const REVALIDAR_EPISODIO = 60 * 15 // 15 min
export const REVALIDAR_BUSQUEDA = 60 * 5 // 5 min

export class ApiError extends Error {
  status?: number

  constructor(mensaje: string, status?: number) {
    super(mensaje)
    this.name = 'ApiError'
    this.status = status
  }
}

interface ParametrosConsulta {
  [clave: string]: string | number | undefined
}

/** Origen del backend, sin la parte de la ruta.
 *
 *  Hace falta separado de API_BASE porque API_BASE ya termina en
 *  /api/v1 y las imágenes llegan como rutas que también empiezan por
 *  /api/v1. Concatenar las dos daría /api/v1/api/v1/... */
const API_ORIGEN = new URL(API_BASE).origin

/** Parámetro con el que envolver una URL suelta, para los casos en que
 *  la API devuelva la dirección del CDN en lugar de la ruta ya armada.
 *  Es `url` y no `u`: `u` espera un token firmado que solo sabe generar
 *  el backend, así que desde aquí no se puede construir. */
const PARAM_ENVOLTORIO = process.env.API_IMAGE_PARAM ?? 'url'

/**
 * Deja lista para un <img> la imagen que devuelve la API.
 *
 * No construye la URL del proxy: eso lo hace el backend, que entrega el
 * campo `image` ya montado con un token opaco —
 * `/api/v1/anime/image-proxy?u=4S5DFco...`— y ese string se usa tal cual.
 * Aquí solo se resuelve a absoluta, porque llega relativa y si no el
 * navegador la buscaría en el dominio de este sitio.
 *
 * El tercer caso es de respaldo: si algún proveedor devolviera todavía
 * la dirección del CDN a pelo, se envuelve para no depender de que ese
 * dominio permita enlaces desde fuera.
 */
export function urlImagenProxy(imagen: string | null | undefined): string | null {
  if (!imagen) return null

  const texto = imagen.trim()
  if (texto === '') return null

  // Ya viene del backend, montada y con su token.
  if (texto.startsWith('/')) return `${API_ORIGEN}${texto}`

  // Absoluta y ya apunta al proxy: se deja intacta.
  if (texto.includes('/anime/image-proxy')) return texto

  // Dirección suelta de un CDN: se envuelve.
  if (texto.startsWith('http')) {
    return `${API_BASE}/anime/image-proxy?${PARAM_ENVOLTORIO}=${encodeURIComponent(texto)}`
  }

  return null
}

async function peticion<T>(
  ruta: string,
  parametros: ParametrosConsulta = {},
  { revalidate }: { revalidate?: number } = {},
): Promise<T> {
  const url = new URL(`${API_BASE}${ruta}`)
  for (const [clave, valor] of Object.entries(parametros)) {
    if (valor !== undefined && valor !== '') url.searchParams.set(clave, String(valor))
  }

  let respuesta: Response
  try {
    respuesta = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: revalidate ? { revalidate } : undefined,
    })
  } catch (causa) {
    throw new ApiError(
      `No se pudo contactar con el servidor (${url.origin}).`,
      undefined,
    )
  }

  if (!respuesta.ok) {
    throw new ApiError(`La API respondió ${respuesta.status}.`, respuesta.status)
  }

  const cuerpo = (await respuesta.json()) as ApiRespuesta<T>
  if (!cuerpo.success) {
    throw new ApiError(cuerpo.error, cuerpo.status)
  }
  return cuerpo.data
}

export interface BusquedaApi {
  query: string
  results: ApiResultado[]
}

/** Búsqueda de anime por título. */
export function apiBuscar(consulta: string): Promise<BusquedaApi> {
  return peticion<BusquedaApi>(
    '/anime/search',
    { q: consulta },
    { revalidate: REVALIDAR_BUSQUEDA },
  )
}

/** Ficha completa de un anime (episodios incluidos). Recibe la URL de
 *  la serie tal y como viene en los resultados. */
export function apiInfo(url: string): Promise<ApiAnimeInfo> {
  return peticion<ApiAnimeInfo>('/anime/info', { url }, { revalidate: REVALIDAR_CATALOGO })
}

/** Enlaces de reproducción de un episodio. Recibe la URL del episodio. */
export function apiEnlacesEpisodio(url: string): Promise<ApiEnlacesEpisodio> {
  return peticion<ApiEnlacesEpisodio>(
    '/anime/episode',
    { url },
    { revalidate: REVALIDAR_EPISODIO },
  )
}

export interface CatalogoApi {
  proveedor: Proveedor | 'animeav1' | 'animeflv'
  genero?: string
  pagina?: number
}

/** Página del catálogo de un proveedor, con filtro de género opcional. */
export function apiCatalogo({
  proveedor,
  genero,
  pagina = 1,
}: CatalogoApi): Promise<ApiCatalogo> {
  return peticion<ApiCatalogo>(
    '/anime/catalog',
    { provider: proveedor, genre: genero, page: pagina },
    { revalidate: REVALIDAR_CATALOGO },
  )
}

export interface GeneroApi {
  slug: string
  name: string
}

/** Los géneros que el scraper sabe filtrar, con su slug real. Esta lista
 *  es la que debe gobernar los filtros de Explorar: los slugs no se
 *  inventan, se leen de aquí. */
export function apiGeneros(): Promise<GeneroApi[]> {
  return peticion<GeneroApi[]>(
    '/anime/genres',
    {},
    { revalidate: REVALIDAR_CATALOGO },
  )
}

/** Intenta resolver un enlace de servidor a una URL reproducible. Muchos
 *  hosts no se pueden resolver; el reproductor debe estar preparado. */
export async function apiResolver(url: string): Promise<{ url: string }> {
  const datos = await peticion<{ url: string }>(
    '/anime/resolve',
    { url },
    { revalidate: 0 },
  )
  return datos
}

/** Lista los servidores de un episodio para una variante de audio. */
export function servidoresDe(
  episodio: ApiEnlacesEpisodio,
  variante: VarianteAudio,
): { server: string; url: string }[] {
  const clave = variante === 'SUB' ? 'sub' : 'dub'
  return episodio.servers?.[clave] ?? episodio.streamLinks[variante] ?? []
}

/* ------------------------------------------------------------
   Nombres y orden de los servidores
   El scraper etiqueta los hosts como «HLS», «UPNShare»,
   «MP4Upload»… con ortografía variable. Aquí se normalizan y se
   les da un orden de calidad para que el reproductor muestre
   primero el que mejor va.
   ------------------------------------------------------------ */

/** Nombres limpios por patrón. Solo etiqueta el host; no promete nada. */
const NOMBRES_SERVIDOR: [RegExp, string][] = [
  [/hls|zilla/i, 'HLS'],
  [/upn|uns\.bio/i, 'UPNShare'],
  [/mp4upload/i, 'MP4Upload'],
  [/youtube|youtu\.be/i, 'YouTube'],
  [/ok(?:\s|\.)?ru/i, 'OK.ru'],
  [/vk/i, 'VK'],
  [/streamtape/i, 'StreamTape'],
  [/mega/i, 'MEGA'],
  [/mediafire/i, 'MediaFire'],
  [/1fichero|1fichier/i, '1Fichier'],
]

/** Prioridad de cada nombre: menor primero (1 = el que mejor va). */
const ORDEN_SERVIDOR: Record<string, number> = {
  HLS: 1,
  UPNShare: 2,
  MP4Upload: 3,
}

/** Nombre legible y constante de un servidor, o el original si es un
 *  host desconocido. */
export function nombreDeServidor(server: string): string {
  const sinEspacios = server.trim()
  for (const [patron, nombre] of NOMBRES_SERVIDOR) {
    if (patron.test(sinEspacios)) return nombre
  }
  return sinEspacios
}

/** Ordena los servidores: primero los conocidos y que mejor van, luego
 *  el resto. Los que no se saben nombrar van al final. */
export function ordenarServidores(
  servidores: { server: string; url: string }[],
): { server: string; url: string }[] {
  return [...servidores].sort((a, b) => {
    const prioridadA = ORDEN_SERVIDOR[nombreDeServidor(a.server)] ?? 999
    const prioridadB = ORDEN_SERVIDOR[nombreDeServidor(b.server)] ?? 999
    if (prioridadA !== prioridadB) return prioridadA - prioridadB
    return a.server.localeCompare(b.server)
  })
}

/** Lista los servidores de un episodio, normalizada y ordenada. */
export function servidoresOrdenados(
  episodio: ApiEnlacesEpisodio,
  variante: VarianteAudio,
): { server: string; url: string }[] {
  return ordenarServidores(servidoresDe(episodio, variante))
}
