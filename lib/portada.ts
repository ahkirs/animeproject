/* Filas de la portada.

   La portada es una pila de filas temáticas, y cada fila cuesta una
   llamada al scraper. Medido contra producción: en serie salían casi
   cinco segundos para seis filas; en paralelo, 1,3.

   Por eso las filas se declaran como datos y no como marcado repetido.
   Añadir una es una línea aquí, y la portada las carga cada una por su
   cuenta con su propio Suspense: la página pinta enseguida y las filas
   van entrando según llegan, en vez de esperar a la más lenta.

   La caché del cliente de la API es de una hora, así que el coste real
   solo lo paga la primera visita. */

import { explorar, tendencias } from './catalogo'
import type { Serie } from './types'

/** Cómo se dibuja una fila. Es lo que da ritmo a la página: si todas
 *  fueran iguales, veinte filas de carátulas del mismo tamaño pesarían
 *  todas lo mismo y nada destacaría. */
export type FormaFila =
  /** Carátulas 2:3 al tamaño normal. */
  | 'normal'
  /** Más grandes y menos: para lo que abre la página. */
  | 'destacada'
  /** Con el puesto en cifra grande. El número es el dato, no un adorno. */
  | 'numerada'

export interface DefinicionFila {
  id: string
  titulo: string
  forma: FormaFila
  /** Género del catálogo, o nada para las tendencias generales. */
  genero?: string
  /** A dónde lleva el enlace de la cabecera. */
  href: string
  /** Cuántas se piden. Las numeradas van a diez por definición. */
  limite?: number
}

/* ------------------------------------------------------------
   Las filas

   Los títulos son editoriales a propósito. «Acción» describe un filtro;
   «Para cuando quieres que pasen cosas» describe un estado de ánimo, que
   es lo que trae a alguien a una portada sin saber qué quiere ver.
   ------------------------------------------------------------ */

export const FILAS: DefinicionFila[] = [
  { id: 'top', titulo: 'Lo más visto ahora', forma: 'numerada', href: '/explorar?orden=nota', limite: 10 },
  { id: 'accion', titulo: 'Para cuando quieres que pasen cosas', forma: 'destacada', genero: 'accion', href: '/explorar?genero=accion' },
  { id: 'fantasia', titulo: 'Mundos que no existen', forma: 'normal', genero: 'fantasia', href: '/explorar?genero=fantasia' },
  { id: 'comedia', titulo: 'Media hora sin pensar en nada', forma: 'normal', genero: 'comedia', href: '/explorar?genero=comedia' },
  { id: 'ciencia', titulo: 'El futuro, según los noventa', forma: 'destacada', genero: 'ciencia-ficcion', href: '/explorar?genero=ciencia-ficcion' },
  { id: 'slice', titulo: 'No pasa nada, y está bien', forma: 'normal', genero: 'slice-of-life', href: '/explorar?genero=slice-of-life' },
]

/** Carga una fila. Devuelve lista vacía si el proveedor falla: una fila
 *  que no carga se oculta, no rompe la portada entera. */
export async function serieDeFila(fila: DefinicionFila): Promise<Serie[]> {
  const limite = fila.limite ?? (fila.forma === 'destacada' ? 12 : 16)

  try {
    const series = fila.genero
      ? await explorar({ genero: fila.genero, orden: 'nota' })
      : await tendencias(limite)
    return series.slice(0, limite)
  } catch {
    return []
  }
}

/* ------------------------------------------------------------
   Promociones intercaladas
   ------------------------------------------------------------ */

export interface Promocion {
  id: string
  titulo: string
  /** Frase corta. No es una sinopsis: es el motivo para pulsar. */
  gancho: string
  href: string
  /** Después de qué fila aparece. */
  trasFila: string
}

/** La franja ancha que corta la pila de filas. Es lo único que rompe el
 *  ritmo, así que va una sola y por la mitad: con seis filas, dos
 *  promociones dejarían la página siendo más anuncio que catálogo. */
export const PROMOCIONES: Promocion[] = [
  {
    id: 'temporada',
    titulo: 'Lo que se estrena esta temporada',
    gancho: 'Todo lo que ha empezado en los últimos tres meses, en un sitio.',
    href: '/explorar?orden=anio',
    trasFila: 'fantasia',
  },
]
