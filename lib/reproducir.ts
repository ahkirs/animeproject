/* Resolución de embeds a URL directa de vídeo (patrón tokianime).
   El scraper entrega enlaces de reproducción que en su mayoría son
   páginas embebidas del host. Para que el <video> propio las pueda
   reproducir, este módulo del lado del servidor raspa el embed y
   extrae el archivo directo.

   Hosts soportados:
   - mp4upload: su embed HTML contiene la URL del .mp4.
   - UPNShare: expone una API (/api/v1/download) que devuelve el .mp4
     cifrado en AES-CBC; desciframos con la clave/IV que el bundle del
     sitio deriva de su location (hoy constantes para https:).
   - Zilla (HLS): la SPA de player.zilla-networks.com monta JWPlayer con
     file = https://player.zilla-networks.com/m3u8/<token>, así que ese
     manifiesto es la «URL directa» del episodio.

   NOTA: importar únicamente desde route handlers o componentes de
   servidor. Usa fetch y node:crypto, nunca debe entrar en el bundle
   del cliente. */

import { createDecipheriv } from 'node:crypto'

const UA_NAVEGADOR =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

function hostDe(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

/** Referer que el CDN de un host espera al servir el archivo de vídeo.
 *  Se pasa al proxy /api/stream para que el upstream no rechace.
 *  El CDN de UPNShare sirve sus mp4 desde IPs propias variables; se
 *  identifican por la firma del archivo (.mp4/.m3u8 o /v4/). */
export function refererDe(host: string, path = ''): string {
  if (host.includes('mp4upload')) return 'https://www.mp4upload.com/'
  if (host.includes('uns.bio')) return 'https://animeav1.uns.bio/'
  if (host.endsWith('.nevalonmedia.cyou')) return 'https://animeav1.uns.bio/'
  if (host.includes('zilla-networks')) {
    // El CDN de Zilla espera el Referer de la página del player que toca
    // ese token. En /m3u8/<token> y /segs/<token>/… el token es el 2.º
    // segmento del path; sin él, el CDN responde 403.
    const partes = path.split('/').filter(Boolean)
    const token =
      partes[0] === 'm3u8' || partes[0] === 'segs' ? partes[1] : partes[0]
    return token
      ? `https://player.zilla-networks.com/play/${token}`
      : 'https://player.zilla-networks.com/'
  }
  if (/\.(mp4|m3u8)(\/download)?(\?|$)/.test(path) || path.includes('/v4/')) {
    return 'https://animeav1.uns.bio/'
  }
  return ''
}

/** Clave y IV del cifrado AES-CBC que UPNShare aplica a su API. El bundle
 *  los construye desde window.location.protocol (https:) y el hash; hoy
 *  son constantes. Si el sitio cambia el esquema, el descifrado falla. */
const UPN_CLAVE = Buffer.from('kiemtienmua911ca', 'utf8')
const UPN_IV = Buffer.from('1234567890oiuytr', 'utf8')

/** Descifra la respuesta hex de la API de UPNShare a su JSON plano. */
function descifrarUpn(hex: string): string | null {
  try {
    const datos = Buffer.from(
      hex.match(/[\da-f]{2}/gi)?.map((b) => parseInt(b, 16)) ?? [],
    )
    const descifrador = createDecipheriv('aes-128-cbc', UPN_CLAVE, UPN_IV)
    descifrador.setAutoPadding(true)
    return Buffer.concat([
      descifrador.update(datos),
      descifrador.final(),
    ]).toString('utf8')
  } catch {
    return null
  }
}

interface Resolvedor {
  host: string
  /** Resuelve el embed a una URL directa del vídeo. */
  resolver: (embedUrl: string) => Promise<string | null>
}

const RESOLVEDORES: Resolvedor[] = [
  {
    host: 'mp4upload.com',
    resolver: async (embedUrl) => {
      const res = await fetch(embedUrl, {
        headers: {
          'User-Agent': UA_NAVEGADOR,
          Accept: 'text/html,application/xhtml+xml,*/*',
        },
        signal: AbortSignal.timeout(12_000),
      })
      if (!res.ok) return null
      const html = await res.text()
      const m = /player\.src\([\s\S]*?src:\s*"([^"]+\.mp4)"/i.exec(html)
      const directa = m?.[1] ?? null
      if (!directa || !hostDe(directa).includes('mp4upload')) return null
      return directa
    },
  },
  {
    host: 'uns.bio',
    resolver: async (embedUrl) => {
      // El id del vídeo va en el fragmento de la URL (#pn5v6w).
      const id = new URL(embedUrl).hash.replace(/^#/, '')
      if (!id) return null
      // El endpoint de descarga devuelve el mp4 directo del episodio.
      const api = `https://animeav1.uns.bio/api/v1/download?id=${encodeURIComponent(id)}&w=1920&h=1080&r=`
      const res = await fetch(api, {
        headers: {
          'User-Agent': UA_NAVEGADOR,
          Referer: 'https://animeav1.uns.bio/',
          Accept: '*/*',
        },
        signal: AbortSignal.timeout(12_000),
      })
      if (!res.ok) return null
      const hex = (await res.text()).trim()
      const plano = descifrarUpn(hex)
      if (!plano) return null
      const datos = JSON.parse(plano) as { mp4?: string }
      const directa = datos.mp4 ?? null
      if (!directa || !directa.startsWith('https://')) return null
      return directa
    },
  },
  {
    host: 'zilla-networks.com',
    resolver: async (embedUrl) => {
      // La SPA de player.zilla-networks.com/play/<token> monta JWPlayer
      // con file = https://player.zilla-networks.com/m3u8/<token>.
      const token = new URL(embedUrl).pathname.split('/').filter(Boolean).pop()
      if (!token || !/^[\da-f]{32}$/i.test(token)) return null
      return `https://player.zilla-networks.com/m3u8/${token}`
    },
  },
]

/** Dado el embed de un host soportado, devuelve la URL directa del vídeo
 *  o null si no se pudo resolver (host no soportado, error o cambio de
 *  formato del host). */
export async function resolverEmbed(embedUrl: string): Promise<string | null> {
  const host = hostDe(embedUrl)
  const resolvedor = RESOLVEDORES.find(
    (r) => host === r.host || host.endsWith('.' + r.host),
  )
  if (!resolvedor) return null

  try {
    return await resolvedor.resolver(embedUrl)
  } catch {
    return null
  }
}
