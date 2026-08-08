/* Identidad de las series en la interfaz.
   La API no ofrece un id global: animeav1 numera por dominio y animeflv
   a veces ni lo tiene. Para las rutas /serie/[id] necesitamos un id
   propio, estable y derivado de la URL, y además deduplicar el mismo
   anime que llega de varios proveedores. */

import type { ApiResultado, Proveedor } from './api-types'

export const PROVEEDORES: { id: Proveedor; nombre: string; prioridad: number }[] = [
  { id: 'animeav1', nombre: 'AnimeAV1', prioridad: 0 },
  { id: 'animeflv', nombre: 'AnimeFLV', prioridad: 1 },
]

export function proveedorDe(nombre: string | null | undefined): Proveedor {
  const texto = (nombre ?? '').toLowerCase()
  if (texto.includes('flv')) return 'animeflv'
  return 'animeav1'
}

/** Nombre legible del proveedor (AnimeAV1, AnimeFLV…). */
export function nombreProveedor(proveedor: Proveedor | string | null): string {
  const p = proveedorDe(proveedor as string)
  return PROVEEDORES.find((x) => x.id === p)?.nombre ?? (proveedor as string)
}

/** Extrae el slug final de una URL de proveedor, sin extensión. */
function slugDeUrl(url: string | null | undefined): string {
  if (!url) return ''
  const limpia = url.split('?')[0].split('#')[0].replace(/\/+$/, '')
  const partes = limpia.split('/')
  let ultima = partes[partes.length - 1] ?? ''
  ultima = ultima.replace(/\.html?$/, '')
  return encodeURIComponent(ultima)
}

/** Id canónico de una serie, estable mientras no cambie su URL. Ej.:
 *  «animeav1-one-piece», «animeflv-tsue-to-tsurugi-no-wistoria-season-2». */
export function idCanonicoDe(resultado: Pick<ApiResultado, 'url' | 'provider' | 'id'>): string {
  const proveedor = proveedorDe(resultado.provider)
  const slug = slugDeUrl(resultado.url)
  if (slug) return `${proveedor}-${slug}`
  // Sin URL no hay mejor id que el del proveedor o el número de serie.
  return resultado.id ? `${proveedor}-${resultado.id}` : `${proveedor}-anonimo`
}

/** Devuelve la URL del proveedor a partir de un id canónico, que es lo
 *  que la API espera para pedir info o episodios. */
export function urlDeId(id: string): { proveedor: Proveedor; url: string } | null {
  const prefijo = id.slice(0, id.indexOf('-'))
  if (prefijo !== 'animeav1' && prefijo !== 'animeflv') return null
  const slug = decodeURIComponent(id.slice(prefijo.length + 1))
  const url =
    prefijo === 'animeav1'
      ? `https://animeav1.com/media/${slug}`
      : `https://animeflv.net/anime/${slug}`
  return { proveedor: prefijo, url }
}

/* ------------------------------------------------------------
   Deduplicación
   Un mismo anime llega de varios proveedores. Se queda con uno por
   título, priorizando el que mejor sirve (animeav1 tiene ficha más
   completa). Se conserva el resto en «alternativas» para que la ficha
   pueda ofrecer dónde verlo.
   ------------------------------------------------------------ */

export interface Deduplicado {
  serie: ApiResultado
  alternativas: ApiResultado[]
}

export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function deduplicar(resultados: ApiResultado[]): Deduplicado[] {
  const porTitulo = new Map<string, Deduplicado>()

  for (const resultado of resultados) {
    const clave = normalizar(resultado.title)
    if (!clave) continue
    const actual = porTitulo.get(clave)
    const pActual = actual ? proveedorDe(actual.serie.provider) : null
    const pNuevo = proveedorDe(resultado.provider)

    if (!actual) {
      porTitulo.set(clave, { serie: resultado, alternativas: [] })
    } else if (pActual !== pNuevo) {
      // Quien tenga mejor prioridad se queda como principal.
      const pActualIdx = PROVEEDORES.find((x) => x.id === pActual)!.prioridad
      const pNuevoIdx = PROVEEDORES.find((x) => x.id === pNuevo)!.prioridad
      if (pNuevoIdx < pActualIdx) {
        actual.alternativas.push(actual.serie)
        actual.serie = resultado
      } else {
        actual.alternativas.push(resultado)
      }
    } else {
      actual.alternativas.push(resultado)
    }
  }

  return [...porTitulo.values()].filter(
    (d) => d.serie.title && d.serie.url,
  )
}
