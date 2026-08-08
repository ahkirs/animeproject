'use server'

/* Acciones de la cuenta.

   Son Server Actions y no rutas propias porque no hay nada que exponer:
   las llama el propio sitio, el token ya está en la cookie y Next se
   encarga del transporte. Cada una revalida la ruta al terminar, que es
   lo que hace que la lista se actualice sin recargar a mano.

   Todas devuelven el mismo sobre: si algo falla, la interfaz lo enseña
   en lugar de tragárselo. */

import { revalidatePath } from 'next/cache'
import { pedirConSesion } from './sesion'

export interface Resultado {
  ok: boolean
  error?: string
}

async function borrar(ruta: string, dondeRevalidar: string): Promise<Resultado> {
  try {
    const respuesta = await pedirConSesion<unknown>(ruta, { method: 'DELETE' })
    // `null` aquí significa que no hay sesión o que ya no vale.
    if (respuesta === null) {
      return { ok: false, error: 'Tu sesión ha caducado. Vuelve a entrar.' }
    }
    revalidatePath(dondeRevalidar)
    return { ok: true }
  } catch {
    return { ok: false, error: 'No se pudo completar. Prueba otra vez.' }
  }
}

export async function quitarDelHistorial(episodeId: string): Promise<Resultado> {
  if (!episodeId) return { ok: false, error: 'Falta el episodio.' }
  return borrar(`/user/history/${encodeURIComponent(episodeId)}`, '/mi-lista')
}

export async function quitarDeFavoritos(animeId: string): Promise<Resultado> {
  if (!animeId) return { ok: false, error: 'Falta la serie.' }
  return borrar(`/user/favorites/${encodeURIComponent(animeId)}`, '/mi-lista')
}

export async function quitarDeWatchlist(animeId: string): Promise<Resultado> {
  if (!animeId) return { ok: false, error: 'Falta la serie.' }
  return borrar(`/user/watchlist/${encodeURIComponent(animeId)}`, '/mi-lista')
}

/**
 * Vacía el historial entero.
 *
 * El backend no tiene un borrado en bloque: solo
 * `DELETE /user/history/{episodeId}`. Así que hay que ir uno por uno, y
 * por eso esto avisa de cuántos quedaron sin borrar en vez de decir que
 * todo fue bien. Si la lista es larga, merece la pena que el backend
 * añada un `DELETE /user/history` y esto se convierta en una llamada.
 */
export async function vaciarHistorial(episodeIds: string[]): Promise<Resultado> {
  if (episodeIds.length === 0) return { ok: true }

  // De diez en diez: mil peticiones a la vez tumbarían el proveedor y
  // seguramente nos ganaríamos un límite de ritmo.
  let fallidos = 0
  for (let i = 0; i < episodeIds.length; i += 10) {
    const tanda = episodeIds.slice(i, i + 10)
    const resultados = await Promise.all(
      tanda.map((id) =>
        pedirConSesion<unknown>(`/user/history/${encodeURIComponent(id)}`, {
          method: 'DELETE',
        }).catch(() => null),
      ),
    )
    fallidos += resultados.filter((r) => r === null).length
  }

  revalidatePath('/mi-lista')

  if (fallidos > 0) {
    return {
      ok: false,
      error: `Quedaron ${fallidos} sin borrar. Vuelve a intentarlo.`,
    }
  }
  return { ok: true }
}
