/* Cliente del scraper (https://backend-anime-production-5b68.up.railway.app).
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
  process.env.API_BASE ?? 'https://backend-anime-production-5b68.up.railway.app/api/v1'

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

/** Nombre del parámetro que espera /anime/image-proxy.
 *
 *  Vive en una constante y no incrustado en la plantilla porque lo decide
 *  el backend, no esta parte: si allí se renombra, aquí se cambia una
 *  línea y no hay que buscarlo. Se puede sobrescribir con la variable
 *  API_IMAGE_PARAM para cuadrar los dos lados sin volver a desplegar. */
const PARAM_IMAGEN = process.env.API_IMAGE_PARAM ?? 'u'

/** Construye la URL de /anime/image-proxy para una imagen remota.
 *  Se usa en <img> y en las láminas: evita depender de que el navegador
 *  pueda cargar el dominio del proveedor. */
export function urlImagenProxy(imagen: string | null | undefined): string | null {
  if (!imagen) return null
  return `${API_BASE}/anime/image-proxy?${PARAM_IMAGEN}=${encodeURIComponent(imagen)}`
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
