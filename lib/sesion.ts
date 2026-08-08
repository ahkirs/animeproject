/* Sesión del usuario.

   El backend emite dos cookies HttpOnly, `accessToken` y `refreshToken`,
   desde SU dominio. Como el sitio corre en otro origen, para el navegador
   serían cookies de terceros: Safari ya las bloquea y Chrome va detrás.
   Funcionaría en el navegador de quien lo programa y fallaría en el móvil
   de cualquier otro, que es la peor clase de fallo.

   Por eso el navegador nunca habla con el backend. Habla con las rutas
   de /api/auth de este mismo sitio, que llaman al backend desde el
   servidor y reemiten la cookie en NUESTRO dominio. Primera parte, sin
   bloqueo, y el token nunca pasa por JavaScript.

   Este archivo es la mitad de lectura: quién es el usuario y cómo se
   llama a la API en su nombre. La de escritura vive en las rutas. */

/* Este archivo no puede acabar en el paquete del navegador: lee cookies
   HttpOnly y llevaría el token al cliente. `server-only` hace que
   importarlo desde un componente de cliente falle al compilar, con el
   nombre del archivo culpable, en vez de dar un error de módulo. */
import 'server-only'

import { cache } from 'react'
import { cookies } from 'next/headers'
import { API_CUENTA, ApiError } from './api'
import type { PerfilUsuario } from './perfil'

export const COOKIE_ACCESO = 'accessToken'
export const COOKIE_REFRESCO = 'refreshToken'

/** Opciones con las que se emiten las dos cookies. Se declaran una sola
 *  vez porque tienen que coincidir exactamente al ponerlas y al
 *  borrarlas: si `path` no coincide, el borrado no surte efecto. */
export const OPCIONES_COOKIE = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
} as const

/** Duración por defecto si el backend no dice otra cosa. */
export const VIDA_ACCESO = 60 * 15 // 15 min
export const VIDA_REFRESCO = 60 * 60 * 24 * 30 // 30 días

export async function tokenDeAcceso(): Promise<string | null> {
  const tarro = await cookies()
  return tarro.get(COOKIE_ACCESO)?.value ?? null
}

/**
 * Llama a la API en nombre del usuario.
 *
 * Devuelve `null` cuando no hay sesión o el token ya no vale, en lugar de
 * lanzar: para una página, «no hay sesión» es un estado normal que se
 * pinta, no un error que reviente el render. Los fallos de verdad —la
 * API caída, un 500— sí se lanzan.
 *
 * El token caducado lo renueva `proxy.ts` antes de que la petición llegue
 * aquí. No se puede hacer en este punto porque un componente de servidor
 * no puede escribir cookies mientras pinta.
 */
export async function pedirConSesion<T>(
  ruta: string,
  opciones: RequestInit = {},
): Promise<T | null> {
  const token = await tokenDeAcceso()
  if (!token) return null

  let respuesta: Response
  try {
    respuesta = await fetch(`${API_CUENTA}${ruta}`, {
      ...opciones,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        ...(opciones.body ? { 'Content-Type': 'application/json' } : {}),
        ...opciones.headers,
      },
      // Nada de lo que hay detrás de una sesión se cachea: es de una
      // persona concreta y cambia cuando ella lo cambia.
      cache: 'no-store',
    })
  } catch {
    throw new ApiError('No se pudo contactar con el servidor.')
  }

  if (respuesta.status === 401 || respuesta.status === 403) return null
  if (!respuesta.ok) {
    throw new ApiError(`La API respondió ${respuesta.status}.`, respuesta.status)
  }

  const cuerpo = (await respuesta.json()) as { success: boolean; data: T; error?: string }
  if (!cuerpo.success) throw new ApiError(cuerpo.error ?? 'Error de la API.')
  return cuerpo.data
}

/**
 * El usuario de esta petición, o null si no hay sesión.
 *
 * Va envuelto en `cache` de React para que las cinco o seis cosas que lo
 * consultan en un mismo render —la cabecera, la página, un componente
 * suelto— no hagan cinco llamadas a /user/profile.
 */
export const usuarioActual = cache(async (): Promise<PerfilUsuario | null> => {
  try {
    return await pedirConSesion<PerfilUsuario>('/user/profile')
  } catch {
    // Si la API está caída, el sitio se comporta como si no hubiera
    // sesión en lugar de caerse entero. Se pierde el nombre en la
    // cabecera; no se pierde la página.
    return null
  }
})

export async function haySesion(): Promise<boolean> {
  return (await tokenDeAcceso()) !== null
}
