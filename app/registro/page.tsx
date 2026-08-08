import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import MarcoCuenta from '@/components/MarcoCuenta'
import FormularioSesion from '@/components/FormularioSesion'
import { haySesion } from '@/lib/sesion'

export const metadata: Metadata = {
  title: 'Crear cuenta',
  description: 'Crea una cuenta para guardar tu lista, tu progreso y tus favoritos.',
}

export default async function Registro() {
  if (await haySesion()) redirect('/mi-lista')

  return (
    <MarcoCuenta
      titulo="Crear cuenta"
      entradilla="Guarda tu lista, tu progreso y lo que quieras ver después."
      pie={{ texto: '¿Ya tienes cuenta?', enlace: 'Entra', href: '/acceder' }}
    >
      <FormularioSesion modo="registro" />
    </MarcoCuenta>
  )
}
