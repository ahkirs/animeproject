/* Ajustes de cuenta: lectura.

   El backend lleva montada una página de seguridad entera —contraseña,
   email, 2FA con TOTP y sesiones activas revocables— que la web nunca
   llegó a ofrecer: donde debía estar había dos botones desactivados.

   Las escrituras están en lib/acciones-cuenta.ts. Aquí solo se lee, para
   que este archivo pueda importarse desde donde haga falta sin arrastrar
   la directiva de servidor. */

import { pedirConSesion } from './sesion'

/** Una sesión abierta: un refresh token vigente. */
export interface SesionActiva {
  id: string
  /** Navegador y sistema, tal y como los reporta el agente de usuario. */
  dispositivo: string
  ip: string | null
  creada: string
  ultimoUso: string | null
  /** La sesión desde la que se está mirando ahora mismo. No se ofrece
   *  cerrarla: para eso está el botón de cerrar sesión. */
  actual: boolean
}

function aSesion(fila: Record<string, unknown>): SesionActiva {
  return {
    id: String(fila.id ?? ''),
    dispositivo: String(
      fila.device ?? fila.userAgent ?? fila.dispositivo ?? 'Dispositivo desconocido',
    ),
    ip: (fila.ip as string) || null,
    creada: String(fila.createdAt ?? new Date().toISOString()),
    ultimoUso: (fila.lastUsedAt as string) || (fila.updatedAt as string) || null,
    actual: Boolean(fila.current ?? fila.isCurrent ?? false),
  }
}

/** Las sesiones abiertas de la cuenta, de más reciente a más antigua. */
export async function sesionesActivas(): Promise<SesionActiva[]> {
  try {
    const datos = await pedirConSesion<unknown>('/user/sessions')
    if (!datos) return []
    const filas = (
      Array.isArray(datos) ? datos : ((datos as { items?: unknown[] }).items ?? [])
    ) as Record<string, unknown>[]

    return filas
      .map(aSesion)
      .sort((a, b) => (b.ultimoUso ?? b.creada).localeCompare(a.ultimoUso ?? a.creada))
  } catch {
    return []
  }
}

/** Lo que devuelve arrancar el alta de 2FA. El backend genera el PNG del
 *  código, así que no hace falta ninguna librería de QR en el cliente:
 *  `qr` va directo a un <img src>. */
export interface Alta2FA {
  /** El secreto en texto, para quien prefiera teclearlo a escanear. */
  secreto: string
  qr: string
}
