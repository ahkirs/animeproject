import type {
  EnCurso,
  EntradaLista,
  EstadoLista,
  Serie,
  Temporada,
} from './types'
import type { ApiAnimeInfo, ApiEnlacesEpisodio, ApiResultado } from './api-types'
import {
  apiBuscar,
  apiCatalogo,
  apiEnlacesEpisodio,
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

/** Primera frase de la sinopsis, para las tarjetas. */
function sinopsisCortaDe(texto: string | null): string {
  if (!texto) return ''
  const llana = texto.trim().replace(/\s+/g, ' ')
  const punto = llana.indexOf('.')
  if (punto !== -1 && punto < 180) return llana.slice(0, punto + 1)
  return llana.length > 180 ? `${llana.slice(0, 180)}…` : llana
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
    sinopsisCorta: sinopsisCortaDe(info.description),
    sinopsis: info.description ?? '',
    lamina: urlImagenProxy(info.image) ?? 'mecha',
    panoramica: urlImagenProxy(info.backdrop) ?? 'panoramica-obra',
    url,
    proveedor,
    alternativas: [],
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

/** Unas cuantas obras para las portadas. La API ordena como puede; se
 *  enriquecen las primeras con la ficha para tener sinopsis y nota. */
export async function tendencias(limite = 10): Promise<Serie[]> {
  const [av1, flv] = await Promise.all([
    apiCatalogo({ proveedor: 'animeav1', pagina: 1 }).catch(() => null),
    apiCatalogo({ proveedor: 'animeflv', pagina: 1 }).catch(() => null),
  ])
  const dedupe = deduplicar([
    ...(av1?.results ?? []),
    ...(flv?.results ?? []),
  ])

  const series = dedupe
    .slice(0, limite)
    .map((d) => unirAlternativas(resultadoASerie(d.serie), d.alternativas))

  // Las primeras, con ficha completa, para el destacado.
  const enriquecidas = await Promise.all(
    series.slice(0, 4).map(async (s) => {
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
  return [...enriquecidas, ...series.slice(4)]
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
}

/** Páginas del catálogo de un proveedor, como listas de tarjetas. */
export async function explorar({
  genero,
  orden = 'titulo',
}: FiltrosExplorar): Promise<Serie[]> {
  const av1 = await apiCatalogo({ proveedor: 'animeav1', genero })
    .catch(() => null)
  const flv = await apiCatalogo({ proveedor: 'animeflv', genero })
    .catch(() => null)

  const dedupe = deduplicar([
    ...(av1?.results ?? []),
    ...(flv?.results ?? []),
  ])
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

/** Géneros que acepta el scraper. El filtro lo hace la API, así que
 *  esta lista es fija (los slugs no se pueden descubrir). */
export const GENEROS: { nombre: string; slug: string }[] = [
  { nombre: 'Acción', slug: 'accion' },
  { nombre: 'Aventura', slug: 'aventura' },
  { nombre: 'Comedia', slug: 'comedia' },
  { nombre: 'Drama', slug: 'drama' },
  { nombre: 'Fantasía', slug: 'fantasia' },
  { nombre: 'Ciencia ficción', slug: 'ciencia-ficcion' },
  { nombre: 'Romance', slug: 'romance' },
  { nombre: 'Slice of life', slug: 'slice-of-life' },
  { nombre: 'Misterio', slug: 'misterio' },
  { nombre: 'Terror', slug: 'terror' },
  { nombre: 'Deportes', slug: 'deportes' },
  { nombre: 'Música', slug: 'musica' },
  { nombre: 'Escolares', slug: 'escolares' },
  { nombre: 'Sobrenatural', slug: 'sobrenatural' },
  { nombre: 'Seinen', slug: 'seinen' },
  { nombre: 'Shounen', slug: 'shounen' },
]

export function generosDisponibles(): { nombre: string; slug: string }[] {
  return GENEROS
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
  return dedupe
    .slice(0, limite)
    .map((d) => ({
      serie: unirAlternativas(resultadoASerie(d.serie), d.alternativas),
      motivo:
        d.serie.type ??
        d.alternativas.map((a) => a.provider ?? '').filter(Boolean).join(' · '),
    }))
}

/* ------------------------------------------------------------
   LISTA DEL USUARIO
   Datos de ejemplo mientras no hay cuentas. Los ids apuntan a obras
   reales del scraper para que la página se vea con contenido.
   ------------------------------------------------------------ */

export const ESTADOS_LISTA: {
  id: EstadoLista
  texto: string
  descripcion: string
}[] = [
  { id: 'viendo', texto: 'Viendo', descripcion: 'Series que tienes empezadas' },
  { id: 'pendiente', texto: 'Pendientes', descripcion: 'Guardadas para más adelante' },
  { id: 'completada', texto: 'Completadas', descripcion: 'Terminadas de ver' },
  { id: 'pausada', texto: 'En pausa', descripcion: 'Aparcadas por ahora' },
  { id: 'abandonada', texto: 'Abandonadas', descripcion: 'Dejadas a medias' },
]

export const USUARIO = {
  nombre: 'Adrián',
  alias: 'ahkirs',
  iniciales: 'AR',
  desde: 'agosto de 2026',
}

export const MI_LISTA: EntradaLista[] = [
  {
    serieId: 'animeav1-one-piece',
    estado: 'viendo',
    episodiosVistos: 1138,
    puntuacion: 9,
    actualizado: '2026-08-07T12:40:00Z',
  },
  {
    serieId: 'animeav1-jujutsu-kaisen',
    estado: 'viendo',
    episodiosVistos: 2,
    puntuacion: 8,
    actualizado: '2026-08-06T21:10:00Z',
  },
  {
    serieId: 'animeav1-spy-x-family',
    estado: 'viendo',
    episodiosVistos: 11,
    actualizado: '2026-08-05T23:55:00Z',
  },
  {
    serieId: 'animeav1-mushoku-tensei-iii-isekai-ittara-honki-dasu',
    estado: 'viendo',
    episodiosVistos: 7,
    puntuacion: 9,
    actualizado: '2026-08-04T19:20:00Z',
  },
  {
    serieId: 'animeav1-sousou-no-frieren-2nd-season',
    estado: 'pendiente',
    episodiosVistos: 0,
    actualizado: '2026-08-02T11:00:00Z',
  },
  {
    serieId: 'animeav1-youjo-senki-ii',
    estado: 'completada',
    episodiosVistos: 12,
    puntuacion: 8,
    actualizado: '2026-08-01T09:30:00Z',
  },
]

/** Entradas de la lista, opcionalmente de un solo estado, de más
 *  reciente a más antigua. */
export function miLista(estado?: EstadoLista): EntradaLista[] {
  return MI_LISTA.filter((e) => !estado || e.estado === estado).sort((a, b) =>
    b.actualizado.localeCompare(a.actualizado),
  )
}

export function cuantasEnEstado(estado: EstadoLista): number {
  return MI_LISTA.filter((e) => e.estado === estado).length
}

/** Resumen para la cabecera del perfil. */
export function resumenLista() {
  const episodios = MI_LISTA.reduce((s, e) => s + e.episodiosVistos, 0)
  const puntuadas = MI_LISTA.filter((e) => e.puntuacion !== undefined)
  const media =
    puntuadas.length > 0
      ? puntuadas.reduce((s, e) => s + (e.puntuacion ?? 0), 0) / puntuadas.length
      : undefined

  return {
    series: MI_LISTA.length,
    episodios,
    horas: Math.round((episodios * 24) / 60),
    media,
  }
}

/* ------------------------------------------------------------
   SEGUIR VIENDO
   Sin cuentas todavía no hay historial real: se muestra un ejemplo.
   ------------------------------------------------------------ */

export const EN_CURSO: EnCurso[] = [
  {
    serieId: 'animeav1-one-piece',
    serieTitulo: 'One Piece',
    episodio: 'E1138',
    restanteMin: 22,
    progreso: 8,
    lamina: 'panoramica-obra',
  },
  {
    serieId: 'animeav1-spy-x-family',
    serieTitulo: 'Spy x Family',
    episodio: 'E12',
    restanteMin: 18,
    progreso: 23,
    lamina: 'panoramica-obra',
  },
  {
    serieId: 'animeav1-mushoku-tensei-iii-isekai-ittara-honki-dasu',
    serieTitulo: 'Mushoku Tensei III',
    episodio: 'E8',
    restanteMin: 2,
    progreso: 91,
    lamina: 'panoramica-obra',
  },
]
