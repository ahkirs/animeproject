'use server'

/* Ajustes de cuenta: escritura.

   Va en un archivo aparte de lib/acciones.ts porque es otro dominio —lo
   de aquí toca credenciales— y porque un archivo con 'use server' solo
   puede exportar funciones asíncronas: los tipos de la cuenta viven en
   lib/cuenta.ts, que sí se puede importar desde cualquier sitio.

   Las formas están leídas del OpenAPI real, no deducidas. */

import { revalidatePath } from 'next/cache'
import { pedirConSesion } from './sesion'
import type { Alta2FA } from './cuenta'

export interface Resultado {
  ok: boolean
  error?: string
}

const SIN_SESION = 'Tu sesión ha caducado. Vuelve a entrar.'

/** Llama y traduce el fallo.
 *
 *  A diferencia de las acciones del catálogo, aquí el mensaje del backend
 *  sí se enseña: «la contraseña actual no es correcta» o «ese código no
 *  vale» son justo lo que la persona necesita leer, y un «no se pudo
 *  completar» genérico la dejaría adivinando. */
async function llamar<T = unknown>(
  ruta: string,
  opciones: RequestInit,
  revalidar?: string,
): Promise<{ ok: boolean; error?: string; datos?: T }> {
  try {
    const datos = await pedirConSesion<T>(ruta, opciones)
    if (datos === null) return { ok: false, error: SIN_SESION }
    if (revalidar) revalidatePath(revalidar)
    return { ok: true, datos }
  } catch (fallo) {
    const mensaje =
      fallo instanceof Error && fallo.message ? fallo.message : 'No se pudo completar.'
    return { ok: false, error: mensaje }
  }
}

/* ------------------------------------------------------------
   Perfil
   ------------------------------------------------------------ */

export async function guardarPerfil(datos: {
  alias?: string
  avatar?: string
  bio?: string
}): Promise<Resultado> {
  const cuerpo: Record<string, string> = {}
  if (datos.alias?.trim()) cuerpo.username = datos.alias.trim()
  if (datos.avatar !== undefined) cuerpo.avatarUrl = datos.avatar.trim()
  if (datos.bio !== undefined) cuerpo.bio = datos.bio.trim()

  if (Object.keys(cuerpo).length === 0) {
    return { ok: false, error: 'No hay nada que guardar.' }
  }

  const r = await llamar('/user/profile', {
    method: 'PUT',
    body: JSON.stringify(cuerpo),
  })
  // El alias sale en el marco y en el perfil público, así que los dos
  // tienen que volver a pintarse.
  if (r.ok) {
    revalidatePath('/cuenta')
    revalidatePath('/mi-lista')
    revalidatePath('/', 'layout')
  }
  return { ok: r.ok, error: r.error }
}

/* ------------------------------------------------------------
   Credenciales
   ------------------------------------------------------------ */

export async function cambiarContrasena(
  actual: string,
  nueva: string,
): Promise<Resultado> {
  if (!actual || !nueva) return { ok: false, error: 'Rellena las dos casillas.' }
  if (nueva.length < 8) {
    return { ok: false, error: 'La nueva contraseña necesita ocho caracteres o más.' }
  }
  if (actual === nueva) {
    return { ok: false, error: 'La nueva contraseña es la misma que la actual.' }
  }

  // Cambiar la contraseña invalida las demás sesiones, así que la lista
  // de dispositivos que se está viendo deja de ser cierta.
  return llamar(
    '/user/change-password',
    {
      method: 'PUT',
      body: JSON.stringify({ currentPassword: actual, newPassword: nueva }),
    },
    '/cuenta',
  )
}

export async function cambiarEmail(
  nuevo: string,
  contrasena: string,
): Promise<Resultado> {
  if (!nuevo.trim()) return { ok: false, error: 'Escribe el correo nuevo.' }
  if (!contrasena) return { ok: false, error: 'Hace falta tu contraseña.' }

  // El backend vuelve a marcar la cuenta como no verificada y manda un
  // correo nuevo: eso cambia el aviso de la página.
  return llamar(
    '/user/email',
    {
      method: 'PUT',
      body: JSON.stringify({ newEmail: nuevo.trim(), password: contrasena }),
    },
    '/cuenta',
  )
}

/* ------------------------------------------------------------
   Verificación en dos pasos
   ------------------------------------------------------------ */

/** Genera un secreto nuevo y su QR. No activa nada todavía: hasta que no
 *  se confirma con un código válido, la cuenta sigue igual. */
export async function prepararDobleFactor(): Promise<
  Resultado & { alta?: Alta2FA }
> {
  const r = await llamar<{ secret: string; qrCodeDataUrl: string }>(
    '/user/2fa/setup',
    { method: 'POST' },
  )
  if (!r.ok || !r.datos) return { ok: false, error: r.error }

  return {
    ok: true,
    alta: { secreto: r.datos.secret, qr: r.datos.qrCodeDataUrl },
  }
}

/** Confirma el alta. Hay que devolver el mismo secreto que dio
 *  `prepararDobleFactor` junto al código que enseña la aplicación. */
export async function activarDobleFactor(
  secreto: string,
  codigo: string,
): Promise<Resultado> {
  if (!secreto) return { ok: false, error: 'Vuelve a empezar la configuración.' }
  if (!/^\d{6}$/.test(codigo.trim())) {
    return { ok: false, error: 'El código son seis cifras.' }
  }
  return llamar(
    '/user/2fa/enable',
    { method: 'POST', body: JSON.stringify({ secret: secreto, code: codigo.trim() }) },
    '/cuenta',
  )
}

export async function desactivarDobleFactor(
  contrasena: string,
  codigo: string,
): Promise<Resultado> {
  if (!contrasena) return { ok: false, error: 'Hace falta tu contraseña.' }
  if (!/^\d{6}$/.test(codigo.trim())) {
    return { ok: false, error: 'El código son seis cifras.' }
  }
  return llamar(
    '/user/2fa/disable',
    {
      method: 'POST',
      body: JSON.stringify({ password: contrasena, code: codigo.trim() }),
    },
    '/cuenta',
  )
}

/* ------------------------------------------------------------
   Sesiones
   ------------------------------------------------------------ */

export async function cerrarSesionRemota(id: string): Promise<Resultado> {
  if (!id) return { ok: false, error: 'Falta la sesión.' }
  return llamar(
    `/user/sessions/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
    '/cuenta',
  )
}

/** Cierra todas menos esta. Es el botón de «me he dejado la sesión
 *  abierta en otro sitio». */
export async function cerrarLasDemasSesiones(): Promise<Resultado> {
  return llamar('/user/sessions', { method: 'DELETE' }, '/cuenta')
}

/* ------------------------------------------------------------
   Baja
   ------------------------------------------------------------ */

export async function borrarCuenta(contrasena: string): Promise<Resultado> {
  if (!contrasena) return { ok: false, error: 'Hace falta tu contraseña.' }
  return llamar('/user/delete-account', {
    method: 'DELETE',
    body: JSON.stringify({ password: contrasena }),
  })
}
