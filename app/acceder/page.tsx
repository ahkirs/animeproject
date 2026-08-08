import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import MarcoCuenta from '@/components/MarcoCuenta'
import FormularioSesion from '@/components/FormularioSesion'
import { haySesion } from '@/lib/sesion'

export const metadata: Metadata = {
  title: 'Acceder',
  description: 'Entra en tu cuenta para recuperar tu lista y tu progreso.',
}

export default async function Acceder({
  searchParams,
}: {
  searchParams: Promise<{ destino?: string }>
}) {
  const { destino } = await searchParams

  // Con sesión abierta esta página no tiene sentido.
  if (await haySesion()) redirect(destino || '/mi-lista')

  // Solo rutas de este sitio: un destino que viniera de fuera convertiría
  // el enlace de acceso en un redirector abierto.
  const seguro = destino && destino.startsWith('/') && !destino.startsWith('//')
    ? destino
    : '/mi-lista'

  return (
    <MarcoCuenta
      titulo="Entrar"
      entradilla="Recupera tu lista, tu progreso y los avisos de estreno."
      pie={{ texto: '¿Todavía no tienes cuenta?', enlace: 'Créala', href: '/registro' }}
    >
      <FormularioSesion modo="login" destino={seguro} />
    </MarcoCuenta>
  )
}
