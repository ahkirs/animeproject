import { refererDe } from '@/lib/reproducir'

export const dynamic = 'force-dynamic'

const UA_NAVEGADOR =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

/** Hosts cuyo CDN permitimos proxificar (el resolver solo entrega URLs
 *  de hosts mp4upload, UPNShare o Zilla). Evita que la ruta sea un proxy
 *  abierto. El CDN de UPNShare sirve sus mp4 desde IPs propias variables,
 *  así que una IP solo se permite cuando la ruta coincide con la firma de
 *  sus archivos: el pathname termina en .mp4/.m3u8 y/o lleva /v4/. El id
 *  de sitio dentro de la ruta (x68, pp, …) cambia por episodio, así que no
 *  se usa como criterio. */
function hostPermitido(host: string, path: string): boolean {
  if (host === 'mp4upload.com' || host.endsWith('.mp4upload.com')) return true
  if (host === 'animeav1.uns.bio' || host.endsWith('.uns.bio')) return true
  if (host.endsWith('.nevalonmedia.cyou')) return true
  if (host.includes('zilla-networks')) return true
  if (
    /^\d{1,3}(\.\d{1,3}){3}$/.test(host) &&
    (/\.(mp4|m3u8)(\/download)?(\?|$)/.test(path) || path.includes('/v4/'))
  ) {
    return true
  }
  return false
}

/** Cabeceras anti-scraping que el CDN de Zilla exige para servir el m3u8
 *  y sus segmentos (sin ellas responde 403). */
function cabecerasZilla(): Record<string, string> {
  return {
    Origin: 'https://player.zilla-networks.com',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Dest': 'empty',
  }
}

/** Reescribe un m3u8 de Zilla para que los segmentos (y el init) se pidan
 *  a través de nuestro proxy /api/stream con las cabeceras necesarias;
 *  si el navegador pidiera player.zilla-networks.com directo, los
 *  segmentos .html responderían 403. */
function reescribirManifiesto(texto: string): string {
  return texto.replace(
    /https:\/\/player\.zilla-networks\.com\/[^"#\s]+/g,
    (url) => `/api/stream?u=${encodeURIComponent(url)}`,
  )
}

/** Proxy de stream: el CDN de mp4upload exige Referer de su propio dominio
 *  y el <video> del navegador enviaría el nuestro, así que este route
 *  handler pide el archivo con las cabeceras correctas (patrón tokianime)
 *  y reenvía el stream al navegador, respetando las peticiones Range para
 *  que el seek funcione. Los m3u8 de Zilla se reescriben para que hls.js
 *  los consuma vía este mismo proxy. */
export async function GET(peticion: Request) {
  const { searchParams } = new URL(peticion.url)
  const destino = searchParams.get('u') ?? ''
  if (!destino) return new Response('falta u', { status: 400 })

  let url: URL
  try {
    url = new URL(destino)
  } catch {
    return new Response('url inválida', { status: 400 })
  }
  if (url.protocol !== 'https:' || !hostPermitido(url.hostname, url.pathname)) {
    return new Response('host no permitido', { status: 403 })
  }

  const esZilla = url.hostname.includes('zilla-networks')
  const cabeceras: Record<string, string> = {
    'User-Agent': UA_NAVEGADOR,
    Accept: '*/*',
    Referer: refererDe(url.hostname, url.pathname),
  }
  if (esZilla) Object.assign(cabeceras, cabecerasZilla())
  const range = peticion.headers.get('range')
  if (range) cabeceras.Range = range

  let arriba: Response
  try {
    // Solo se limita la espera de la CABECERA (30 s): un archivo largo
    // pero lento no debe cortarse a mitad de un timeout de duración
    // total (eso dejaba audio y congelaba el vídeo). Una vez que llegan
    // las cabeceras, el cuerpo se transmite sin tope de tiempo y se
    // aborta solo si el navegador desconecta (peticion.signal). UPNShare
    // responde cabeceras de forma lenta (hasta ~20 s en pruebas), de ahí
    // el margen.
    const controlador = new AbortController()
    const espera = setTimeout(
      () => controlador.abort(new Error('el proveedor tarda en responder')),
      30_000,
    )
    const senalFusionada = AbortSignal.any([peticion.signal, controlador.signal])
    try {
      arriba = await fetch(url, { headers: cabeceras, signal: senalFusionada })
    } finally {
      clearTimeout(espera)
    }
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : String(err)
    const causa =
      err instanceof Error && err.cause instanceof Error
        ? `${err.cause.name}: ${err.cause.message}`
        : ''
    const detalle = causa ? `${mensaje} :: ${causa}` : mensaje
    return new Response(`error al conectar con el proveedor: ${detalle}`, {
      status: 502,
    })
  }
  if (!arriba.ok && arriba.status !== 206) {
    return new Response('el proveedor rechazó la petición', {
      status: arriba.status,
    })
  }

  // Se reenvía lo imprescindible para que el <video> entienda el stream.
  const salida = new Headers()
  const tipo = arriba.headers.get('content-type')
  if (tipo) salida.set('content-type', tipo)
  // Nuestro proxy SÍ soporta Range (lo reenvía al proveedor), aunque el
  // CDN no anuncie accept-ranges: el navegador necesita la cabecera para
  // pausar/reanudar y buscar en archivos grandes.
  salida.set('accept-ranges', 'bytes')
  // Los CDN (m4p) sirven .mp4 como application/octet-stream; el navegador
  // usa la extensión de la URL para querer sniff: /api/stream no tiene
  // extensión, así que atamos el MIME correcto según el archivo pedido.
  const esMp4 = /\.(mp4|m4v|mov)(\/download)?(\?|$)/i.test(url.pathname)
  const esWebm = /\.webm(\/download)?(\?|$)/i.test(url.pathname)
  if ((!tipo || tipo === 'application/octet-stream' || tipo.startsWith('text/')) && esMp4) {
    salida.set('content-type', 'video/mp4')
  } else if ((!tipo || tipo === 'application/octet-stream') && esWebm) {
    salida.set('content-type', 'video/webm')
  }
  const len = arriba.headers.get('content-length')
  if (len) salida.set('content-length', len)
  const cr = arriba.headers.get('content-range')
  if (cr) salida.set('content-range', cr)
  salida.set('cache-control', 'no-store')

  // Un manifiesto m3u8 de Zilla se reescribe (solo afecta al m3u8; los
  // segmentos fMP4 se reenvían tal cual, sin Range desde hls.js).
  if (esZilla && /mpegurl/i.test(tipo ?? '')) {
    try {
      const texto = await arriba.text()
      salida.set('content-type', 'application/x-mpegURL')
      salida.delete('content-length')
      return new Response(reescribirManifiesto(texto), {
        status: 200,
        headers: salida,
      })
    } catch {
      // Si el cuerpo no se pudo leer se deja el stream tal cual.
    }
  }

  // El cuerpo se transmite tal cual; si el navegador corta, el stream
  // upstream también se corta (la señal del cliente se propaga).
  return new Response(arriba.body, {
    status: arriba.status,
    headers: salida,
  })
}
