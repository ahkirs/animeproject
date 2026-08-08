import type { JSX, SVGProps } from 'react'

/* Iconos dibujados, un solo grosor de trazo en toda la familia.
   Antes vivían como <symbol> repetidos en los tres archivos HTML;
   aquí se declaran una vez. Los trazados son los mismos. */

const TRAZO = {
  fill: 'none',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

const ICONOS = {
  play: <path d="M7 4.5v15l13-7.5z" fill="currentColor" />,

  pausa: (
    <>
      <rect x="6.5" y="4.5" width="4" height="15" fill="currentColor" />
      <rect x="13.5" y="4.5" width="4" height="15" fill="currentColor" />
    </>
  ),

  mas: (
    <g stroke="currentColor" {...TRAZO}>
      <path d="M12 5v14M5 12h14" />
    </g>
  ),

  buscar: (
    <g stroke="currentColor" {...TRAZO}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </g>
  ),

  flecha: (
    <g stroke="currentColor" {...TRAZO}>
      <path d="M5 12h13M13 6.5l5.5 5.5-5.5 5.5" />
    </g>
  ),

  atras: (
    <g stroke="currentColor" {...TRAZO} strokeWidth={1.9}>
      <path d="M19 12H6M11 5.5L5 12l6 6.5" />
    </g>
  ),

  campana: (
    <g stroke="currentColor" {...TRAZO}>
      <path d="M6 10a6 6 0 0112 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10z" />
      <path d="M10.5 19a1.8 1.8 0 003 0" />
    </g>
  ),

  marcador: (
    <g stroke="currentColor" {...TRAZO}>
      <path d="M6.5 4.5h11a1 1 0 011 1v14l-6.5-4.4-6.5 4.4v-14a1 1 0 011-1z" />
    </g>
  ),

  /* Cheurón de menú. Va más fino que el resto de la familia a propósito:
     se usa a 12px junto al avatar, y al grosor normal se emborrona. */
  cheuron: (
    <g stroke="currentColor" {...TRAZO} strokeWidth={2.2}>
      <path d="M7 10l5 5 5-5" />
    </g>
  ),

  cinta: (
    <g stroke="currentColor" fill="none" strokeWidth={1.8}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2" />
      <circle cx="8" cy="12" r="2.4" />
      <circle cx="16" cy="12" r="2.4" />
    </g>
  ),

  check: (
    <g stroke="currentColor" {...TRAZO} strokeWidth={2.2}>
      <path d="M5 12.5l4.5 4.5L19 7" />
    </g>
  ),

  candado: (
    <g stroke="currentColor" fill="none" strokeWidth={1.8}>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
      <path d="M8.5 10.5V8a3.5 3.5 0 017 0v2.5" />
    </g>
  ),

  compartir: (
    <g stroke="currentColor" {...TRAZO}>
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M8.3 10.8l7.4-3.6M8.3 13.2l7.4 3.6" />
    </g>
  ),

  descarga: (
    <g stroke="currentColor" {...TRAZO}>
      <path d="M12 3.5v11M7.5 10.5l4.5 4.5 4.5-4.5M4.5 19.5h15" />
    </g>
  ),

  'atras-10': (
    <g stroke="currentColor" {...TRAZO}>
      <path d="M11 5.5A7.5 7.5 0 114 14" />
      <path d="M11 2.5L8 5.5l3 3" />
    </g>
  ),

  'alante-10': (
    <g stroke="currentColor" {...TRAZO}>
      <path d="M13 5.5A7.5 7.5 0 1020 14" />
      <path d="M13 2.5l3 3-3 3" />
    </g>
  ),

  siguiente: (
    <>
      <path d="M5 5l11 7-11 7z" fill="currentColor" />
      <rect x="17" y="5" width="3" height="14" fill="currentColor" />
    </>
  ),

  volumen: (
    <g stroke="currentColor" fill="none" strokeWidth={1.8} strokeLinejoin="round">
      <path d="M4 9.5h4L13 5v14L8 14.5H4z" fill="currentColor" />
      <path d="M16.5 9a4.5 4.5 0 010 6M19 6.5a8 8 0 010 11" />
    </g>
  ),

  silencio: (
    <g stroke="currentColor" fill="none" strokeWidth={1.8} strokeLinejoin="round">
      <path d="M4 9.5h4L13 5v14L8 14.5H4z" fill="currentColor" />
      <path d="M17 9.5l5 5M22 9.5l-5 5" strokeLinecap="round" />
    </g>
  ),

  cc: (
    <g stroke="currentColor" fill="none" strokeWidth={1.7}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path
        d="M10 10.2a2.6 2.6 0 100 3.6M17 10.2a2.6 2.6 0 100 3.6"
        strokeLinecap="round"
      />
    </g>
  ),

  ajustes: (
    <g stroke="currentColor" fill="none" strokeWidth={1.7}>
      <circle cx="12" cy="12" r="3" />
      <path
        d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4L5.3 5.3"
        strokeLinecap="round"
      />
    </g>
  ),

  pantalla: (
    <g stroke="currentColor" {...TRAZO} strokeWidth={1.9}>
      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
    </g>
  ),

  emitir: (
    <g stroke="currentColor" {...TRAZO}>
      <path d="M3 19.5h.01M3 15a4.5 4.5 0 014.5 4.5M3 10.5a9 9 0 019 9" />
      <path d="M3 7.5v-2a1.5 1.5 0 011.5-1.5h15A1.5 1.5 0 0121 5.5v13a1.5 1.5 0 01-1.5 1.5H14" />
    </g>
  ),

  pip: (
    <g stroke="currentColor" fill="none" strokeWidth={1.8} strokeLinejoin="round">
      <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
      <rect x="12" y="11" width="8" height="7" rx="1" fill="currentColor" stroke="none" />
    </g>
  ),

  teclado: (
    <g stroke="currentColor" {...TRAZO}>
      <rect x="1.8" y="5.5" width="20.4" height="13" rx="2.2" />
      <path d="M5.6 9.3h.01M9 9.3h.01M12.4 9.3h.01M15.8 9.3h.01M18.4 9.3h.01M5.6 12.4h.01M9 12.4h.01M12.4 12.4h.01M15.8 12.4h.01M18.4 12.4h.01M8 15.4h8" />
    </g>
  ),

  velocidad: (
    <g stroke="currentColor" {...TRAZO} strokeLinecap="round">
      <path d="M12 20a8 8 0 108-8" />
      <path d="M12 12l4.5-4" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </g>
  ),

  calidad: (
    <g stroke="currentColor" {...TRAZO} strokeLinejoin="round">
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M7 9.5v5M7 12h3.2M10.2 9.5v5" strokeLinecap="round" />
      <path d="M14 9.5v5h1.6a2.4 2.4 0 000-5H14z" strokeLinecap="round" />
    </g>
  ),

  cerrar: (
    <g stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </g>
  ),

  'salir-pantalla': (
    <g stroke="currentColor" {...TRAZO} strokeWidth={1.9}>
      <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
    </g>
  ),
} satisfies Record<string, JSX.Element>

export type NombreIcono = keyof typeof ICONOS

interface Props extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  nombre: NombreIcono
  tam?: number
}

export default function Icono({ nombre, tam = 18, ...props }: Props) {
  return (
    <svg
      width={tam}
      height={tam}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {ICONOS[nombre]}
    </svg>
  )
}
