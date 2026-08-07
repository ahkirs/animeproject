import Link from 'next/link'
import Icono from './Icono'

type Seccion = 'inicio' | 'series' | 'estrenos' | 'emision' | 'generos'

const ENLACES: { id: Seccion; texto: string; href: string }[] = [
  { id: 'inicio', texto: 'Inicio', href: '/' },
  { id: 'series', texto: 'Series', href: '/serie/cielo-de-hierro' },
  { id: 'estrenos', texto: 'Estrenos', href: '/#estrenos' },
  { id: 'emision', texto: 'Emisión', href: '/emision' },
  { id: 'generos', texto: 'Géneros', href: '/#generos' },
]

export function Marca({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-flex shrink-0 items-center gap-[0.55rem] font-display text-paso-3 tracking-[-0.03em] no-underline ${className}`}
    >
      <Icono nombre="cinta" tam={26} className="text-ambar" />
      KUROBA
    </Link>
  )
}

export default function Cabecera({ activa }: { activa?: Seccion }) {
  return (
    <header className="sticky top-0 z-60 flex items-center gap-e4 bg-[linear-gradient(to_bottom,#0b0a09_55%,rgba(11,10,9,0))] px-margen py-e3">
      <Marca />

      <nav aria-label="Principal" className="ml-e2 hidden gap-e3 min-[900px]:flex">
        {ENLACES.map((e) => {
          const actual = e.id === activa
          return (
            <Link
              key={e.id}
              href={e.href}
              aria-current={actual ? 'page' : undefined}
              className={`border-b-2 py-1 text-paso-1 font-medium no-underline transition-colors duration-200 ease-sal ${
                actual
                  ? 'border-ambar text-hueso'
                  : 'border-transparent text-hueso-70 hover:text-hueso'
              }`}
            >
              {e.texto}
            </Link>
          )
        })}
      </nav>

      <div className="ml-auto flex items-center gap-e2">
        <label className="flex items-center gap-2 rounded-full border border-borde bg-sala-700 px-[0.9rem] py-2 transition-colors duration-200 ease-sal focus-within:border-hueso-45 max-[560px]:px-[0.55rem]">
          <Icono nombre="buscar" tam={17} className="shrink-0 text-hueso-45" />
          <span className="sr-only">Buscar series</span>
          <input
            type="search"
            placeholder="Buscar…"
            className="w-[11ch] border-0 bg-transparent text-paso-1 text-hueso outline-none transition-[width] duration-300 ease-sal placeholder:text-hueso-45 focus:w-[18ch] max-[560px]:hidden"
          />
        </label>

        <button
          type="button"
          aria-label="Novedades"
          className="grid size-11 cursor-pointer place-items-center rounded-full border border-borde-vivo bg-hueso/6 text-hueso transition-colors duration-200 ease-sal hover:border-hueso-45 hover:bg-hueso/14"
        >
          <Icono nombre="campana" tam={19} />
        </button>

        <button
          type="button"
          aria-label="Tu cuenta"
          className="grid size-[34px] cursor-pointer place-items-center rounded-full border border-borde-vivo bg-sala-600 text-paso-0 font-bold text-hueso-70 hover:border-hueso-45 hover:text-hueso"
        >
          AR
        </button>
      </div>
    </header>
  )
}
