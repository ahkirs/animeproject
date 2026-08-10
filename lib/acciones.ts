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

const SIN_SESION = 'Entra en tu cuenta para hacer esto.'
const CADUCADA = 'Tu sesión ha caducado. Vuelve a entrar.'
const GENERICO = 'No se pudo completar. Prueba otra vez.'

async function borrar(ruta: string, dondeRevalidar: string): Promise<Resultado> {
  try {
    const respuesta = await pedirConSesion<unknown>(ruta, { method: 'DELETE' })
    // `null` aquí significa que no hay sesión o que ya no vale.
    if (respuesta === null) return { ok: false, error: CADUCADA }
    revalidatePath(dondeRevalidar)
    return { ok: true }
  } catch {
    return { ok: false, error: GENERICO }
  }
}

/** Envía un cuerpo JSON y normaliza el resultado. */
async function enviar(
  ruta: string,
  cuerpo: unknown,
  { metodo = 'POST', revalidar }: { metodo?: string; revalidar?: string | string[] } = {},
): Promise<Resultado> {
  try {
    const respuesta = await pedirConSesion<unknown>(ruta, {
      method: metodo,
      body: JSON.stringify(cuerpo),
    })
    if (respuesta === null) return { ok: false, error: SIN_SESION }
    for (const r of revalidar ? [revalidar].flat() : []) revalidatePath(r)
    return { ok: true }
  } catch {
    return { ok: false, error: GENERICO }
  }
}

/* ------------------------------------------------------------
   Historial
   ------------------------------------------------------------ */

export async function quitarDelHistorial(episodeId: string): Promise<Resultado> {
  if (!episodeId) return { ok: false, error: 'Falta el episodio.' }
  return borrar(`/user/history/${encodeURIComponent(episodeId)}`, '/mi-lista')
}

/**
 * Guarda por dónde va un episodio.
 *
 * Esta es la pieza que faltaba en todo el sitio. El endpoint existía
 * desde el principio y no lo llamaba nadie, así que el historial estaba
 * siempre vacío y «Seguir viendo» era una lista escrita a mano. Ahora la
 * llama el reproductor mientras se ve.
 *
 * El backend hace upsert por episodio, así que se puede llamar tantas
 * veces como haga falta sin acumular filas.
 *
 * No revalida nada a propósito: se llama cada pocos segundos durante la
 * reproducción, y revalidar la portada en cada latido tiraría la caché
 * del catálogo entero. Las páginas que leen el historial ya se pintan de
 * nuevo al navegar a ellas.
 */
export async function registrarProgreso(vista: {
  animeId: string
  animeTitle: string
  episodeId: string
  episodeTitle: string
  image?: string | null
  /** Segundos vistos. */
  progress: number
  /** Duración total en segundos, si se conoce. */
  duration?: number
}): Promise<Resultado> {
  if (!vista.animeId || !vista.episodeId) {
    return { ok: false, error: 'Falta el episodio.' }
  }

  return enviar('/user/history', {
    animeId: vista.animeId,
    animeTitle: vista.animeTitle,
    episodeId: vista.episodeId,
    episodeTitle: vista.episodeTitle,
    ...(vista.image ? { image: vista.image } : {}),
    progress: Math.round(vista.progress),
    ...(vista.duration ? { duration: Math.round(vista.duration) } : {}),
  })
}

export async function vaciarHistorial(episodeIds: string[]): Promise<Resultado> {
  if (episodeIds.length === 0) return { ok: true }

  // De diez en diez: mil peticiones a la vez tumbarían el proveedor y
  // seguramente nos ganaríamos un límite de ritmo. El backend no tiene
  // un borrado en bloque; si la lista crece, merece la pena pedirlo.
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
    return { ok: false, error: `Quedaron ${fallidos} sin borrar. Vuelve a intentarlo.` }
  }
  return { ok: true }
}

/* ------------------------------------------------------------
   Favoritos y ver después
   ------------------------------------------------------------ */

/** Lo que el backend exige para dar de alta una obra en cualquiera de
 *  las dos colecciones. */
export interface ObraParaGuardar {
  animeId: string
  titulo: string
  imagen?: string | null
  tipo?: string
}

/**
 * Guarda una obra en favoritos.
 *
 * Esto estaba roto: se mandaba solo `{ animeId }` porque el cuerpo se
 * había deducido en vez de leerlo. El esquema real exige además `title`,
 * así que el backend rechazaba **todas** las altas y la estrella no
 * guardaba nada. Confirmado contra el OpenAPI, que vive en
 * /api/docs/swagger-ui-init.js.
 */
export async function guardarEnFavoritos(obra: ObraParaGuardar): Promise<Resultado> {
  if (!obra.animeId || !obra.titulo) return { ok: false, error: 'Falta la serie.' }
  return enviar(
    '/user/favorites',
    {
      animeId: obra.animeId,
      title: obra.titulo,
      ...(obra.imagen ? { image: obra.imagen } : {}),
      ...(obra.tipo ? { type: obra.tipo } : {}),
    },
    { revalidar: '/mi-lista' },
  )
}

