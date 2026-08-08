'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Lamina from './Lamina'
import Icono from './Icono'
import VideoConHls from './VideoConHls'
import ControlesVideo from './ControlesVideo'
import { servidoresOrdenados, nombreDeServidor } from '@/lib/api'
import type { ApiEnlacesEpisodio, VarianteAudio } from '@/lib/api-types'

const EXTENSIONES_VIDEO = /\.(mp4|webm|ogv|ogg|mov|m4v|mkv)(\?|#|$)/i

/** ¿Es un archivo de vídeo reproducible en <video> (no un embed)? */
function esUrlDirecta(url: string): boolean {
  if (EXTENSIONES_VIDEO.test(url)) return true
  const u = new URL(url, 'https://x.invalid')
  return u.pathname.endsWith('.m3u8')
}

/** ¿Es un manifiesto HLS? También cubre los m3u8 de Zilla cuya URL es
 *  /m3u8/<token> (no termina en .m3u8). */
function esHlsUrl(url: string): boolean {
  return /\.m3u8(\?|#|$)/i.test(url) || /\/m3u8\//i.test(url)
}

/** Hosts con resolver propio (servidor /api/reproducir). El resto de
 *  embeds se muestran en iframe (el resolver no los sabe abrir). */
const RESOLVEDORES_DE_HOST = ['mp4upload.com', 'uns.bio', 'zilla-networks.com']

function esHostResolvible(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '').toLowerCase()
    return RESOLVEDORES_DE_HOST.some(
      (h) => host === h || host.endsWith('.' + h),
    )
  } catch {
    return false
  }
}

/** Panel de respaldo: se muestra dentro del visor cuando el servidor
 *  elegido no carga (archivo directo fallido) y como barra fija bajo el
 *  visor cuando el host bloquea la incrustación. */
function PanelRespaldo({
  enlace,
  nota,
}: {
  enlace: string
  nota: string
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-e2 bg-sala-900/72 p-e4 text-center">
      <p className="text-paso-1 font-semibold text-hueso">
        Este servidor no se pudo cargar
      </p>
      <p className="max-w-[46ch] text-paso-1 text-hueso-70">{nota}</p>
      <a
        href={enlace}
        target="_blank"
        rel="noreferrer"
        className="mt-e2 inline-flex items-center gap-2 rounded-radio bg-ambar px-[1.35rem] py-3 text-paso-1 font-semibold text-ambar-tinta no-underline transition-colors duration-200 ease-sal hover:bg-ambar-claro"
      >
        <Icono nombre="emitir" tam={16} />
        Abrir en el proveedor
      </a>
    </div>
  )
}

/** Reproduce el episodio en un único visor:
 *  - archivo directo (.mp4/.m3u8/...) -> <video> nativo;
 *  - embed que nuestro servidor resuelve a URL directa -> <video> a
 *    través del proxy /api/stream (patrón tokianime);
 *  - embed sin resolver -> <iframe> del host, con respaldo para abrir
 *    en el proveedor. */
