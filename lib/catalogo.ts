import type { EstadoEmision, Relacionada, Serie, Temporada } from './types'
import type { ApiAnimeInfo, ApiEnlacesEpisodio, ApiResultado } from './api-types'
import {
  apiBuscar,
  apiCatalogo,
  apiEnlacesEpisodio,
  apiGeneros,
  apiInfo,
  urlImagenProxy,
} from './api'
import {
  deduplicar,
  idCanonicoDe,
  nombreProveedor,
  proveedorDe,
  urlDeId,
} from './ids'

/* ============================================================
   COSTURA SOBRE EL SCRAPER
   lib/api.ts es el único archivo que habla con la red. Aquí se
   mapea la respuesta a las formas de lib/types.ts y se resuelven
   los filtros y el orden que la API no hace por nosotros.
   ============================================================ */

/* ------------------------------------------------------------
   Solo obras reproducibles
   El catálogo mezcla proveedores: AnimeFLV devuelve episodios
   pero con streamLinks vacíos (no publica vídeo con el patrón del
   scraper). Para que una obra aparezca en una lista hay que
   comprobar que su primer episodio tiene algún enlace de
   reproducción; si no, no muestra lugar en la página.
   ------------------------------------------------------------ */

/** ¿Tiene el primer episodio disponible de «url» al menos un enlace? */
async function tieneVideo(url: string): Promise<boolean> {
  try {
    const info = await apiInfo(url)
    const episodio = (info.episodes ?? []).find((e) => e.url)
    if (!episodio?.url) return false
    const enlaces = await apiEnlacesEpisodio(episodio.url)
    return (
      (enlaces.streamLinks?.SUB?.length ?? 0) +
        (enlaces.streamLinks?.DUB?.length ?? 0) >
      0
    )
  } catch {
    return false
  }
}

/** Cuántas comprobaciones de /anime/episode se lanzan a la vez. */
const CONCURRENCIA_VERIFICACION = 6

/** Devuelve el subconjunto de URLs cuyo primer episodio se puede
 *  reproducir. Las peticiones van acotadas para no dormir la API. */
async function urlsConVideo(urls: string[]): Promise<Set<string>> {
  const conVideo = new Set<string>()
  let indice = 0
  const trabajadores = Array.from(
    { length: Math.min(CONCURRENCIA_VERIFICACION, urls.length) },
    async () => {
      while (indice < urls.length) {
        const actual = urls[indice++]
        if (await tieneVideo(actual)) conVideo.add(actual)
      }
    },
  )
  await Promise.all(trabajadores)
  return conVideo
}

/** Filtra una lista de resultados quedándose con los que tienen vídeo. */
async function conVideo<T>(
  entradas: T[],
  urlDe: (e: T) => string | null | undefined,
): Promise<T[]> {
  const urls = entradas
    .map(urlDe)
    .filter((u): u is string => Boolean(u))
  const conV = await urlsConVideo(urls)
  return entradas.filter((e) => {
    const u = urlDe(e)
    return !!u && conV.has(u)
  })
}

/* ------------------------------------------------------------
   Mapeo de la respuesta a Serie
   ------------------------------------------------------------ */

/** Una serie aún sin episodios cargados: la que trae el catálogo o la
 *  búsqueda. Para las tarjetas basta; para la ficha hay que pedir info. */
function resultadoASerie(r: ApiResultado): Serie {
  const proveedor = proveedorDe(r.provider)
  return {
    id: idCanonicoDe(r),
    titulo: r.title,
    anio: r.year ? Number(r.year) : null,
    nota: r.score,
    votos: null,
    genero: r.type ?? 'Anime',
    generos: [],
    temporadaEtiqueta: r.type ?? 'Serie',
    sinopsisCorta: '',
    sinopsis: '',
    lamina: urlImagenProxy(r.image) ?? 'mecha',
    panoramica: urlImagenProxy(r.backdrop) ?? undefined,
    url: r.url ?? '',
    proveedor,
    alternativas: [],
    totalEpisodios: 0,
  }
}

function anioDeInfo(info: ApiAnimeInfo): number | null {
  if (info.year) return Number(info.year)
  if (info.startDate) return Number(info.startDate.slice(0, 4))
  return null
}

