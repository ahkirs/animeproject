/* Ajustes de cuenta.

   Donde antes había dos botones desactivados y un comentario diciendo
   qué endpoints había detrás. Estaban todos: perfil, contraseña, correo,
   doble factor con TOTP, sesiones abiertas y baja.

   Las secciones van en el orden en que se usan de verdad —lo que se
   toca a menudo arriba, lo irreversible al fondo— y la baja además
   plegada. */

import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import AjustesPerfil from '@/components/AjustesPerfil'
import AjustesSesiones from '@/components/AjustesSesiones'
import BorrarCuenta from '@/components/BorrarCuenta'
import {
  CambiarContrasena,
  CambiarCorreo,
  DobleFactor,
} from '@/components/AjustesSeguridad'
import { perfil } from '@/lib/perfil'
import { sesionesActivas } from '@/lib/cuenta'

export const metadata: Metadata = {
  title: 'Ajustes de cuenta',
  robots: { index: false, follow: false },
}

function Seccion({
  titulo,
  descripcion,
  children,
}: {
  titulo: string
  descripcion?: string
  children: ReactNode
}) {
  return (
    <section className="border-t border-borde py-8 first:border-t-0 first:pt-0">
      <h2 className="text-lg font-semibold text-tinta">{titulo}</h2>
      {descripcion && (
        <p className="mt-1 mb-5 max-w-[60ch] text-sm text-tinta-tenue">
          {descripcion}
        </p>
      )}
      <div className={descripcion ? '' : 'mt-5'}>{children}</div>
    </section>
  )
}

export default async function Cuenta() {
  const p = await perfil()
  if (!p) redirect('/acceder?destino=%2Fcuenta')

  const sesiones = await sesionesActivas()

  const alta = new Date(p.createdAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })

  return (
    <div className="mx-auto max-w-[760px] px-bleed pb-16">
      <header className="pt-8 pb-6">
        <h1 className="font-titulo text-2xl font-extrabold tracking-[-0.02em]">
          Ajustes de cuenta
        </h1>
        <p className="mt-1 text-sm text-tinta-tenue">
          Cuenta creada el {alta}
          {p.subscriptionStatus === 'free' ? ' · plan gratuito' : ''}
        </p>
      </header>

      {!p.isEmailVerified && (
        <p className="mb-6 rounded-radio border border-borde bg-tarjeta px-4 py-3 text-sm text-tinta-apagada">
          Tu correo <b className="font-semibold text-tinta">{p.email}</b> todavía
          no está verificado. Busca el mensaje que te mandamos al registrarte.
        </p>
      )}

      <Seccion
        titulo="Perfil"
        descripcion="Lo que ve el resto de gente en tus comentarios y en tu perfil público."
      >
        <AjustesPerfil
          alias={p.username}
          avatar={p.avatarUrl ?? ''}
          bio={p.bio ?? ''}
        />
      </Seccion>

      <Seccion
        titulo="Contraseña"
        descripcion="Cambiarla cierra el resto de sesiones abiertas."
      >
        <CambiarContrasena />
      </Seccion>

      <Seccion titulo="Correo electrónico">
        <CambiarCorreo actual={p.email} />
      </Seccion>

      <Seccion titulo="Verificación en dos pasos">
        <DobleFactor activo={p.twoFactorEnabled ?? false} />
      </Seccion>

      <Seccion
        titulo="Sesiones abiertas"
        descripcion="Cada una es un navegador donde tu cuenta sigue entrada."
      >
        <AjustesSesiones sesiones={sesiones} />
      </Seccion>

      <Seccion titulo="Zona de riesgo">
        <BorrarCuenta alias={p.username} />
      </Seccion>
    </div>
  )
}
