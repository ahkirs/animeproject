'use client'

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type RefObject,
} from 'react'
import Icono from './Icono'

/* ============================================================
   ControlesVideo — controles personalizados para <video>
   Réplica en React/Tailwind del reproductor independiente
   "Sala Oscura": botón central, spinner, línea de tiempo con
   globo y vista previa, volumen, menús de calidad y velocidad,
   PiP, pantalla completa, atajos de teclado y auto-ocultado.
   ============================================================ */

/* --- Helpers ------------------------------------------------- */

function formatearTiempo(seg: number): string {
  if (!isFinite(seg) || seg < 0) return '0:00'
  const h = Math.floor(seg / 3600)
  const m = Math.floor((seg % 3600) / 60)
  const s = Math.floor(seg % 60)
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`
}

/** Clases comunes para los botones del reproductor. */
const CLS_MANDO =
  'inline-grid place-items-center size-[42px] shrink-0 rounded-[3px] border-0 bg-transparent text-hueso cursor-pointer transition-colors duration-150 hover:bg-hueso/14 max-[640px]:size-9'

const VELOCIDADES = [0.5, 0.75, 1, 1.25, 1.5, 2]

const ATAJOS: [string, string][] = [
  ['Espacio', 'Reproducir o pausar'],
  ['K', 'Reproducir o pausar'],
  ['← →', 'Cinco segundos atrás o adelante'],
  ['J L', 'Diez segundos atrás o adelante'],
  ['↑ ↓', 'Subir o bajar el volumen'],
  ['M', 'Silenciar'],
  ['F', 'Pantalla completa'],
  ['C', 'Cambiar de calidad'],
  ['N', 'Episodio siguiente'],
  ['0 – 9', 'Saltar a ese punto del episodio'],
  ['?', 'Abrir o cerrar esta ayuda'],
]

const CLAVE_ENCADENAR = 'kuroba:encadenar'

function leerEncadenar(): boolean {
  try {
    return (localStorage.getItem(CLAVE_ENCADENAR) ?? '1') === '1'
  } catch {
    return true
  }
}

/* --------------------- Propiedades --------------------------- */

interface Calidad {
  etiqueta: string
  url: string
}

interface Props {
  videoRef: RefObject<HTMLVideoElement | null>
  contenedorRef: RefObject<HTMLDivElement | null>
  titulo?: string
  urlSiguiente?: string
  /** Calidades disponibles para el menú. Con menos de dos se oculta. */
  calidades?: Calidad[]
  /** Rango [inicio, fin] de la cabecera, para el botón "Saltar". */
  saltarCabecera?: [number, number]
  /** El padre se encarga de cambiar de fuente (remonta el <video>). */
  cambiarFuente?: (c: Calidad) => void
}

export default function ControlesVideo({
  videoRef,
  contenedorRef,
  titulo,
  urlSiguiente,
  calidades,
  saltarCabecera,
  cambiarFuente,
}: Props) {
  /* Estado --------------------------------------------------- */
  const [reproduciendo, setReproduciendo] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [tiempoActual, setTiempoActual] = useState(0)
  const [duracion, setDuracion] = useState(0)
  const [volumen, setVolumen] = useState(1)
  const [silenciado, setSilenciado] = useState(false)
  const [pantallaCompleta, setPantallaCompleta] = useState(false)
  const [visible, setVisible] = useState(true)
  const [bufferizado, setBufferizado] = useState(0)
  const [arrastrando, setArrastrando] = useState(false)
  const arrastrandoRef = useRef(false)
  const [velocidad, setVelocidad] = useState(1)
  const [menuAbierto, setMenuAbierto] = useState<'velocidad' | 'calidad' | null>(null)
  const [atajosAbiertos, setAtajosAbiertos] = useState(false)
  const [avisoTxt, setAvisoTxt] = useState('')
  const [avisoEncendido, setAvisoEncendido] = useState(false)
  const [globoVisible, setGloboVisible] = useState(false)
  const [globoX, setGloboX] = useState(0)
  const [globoHora, setGloboHora] = useState('')

  const ocultarRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const avisoTap = useRef<ReturnType<typeof setTimeout>>(undefined)

  const lineaRef = useRef<HTMLDivElement>(null)
  const pistaRef = useRef<HTMLDivElement>(null)
  const globoRef = useRef<HTMLDivElement>(null)

  /* Refs con los valores actuales para el teclado sin re-bindear */
  const tiempoRef = useRef(tiempoActual)
  tiempoRef.current = tiempoActual
  const volumenRef = useRef(volumen)
  volumenRef.current = volumen
  const atajosRef = useRef(atajosAbiertos)
  atajosRef.current = atajosAbiertos
  const encadenarRef = useRef(true)

  /* Aviso central --------------------------------------------- */
  const avisar = useCallback((texto: string) => {
    setAvisoEncendido(true)
    setAvisoTxt(texto)
    clearTimeout(avisoTap.current)
    avisoTap.current = setTimeout(() => setAvisoEncendido(false), 650)
  }, [])

  /* Mostrar / ocultar controles automáticamente --------------- */
  const mostrar = useCallback(() => {
    setVisible(true)
    clearTimeout(ocultarRef.current)
    ocultarRef.current = setTimeout(() => {
      const v = videoRef.current
      if (v && !v.paused && !atajosRef.current && !menuAbierto) setVisible(false)
    }, 2600)
  }, [videoRef, menuAbierto])

  /* Play / Pausa ---------------------------------------------- */
  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) void v.play()
    else v.pause()
    mostrar()
  }, [videoRef, mostrar])

  /* Buscar (seek) --------------------------------------------- */
  const buscar = useCallback(
    (t: number) => {
      const v = videoRef.current
      if (!v) return
      v.currentTime = Math.max(0, Math.min(t, v.duration || 0))
      setTiempoActual(v.currentTime)
      mostrar()
    },
    [videoRef, mostrar],
  )

  /* Volumen --------------------------------------------------- */
  const cambiarVolumen = useCallback(
    (val: number) => {
      const v = videoRef.current
      if (!v) return
      const c = Math.max(0, Math.min(1, val))
      v.volume = c
      setVolumen(c)
      if (c === 0) {
        v.muted = true
        setSilenciado(true)
      } else if (v.muted) {
        v.muted = false
        setSilenciado(false)
      }
    },
    [videoRef],
  )

  const toggleMute = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setSilenciado(v.muted)
    avisar(v.muted ? 'Silenciado' : 'Sonido activado')
    mostrar()
  }, [videoRef, avisar, mostrar])

  /* Volumen por clic sobre la pista del volumen */
  const clicVolumen = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const caja = e.currentTarget.getBoundingClientRect()
      cambiarVolumen((e.clientX - caja.left) / caja.width)
    },
    [cambiarVolumen],
  )

  /* Pantalla completa ----------------------------------------- */
  const togglePantallaCompleta = useCallback(() => {
    const el = contenedorRef.current
    if (!el) return
    if (document.fullscreenElement) void document.exitFullscreen()
    else el.requestFullscreen().catch(() => {})
  }, [contenedorRef])

  /* Ventana flotante (PiP) ------------------------------------- */
  const togglePip = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    try {
      if (document.pictureInPictureElement) {
        void document.exitPictureInPicture()
      } else {
        void v.requestPictureInPicture()
      }
    } catch {
      avisar('Ventana flotante no disponible')
    }
  }, [videoRef, avisar])

  /* Velocidad -------------------------------------------------- */
  const cambiarVelocidad = useCallback(
    (v: number) => {
      const video = videoRef.current
      if (!video) return
      video.playbackRate = v
      setVelocidad(v)
      setMenuAbierto(null)
      avisar(v === 1 ? 'Velocidad normal' : `Velocidad ${v}×`)
    },
    [videoRef, avisar],
  )

  /* Calidad ---------------------------------------------------- */
  const cambiarCalidad = useCallback(
    (c: Calidad, _i: number) => {
      if (cambiarFuente) {
        cambiarFuente(c)
        avisar(`Calidad ${c.etiqueta}`)
        setMenuAbierto(null)
        return
      }
      const v = videoRef.current
      if (!v || !calidades) return
      const ahora = v.currentTime
      const seguia = !v.paused
      v.src = c.url
      v.load()
      v.addEventListener(
        'loadedmetadata',
        () => {
          v.currentTime = ahora
          if (seguia) void v.play()
        },
        { once: true },
      )
      avisar(`Calidad ${c.etiqueta}`)
      setMenuAbierto(null)
    },
    [cambiarFuente, videoRef, calidades, avisar],
  )

  const ciclarCalidad = useCallback(() => {
    if (!calidades || calidades.length < 2) return
    const v = videoRef.current
    if (!v) return
    const actual = v.src ?? ''
    const i = calidades.findIndex((c) => actual.includes(c.url))
    const idx = i >= 0 ? i : 0
    const siguiente = calidades[(idx + 1) % calidades.length]
    cambiarCalidad(siguiente, (idx + 1) % calidades.length)
  }, [calidades, videoRef, cambiarCalidad])

  /* ----------------- Línea de tiempo ---------------------------- */

  const fraccionDesdeX = useCallback((clientX: number) => {
    const pista = pistaRef.current
    if (!pista) return 0
    const rect = pista.getBoundingClientRect()
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  }, [])

  const seekEnLinea = useCallback(
    (clientX: number) => {
      const v = videoRef.current
      if (!v || !v.duration) return
      const frac = fraccionDesdeX(clientX)
      const destino = frac * v.duration
      v.currentTime = destino
      // El feedback no espera a que el navegador aplique el seek: se pinta
      // la posición bajo el puntero aunque el stream aún esté descargando.
      setTiempoActual(destino)
    },
    [videoRef, fraccionDesdeX],
  )

  /* Globo con el tiempo bajo el puntero (sin vista previa) -------- */
  const colocarGlobo = useCallback((frac: number) => {
    const pista = pistaRef.current
    const globo = globoRef.current
    if (!pista || !globo) return
    const anchoBarra = pista.getBoundingClientRect().width
    const anchoGlobo = globo.offsetWidth || 64
    const centro = frac * anchoBarra
    setGloboX(Math.max(0, Math.min(anchoBarra - anchoGlobo, centro - anchoGlobo / 2)))
  }, [])

  const onLineaMove = useCallback(
    (e: React.MouseEvent) => {
      const v = videoRef.current
      if (!v || !v.duration) return
      const frac = fraccionDesdeX(e.clientX)
      const seg = frac * v.duration
      setGloboHora(formatearTiempo(seg))
      colocarGlobo(frac)
      setGloboVisible(true)
    },
    [videoRef, fraccionDesdeX, colocarGlobo],
  )

  /* ------------------- Eventos del vídeo ----------------------- */

  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    const onPlay = () => setReproduciendo(true)
    const onPause = () => {
      setReproduciendo(false)
      setVisible(true)
      clearTimeout(ocultarRef.current)
    }
    const onTime = () => {
      if (arrastrandoRef.current) return
      setTiempoActual(v.currentTime)
    }
    const onDur = () => {
      setDuracion(v.duration || 0)
    }
    const onBuf = () => {
      if (v.buffered.length > 0)
        setBufferizado(v.buffered.end(v.buffered.length - 1))
    }
    const onVol = () => {
      setVolumen(v.volume)
      setSilenciado(v.muted)
    }
    const onWaiting = () => setCargando(true)
    const onReady = () => setCargando(false)
    const onEnded = () => {
      setCargando(false)
      if (encadenarRef.current && urlSiguiente) {
        window.location.href = urlSiguiente
      }
    }

    v.addEventListener('play', onPlay)
    v.addEventListener('pause', onPause)
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('durationchange', onDur)
    v.addEventListener('loadedmetadata', onDur)
    v.addEventListener('progress', onBuf)
    v.addEventListener('volumechange', onVol)
    v.addEventListener('waiting', onWaiting)
    v.addEventListener('playing', onReady)
    v.addEventListener('canplay', onReady)
    v.addEventListener('ended', onEnded)

    return () => {
      v.removeEventListener('play', onPlay)
      v.removeEventListener('pause', onPause)
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('durationchange', onDur)
      v.removeEventListener('loadedmetadata', onDur)
      v.removeEventListener('progress', onBuf)
      v.removeEventListener('volumechange', onVol)
      v.removeEventListener('waiting', onWaiting)
      v.removeEventListener('playing', onReady)
      v.removeEventListener('canplay', onReady)
      v.removeEventListener('ended', onEnded)
    }
  }, [videoRef, urlSiguiente])

  /* Fullscreen change ----------------------------------------- */
  useEffect(() => {
    const handler = () => setPantallaCompleta(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  /* Cerrar menús al hacer clic fuera -------------------------- */
  useEffect(() => {
    const cerrar = () => {
      setMenuAbierto(null)
      setAtajosAbiertos((a) => (a ? false : a))
    }
    document.addEventListener('pointerdown', cerrar)
    return () => document.removeEventListener('pointerdown', cerrar)
  }, [])

  /* Encadenar ------------------------------------------------- */
  useEffect(() => {
    encadenarRef.current = leerEncadenar()
  }, [])

  /* Atajos de teclado ----------------------------------------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (atajosAbiertos) {
        if (e.key === 'Escape') setAtajosAbiertos(false)
        return
      }
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (e.key === 'Escape') {
        setMenuAbierto(null)
        return
      }
      if (e.key === '?') {
        e.preventDefault()
        setAtajosAbiertos(true)
        return
      }

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault()
          togglePlay()
          break
        case 'arrowleft':
          e.preventDefault()
          buscar(tiempoRef.current - 5)
          break
        case 'arrowright':
          e.preventDefault()
          buscar(tiempoRef.current + 5)
          break
        case 'j':
          buscar(tiempoRef.current - 10)
          break
        case 'l':
          buscar(tiempoRef.current + 10)
          break
        case 'arrowup':
          e.preventDefault()
          cambiarVolumen(volumenRef.current + 0.1)
          avisar(`Volumen ${Math.round((volumenRef.current + 0.1) * 100)} %`)
          mostrar()
          break
        case 'arrowdown':
          e.preventDefault()
          cambiarVolumen(volumenRef.current - 0.1)
          avisar(`Volumen ${Math.round((volumenRef.current - 0.1) * 100)} %`)
          mostrar()
          break
        case 'f':
          e.preventDefault()
          togglePantallaCompleta()
          break
        case 'm':
          e.preventDefault()
          toggleMute()
          break
        case 'c':
          ciclarCalidad()
          break
        case 'n':
          if (urlSiguiente) window.location.href = urlSiguiente
          break
        default:
          if (/^[0-9]$/.test(e.key)) {
            const v = videoRef.current
            if (v && v.duration) {
              e.preventDefault()
              const pct = Number(e.key) * 10
              v.currentTime = (pct / 100) * v.duration
              avisar(`${pct} %`)
            }
          }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [atajosAbiertos, togglePlay, buscar, cambiarVolumen, avisar, mostrar, togglePantallaCompleta, toggleMute, ciclarCalidad, urlSiguiente, videoRef])

  /* Derivados ------------------------------------------------- */
  const progreso = duracion > 0 ? (tiempoActual / duracion) * 100 : 0
  const progresoBuffer = duracion > 0 ? (bufferizado / duracion) * 100 : 0

  const hayCalidades = calidades && calidades.length > 1
  const ocultos =
    reproduciendo && !visible && !arrastrando && !atajosAbiertos && !menuAbierto

  const enRangoCabecera =
    saltarCabecera &&
    tiempoActual >= saltarCabecera[0] &&
    tiempoActual <= saltarCabecera[1]

  /* ------------------ Render --------------------------------- */
  return (
    <div
      className={`absolute inset-0 z-10 select-none ${
        ocultos ? 'cursor-none' : ''
      }`}
      onMouseMove={mostrar}
      onMouseLeave={() => {
        if (reproduciendo && !arrastrando && !atajosAbiertos) setVisible(false)
      }}
    >
      {/* Zona de clic: play/pausa · doble-clic: fullscreen */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={togglePlay}
        onDoubleClick={togglePantallaCompleta}
      />

      {/* Capa central: botón grande, spinner, aviso */}
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        {cargando ? (
          <span
            role="status"
            aria-label="Cargando"
            className="size-[54px] rounded-full border-[3px] border-hueso/22 border-t-ambar"
          />
        ) : (
          !reproduciendo && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                togglePlay()
              }}
              className="pointer-events-auto flex size-[84px] items-center justify-center rounded-[99px] border-0 bg-ambar text-ambar-tinta shadow-alta transition-transform duration-200 ease-sal hover:scale-[1.06] max-[640px]:size-16"
              aria-label="Reproducir"
            >
              <Icono nombre="play" tam={36} />
            </button>
          )
        )}
      </div>

      {/* Aviso de tecla */}
      <div
        aria-live="polite"
        className={`pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[3px] border border-borde-vivo bg-sala-900/82 px-e3 py-e2 text-paso-2 font-semibold opacity-0 transition-opacity duration-300 ease-sal ${
          avisoEncendido ? 'opacity-100' : ''
        }`}
      >
        {avisoTxt}
      </div>

      {/* Saltar cabecera */}
      {saltarCabecera && (
        <button
          className={`absolute right-e3 bottom-[104px] z-20 rounded-[3px] border border-borde-vivo bg-sala-900/86 px-[1.1rem] py-[0.6rem] text-paso-1 font-semibold text-hueso backdrop-blur-[4px] transition-colors duration-150 ease-sal hover:border-ambar hover:bg-ambar hover:text-ambar-tinta ${
            enRangoCabecera && !ocultos ? '' : 'hidden'
          }`}
          onClick={(e) => {
            e.stopPropagation()
            const v = videoRef.current
            if (v && saltarCabecera) {
              v.currentTime = saltarCabecera[1]
              avisar('Cabecera saltada')
            }
          }}
        >
          Saltar cabecera
        </button>
      )}

      {/* Panel de atajos */}
      <div
        role="dialog"
        aria-modal="false"
        aria-labelledby="titulo-atajos"
        className={`absolute right-e3 bottom-[104px] z-30 w-[26rem] max-w-[calc(100%-2rem)] rounded-[3px] border border-borde-vivo bg-sala-900/94 p-e3 shadow-alta backdrop-blur-[6px] ${
          atajosAbiertos ? '' : 'hidden'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-e2 flex items-center justify-between gap-e2 border-b border-borde pb-e2">
          <h2
            id="titulo-atajos"
            className="text-paso-0 font-bold tracking-[0.11em] text-hueso-45 uppercase"
          >
            Atajos de teclado
          </h2>
          <button
            className={CLS_MANDO}
            aria-label="Cerrar"
            onClick={() => setAtajosAbiertos(false)}
          >
            <Icono nombre="cerrar" tam={18} />
          </button>
        </div>
        <dl className="grid max-h-[46vh] grid-cols-[auto_1fr] gap-x-e3 gap-y-[0.4rem] overflow-y-auto text-paso-0">
          {ATAJOS.map(([tecla, desc]) => (
            <div className="contents" key={tecla}>
              <dt className="justify-self-start rounded-[2px] border border-borde-vivo bg-sala-700 px-[0.4rem] py-[0.1rem] font-mono whitespace-nowrap">
                {tecla}
              </dt>
              <dd className="m-0 self-center text-hueso-70">{desc}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Gradiente inferior */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

      {/* Barra de controles */}
      <div
        className={`absolute inset-x-0 bottom-0 z-20 px-e3 pt-e5 transition-[opacity,transform] duration-200 ease-sal ${
          ocultos
            ? 'pointer-events-none translate-y-2 opacity-0'
            : 'translate-y-0 opacity-100'
        }`}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
      >
        {/* Línea de tiempo */}
        <div
          ref={lineaRef}
          role="slider"
          tabIndex={0}
          aria-label="Progreso del episodio"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progreso)}
          aria-valuetext={`${formatearTiempo(tiempoActual)} de ${formatearTiempo(duracion)}`}
          className="group/linea flex h-[22px] cursor-pointer items-center touch-none"
          onPointerDown={(e) => {
            e.preventDefault()
            setArrastrando(true)
            arrastrandoRef.current = true
            ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
            seekEnLinea(e.clientX)
          }}
          onPointerMove={(e) => {
            if (arrastrando) seekEnLinea(e.clientX)
            else onLineaMove(e)
          }}
          onPointerUp={() => {
            setArrastrando(false)
            arrastrandoRef.current = false
            setGloboVisible(false)
          }}
          onPointerLeave={() => {
            setGloboVisible(false)
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
              e.preventDefault()
              buscar(
                e.key === 'ArrowRight'
                  ? tiempoRef.current + 5
                  : tiempoRef.current - 5,
              )
            }
          }}
        >
          <div
            ref={pistaRef}
            className="relative h-[4px] w-full rounded-[99px] bg-hueso/22 transition-[height] duration-150 ease-sal group-hover/linea:h-[7px]"
          >
            <div
              className="absolute inset-y-0 left-0 rounded-[99px] bg-hueso/32"
              style={{ width: `${progresoBuffer}%` }}
            />
            <div
              className="absolute inset-y-0 left-0 rounded-[99px] bg-ambar"
              style={{ width: `${progreso}%` }}
            />
            <div
              className="absolute top-1/2 size-[14px] -translate-x-1/2 -translate-y-1/2 scale-0 rounded-[99px] bg-ambar shadow-baja transition-transform duration-150 ease-sal group-hover/linea:scale-100"
              style={{ left: `${progreso}%` }}
            />
            {saltarCabecera && duracion > 0 && (
              <>
                <div
                  className="absolute -top-[3px] h-[10px] w-[3px] rounded-[2px] bg-hueso-45"
                  title="Cabecera"
                  style={{ left: `${(saltarCabecera[0] / duracion) * 100}%` }}
                />
                <div
                  className="absolute -top-[3px] h-[10px] w-[3px] rounded-[2px] bg-hueso-45"
                  title="Cierre"
                  style={{
                    left: `${Math.max(0, ((duracion - 25) / duracion) * 100)}%`,
                  }}
                />
              </>
            )}
          </div>

          {/* Globo con el tiempo bajo el puntero */}
          <div
            ref={globoRef}
            className={`pointer-events-none absolute bottom-[28px] left-0 rounded-[3px] border border-borde-vivo bg-sala-900 px-[0.45rem] py-[0.15rem] font-variant-numeric tabular-nums whitespace-nowrap transition-opacity duration-150 ease-sal ${
              globoVisible ? 'opacity-100' : ''
            }`}
            style={{ left: globoX, opacity: globoVisible ? 1 : 0 }}
          >
            <span className="block px-[0.25rem] pt-[0.2rem] pb-[0.25rem] text-center">
              {globoHora}
            </span>
          </div>
        </div>

        {/* Fila de botones */}
        <div className="flex items-center gap-[2px]">
          <button
            className={CLS_MANDO}
            onClick={togglePlay}
            aria-label={reproduciendo ? 'Pausar' : 'Reproducir'}
          >
            <Icono nombre={reproduciendo ? 'pausa' : 'play'} tam={24} />
          </button>

          <button
            className={CLS_MANDO}
            onClick={() => buscar(tiempoRef.current - 10)}
            aria-label="Retroceder 10 segundos"
          >
            <Icono nombre="atras-10" tam={21} />
          </button>

          <button
            className={CLS_MANDO}
            onClick={() => buscar(tiempoRef.current + 10)}
            aria-label="Avanzar 10 segundos"
          >
            <Icono nombre="alante-10" tam={21} />
          </button>

          {urlSiguiente && (
            <a
              href={urlSiguiente}
              className={CLS_MANDO}
              aria-label="Episodio siguiente"
            >
              <Icono nombre="siguiente" tam={20} />
            </a>
          )}

          {/* Volumen */}
          <div className="group/vol flex items-center gap-2">
            <button
              className={CLS_MANDO}
              onClick={toggleMute}
              aria-label={silenciado ? 'Activar sonido' : 'Silenciar'}
            >
              <Icono nombre={silenciado ? 'silencio' : 'volumen'} tam={21} />
            </button>
            <div
              role="slider"
              tabIndex={0}
              aria-label="Volumen"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={silenciado ? 0 : Math.round(volumen * 100)}
              className="relative h-[4px] w-0 cursor-pointer rounded-[99px] bg-hueso/22 opacity-0 transition-[width,opacity] duration-200 ease-sal focus-within:w-[74px] focus-within:opacity-100 group-hover/vol:w-[74px] group-hover/vol:opacity-100"
              onClick={clicVolumen}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-[99px] bg-hueso"
                style={{ width: `${silenciado ? 0 : volumen * 100}%` }}
              />
            </div>
          </div>

          <span className="ml-[0.35rem] text-paso-0 text-hueso-70 tabular-nums max-[480px]:hidden">
            {formatearTiempo(tiempoActual)}{' '}
            <span className="text-hueso-45">/</span>{' '}
            {formatearTiempo(duracion)}
          </span>

          <span className="flex-1" />

          {titulo && (
            <span className="mr-e2 max-w-[30ch] truncate text-paso-0 font-semibold text-hueso/80 max-[800px]:hidden">
              {titulo}
            </span>
          )}

          <button
            className={CLS_MANDO}
            aria-label="Atajos"
            aria-haspopup="dialog"
            aria-expanded={atajosAbiertos}
            onClick={() => setAtajosAbiertos((a) => !a)}
          >
            <Icono nombre="teclado" tam={21} />
          </button>

          {/* Menú de calidad */}
          {hayCalidades && (
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                className={`${CLS_MANDO} inline-flex items-center gap-[0.35rem]`}
                aria-haspopup="true"
                aria-expanded={menuAbierto === 'calidad'}
                aria-label="Calidad de vídeo"
                onClick={() =>
                  setMenuAbierto((m) => (m === 'calidad' ? null : 'calidad'))
                }
              >
                <Icono nombre="calidad" tam={21} />
                <span className="text-paso-0 font-bold tracking-[0.04em] text-hueso-70">
                  {calidades![0]?.etiqueta}
                </span>
              </button>
              <div
                className={`absolute right-0 bottom-[calc(100%+0.5rem)] min-w-[8rem] rounded-[3px] border border-borde-vivo bg-sala-800 p-e1 shadow-alta ${
                  menuAbierto === 'calidad' ? '' : 'hidden'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {calidades!.map((c, i) => (
                  <button
                    key={c.etiqueta}
                    role="menuitemradio"
                    aria-checked={c.etiqueta === calidades![0]?.etiqueta}
                    className="block w-full cursor-pointer rounded-[2px] border-0 bg-transparent px-[0.7rem] py-[0.4rem] text-left text-paso-1 hover:bg-sala-700 aria-checked:font-semibold aria-checked:text-ambar"
                    onClick={() => cambiarCalidad(c, i)}
                  >
                    {c.etiqueta}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Menú de velocidad */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              className={CLS_MANDO}
              aria-haspopup="true"
              aria-expanded={menuAbierto === 'velocidad'}
              aria-label="Velocidad de reproducción"
              onClick={() =>
                setMenuAbierto((m) => (m === 'velocidad' ? null : 'velocidad'))
              }
            >
              <Icono nombre="velocidad" tam={21} />
            </button>
            <div
              className={`absolute right-0 bottom-[calc(100%+0.5rem)] min-w-[8rem] rounded-[3px] border border-borde-vivo bg-sala-800 p-e1 shadow-alta ${
                menuAbierto === 'velocidad' ? '' : 'hidden'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {VELOCIDADES.map((v) => (
                <button
                  key={v}
                  role="menuitemradio"
                  aria-checked={velocidad === v}
                  className="block w-full cursor-pointer rounded-[2px] border-0 bg-transparent px-[0.7rem] py-[0.4rem] text-left text-paso-1 hover:bg-sala-700 aria-checked:font-semibold aria-checked:text-ambar"
                  onClick={() => cambiarVelocidad(v)}
                >
                  {v === 1 ? 'Normal' : `${v}×`}
                </button>
              ))}
            </div>
          </div>

          <button
            className={CLS_MANDO}
            aria-label="Ventana flotante"
            onClick={togglePip}
          >
            <Icono nombre="pip" tam={21} />
          </button>

          <button
            className={CLS_MANDO}
            onClick={togglePantallaCompleta}
            aria-label={
              pantallaCompleta
                ? 'Salir de pantalla completa'
                : 'Pantalla completa'
            }
          >
            <Icono
              nombre={pantallaCompleta ? 'salir-pantalla' : 'pantalla'}
              tam={21}
            />
          </button>
        </div>
      </div>
    </div>
  )
}