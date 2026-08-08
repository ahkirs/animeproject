'use client'

import { useEffect, useRef, type RefObject } from 'react'

/* ============================================================
   VideoConHls — <video> con soporte HLS automático
   Para .m3u8: usa hls.js en Chrome/Firefox, nativo en Safari.
   Para el resto (.mp4, .webm…): reproducción nativa directa.
   ============================================================ */

interface Props {
  videoRef: RefObject<HTMLVideoElement | null>
  src: string
  /** HLS explícito (p.ej. un m3u8 servido por nuestro proxy, cuya URL no
   *  termina en .m3u8). Si no se pasa, se deduce de la extensión de src. */
  esHls?: boolean
  controles?: boolean
  autoPlay?: boolean
  onFallo?: () => void
}

export default function VideoConHls({
  videoRef,
  src,
  esHls,
  controles = true,
  autoPlay = false,
  onFallo,
}: Props) {
  const hlsRef = useRef<any>(null)
  const onFalloRef = useRef(onFallo)
  onFalloRef.current = onFallo

  const esHlsFinal = esHls ?? /\.m3u8(\?|#|$)/i.test(src)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    /* --- Fuente normal (mp4, webm…) --- */
    if (!esHlsFinal) {
      video.src = src
      if (autoPlay) video.play().catch(() => {})
      return
    }

    /* --- Fuente HLS (.m3u8) --- */
    let destruido = false

    import('hls.js').then(({ default: Hls }) => {
      if (destruido) return

      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true })
        hlsRef.current = hls
        hls.loadSource(src)
        hls.attachMedia(video)
        if (autoPlay) {
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => {})
          })
        }
        hls.on(Hls.Events.ERROR, (_: string, data: any) => {
          if (data.fatal) {
            hls.destroy()
            hlsRef.current = null
            onFalloRef.current?.()
          }
        })
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        /* Safari: HLS nativo */
        video.src = src
        if (autoPlay) video.play().catch(() => {})
      } else {
        onFalloRef.current?.()
      }
    }).catch(() => {
      video.src = src
      if (autoPlay) video.play().catch(() => {})
    })

    return () => {
      destruido = true
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [src, autoPlay, esHlsFinal, videoRef])

  return (
    <video
      ref={videoRef}
      controls={controles}
      playsInline
      onError={esHlsFinal ? undefined : onFallo}
      className="absolute inset-0 h-full w-full bg-black"
    />
  )
}