/** Estado de emisión a partir de la ficha.
 *
 *  El proveedor marca con `status: 2` lo que sigue emitiéndose, pero no
 *  usa ningún código para lo terminado: las obras antiguas llegan con el
 *  campo a nulo y una fecha de fin. Así que lo terminado se deduce de
 *  `endDate`, y lo que no tiene ni una cosa ni la otra se deja sin
 *  estado en vez de inventarlo. */
function estadoDeInfo(info: ApiAnimeInfo): EstadoEmision | undefined {
  if (info.status === 2) return 'en-emision'
  if (info.endDate) return 'finalizada'
  return undefined
}

/** Primera frase de la sinopsis, para las tarjetas. */
function sinopsisCortaDe(texto: string | null): string {
  if (!texto) return ''
  const llana = texto.trim().replace(/\s+/g, ' ')
  const punto = llana.indexOf('.')
  if (punto !== -1 && punto < 180) return llana.slice(0, punto + 1)
  return llana.length > 180 ? `${llana.slice(0, 180)}…` : llana
}

/** Rótulo de cada código de relación. Solo se nombran los dos que se han
 *  podido confirmar contra fichas conocidas; lo demás cae en el genérico
 *  antes que arriesgarse a llamar «secuela» a una película. La deducción
 *  está explicada en ApiRelacion. */
const VINCULOS: Record<number, string> = {
  1: 'Precuela',
  2: 'Secuela',
}

/** Obras emparentadas, listas para pintar.
 *
 *  Una relación solo es navegable si trae `url`: de ahí sale el id
 *  canónico con el que se abre su ficha. Las que no la traen se enseñan
 *  igual, pero sin enlace —existen, y decir que existen ya es
 *  información— y por eso `id` puede ser nulo. */
function relacionesDeInfo(info: ApiAnimeInfo): Relacionada[] | undefined {
  const relaciones = (info.relations ?? []).filter((r) => r?.title?.trim())
  if (relaciones.length === 0) return undefined

  return relaciones.map((r) => ({
    id: r.url
      ? idCanonicoDe({ url: r.url, provider: nombreProveedor('animeav1'), id: null })
      : null,
    titulo: r.title.trim(),
    vinculo: VINCULOS[r.type] ?? 'Relacionada',
    anio: r.startDate ? Number(r.startDate.slice(0, 4)) : null,
  }))
}

/** Ficha completa de una obra, con todos sus episodios. */
function infoASerie(
  info: ApiAnimeInfo,
  proveedor: 'animeav1' | 'animeflv',
  url: string,
): Serie {
  const generos = (info.genres ?? []).map((g) => g.name)
  const episodios = (info.episodes ?? [])
    .slice()
    .sort((a, b) => a.number - b.number)
    .map((e) => ({
      numero: e.number,
      titulo: e.title,
      estado: 'disponible' as const,
      lamina: urlImagenProxy(info.backdrop) ?? ('ep-1' as const),
      url: e.url ?? undefined,
    }))

  return {
    id: idCanonicoDe({
      url,
      provider: nombreProveedor(proveedor),
      id: info.id != null ? String(info.id) : null,
    }),
    titulo: info.title ?? '',
    tituloOriginal: info.titleJapanese ?? undefined,
    anio: anioDeInfo(info),
    nota: info.score,
    votos: info.votes,
    genero: generos[0] ?? info.type ?? 'Anime',
    generos,
    temporadaEtiqueta: info.type ?? 'Serie',
    estado: estadoDeInfo(info),
    fechaInicio: info.startDate ?? undefined,
    sinopsisCorta: sinopsisCortaDe(info.description),
    sinopsis: info.description ?? '',
    lamina: urlImagenProxy(info.image) ?? 'mecha',
    panoramica: urlImagenProxy(info.backdrop) ?? 'panoramica-obra',
    trailer: info.trailer ?? undefined,
    malId: info.malId ?? undefined,
    url,
    proveedor,
    alternativas: [],
    relacionadas: relacionesDeInfo(info),
    totalEpisodios: info.totalEpisodes ?? episodios.length,
    temporadas: [
      {
        numero: 1,
        etiqueta: 'Episodios',
        enEmision: info.status === 2,
        episodios,
      },
    ],
  }
}

