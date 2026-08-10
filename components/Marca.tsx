import Link from 'next/link'
import Icono from './Icono'

/* La marca vive aparte del marco a propósito.

   El marco lee la sesión, y eso lo ata al servidor. El pie, las páginas
   de cuenta y la frontera de error la necesitan también, y esta última es
   un componente de cliente por obligación. Si la marca siguiera dentro
   del componente que lee la sesión, importarla arrastraría
   `next/headers` al paquete del navegador y la compilación se caería. */
export default function Marca({
  className = '',
  /** En el riel lateral no caben las seis letras: 48px de ancho solo dan
   *  para el símbolo. El nombre queda igualmente accesible porque el
   *  enlace conserva su etiqueta. */
  soloIcono = false,
}: {
  className?: string
  soloIcono?: boolean
}) {
  return (
    <Link
      href="/"
      aria-label={soloIcono ? 'KUROBA — ir al inicio' : undefined}
      className={`inline-flex shrink-0 items-center gap-[0.5rem] font-titulo text-lg font-extrabold tracking-[-0.03em] no-underline ${className}`}
    >
      <Icono nombre="cinta" tam={soloIcono ? 22 : 24} className="text-acento" />
      {!soloIcono && 'KUROBA'}
    </Link>
  )
}