export default function Reproductor({
  enlaces,
  titulo,
  proveedorUrl,
  urlSiguiente,
}: {
  enlaces: ApiEnlacesEpisodio | null
  titulo: string
  /** URL del episodio en el proveedor, para el enlace de respaldo. */
  proveedorUrl?: string
  /** URL del episodio siguiente, para el botón "siguiente". */
  urlSiguiente?: string
}) {
  const servidoresSub = useMemo(
    () => (enlaces ? servidoresOrdenados(enlaces, 'SUB').filter((s) => s.url) : []),
    [enlaces],
  )
  const servidoresDub = useMemo(
    () => (enlaces ? servidoresOrdenados(enlaces, 'DUB').filter((s) => s.url) : []),
    [enlaces],
  )

  const [variante, setVariante] = useState<VarianteAudio>(
    servidoresSub.length > 0 ? 'SUB' : 'DUB',
  )
const servidores = variante === 'SUB' ? servidoresSub : servidoresDub
  const [indice, setIndice] = useState(0)
  const [falloVideo, setFalloVideo] = useState(false)
  const [resueltas, setResueltas] = useState<Record<string, string>>({})
  const [estadosResolucion, setEstadosResolucion] = useState<
    Record<string, 'resolviendo' | 'resuelto' | 'fallo'>
  >({})
  const [aviso, setAviso] = useState<string | null>(null)

  const elegido = servidores[indice] ?? servidores[0]
  const directo = elegido ? esUrlDirecta(elegido.url) : false
  const hostResolvible = elegido ? esHostResolvible(elegido.url) : false

  // Cache de embeds ya solicitados al resolver, para que el efecto no
  // dependa del estado (si dependiera, el setState de "resolviendo"
  // re-ejecutaría el efecto y su cleanup cancelaría el fetch en vuelo).
  const solicitados = useRef<Set<string>>(new Set())
  // Reintentos de resolución por embed (las URLs firmadas expiran).
  const reintentos = useRef<Record<string, number>>({})
  const avisoRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const resolver = (embed: string) => {
    if (solicitados.current.has(embed)) return
    solicitados.current.add(embed)
    setEstadosResolucion((e) => ({ ...e, [embed]: 'resolviendo' }))
    fetch(`/api/reproducir?url=${encodeURIComponent(embed)}`)
      .then((r) => r.json())
      .then(({ directa }: { directa: string | null }) => {
        if (directa) {
          setResueltas((m) => ({ ...m, [embed]: directa }))
          setEstadosResolucion((e) => ({ ...e, [embed]: 'resuelto' }))
        } else {
          // Host con resolver, pero la URL firmada expiró o el host cambió:
          // se reintenta con una URL fresca (manejarFalloVideo) o se salta.
          setEstadosResolucion((e) => ({
            ...e,
            [embed]: esHostResolvible(embed) ? 'fallo' : 'resuelto',
          }))
        }
      })
      .catch(() => {
        setEstadosResolucion((e) => ({ ...e, [embed]: 'fallo' }))
      })
  }

  // Intenta resolver el embed del servidor seleccionado a URL directa.
  // Solo se resuelven los hosts que tenemos en el servidor; el resto
  // (embeds tipo TeraBox/YourUpload) se muestran tal cual en iframe.
  useEffect(() => {
    if (!elegido || directo || !hostResolvible) return
    resolver(elegido.url)
  }, [elegido, directo, hostResolvible])

  // Cuando la resolución acaba en «fallo» (el embed no devolvió directa),
  // se re-resuelve con URL fresca y, si sigue fallando, se salta al
  // siguiente servidor (igual que cuando falla el <video>).
  useEffect(() => {
    if (!elegido || !hostResolvible) return
    if (estadosResolucion[elegido.url] !== 'fallo') return
    manejarFalloVideo()
  }, [elegido, hostResolvible, estadosResolucion])

  /** Re-resuelve un embed eliminando su caché y volviendo a pedir (las
   *  URLs firmadas de mp4upload/UPN expiran a los minutos). */
  const reintentarResolucion = (embed: string) => {
    solicitados.current.delete(embed)
    setResueltas((m) => {
      const copia = { ...m }
      delete copia[embed]
      return copia
    })
    setEstadosResolucion((e) => {
      const copia = { ...e }
      delete copia[embed]
      return copia
    })
    resolver(embed)
  }

  /** Cambia al siguiente servidor con un aviso visual. */
  const pasarSiguiente = (motivo: string) => {
    if (servidores.length <= 1) {
      setFalloVideo(true)
      return
    }
    const siguiente = (indice + 1) % servidores.length
    setIndice(siguiente)
    setFalloVideo(false)
    setAviso(motivo)
    clearTimeout(avisoRef.current)
    avisoRef.current = setTimeout(() => setAviso(null), 3000)
  }

  /** Fallo del <video> o de HLS: re-resuelve 1 vez (las URLs firmadas
   *  expiran) y si sigue fallando, salta al siguiente servidor. Nada de
   *  panel muerto: el reproductor siempre intenta que haya vídeo. */
  const manejarFalloVideo = () => {
    const embed = elegido?.url
    if (!embed) {
      setFalloVideo(true)
      return
    }
    if (!directo && hostResolvible && (reintentos.current[embed] ?? 0) < 2) {
      reintentos.current[embed] = (reintentos.current[embed] ?? 0) + 1
      setFalloVideo(false)
      reintentarResolucion(embed)
      return
    }
    pasarSiguiente('Ese servidor no respondió; probando el siguiente…')
  }

  const directaResuelta = directo
    ? elegido!.url
    : resueltas[elegido!.url]
  const visorDirecto = directaResuelta
  const hlsActivo = visorDirecto ? esHlsUrl(visorDirecto) : false
  const resolviendo = elegido
    ? estadosResolucion[elegido.url] === 'resolviendo'
    : false

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const contenedorRef = useRef<HTMLDivElement | null>(null)

  // Si el vídeo se queda "cargando" sin datos (CDN lento o colgado), se
  // salta al siguiente servidor: un stream que no arranca no merece que
  // el reproductor se quede pegado en el spinner.
  useEffect(() => {
    if (!elegido || !visorDirecto || falloVideo) return
    const v = videoRef.current
    if (!v) return
    let listo = false
    const marcar = () => {
      listo = true
    }
    const revisar = () => {
      if (listo) return
      if (v.readyState >= 2) {
        listo = true
        return
      }
      pasarSiguiente('El servidor tardó demasiado; probando otro…')
    }
    v.addEventListener('loadedmetadata', marcar)
    v.addEventListener('playing', marcar)
    const temporizador = setTimeout(revisar, 15_000)
    return () => {
      clearTimeout(temporizador)
      v.removeEventListener('loadedmetadata', marcar)
      v.removeEventListener('playing', marcar)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elegido, indice, visorDirecto, falloVideo, variante])

  const cambiarVariante = (v: VarianteAudio) => {
    setVariante(v)
    setIndice(0)
    setFalloVideo(false)
    setAviso(null)
    reintentos.current = {}
  }
  const elegirServidor = (i: number) => {
    setIndice(i)
    setFalloVideo(false)
    setAviso(null)
  }

  const enlaceRespaldo = elegido ? elegido.url : proveedorUrl
  // Todo se sirve por el proxy /api/stream: el CDN de mp4upload/UPN/Zilla
  // exige Referer/UA propios y nuestro proxy se los pone; si un «directo»
  // se abriera tal cual, el navegador lo pediría sin esas cabeceras y el
  // CDN lo corta (imagen quieta o sin carga).
  const fuenteVisor = visorDirecto
    ? `/api/stream?u=${encodeURIComponent(visorDirecto)}`
    : undefined

  return (
    <div>
      {/* ---------- Visor ---------- */}
      <div
        ref={contenedorRef}
        id="visor"
        role="region"
        aria-label="Reproductor de vídeo"
        className="relative aspect-video overflow-hidden bg-black"
      >
        {elegido && visorDirecto && !falloVideo ? (
          hlsActivo ? (
            <VideoConHls
              key={`${variante}-${indice}-${visorDirecto}`}
              videoRef={videoRef}
              src={fuenteVisor!}
              esHls
              controles={false}
              onFallo={manejarFalloVideo}
            />
          ) : (
            <video
              key={`${variante}-${indice}-${visorDirecto}`}
              ref={videoRef}
              src={fuenteVisor}
              poster=""
              playsInline
              onError={manejarFalloVideo}
              className="absolute inset-0 h-full w-full bg-black"
            >
              Tu navegador no puede reproducir este vídeo.
            </video>
          )
        ) : null}
        {elegido && visorDirecto && !falloVideo && (
          <ControlesVideo
            key={`ctr-${variante}-${indice}-${visorDirecto}`}
            videoRef={videoRef}
            contenedorRef={contenedorRef}
            titulo={titulo}
            urlSiguiente={urlSiguiente}
          />
        )}

        {/* Capa de estado: SOLO se pinta cuando no hay un vídeo reproduciéndose
            con éxito; si el directo ya está en el <video>, no se superpone nada. */}
        {!(elegido && visorDirecto && !falloVideo) && (
          <>
            {elegido && visorDirecto && falloVideo ? (
          <PanelRespaldo
            enlace={elegido.url}
            nota="El archivo del servidor no cargó en este navegador. Puedes abrirlo directamente en el proveedor."
          />
        ) : elegido && resolviendo ? (
          <div className="absolute inset-0 grid place-items-center bg-sala-900/72 p-e4 text-center">
            <div className="flex flex-col items-center gap-e3">
              <span
                aria-hidden="true"
                className="size-9 animate-spin rounded-full border-[3px] border-borde-vivo border-t-ambar"
              />
              <p className="text-paso-1 font-semibold text-hueso">
                Resolviendo reproducción…
              </p>
            </div>
          </div>
) : elegido && !hostResolvible ? (
          <iframe
            key={`${variante}-${indice}`}
            src={elegido.url}
            title={titulo}
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : elegido ? (
          <div className="absolute inset-0 grid place-items-center bg-sala-900/72 p-e4 text-center">
            <div className="flex flex-col items-center gap-e3">
              <span
                aria-hidden="true"
                className="size-9 animate-spin rounded-full border-[3px] border-borde-vivo border-t-ambar"
              />
<p className="text-paso-1 font-semibold text-hueso">
                Este servidor no respondió, probando otro…
              </p>
            </div>
          </div>
            ) : (
              <>
                <Lamina arte="panoramica-player" />
                <div className="absolute inset-0 grid place-items-center bg-sala-900/72 p-e4 text-center">
                  <div className="max-w-[46ch]">
                    <p className="text-paso-3 font-semibold">
                      No hay enlaces de reproducción
                    </p>
                    <p className="mt-e2 text-paso-1 text-hueso-70">
                      La API no devuelve servidores para este episodio todavía.
                    </p>
                    {proveedorUrl && (
                      <a
                        href={proveedorUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-e3 inline-flex items-center gap-2 rounded-radio bg-ambar px-[1.35rem] py-3 text-paso-1 font-semibold text-ambar-tinta no-underline transition-colors duration-200 ease-sal hover:bg-ambar-claro"
                      >
                        <Icono nombre="emitir" tam={16} />
                        Abrir en el proveedor
                      </a>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Aviso de cambio automático de servidor */}
        {aviso && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex justify-center p-e3">
            <p className="rounded-full border border-ambar/40 bg-sala-900/88 px-e3 py-e1 text-paso-0 font-semibold text-ambar backdrop-blur-[4px]">
              {aviso}
            </p>
          </div>
        )}
      </div>

      {/* ---------- Barra de respaldo ---------- */}
      {elegido && enlaceRespaldo && (
        <div className="flex flex-wrap items-center justify-between gap-x-e4 gap-y-e2 border-t border-borde bg-sala-900 px-e3 py-e2">
          <p className="text-paso-0 text-hueso-45">
            {visorDirecto
              ? 'Reproducción directa del archivo del proveedor.'
              : 'Reproducción incrustada del reproductor del proveedor. Algunos hosts bloquean la incrustación.'}
          </p>
          <a
            href={enlaceRespaldo}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-borde-vivo bg-hueso/6 px-[0.9rem] py-[0.4rem] text-paso-0 font-semibold text-hueso no-underline transition-colors duration-200 ease-sal hover:border-hueso-45 hover:bg-hueso/12"
          >
            <Icono nombre="emitir" tam={15} />
            ¿No se ve? Abrir en el proveedor
          </a>
        </div>
      )}

      {/* ---------- Selector de audio y servidor ---------- */}
      {(servidoresSub.length > 0 || servidoresDub.length > 0) && (
        <div className="flex flex-wrap items-center gap-x-e4 gap-y-e2 border-t border-borde bg-sala-900 px-e3 py-e2">
          {/* Audio */}
          <div className="flex items-center gap-e2">
            <span className="text-paso-0 font-bold tracking-[0.11em] text-hueso-45 uppercase">
              Audio
            </span>
            <div
              role="tablist"
              aria-label="Audio"
              className="flex rounded-radio border border-borde-vivo p-[2px]"
            >
              {servidoresSub.length > 0 && (
                <button
                  type="button"
                  role="tab"
                  aria-selected={variante === 'SUB'}
                  onClick={() => cambiarVariante('SUB')}
                  className={`cursor-pointer rounded-radio border-0 px-[0.9rem] py-[0.3rem] text-paso-0 font-bold transition-colors duration-200 ease-sal ${
                    variante === 'SUB'
                      ? 'bg-ambar text-ambar-tinta'
                      : 'bg-transparent text-hueso-70 hover:text-hueso'
                  }`}
                >
                  Subtitulado
                </button>
              )}
              {servidoresDub.length > 0 && (
                <button
                  type="button"
                  role="tab"
                  aria-selected={variante === 'DUB'}
                  onClick={() => cambiarVariante('DUB')}
                  className={`cursor-pointer rounded-radio border-0 px-[0.9rem] py-[0.3rem] text-paso-0 font-bold transition-colors duration-200 ease-sal ${
                    variante === 'DUB'
                      ? 'bg-ambar text-ambar-tinta'
                      : 'bg-transparent text-hueso-70 hover:text-hueso'
                  }`}
                >
                  Latino
                </button>
              )}
            </div>
          </div>

          {/* Servidor */}
          {servidores.length > 0 && (
            <div className="flex items-center gap-e2">
              <span className="text-paso-0 font-bold tracking-[0.11em] text-hueso-45 uppercase">
                Servidor
              </span>
              <span
                className="min-w-[7.5rem] rounded-full border border-borde-vivo bg-sala-800 px-[0.85rem] py-[0.3rem] text-paso-0 font-semibold text-hueso tabular-nums"
                title={servidores[indice] ? nombreDeServidor(servidores[indice].server) : undefined}
              >
                Servidor {indice + 1} de {servidores.length}
              </span>
              {servidores.length > 1 && (
                <button
                  type="button"
                  onClick={() => elegirServidor((indice + 1) % servidores.length)}
                  className="inline-flex cursor-pointer items-center gap-[0.4rem] rounded-radio border border-borde-vivo px-[0.8rem] py-[0.3rem] text-paso-0 font-semibold text-hueso-70 transition-colors duration-200 ease-sal hover:border-hueso-45 hover:text-hueso"
                >
                  <Icono nombre="cambiar" tam={15} />
                  Cambiar
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
