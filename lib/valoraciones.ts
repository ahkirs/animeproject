/* Notas de la comunidad.

   Ojo con no confundirla con la otra nota. La ficha enseña dos números
   distintos y no son lo mismo:

   - `serie.nota` viene del scraper. Es la nota de un agregador externo
     (8,73 sobre millón y medio de votos, en el caso de One Piece), y no
     tiene nada que ver con este sitio.
   - esta es la de quien entra aquí. Empieza en cero votos y sube sola.

   La escritura vive en lib/acciones.ts (`calificar`, `quitarNota`);
   aquí solo se lee. Verificado contra
   GET /ratings?animeId=197 → { animeId, average, count, myScore }. */

import { API_CUENTA } from './api'
import { tokenDeAcceso } from './sesion'

export interface NotaComunidad {
  /** Media de 1 a 10, o nulo si todavía no ha votado nadie. */
  media: number | null
  votos: number
  /** Tu nota, o nulo si no has votado o no hay sesión. */
  miNota: number | null
}

const SIN_NOTAS: NotaComunidad = { media: null, votos: 0, miNota: null }

/**
 * Nota de una obra.
 *
 * La ruta es pública —cualquiera ve la media— pero se manda el token si
 * lo hay, porque `myScore` solo llega para quien ha votado. Por eso no
 * usa `pedirConSesion`, que se planta si no hay sesión: aquí «sin
 * sesión» sigue devolviendo datos útiles.
 */
export async function notaDe(animeId: string): Promise<NotaComunidad> {
  if (!animeId) return SIN_NOTAS

  const token = await tokenDeAcceso()

  try {
    const respuesta = await fetch(
      `${API_CUENTA}/ratings?animeId=${encodeURIComponent(animeId)}`,
      {
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        // La media cambia cada vez que alguien vota, y `myScore` es de
        // una persona concreta: cachear esto enseñaría la nota de otro.
        cache: 'no-store',
      },
    )
    if (!respuesta.ok) return SIN_NOTAS

    const cuerpo = (await respuesta.json()) as {
      success: boolean
      data?: { average: number | null; count: number; myScore: number | null }
    }
    if (!cuerpo.success || !cuerpo.data) return SIN_NOTAS

    return {
      media: cuerpo.data.average,
      votos: cuerpo.data.count ?? 0,
      miNota: cuerpo.data.myScore,
    }
  } catch {
    // Que no se pueda leer la nota no puede tumbar la ficha entera.
    return SIN_NOTAS
  }
}
