/* Formato de fechas relativas.

   Vive aparte de lib/perfil.ts a propósito. Allí estaban al principio,
   por ser donde se usaban, pero perfil.ts importa lib/sesion.ts, que
   lleva `server-only`: en cuanto un componente de cliente quiso escribir
   «hace 2 h» —los comentarios, las sesiones abiertas— arrastraba el
   módulo de cookies al paquete del navegador y la compilación se caía.

   Esto es cálculo puro sobre una cadena ISO: no toca red, ni cookies, ni
   nada del servidor, así que puede usarse desde los dos lados. */

/** «hace 2 h», «ayer», «hace 3 días». */
export function haceCuanto(iso: string, referencia = Date.now()): string {
  const minutos = Math.round((referencia - Date.parse(iso)) / 60_000)
  if (!Number.isFinite(minutos)) return ''
  if (minutos < 1) return 'ahora mismo'
  if (minutos < 60) return `hace ${minutos} min`

  const horas = Math.round(minutos / 60)
  if (horas < 24) return `hace ${horas} h`

  const dias = Math.round(horas / 24)
  if (dias === 1) return 'ayer'
  if (dias < 30) return `hace ${dias} días`

  const meses = Math.round(dias / 30)
  return meses === 1 ? 'hace un mes' : `hace ${meses} meses`
}

/** Etiqueta del grupo al que pertenece una vista: Hoy, Ayer, o la fecha. */
export function grupoDeDia(iso: string, referencia = Date.now()): string {
  const dia = (t: number) => Math.floor(t / 86_400_000)
  const diferencia = dia(referencia) - dia(Date.parse(iso))

  if (!Number.isFinite(diferencia)) return 'Antes'
  if (diferencia <= 0) return 'Hoy'
  if (diferencia === 1) return 'Ayer'
  if (diferencia < 7) return 'Esta semana'
  if (diferencia < 30) return 'Este mes'
  return new Date(iso).toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