export async function quitarDeFavoritos(animeId: string): Promise<Resultado> {
  if (!animeId) return { ok: false, error: 'Falta la serie.' }
  return borrar(`/user/favorites/${encodeURIComponent(animeId)}`, '/mi-lista')
}

/** Misma forma que favoritos: son dos colecciones planas con el mismo
 *  esquema, y el backend las trata igual. */
export async function guardarEnWatchlist(obra: ObraParaGuardar): Promise<Resultado> {
  if (!obra.animeId || !obra.titulo) return { ok: false, error: 'Falta la serie.' }
  return enviar(
    '/user/watchlist',
    {
      animeId: obra.animeId,
      title: obra.titulo,
      ...(obra.imagen ? { image: obra.imagen } : {}),
      ...(obra.tipo ? { type: obra.tipo } : {}),
    },
    { revalidar: '/mi-lista' },
  )
}

export async function quitarDeWatchlist(animeId: string): Promise<Resultado> {
  if (!animeId) return { ok: false, error: 'Falta la serie.' }
  return borrar(`/user/watchlist/${encodeURIComponent(animeId)}`, '/mi-lista')
}

/* ------------------------------------------------------------
   Notas de la comunidad
   ------------------------------------------------------------ */

/** Puntúa una obra del 1 al 10. Repetir sobrescribe: el backend hace
 *  upsert, así que no hay que borrar antes de volver a votar. */
export async function calificar(animeId: string, nota: number): Promise<Resultado> {
  if (!animeId) return { ok: false, error: 'Falta la serie.' }
  if (!Number.isInteger(nota) || nota < 1 || nota > 10) {
    return { ok: false, error: 'La nota va del 1 al 10.' }
  }
  return enviar(
    '/ratings',
    { animeId, score: nota },
    { revalidar: `/serie/${animeId}` },
  )
}

export async function quitarNota(animeId: string): Promise<Resultado> {
  if (!animeId) return { ok: false, error: 'Falta la serie.' }
  return borrar(`/ratings/${encodeURIComponent(animeId)}`, `/serie/${animeId}`)
}

/* ------------------------------------------------------------
   Comentarios
   ------------------------------------------------------------ */

export async function publicarComentario(datos: {
  animeId: string
  episodeId?: string
  /** Si va, el comentario es una respuesta a ese otro. */
  parentId?: string
  texto: string
}): Promise<Resultado> {
  const texto = datos.texto.trim()
  if (!datos.animeId) return { ok: false, error: 'Falta la serie.' }
  if (!texto) return { ok: false, error: 'Escribe algo antes de publicar.' }

  return enviar(
    '/comments',
    {
      animeId: datos.animeId,
      ...(datos.episodeId ? { episodeId: datos.episodeId } : {}),
      ...(datos.parentId ? { parentId: datos.parentId } : {}),
      content: texto,
    },
    { revalidar: `/serie/${datos.animeId}` },
  )
}

export async function editarComentario(
  id: string,
  texto: string,
  animeId: string,
): Promise<Resultado> {
  const limpio = texto.trim()
  if (!id) return { ok: false, error: 'Falta el comentario.' }
  if (!limpio) return { ok: false, error: 'El comentario no puede quedarse vacío.' }
  return enviar(
    `/comments/${encodeURIComponent(id)}`,
    { content: limpio },
    { metodo: 'PUT', revalidar: `/serie/${animeId}` },
  )
}

export async function borrarComentario(
  id: string,
  animeId: string,
): Promise<Resultado> {
  if (!id) return { ok: false, error: 'Falta el comentario.' }
  return borrar(`/comments/${encodeURIComponent(id)}`, `/serie/${animeId}`)
}

/** Da o quita el like. El backend usa dos verbos sobre la misma ruta, así
 *  que quien llama dice en qué estado quiere quedarse, no qué acción
 *  hacer: así no hay forma de desincronizar el botón. */
export async function marcarMeGusta(
  id: string,
  gustado: boolean,
  animeId: string,
): Promise<Resultado> {
  if (!id) return { ok: false, error: 'Falta el comentario.' }
  if (gustado) {
    return enviar(`/comments/${encodeURIComponent(id)}/like`, {}, {
      revalidar: `/serie/${animeId}`,
    })
  }
  return borrar(`/comments/${encodeURIComponent(id)}/like`, `/serie/${animeId}`)
}

export async function reportarComentario(
  id: string,
  motivo: string,
): Promise<Resultado> {
  if (!id) return { ok: false, error: 'Falta el comentario.' }
  return enviar(`/comments/${encodeURIComponent(id)}/report`, {
    reason: motivo.trim() || 'Sin especificar',
  })
}

/* ------------------------------------------------------------
   Notificaciones
   ------------------------------------------------------------ */

export async function marcarLeida(id: string): Promise<Resultado> {
  if (!id) return { ok: false, error: 'Falta la notificación.' }
  return enviar(`/notifications/${encodeURIComponent(id)}/read`, {}, {
    revalidar: '/notificaciones',
  })
}

export async function marcarTodasLeidas(): Promise<Resultado> {
  return enviar('/notifications/read-all', {}, { revalidar: '/notificaciones' })
}