/** Une los proveedores alternativos que la búsqueda ya deduplicó. */
function unirAlternativas(
  principal: Serie,
  alternativas: ApiResultado[],
): Serie {
  return {
    ...principal,
    alternativas: alternativas.map((a) => ({
      proveedor: proveedorDe(a.provider),
      nombre: a.provider ?? nombreProveedor(a.provider),
      url: a.url ?? '',
    })),
  }
}

/* ------------------------------------------------------------
   Acceso a una serie
   ------------------------------------------------------------ */

/** Ficha completa de una serie desde su id canónico. */
export async function obtenerSerie(id: string): Promise<Serie | undefined> {
  const dato = urlDeId(id)
  if (!dato) return undefined
  const info = await apiInfo(dato.url)
  return infoASerie(info, dato.proveedor, dato.url)
}

export function obtenerTemporada(
  serie: Serie,
  numero?: number,
): Temporada | undefined {
  if (!serie.temporadas?.length) return undefined
  if (numero === undefined) return serie.temporadas[0]
  return (
    serie.temporadas.find((t) => t.numero === numero) ?? serie.temporadas[0]
  )
}

/** Episodio por el que tiene sentido entrar: el primero disponible. */
export function episodioDeEntrada(serie: Serie) {
  const temporada = obtenerTemporada(serie)
  if (!temporada?.episodios.length) return undefined
  return { temporada, episodio: temporada.episodios[0] }
}

/** URL del reproductor del primer episodio disponible. */
export async function rutaReproductor(
  serieId: string,
): Promise<string | undefined> {
  const serie = await obtenerSerie(serieId)
  const entrada = serie ? episodioDeEntrada(serie) : undefined
  if (!serie || !entrada) return undefined
  return `/ver/${serie.id}/${entrada.temporada.numero}/${entrada.episodio.numero}`
}

/** Enlaces de reproducción de un episodio, para el reproductor. */
export async function enlacesDeEpisodio(
  serie: Serie,
  numero: number,
): Promise<ApiEnlacesEpisodio | undefined> {
  const episodio = serie.temporadas?.[0]?.episodios.find(
    (e) => e.numero === numero,
  )
  if (!episodio?.url) return undefined
  return apiEnlacesEpisodio(episodio.url)
}

/* ------------------------------------------------------------
   Catálogo y tendencias
   ------------------------------------------------------------ */

/* De los proveedores que publica la API, solo animeav1 sirve vídeo
   reproducible: animeflv llega con streamLinks vacíos y jkanime,
   tioanime y monoschinos devuelven las mismas URLs que animeav1 con otra
   etiqueta. Por eso las listas se nutren solo de animeav1, paginado:
   cada página trae veinte títulos y todas tienen vídeo (se comprobó en
   producción: 11 de 11). Como es fiable, no se pide el vídeo obra por
   obra antes de enseñarla; si una obra fallara en la reproducción, se
   vería ahí y no en el listado. */

/** Cuántas páginas del catálogo de animeav1 se consultan para una fila
 *  de la portada. Las filas piden entre 10 y 16 obras; con tres páginas
 *  (60 títulos) hay de sobra y la página no tarda. */
const PAGINAS_FILA = 3

/** Cuántas páginas del catálogo de animeav1 se piden a la vez. Con el
 *  catálogo entero detrás (Explorar), cincuenta páginas una a una
 *  tardarían demasiado; en tandas de diez se va en cinco viajes. */
const TANDA_PAGINAS = 10

/** Une páginas del catálogo de animeav1.
 *
 *  «paginas»: cuántas como máximo. Un número corta ahí; «todas» recorre
 *  el catálogo entero hasta que una página viene vacía o falla, y las
 *  pide en tandas paralelas para no ir de una en una.
 *
 *  Una página que falla se ignora y se sigue con la siguiente: nunca
 *  rompe la lista por una página caída. */
