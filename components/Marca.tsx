import Link from 'next/link'
import Icono from './Icono'

/* La marca vive aparte de la cabecera a propósito.

   La cabecera lee la sesión, y eso la ata al servidor. El pie, el marco
   de las páginas de cuenta y la frontera de error la necesitan también,
   y esta última es un componente de cliente por obligación. Si la marca
   siguiera dentro de Cabecera.tsx, importarla arrastraría `next/headers`
   al paquete del navegador y la compilación se caería. */
export default function Marca({ className = '' }: { className?: string }) {
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
