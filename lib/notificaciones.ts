/* Notificaciones.
   Respuestas a tus comentarios y episodios nuevos de lo que sigues.

   El backend lleva esto montado desde hace tiempo —GET /notifications,
   /read-all y /{id}/read— y la web no lo llamaba nunca. Las formas de
   aquí salen del OpenAPI real, que está en
   /api/docs/swagger-ui-init.js (los /api/docs-json de costumbre dan 404).

   Como todo lo que cuelga de una sesión, cuando no hay usuario esto
   devuelve vacío en vez de fallar: «no has entrado» es un estado que se
   pinta, no un error. */

import { pedirConSesion } from './sesion'

/** Los tipos que emite el backend hoy. Se deja `string` de escape porque
 *  la lista puede crecer y una notificación desconocida tiene que poder
 *  pintarse igual, con su icono genérico. */
export type TipoNotificacion =
  | 'COMMENT_REPLY'
  | 'COMMENT_LIKE'
  | 'NEW_EPISODE'
  | (string & {})

export interface Notificacion {
  id: string
  tipo: TipoNotificacion
  titulo: string
  cuerpo: string
  /** A dónde lleva al pulsarla. Puede no haber destino. */
  href: string | null
  leida: boolean
  creada: string
}

export interface PaginaNotificaciones {
  filas: Notificacion[]
  total: number
  pagina: number
  paginas: number
  /** Cuántas quedan sin leer, para el punto de la campana. */
  sinLeer: number
}

const VACIA: PaginaNotificaciones = {
  filas: [],
  total: 0,
  pagina: 1,
  paginas: 1,
  sinLeer: 0,
}

/** El backend compone el destino a partir del anime y el episodio; si
 *  algún día manda un `url` ya hecho, se respeta ese. */
function destinoDe(fila: Record<string, unknown>): string | null {
  const directo = fila.url ?? fila.link ?? fila.href
  if (typeof directo === 'string' && directo !== '') return directo

  const anime = fila.animeId
  if (typeof anime !== 'string' || anime === '') return null
  return `/serie/${anime}`
}

function aNotificacion(fila: Record<string, unknown>): Notificacion {
  return {
    id: String(fila.id ?? ''),
    tipo: String(fila.type ?? fila.tipo ?? 'GENERIC'),
    titulo: String(fila.title ?? fila.titulo ?? ''),
    cuerpo: String(fila.body ?? fila.message ?? fila.content ?? ''),
    href: destinoDe(fila),
    leida: Boolean(fila.read ?? fila.isRead ?? false),
    creada: String(fila.createdAt ?? fila.creada ?? new Date().toISOString()),
  }
}

export async function notificaciones({
  pagina = 1,
  porPagina = 20,
  soloNoLeidas = false,
}: {
  pagina?: number
  porPagina?: number
  soloNoLeidas?: boolean
} = {}): Promise<PaginaNotificaciones> {
  const parametros = new URLSearchParams({
    page: String(pagina),
    limit: String(porPagina),
  })
  if (soloNoLeidas) parametros.set('unreadOnly', 'true')

  let datos: Record<string, unknown> | null
  try {
    datos = await pedirConSesion<Record<string, unknown>>(
      `/notifications?${parametros}`,
    )
  } catch {
    // La campana no puede tumbar el marco entero: si el servicio falla,
    // se pinta sin punto y ya.
    return VACIA
  }
  if (!datos) return VACIA

  const crudas = (
    Array.isArray(datos) ? datos : (datos.items ?? datos.results ?? [])
  ) as Record<string, unknown>[]

  const filas = crudas.map(aNotificacion)
  const total = Number(datos.total ?? filas.length)

  return {
    filas,
    total,
    pagina: Number(datos.page ?? pagina),
    paginas: Number(datos.totalPages ?? datos.pages ?? Math.max(1, Math.ceil(total / porPagina))),
    // Si el backend no manda la cuenta, se deduce de lo que hay a la
    // vista. Es un mínimo, no el total, pero basta para encender el punto.
    sinLeer: Number(datos.unread ?? datos.unreadCount ?? filas.filter((f) => !f.leida).length),
  }
}

/** Solo la cuenta de no leídas, para el punto de la campana del marco.
 *  Pide una sola fila: lo que interesa es el contador, no la lista. */
export async function sinLeer(): Promise<number> {
  const pagina = await notificaciones({ pagina: 1, porPagina: 1, soloNoLeidas: true })
  return pagina.total || pagina.sinLeer
}
