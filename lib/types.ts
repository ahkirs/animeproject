/* Modelo de datos del catálogo.
   Todo el contenido es sintético: no hay ninguna obra, marca ni
   persona real. Cuando se sustituya por una API, estas mismas
   formas son el contrato al que hay que mapear la respuesta. */

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
  sinopsis: string
  duracionMin: number
  estado: EstadoEpisodio
  /** 0-100. Solo tiene sentido cuando estado es 'en-curso'. */
  progreso?: number
  /** Texto de disponibilidad: «Viernes 14», «En 14 días». */
  disponible?: string
  lamina: ClaveLamina
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

/** Una emisión programada. La parrilla es una lista de estas. */
export interface Programacion {
  serieId: string
  dia: DiaSemana
  /** Día del mes, para la tira de la portada. */
  fecha: string
  /** Hora local de emisión, formato 24h. */
  hora: string
  /** Número del episodio que se emite a continuación. */
  proximoEpisodio: number
  /** Cuenta atrás hasta la emisión, p. ej. «6D 10H».
   *  En la maqueta es texto fijo; con la API pasa a calcularse. */
  cuentaAtras: string
}

export interface Serie {
  id: string
  titulo: string
  /** Título en japonés, si lo tiene. */
  tituloOriginal?: string
  romaji?: string
  anio: number
  nota: number
  votos: number
  clasificacion: string
  duracionMin: number
  genero: string
  generos: string[]
  temporadaEtiqueta: string
  sinopsisCorta: string
  sinopsis: string
  lamina: ClaveLamina
  panoramica?: ClaveLamina
  ficha?: FichaTecnica
  reparto?: Persona[]
  temporadas?: Temporada[]
}

/** Una entrada de «Seguir viendo». */
export interface EnCurso {
  serieId: string
  serieTitulo: string
  episodio: string
  restanteMin: number
  progreso: number
  lamina: ClaveLamina
}
