import type { JSX } from 'react'
import type { ClaveLamina } from '@/lib/types'

/* Carátulas y fotogramas.
   Son ilustraciones vectoriales planas creadas para esta maqueta,
   no imágenes de terceros. Antes estaban duplicadas como <symbol>
   en los tres archivos HTML; aquí se declaran una sola vez. */

interface Dibujo {
  viewBox: string
  contenido: JSX.Element
}

const LAMINAS = {
  /* ---------- Carteles 2:3 ---------- */

  mecha: {
    viewBox: '0 0 400 600',
    contenido: (
      <>
        <rect width="400" height="600" fill="#191c24" />
        <circle cx="200" cy="215" r="118" fill="#c8442f" />
        <path d="M0 600V420l70-52 64 40 68-74 76 52 62-36 60 44v206z" fill="#0d0f14" />
        <path d="M200 150l52 44v96l-52 40-52-40v-96z" fill="#0d0f14" />
        <path d="M176 214h20v22h-20zM204 214h20v22h-20z" fill="#ffb03a" />
        <path
          d="M200 330v112M158 366l42-30 42 30"
          stroke="#0d0f14"
          strokeWidth="13"
          fill="none"
        />
      </>
    ),
  },

  jardin: {
    viewBox: '0 0 400 600',
    contenido: (
      <>
        <rect width="400" height="600" fill="#22301f" />
        <circle cx="288" cy="150" r="76" fill="#e8dcc0" />
        <path
          d="M0 600V400c60-38 96 22 150-16s78-70 132-44 74 8 118-22v282z"
          fill="#162114"
        />
        <path d="M96 600V300" stroke="#0d150c" strokeWidth="16" />
        <path
          d="M96 356c-46-10-62-46-58-84 40 6 62 40 58 84zM96 402c46-14 60-52 54-90-40 10-58 46-54 90z"
          fill="#3f6b3a"
        />
        <g fill="#e0b3c6">
          <circle cx="150" cy="238" r="9" />
          <circle cx="60" cy="286" r="7" />
          <circle cx="196" cy="322" r="6" />
          <circle cx="112" cy="196" r="5" />
        </g>
      </>
    ),
  },

  kaiju: {
    viewBox: '0 0 400 600',
    contenido: (
      <>
        <rect width="400" height="600" fill="#141b26" />
        <path
          d="M0 600V300h44v-70h40v70h50V220h46v80h58v-56h42v56h46v96h74v204z"
          fill="#0a0e15"
        />
        <g fill="#ffb03a" opacity="0.85">
          <rect x="12" y="330" width="10" height="14" />
          <rect x="56" y="262" width="10" height="14" />
          <rect x="150" y="252" width="10" height="14" />
          <rect x="252" y="288" width="10" height="14" />
          <rect x="316" y="360" width="10" height="14" />
        </g>
        <path
          d="M258 600c-16-84 8-152 46-206 22-32 18-64-8-92 62 18 96 76 88 146-6 54-34 104-70 152z"
          fill="#233d3a"
        />
        <circle cx="316" cy="286" r="11" fill="#e0453a" />
      </>
    ),
  },

  noche: {
    viewBox: '0 0 400 600',
    contenido: (
      <>
        <rect width="400" height="600" fill="#161428" />
        <g stroke="#2f2a4d" strokeWidth="2">
          <path d="M40 0l-30 600M120 0l-30 600M200 0l-30 600M280 0l-30 600M360 0l-30 600M440 0l-30 600" />
        </g>
        <circle cx="300" cy="120" r="58" fill="#f0e9d8" />
        <circle cx="272" cy="104" r="52" fill="#161428" />
        <path d="M0 600V486h400v114z" fill="#0d0b1b" />
        <path d="M130 486V376" stroke="#0d0b1b" strokeWidth="7" />
        <path d="M74 380a56 30 0 01112 0z" fill="#e0453a" />
        <path
          d="M130 486l-14 74M130 486l16 74"
          stroke="#0d0b1b"
          strokeWidth="11"
          strokeLinecap="round"
        />
      </>
    ),
  },

  tren: {
    viewBox: '0 0 400 600',
    contenido: (
      <>
        <rect width="400" height="600" fill="#1b1a22" />
        <circle cx="112" cy="164" r="86" fill="#f4efe6" />
        <path d="M0 600V430h400v170z" fill="#101016" />
        <rect x="-20" y="300" width="440" height="112" rx="10" fill="#2c3a4a" />
        <g fill="#ffb03a">
          <rect x="8" y="330" width="42" height="34" rx="3" />
          <rect x="70" y="330" width="42" height="34" rx="3" />
          <rect x="132" y="330" width="42" height="34" rx="3" />
          <rect x="194" y="330" width="42" height="34" rx="3" />
          <rect x="256" y="330" width="42" height="34" rx="3" />
          <rect x="318" y="330" width="42" height="34" rx="3" />
        </g>
        <g fill="#0a0a10">
          <circle cx="60" cy="424" r="20" />
          <circle cx="150" cy="424" r="20" />
          <circle cx="250" cy="424" r="20" />
          <circle cx="340" cy="424" r="20" />
        </g>
        <path d="M0 452h400" stroke="#3a3a48" strokeWidth="6" />
      </>
    ),
  },

  espada: {
    viewBox: '0 0 400 600',
    contenido: (
      <>
        <rect width="400" height="600" fill="#2a1a18" />
        <circle cx="200" cy="196" r="130" fill="#e8dcc0" />
        <path d="M0 600V440c70 26 118-30 200-30s130 56 200 30v160z" fill="#1a100f" />
        <path
          d="M0 470c76 22 122-26 200-26s124 48 200 26"
          stroke="#c8442f"
          strokeWidth="5"
          fill="none"
        />
        <path d="M212 118v300" stroke="#1a100f" strokeWidth="9" />
        <path d="M188 288h48" stroke="#1a100f" strokeWidth="11" />
        <path d="M176 440c0-58 14-96 36-114 22 18 36 56 36 114z" fill="#1a100f" />
        <circle cx="212" cy="306" r="7" fill="#ffb03a" />
      </>
    ),
  },

  /* ---------- Panorámicas 16:9 ---------- */

  'panoramica-escena': {
    viewBox: '0 0 1600 900',
    contenido: (
      <>
        <rect width="1600" height="900" fill="#17141f" />
        <circle cx="1150" cy="300" r="220" fill="#c8442f" />
        <circle cx="1080" cy="262" r="200" fill="#17141f" opacity="0.55" />
        <path
          d="M0 900V620c120-70 210 40 330-10s180-150 300-110 210 130 330 80 200-160 330-120 200 140 310 96V900z"
          fill="#0f0d16"
        />
        <path
          d="M0 900V740c140-46 230 40 360 6s200-108 330-78 210 96 330 60 200-118 330-86 190 104 250 72V900z"
          fill="#0a0910"
        />
        <g fill="#0a0910">
          <path d="M690 900V560l52-40 52 40v340z" />
          <path d="M716 596h52v34h-52z" fill="#ffb03a" opacity="0.9" />
        </g>
        <g stroke="#2a2438" strokeWidth="2" opacity="0.5">
          <path d="M0 200h1600M0 340h1600M0 480h1600" />
        </g>
      </>
    ),
  },

  'panoramica-obra': {
    viewBox: '0 0 1600 900',
    contenido: (
      <>
        <rect width="1600" height="900" fill="#171a22" />
        <circle cx="1180" cy="270" r="240" fill="#c8442f" />
        <path
          d="M0 900V600c130-64 220 44 350-8s190-146 320-104 210 128 340 78 200-152 330-114 190 130 260 92V900z"
          fill="#0e1118"
        />
        <path
          d="M0 900V760c150-40 240 34 370 4s210-100 340-72 220 88 340 54 200-110 330-80 160 96 220 70V900z"
          fill="#090b10"
        />
        <g stroke="#242938" strokeWidth="2" opacity="0.45">
          <path d="M0 180h1600M0 320h1600M0 460h1600" />
        </g>
      </>
    ),
  },

  'panoramica-player': {
    viewBox: '0 0 1600 900',
    contenido: (
      <>
        <rect width="1600" height="900" fill="#10131b" />
        <circle cx="1220" cy="250" r="180" fill="#c8442f" />
        <path
          d="M0 900V640c140-58 230 36 360-6s200-128 330-92 210 112 340 72 210-130 330-96 180 116 240 84V900z"
          fill="#080a10"
        />
        <g fill="#080a10">
          <path d="M520 900V520l70-54 70 54v380z" />
          <path d="M556 560h68v40h-68z" fill="#ffb03a" />
          <path
            d="M590 660v150M520 700l70-42 70 42"
            stroke="#080a10"
            strokeWidth="18"
            fill="none"
          />
        </g>
        <g stroke="#1b2130" strokeWidth="3" opacity="0.5">
          <path d="M0 200h1600M0 340h1600M0 480h1600" />
        </g>
        <g fill="#f4efe6" opacity="0.5">
          <circle cx="180" cy="140" r="3" />
          <circle cx="420" cy="90" r="2" />
          <circle cx="760" cy="180" r="2.5" />
          <circle cx="980" cy="110" r="2" />
        </g>
      </>
    ),
  },

  /* ---------- Miniaturas de episodio 16:9 ---------- */

  'ep-1': {
    viewBox: '0 0 400 225',
    contenido: (
      <>
        <rect width="400" height="225" fill="#1c2029" />
        <circle cx="300" cy="70" r="52" fill="#c8442f" />
        <path d="M0 225V150l60-28 58 22 70-40 66 30 74-24 72 34v81z" fill="#0d0f14" />
        <path d="M120 150V96l22-16 22 16v54z" fill="#0d0f14" />
        <rect x="132" y="106" width="20" height="12" fill="#ffb03a" />
      </>
    ),
  },

  'ep-2': {
    viewBox: '0 0 400 225',
    contenido: (
      <>
        <rect width="400" height="225" fill="#182028" />
        <path d="M0 225V120c70-30 120 26 190-4s130-52 210-16v125z" fill="#0f1620" />
        <circle cx="92" cy="66" r="40" fill="#f4efe6" />
        <g fill="#ffb03a">
          <rect x="250" y="130" width="8" height="26" />
          <rect x="284" y="118" width="8" height="38" />
          <rect x="318" y="136" width="8" height="20" />
        </g>
      </>
    ),
  },

  'ep-3': {
    viewBox: '0 0 400 225',
    contenido: (
      <>
        <rect width="400" height="225" fill="#231a1c" />
        <circle cx="200" cy="104" r="74" fill="#e8dcc0" />
        <path d="M0 225V168c80 22 130-24 200-24s124 46 200 24v57z" fill="#150f11" />
        <path d="M200 44v130" stroke="#150f11" strokeWidth="7" />
        <path d="M182 118h36" stroke="#150f11" strokeWidth="9" />
      </>
    ),
  },

  'ep-4': {
    viewBox: '0 0 400 225',
    contenido: (
      <>
        <rect width="400" height="225" fill="#141b26" />
        <path
          d="M0 225V110h40v-26h34v26h44V70h40v40h50v-22h36v22h40v40h76v75z"
          fill="#0a0e15"
        />
        <g fill="#ffb03a" opacity="0.85">
          <rect x="14" y="126" width="8" height="10" />
          <rect x="86" y="90" width="8" height="10" />
          <rect x="176" y="80" width="8" height="10" />
          <rect x="272" y="104" width="8" height="10" />
        </g>
      </>
    ),
  },
} satisfies Record<ClaveLamina, Dibujo>

interface Props {
  arte: ClaveLamina
  className?: string
}

export default function Lamina({ arte, className }: Props) {
  const { viewBox, contenido } = LAMINAS[arte]
  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      className={className ?? 'h-full w-full'}
    >
      {contenido}
    </svg>
  )
}