async function catalogarAnimeav1(
  genero?: string,
  paginas: number | 'todas' = PAGINAS_FILA,
): Promise<ApiResultado[]> {
  const resultados: ApiResultado[] = []

  // Número fijo: se piden todas a la vez, como antes.
  if (paginas !== 'todas') {
    const lotes = await Promise.all(
      Array.from({ length: paginas }, (_, i) =>
        apiCatalogo({ proveedor: 'animeav1', genero, pagina: i + 1 }).catch(
          () => null,
        ),
      ),
    )
    return lotes.flatMap((lote) => lote?.results ?? [])
  }

  // Catálogo entero: en tandas paralelas hasta que una página venga
  // vacía o falle. Eso marca el final sin saber cuántas páginas hay.
  let pagina = 1
  for (;;) {
    const lotes = await Promise.all(
      Array.from({ length: TANDA_PAGINAS }, (_, i) =>
        apiCatalogo({
          proveedor: 'animeav1',
          genero,
          pagina: pagina + i,
        }).catch(() => null),
      ),
    )
    let huboDatos = false
    for (const lote of lotes) {
      if (!lote || lote.results.length === 0) return resultados
      resultados.push(...lote.results)
      huboDatos = true
    }
    if (!huboDatos) return resultados
    pagina += TANDA_PAGINAS
  }
}

/** Unas cuantas obras para las portadas. La API ordena como puede; se
 *  enriquecen las primeras con la ficha para tener sinopsis y nota.
 *
 *  `conFicha` es cuántas se enriquecen: cada una es una llamada más al
 *  scraper, así que sube solo lo que el destacado vaya a enseñar. */
export async function tendencias(limite = 10, conFicha = 4): Promise<Serie[]> {
  const dedupe = deduplicar(await catalogarAnimeav1(undefined, PAGINAS_FILA))

  const series = dedupe
    .slice(0, limite)
    .map((d) => unirAlternativas(resultadoASerie(d.serie), d.alternativas))

  // Las primeras, con ficha completa, para el destacado.
  const enriquecidas = await Promise.all(
    series.slice(0, conFicha).map(async (s) => {
      if (!s.url) return s
      try {
        const info = await apiInfo(s.url)
        return {
          ...infoASerie(info, s.proveedor, s.url),
          alternativas: s.alternativas,
        }
      } catch {
        return s
      }
    }),
  )
  return [...enriquecidas, ...series.slice(conFicha)]
}

/* ------------------------------------------------------------
   Temporada de estreno

   El scraper no da la temporada, da la fecha de inicio. Se deriva
   del mes, que es como se nombran las temporadas de anime: enero
   es invierno, abril primavera, julio verano y octubre otoño.
   ------------------------------------------------------------ */

const TEMPORADAS = ['Invierno', 'Primavera', 'Verano', 'Otoño'] as const

/** «Verano 2026» a partir de una fecha ISO. Nada si no hay fecha. */
export function temporadaDe(fechaIso: string | undefined): string | undefined {
  if (!fechaIso) return undefined
  const fecha = new Date(fechaIso)
  if (Number.isNaN(fecha.getTime())) return undefined
  const nombre = TEMPORADAS[Math.floor(fecha.getUTCMonth() / 3)]
  return `${nombre} ${fecha.getUTCFullYear()}`
}

export function estaEnEmision(serie: Serie): boolean {
  return serie.temporadas?.some((t) => t.enEmision) ?? false
}

export function totalEpisodios(serie: Serie): number {
  return (
    serie.totalEpisodios ??
    serie.temporadas?.reduce((suma, t) => suma + t.episodios.length, 0) ??
    0
  )
}

/* ------------------------------------------------------------
   EXPLORAR
   Filtros y orden. El scraper solo filtra por género y por página,
   así que el orden se aplica aquí con los datos que vengan.
   ------------------------------------------------------------ */

export type EstadoSerie = 'emision' | 'completa'
export type OrdenSerie = 'titulo' | 'nota' | 'anio' | 'episodios'

export const ORDENES: { id: OrdenSerie; texto: string }[] = [
  { id: 'nota', texto: 'Mejor valoradas' },
  { id: 'anio', texto: 'Más recientes' },
  { id: 'titulo', texto: 'A–Z' },
  { id: 'episodios', texto: 'Más episodios' },
]

export const ESTADOS: { id: EstadoSerie; texto: string }[] = [
  { id: 'emision', texto: 'En emisión' },
  { id: 'completa', texto: 'Completas' },
]

export interface FiltrosExplorar {
  genero?: string
  orden?: OrdenSerie
  /** Cuántas se quieren como mínimo. La portada pasa el ancho de la
   *  fila y se queda con las primeras; sin valor, se muestra el
   *  catálogo entero de animeav1. */
  limite?: number
}

