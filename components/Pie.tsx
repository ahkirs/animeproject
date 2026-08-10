import Link from 'next/link'
import Marca from './Marca'

/* El pie.

   Vive dentro del panel con scroll del marco, así que se ve al final de
   cualquier página sin que ninguna tenga que montarlo. Va callado a
   propósito: en un sitio donde el contenido es la carátula, el pie es
   señalización, no una sección más. */

const COLUMNAS: { titulo: string; enlaces: { texto: string; href: string }[] }[] = [
  {
    titulo: 'Catálogo',
    enlaces: [
      { texto: 'Explorar', href: '/explorar' },
      { texto: 'En emisión', href: '/explorar?estado=emision' },
      { texto: 'Completas', href: '/explorar?estado=completa' },
    ],
  },
  {
    titulo: 'Cuenta',
    enlaces: [
      { texto: 'Mi lista', href: '/mi-lista' },
      { texto: 'Notificaciones', href: '/notificaciones' },
      { texto: 'Ajustes', href: '/cuenta' },
    ],
  },
  {
    titulo: 'Ayuda',
    enlaces: [
      { texto: 'Accesibilidad', href: '#' },
      { texto: 'Aviso legal', href: '#' },
      { texto: 'Privacidad', href: '#' },
    ],
  },
]

const AVISO_POR_DEFECTO =
  'KUROBA no aloja ningún vídeo. El catálogo, las fichas y los enlaces de reproducción se obtienen de proveedores externos y se enlazan tal cual; los derechos de cada obra pertenecen a sus autores y licenciatarios.'

export default function Pie({
  /** Texto legal, distinto en el reproductor. */
  aviso = AVISO_POR_DEFECTO,
}: {
  aviso?: string
}) {
  return (
    <footer className="mt-16 border-t border-borde px-bleed pt-10 pb-8 text-sm text-tinta-tenue">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-start justify-between gap-8">
        <div>
          <Marca />
          <p className="mt-3 max-w-[34ch]">
            Catálogo de anime en español, con lo que está emitiéndose ahora
            mismo.
          </p>
        </div>

        {COLUMNAS.map((col) => (
          <div key={col.titulo}>
            <h3 className="mb-3 text-xs font-bold tracking-[0.1em] text-tinta-apagada uppercase">
              {col.titulo}
            </h3>
            <ul className="grid list-none gap-[0.45rem] p-0">
              {col.enlaces.map((e) => (
                <li key={e.texto}>
                  <Link
                    href={e.href}
                    className="no-underline transition-colors duration-150 ease-sal hover:text-tinta"
                  >
                    {e.texto}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mx-auto mt-8 max-w-[1600px] border-t border-borde pt-5 text-xs leading-relaxed">
        {aviso}
      </p>
    </footer>
  )
}
