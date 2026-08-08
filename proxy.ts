/* Renovación del token antes de pintar.

   En Next 16 esto era `middleware.ts`; el archivo se llama `proxy.ts` y
   exporta `proxy`. Se comprobó en node_modules/next/dist/docs, que dice
   que middleware queda obsoleto y renombrado.

   Por qué vive aquí y no en la capa de sesión: un componente de servidor
   NO puede escribir cookies mientras pinta. Si el accessToken caduca a
   mitad de una visita, `lib/sesion.ts` no puede renovarlo y guardarlo.
   Esto se ejecuta antes del render, que es el único punto donde se puede
   hacer las dos cosas.

   La regla es sencilla: si falta el token de acceso pero queda refresh,
   se intenta renovar una vez. Si no se puede, se sigue sin sesión — la
   página ya sabe pintarse sin ella. */

import { NextResponse, type NextRequest } from 'next/server'

const COOKIE_ACCESO = 'accessToken'
const COOKIE_REFRESCO = 'refreshToken'

/** Rutas que no tienen nada que enseñar sin sesión. */
const PRIVADAS = ['/mi-lista']

export async function proxy(peticion: NextRequest) {
  const acceso = peticion.cookies.get(COOKIE_ACCESO)?.value
  const refresco = peticion.cookies.get(COOKIE_REFRESCO)?.value
  const ruta = peticion.nextUrl.pathname

  /* El redirect de una página privada se hace aquí y no con `redirect()`
     dentro de ella. Con un loading.tsx de por medio, Next ya ha empezado
     a enviar la respuesta cuando la página se ejecuta: el redirect se
     pinta pero el estado se queda en 200, y quien no ejecute JavaScript
     —un rastreador— recibe una página en blanco. Esto corre antes del
     render, así que devuelve un 307 de verdad. */
  if (!acceso && !refresco && PRIVADAS.some((p) => ruta.startsWith(p))) {
    const destino = new URL('/acceder', peticion.url)
    destino.searchParams.set('destino', ruta)
    return NextResponse.redirect(destino)
  }

  // Con sesión válida, o sin nada que renovar, no hay trabajo que hacer.
  if (acceso || !refresco) return NextResponse.next()

  const destino = new URL('/api/auth/renovar', peticion.url)

  try {
    const respuesta = await fetch(destino, {
      method: 'POST',
      headers: { Cookie: `${COOKIE_REFRESCO}=${refresco}` },
    })

    const salida = NextResponse.next()

    if (respuesta.ok) {
      // Las cookies que emitió la ruta se copian a esta respuesta, para
      // que el navegador las reciba y el render de abajo ya las vea.
      for (const galleta of respuesta.headers.getSetCookie()) {
        salida.headers.append('Set-Cookie', galleta)
      }
    } else {
      // El refresh ya no vale: se retira para no reintentar en cada
      // navegación, que serían dos peticiones de más por página.
      salida.cookies.delete(COOKIE_REFRESCO)
    }

    return salida
  } catch {
    // La API caída no debe impedir ver el catálogo.
    return NextResponse.next()
  }
}

export const config = {
  /* Sin matcher esto correría también sobre /_next/static, las imágenes
     y todo lo de public/, que es una llamada de red por cada archivo.
     Se excluyen, y también /api/auth para no morderse la cola. */
  matcher: [
    '/((?!_next/static|_next/image|api/auth|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|txt|xml)$).*)',
  ],
}
