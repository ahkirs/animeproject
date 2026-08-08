/* Puente de sesión entre el navegador y el backend.

   El navegador solo habla con estas rutas, nunca con la API. Aquí se
   llama al backend desde el servidor y se reemiten sus tokens como
   cookies de ESTE dominio. Tres cosas se ganan con eso:

   1. Las cookies son de primera parte. Las que emite el backend van con
      su dominio, y para el navegador serían de terceros: bloqueadas en
      Safari, y en Chrome cada vez más.
   2. No hace falta CORS. El navegador no cruza de origen, así que da
      igual lo que haya en ALLOWED_ORIGINS para esto.
   3. El token no pasa por JavaScript en ningún momento. Va en cookie
      HttpOnly, así que un XSS no lo puede leer.

   El backend devuelve el accessToken en el cuerpo; el refreshToken solo
   como Set-Cookie, así que ese hay que sacarlo de la cabecera. */

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { API_CUENTA } from '@/lib/api'
import {
  COOKIE_ACCESO,
  COOKIE_REFRESCO,
  OPCIONES_COOKIE,
  VIDA_ACCESO,
  VIDA_REFRESCO,
} from '@/lib/sesion'

export const runtime = 'nodejs'

const ACCIONES = ['login', 'registro', 'salir', 'renovar'] as const
type Accion = (typeof ACCIONES)[number]

/** Nuestro nombre de acción al del backend. Se traduce aquí para que las
 *  URLs del sitio estén en español sin atar nada al backend. */
const RUTA_BACKEND: Record<Accion, string> = {
  login: '/auth/login',
  registro: '/auth/register',
  salir: '/auth/logout',
  renovar: '/auth/refresh-token',
}

/** Saca el valor de una cookie de las cabeceras Set-Cookie que devuelve
 *  el backend. No se reutiliza su Domain ni su Path: se vuelve a emitir
 *  con los nuestros, que es lo que la convierte en de primera parte. */
function valorDeCookie(cabeceras: string[], nombre: string): string | null {
  for (const linea of cabeceras) {
    const [par] = linea.split(';')
    const igual = par.indexOf('=')
    if (igual === -1) continue
    if (par.slice(0, igual).trim() === nombre) {
      return decodeURIComponent(par.slice(igual + 1).trim())
    }
  }
  return null
}

interface RespuestaAuth {
  success: boolean
  error?: string
  status?: number
  data?: { accessToken?: string; user?: unknown }
}

export async function POST(
  peticion: Request,
  { params }: { params: Promise<{ accion: string }> },
) {
  const { accion } = await params
  if (!ACCIONES.includes(accion as Accion)) {
    return NextResponse.json({ ok: false, error: 'Acción desconocida.' }, { status: 404 })
  }

  const tarro = await cookies()

  // Al salir no hace falta esperar al backend para limpiar lo nuestro:
  // aunque su llamada falle, la sesión local tiene que desaparecer.
  const cuerpoEntrante =
    accion === 'salir' || accion === 'renovar' ? undefined : await peticion.text()

  // Renovar y salir se apoyan en el refresh, que va en nuestra cookie.
  const refresco = tarro.get(COOKIE_REFRESCO)?.value

  let respuesta: Response
  try {
    respuesta = await fetch(`${API_CUENTA}${RUTA_BACKEND[accion as Accion]}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...(cuerpoEntrante ? { 'Content-Type': 'application/json' } : {}),
        ...(refresco ? { Cookie: `${COOKIE_REFRESCO}=${refresco}` } : {}),
      },
      body: cuerpoEntrante,
      cache: 'no-store',
    })
  } catch {
    return NextResponse.json(
      { ok: false, error: 'No se pudo contactar con el servidor. Prueba en un momento.' },
      { status: 503 },
    )
  }

  let cuerpo: RespuestaAuth
  try {
    cuerpo = (await respuesta.json()) as RespuestaAuth
  } catch {
    cuerpo = { success: respuesta.ok }
  }

  // ---- Salir: se borra siempre, pase lo que pase arriba ----
  if (accion === 'salir') {
    tarro.delete({ name: COOKIE_ACCESO, path: OPCIONES_COOKIE.path })
    tarro.delete({ name: COOKIE_REFRESCO, path: OPCIONES_COOKIE.path })
    return NextResponse.json({ ok: true })
  }

  if (!respuesta.ok || cuerpo.success === false) {
    // El backend limita a cinco intentos por minuto y por IP. Decirlo
    // vale más que un «error» a secas: la persona sabe que no es culpa
    // de su contraseña y que basta con esperar.
    const mensaje =
      respuesta.status === 429
        ? 'Demasiados intentos. Espera un minuto y vuelve a probar.'
        : (cuerpo.error ?? 'No se pudo completar la operación.')

    return NextResponse.json({ ok: false, error: mensaje }, { status: respuesta.status })
  }

  // ---- Reemisión de los tokens en nuestro dominio ----
  const salida = NextResponse.json({ ok: true, user: cuerpo.data?.user ?? null })

  const acceso = cuerpo.data?.accessToken
  if (acceso) {
    salida.cookies.set(COOKIE_ACCESO, acceso, {
      ...OPCIONES_COOKIE,
      maxAge: VIDA_ACCESO,
    })
  }

  const nuevoRefresco = valorDeCookie(respuesta.headers.getSetCookie(), COOKIE_REFRESCO)
  if (nuevoRefresco) {
    salida.cookies.set(COOKIE_REFRESCO, nuevoRefresco, {
      ...OPCIONES_COOKIE,
      maxAge: VIDA_REFRESCO,
    })
  }

  return salida
}
