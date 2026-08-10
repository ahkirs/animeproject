/* Comentarios.

   Van por obra y, opcionalmente, por episodio: el mismo endpoint sirve
   la conversación de la ficha y la del reproductor, y lo único que
   cambia es si se manda `episodeId`.

   La escritura vive en lib/acciones.ts. Aquí solo se lee.

   AVISO sobre las formas: `GET /comments?animeId=…` está confirmado y
   devuelve `{ items, page, limit, total, totalPages }`, pero hoy no hay
   ni un comentario publicado en producción, así que **la forma de cada
   fila está deducida**, no observada. Lo que se sabe seguro es lo que
   pide el POST (`animeId`, `episodeId`, `parentId`, `content`) y de ahí
   salen los nombres. Por eso el mapeo acepta varios alias por campo y no
   se rompe si falta ninguno: el día que haya datos reales, hay que
   contrastarlo antes de dar nada por bueno. */

import { API_CUENTA } from './api'
import { tokenDeAcceso } from './sesion'

export interface Autor {
  id: string
  alias: string
  avatar: string | null
}

export interface Comentario {
  id: string
  texto: string
  autor: Autor
  creado: string
  /** Distinto de `creado` si se editó. */
  editado: string | null
  meGusta: number
  /** Si tú le has dado. Falso sin sesión. */
  leHeDado: boolean
  /** Si es tuyo: decide si se ofrecen editar y borrar. */
  esMio: boolean
  /** Borrado lógico: el backend conserva la fila para no dejar
   *  huérfanas las respuestas. Se pinta como «eliminado». */
  eliminado: boolean
  respuestas: Comentario[]
}

export interface PaginaComentarios {
  filas: Comentario[]
  total: number
  pagina: number
  paginas: number
}

const VACIA: PaginaComentarios = { filas: [], total: 0, pagina: 1, paginas: 1 }

function autorDe(fila: Record<string, unknown>): Autor {
  const usuario = (fila.user ?? fila.author ?? {}) as Record<string, unknown>
  return {
    id: String(usuario.id ?? ''),
    alias: String(usuario.username ?? usuario.alias ?? 'Alguien'),
    avatar: (usuario.avatarUrl as string) || null,
  }
}

function aComentario(
  fila: Record<string, unknown>,
  yo: string | null,
): Comentario {
  const autor = autorDe(fila)
  const creado = String(fila.createdAt ?? new Date().toISOString())
  const actualizado = fila.updatedAt ? String(fila.updatedAt) : null

  const hijas = (fila.replies ?? fila.children ?? []) as Record<string, unknown>[]

  return {
    id: String(fila.id ?? ''),
    texto: String(fila.content ?? fila.texto ?? ''),
    autor,
    creado,
    // Solo cuenta como editado si la marca de actualización se separa de
    // la de creación: el backend las iguala al insertar.
    editado: actualizado && actualizado !== creado ? actualizado : null,
    meGusta: Number(fila.likeCount ?? fila.likes ?? 0),
    leHeDado: Boolean(fila.likedByMe ?? fila.isLiked ?? false),
    esMio: !!yo && autor.id === yo,
    eliminado: Boolean(fila.deleted ?? fila.isDeleted ?? false),
    respuestas: Array.isArray(hijas) ? hijas.map((h) => aComentario(h, yo)) : [],
  }
}

/**
 * Comentarios de primer nivel de una obra, con sus respuestas dentro.
 *
 * Es una ruta pública, pero se manda el token si lo hay: sin él no se
 * puede saber cuáles son tuyos ni a cuáles has dado like, y los botones
 * de editar y borrar no aparecerían nunca.
 */
export async function comentariosDe({
  animeId,
  episodeId,
  pagina = 1,
  porPagina = 20,
  /** Id del usuario de la sesión, para marcar los propios. */
  yo = null,
}: {
  animeId: string
  episodeId?: string
  pagina?: number
  porPagina?: number
  yo?: string | null
}): Promise<PaginaComentarios> {
  if (!animeId) return VACIA

  const parametros = new URLSearchParams({
    animeId,
    page: String(pagina),
    limit: String(porPagina),
  })
  if (episodeId) parametros.set('episodeId', episodeId)

  const token = await tokenDeAcceso()

  try {
    const respuesta = await fetch(`${API_CUENTA}/comments?${parametros}`, {
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: 'no-store',
    })
    if (!respuesta.ok) return VACIA

    const cuerpo = (await respuesta.json()) as {
      success: boolean
      data?: Record<string, unknown>
    }
    if (!cuerpo.success || !cuerpo.data) return VACIA

    const datos = cuerpo.data
    const crudas = (datos.items ?? datos.results ?? []) as Record<string, unknown>[]
    const total = Number(datos.total ?? crudas.length)

    return {
      filas: crudas.map((f) => aComentario(f, yo)),
      total,
      pagina: Number(datos.page ?? pagina),
      paginas: Number(
        datos.totalPages ?? Math.max(1, Math.ceil(total / porPagina)),
      ),
    }
  } catch {
    // Una conversación que no carga no puede llevarse por delante la
    // ficha entera.
    return VACIA
  }
}