/** Páginas del catálogo de un proveedor, como listas de tarjetas. */
export async function explorar({
  genero,
  orden = 'titulo',
  limite,
}: FiltrosExplorar): Promise<Serie[]> {
  const dedupe = deduplicar(
    await catalogarAnimeav1(genero, limite ? limite : 'todas'),
  )
  const series = dedupe.map((d) =>
    unirAlternativas(resultadoASerie(d.serie), d.alternativas),
  )

  const comparar: Record<OrdenSerie, (a: Serie, b: Serie) => number> = {
    nota: (a, b) => (b.nota ?? 0) - (a.nota ?? 0),
    anio: (a, b) => (b.anio ?? 0) - (a.anio ?? 0) || a.titulo.localeCompare(b.titulo),
    titulo: (a, b) => a.titulo.localeCompare(b.titulo, 'es'),
    episodios: (a, b) => b.totalEpisodios - a.totalEpisodios,
  }

  return series.sort(comparar[orden])
}

/** Géneros que no se enseñan: contenido adulto o sugerente. */
const GENEROS_ADULTOS = new Set([
  'ecchi',
  'harem',
  'yaoi',
  'yuri',
  'shounen-ai',
  'shoujo-ai',
])

/** Respaldo por si la API de géneros no responde: los que el scraper
 *  filtra hoy, con sus slugs reales. Solo se usa en el primer render o
 *  si /anime/genres falla; no debe editarse a mano. */
const GENEROS_RESERVA: { nombre: string; slug: string }[] = [
  { nombre: 'Acción', slug: 'accion' },
  { nombre: 'Aventura', slug: 'aventura' },
  { nombre: 'Comedia', slug: 'comedia' },
  { nombre: 'Drama', slug: 'drama' },
  { nombre: 'Fantasía', slug: 'fantasia' },
  { nombre: 'Ciencia ficción', slug: 'ciencia-ficcion' },
  { nombre: 'Romance', slug: 'romance' },
  { nombre: 'Recuentos de la Vida', slug: 'recuentos-de-la-vida' },
  { nombre: 'Misterio', slug: 'misterio' },
  { nombre: 'Terror', slug: 'terror' },
  { nombre: 'Deportes', slug: 'deportes' },
  { nombre: 'Música', slug: 'musica' },
  { nombre: 'Escolares', slug: 'escolares' },
  { nombre: 'Sobrenatural', slug: 'sobrenatural' },
  { nombre: 'Seinen', slug: 'seinen' },
  { nombre: 'Shounen', slug: 'shounen' },
]

/** Los géneros que filtra el scraper, tal y como los publica la API y
 *  sin los de contenido adulto. Son los slugs que el catálogo entiende
 *  de verdad, no una lista inventada. */
export async function generosDisponibles(): Promise<
  { nombre: string; slug: string }[]
> {
  try {
    const generos = await apiGeneros()
    return generos
      .filter((g) => !GENEROS_ADULTOS.has(g.slug))
      .map((g) => ({ nombre: g.name, slug: g.slug }))
  } catch {
    return GENEROS_RESERVA
  }
}

/** El scraper no publica años en el catálogo. */
export function aniosDisponibles(): number[] {
  return []
}

/* ------------------------------------------------------------
   BÚSQUEDA
   Se resuelve contra la API y se deduplica por título.
   ------------------------------------------------------------ */

export interface Coincidencia {
  serie: Serie
  /** Por qué ha entrado: se muestra bajo el título. */
  motivo: string
}

/** Hiragana, katakana y kanji. */
const CJK = /[\u3040-\u30ff\u4e00-\u9fff]/

/** Cuántos caracteres hacen falta para buscar. */
export function minimoParaBuscar(consulta: string): number {
  return CJK.test(consulta) ? 1 : 2
}

export async function buscarSeries(
  consulta: string,
  limite = 6,
): Promise<Coincidencia[]> {
  const respuesta = await apiBuscar(consulta)
  const dedupe = deduplicar(respuesta.results)
  const visibles = await conVideo(dedupe, (d) => d.serie.url)
  return visibles
    .slice(0, limite)
    .map((d) => ({
      serie: unirAlternativas(resultadoASerie(d.serie), d.alternativas),
      motivo:
        d.serie.type ??
        d.alternativas.map((a) => a.provider ?? '').filter(Boolean).join(' · '),
    }))
}
