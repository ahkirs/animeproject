import Link from 'next/link'
import { Marca } from './Cabecera'

const COLUMNAS: { titulo: string; enlaces: { texto: string; href: string }[] }[] = [
  {
    titulo: 'Catálogo',
    enlaces: [
      { texto: 'Explorar', href: '/explorar' },
      { texto: 'Emisión', href: '/emision' },
      { texto: 'Simulcast', href: '/explorar?estado=emision' },
      { texto: 'Doblaje en español', href: '/explorar' },
    ],
  },
  {
    titulo: 'Cuenta',
    enlaces: [
      { texto: 'Mi lista', href: '/mi-lista' },
      { texto: 'Entrar', href: '/acceder' },
      { texto: 'Crear cuenta', href: '/registro' },
      { texto: 'Dispositivos', href: '/mi-lista' },
    ],
  },
  {
    titulo: 'Ayuda',
    enlaces: [
      { texto: 'Centro de soporte', href: '#' },
      { texto: 'Accesibilidad', href: '#' },
      { texto: 'Aviso legal', href: '#' },
      { texto: 'Privacidad', href: '#' },
    ],
  },
]

interface Props {
  /** Texto del aviso legal, distinto en el reproductor. */
  aviso?: string
  /** El reproductor lo pega al contenido, sin margen superior. */
  pegado?: boolean
}

const AVISO_POR_DEFECTO =
  'Maqueta de diseño. Todos los títulos, sinopsis, fechas, valoraciones, nombres y carátulas son material sintético creado para esta demostración: ninguna obra, marca ni persona real aparece en la página. Sustituye este contenido por el catálogo real antes de publicar.'

export default function Pie({ aviso = AVISO_POR_DEFECTO, pegado }: Props) {
  return (
    <footer
      className={`border-t border-borde px-margen pt-e5 pb-e4 text-paso-1 text-hueso-45 ${
        pegado ? 'mt-0' : 'mt-e6'
      }`}
    >
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-start justify-between gap-e4">
        <div>
          <Marca />
          <p className="mt-3 max-w-[34ch]">
            Catálogo de anime con emisión simultánea y subtítulos en cinco idiomas.
          </p>
        </div>

        {COLUMNAS.map((col) => (
          <div key={col.titulo}>
            <h3 className="mb-e2 text-paso-0 font-bold tracking-[0.1em] text-hueso-70 uppercase">
              {col.titulo}
            </h3>
            <ul className="grid list-none gap-[0.45rem] p-0">
              {col.enlaces.map((e) => (
                <li key={e.texto}>
                  <Link
                    href={e.href}
                    className="no-underline hover:text-hueso hover:underline"
                  >
                    {e.texto}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mx-auto mt-e4 max-w-[1600px] border-t border-borde pt-e3 text-paso-0 leading-relaxed text-hueso-45">
        {aviso}
      </p>
    </footer>
  )
}
