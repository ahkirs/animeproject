/* Modelo de datos del catálogo.
   El contenido llega del scraper (lib/api.ts); estas formas son el
   contrato al que lib/catalogo.ts mapea la respuesta de la API. */

import type { Proveedor } from './api-types'

/** Carátula o fotograma: clave de los SVG de Lamina.tsx o una URL. */
export type Arte = ClaveLamina | string

/** Claves de las láminas SVG dibujadas en components/Lamina.tsx */
export type ClaveLamina =
  // Carteles 2:3
  | 'mecha'
  | 'jardin'
  | 'kaiju'
  | 'noche'
  | 'tren'
  | 'espada'
  // Panorámicas 16:9
  | 'panoramica-escena'
  | 'panoramica-obra'
  | 'panoramica-player'
  // Miniaturas de episodio 16:9
  | 'ep-1'
  | 'ep-2'
  | 'ep-3'
  | 'ep-4'

export type EstadoEpisodio = 'visto' | 'en-curso' | 'disponible' | 'bloqueado'

export interface Episodio {
  numero: number
  titulo: string
  sinopsis?: string
  duracionMin?: number
  estado: EstadoEpisodio
  /** 0-100. Solo tiene sentido cuando estado es 'en-curso'. */
  progreso?: number
  /** Texto de disponibilidad: «Viernes 14», «En 14 días». */
  disponible?: string
  lamina: Arte
  /** URL del episodio en el proveedor, para pedir los enlaces. */
  url?: string
}

export interface Temporada {
  numero: number
  etiqueta: string
  enEmision?: boolean
  episodios: Episodio[]
}

export interface Persona {
  nombre: string
  papel?: string
  voz?: string
  iniciales: string
}

export interface FichaTecnica {
  estudio: string
  direccion: string
  guion: string
  musica: string
  emision: string
  origen: string
  audio: string
  subtitulos: string
}

/** 0 es domingo, como en Date.getDay(). */
export type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5 | 6

/** Una emisión programada. La parrilla es una lista de estas.
 *
 *  El instante se guarda en UTC y todo lo demás se deriva de él: el día
 *  de la semana, la hora en Japón, la hora local del visitante y la
 *  cuenta atrás. Guardar «21:00» a secas no serviría, porque una cadena
 *  suelta no dice a qué zona horaria pertenece. */
export interface Programacion {
  serieId: string
  /** Instante exacto de emisión, en UTC. */
  emitidoUtc: string
  /** Número del episodio que se emite a continuación. */
  proximoEpisodio: number
}

/** Las dos lecturas que ofrece la interfaz. La hora de Japón se sigue
 *  usando por dentro para agrupar los días, pero no se muestra. */
export type ZonaHoraria = 'local' | 'utc'

/** Una plataforma con licencia donde ver la obra. Viene de los enlaces
 *  externos de AniList; es la pieza que hace de esto un agregador. */
export interface EnlaceOficial {
  sitio: string
  url: string
  idioma?: string
}

/** Una emisión de la parrilla, con los datos de la obra incrustados.
 *
 *  A diferencia de Programacion, no apunta al catálogo del proveedor: el
 *  calendario viene de AniList y sus obras no tienen por qué estar en él.
 *  El instante sigue siendo UTC, así que la hora local, la agrupación por
 *  día y la cuenta atrás se derivan igual que antes. */
export interface EmisionProgramada {
  /** Id de AniList. */
  id: number
  episodio: number
  emitidoUtc: string
  titulo: string
  tituloNativo?: string
  formato?: string
  episodiosTotales: number | null
  duracionMin: number | null
  nota: number | null
  generos: string[]
  portada: string | null
  /** Color dominante que AniList extrae de la carátula. */
  color: string | null
  donde: EnlaceOficial[]
}

export interface Serie {
  /** Id canónico derivado de la URL del proveedor (lib/ids.ts). */
  id: string
  titulo: string
  /** Título en japonés, si lo tiene. */
  tituloOriginal?: string
  anio: number | null
  nota: number | null
  votos: number | null
  clasificacion?: string
  duracionMin?: number
  genero: string
  generos: string[]
  temporadaEtiqueta: string
  sinopsisCorta: string
  sinopsis: string
  /** Carátula (poster) o su SVG de reserva. */
  lamina: Arte
  /** Fondo panorámico o su SVG de reserva. */
  panoramica?: Arte
  /** URL en el proveedor: es la que se pasa para pedir info/episodios. */
  url: string
  proveedor: Proveedor
  /** Otros proveedores donde está la misma obra. */
  alternativas: SerieAlternativa[]
  totalEpisodios: number
  /** El scraper no agrupa por temporada: todos los episodios van en una. */
  temporadas?: Temporada[]
  ficha?: FichaTecnica
  reparto?: Persona[]
}

/** Otra copia de la misma obra en un proveedor distinto. */
export interface SerieAlternativa {
  proveedor: Proveedor
  nombre: string
  url: string
}

/* ---------------- Lista del usuario ---------------- */

export type EstadoLista =
  | 'viendo'
  | 'pendiente'
  | 'completada'
  | 'pausada'
  | 'abandonada'

/** Una serie dentro de la lista de alguien. Cuando haya cuentas, esto
 *  es una fila por usuario y serie en la base de datos. */
export interface EntradaLista {
  serieId: string
  estado: EstadoLista
  episodiosVistos: number
  /** Puntuación personal del 1 al 10. Sin puntuar si falta. */
  puntuacion?: number
  /** Última vez que se tocó la entrada, en ISO. */
  actualizado: string
}

/** Una entrada de «Seguir viendo». */
export interface EnCurso {
  serieId: string
  serieTitulo: string
  episodio: string
  restanteMin: number
  progreso: number
  lamina: Arte
}
