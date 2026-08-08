/* Tipos de la respuesta del scraper (https://backend-anime-production-5b68
   .up.railway.app/api/v1). Son los tipos crudos que llegan por red, sin
   interpretar: el mapeo a Serie/Episodio de lib/types.ts vive en
   lib/catalogo.ts. La fuente de verdad es el OpenAPI de /api/docs. */

export type Proveedor = 'animeav1' | 'animeflv'

/** Un resultado de búsqueda o de catálogo. */
export interface ApiResultado {
  id: string | null
  title: string
  slug: string | null
  url: string | null
  image: string | null
  backdrop: string | null
  type: string | null
  score: number | null
  status: string | null
  year: string | null
  provider: string | null
}

export interface ApiGenero {
  id: number | null
  name: string
  slug: string | null
  malId: number | null
}

export interface ApiEpisodioInfo {
  id: number
  number: number
  title: string
  url: string | null
}

/** Respuesta de /anime/info. */
export interface ApiAnimeInfo {
  id: string | number | null
  title: string | null
  titleJapanese: string | null
  description: string | null
  image: string | null
  backdrop: string | null
  status: number | string | null
  type: string | null
  year: string | null
  startDate: string | null
  endDate: string | null
  score: number | null
  votes: number | null
  totalEpisodes: number
  malId: number | null
  trailer: string | null
  genres: ApiGenero[]
  episodes: ApiEpisodioInfo[]
}

export interface ApiVideoLink {
  server: string
  url: string
  quality?: string | null
}

/** Servidores disponibles para un episodio. `variants` cuenta cuántos
 *  servidores hay de cada tipo; `servers` y `streamLinks` los listan. */
export interface ApiEnlacesEpisodio {
  id: number
  episode: number | null
  title: string
  season: string | null
  variants: { SUB: number; DUB: number }
  publishedAt?: string | null
  servers?: { sub: ApiVideoLink[]; dub: ApiVideoLink[] }
  streamLinks: { SUB: ApiVideoLink[]; DUB: ApiVideoLink[] }
  downloadLinks: { SUB: ApiVideoLink[]; DUB: ApiVideoLink[] }
}

export type VarianteAudio = 'SUB' | 'DUB'

/** Respuesta de /anime/catalog. */
export interface ApiCatalogo {
  page: number
  genre: string | null
  count: number
  hasMore: boolean
  results: ApiResultado[]
}

/* ------------------------------------------------------------
   Envoltorios de respuesta
   ------------------------------------------------------------ */

export interface ApiOk<T> {
  success: true
  data: T
  source?: string
}

export interface ApiError {
  success: false
  error: string
  status?: number
}

export type ApiRespuesta<T> = ApiOk<T> | ApiError
