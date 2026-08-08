'use client'

/* Formulario de acceso y de registro.

   Cliente porque tiene que enseñar el error del servidor sin recargar y
   bloquear el botón mientras va la petición: sin eso, la gente pulsa dos
   veces y el backend cuenta dos intentos de los cinco por minuto que
   permite.

   El envío va a /api/auth/*, de este mismo sitio, nunca al backend. */

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Campo from './Campo'
import Icono from './Icono'

export type Modo = 'login' | 'registro'

export default function FormularioSesion({
  modo,
  destino = '/mi-lista',
}: {
  modo: Modo
  /** A dónde ir al terminar. */
  destino?: string
}) {
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (enviando) return

    const datos = new FormData(evento.currentTarget)
    const cuerpo =
      modo === 'login'
        ? {
            email: String(datos.get('email') ?? ''),
            password: String(datos.get('password') ?? ''),
          }
        : {
            email: String(datos.get('email') ?? ''),
            username: String(datos.get('username') ?? ''),
            password: String(datos.get('password') ?? ''),
            confirmPassword: String(datos.get('confirmPassword') ?? ''),
          }

    // Se comprueba aquí antes de gastar uno de los cinco intentos.
    if (modo === 'registro' && cuerpo.password !== (cuerpo as { confirmPassword: string }).confirmPassword) {
      setError('Las dos contraseñas no coinciden.')
      return
    }

    setEnviando(true)
    setError(null)

    try {
      const respuesta = await fetch(`/api/auth/${modo}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo),
      })
      const resultado = (await respuesta.json()) as { ok: boolean; error?: string }

      if (!resultado.ok) {
        setError(resultado.error ?? 'No se pudo continuar.')
        setEnviando(false)
        return
      }

      // refresh() antes de push() para que los componentes de servidor
      // vuelvan a leer la cookie: sin él la cabecera seguiría enseñando
      // «Acceder» en la página siguiente.
      router.refresh()
      router.push(destino)
    } catch {
      setError('No hay conexión con el servidor. Prueba en un momento.')
      setEnviando(false)
    }
  }

  return (
    <form className="grid gap-e3" onSubmit={enviar} noValidate>
      {error && (
        <p
          role="alert"
          className="flex items-start gap-e2 rounded-radio border border-rojo/40 bg-rojo/10 px-e3 py-e2 text-paso-1 text-hueso"
        >
          <span className="mt-[0.15rem] shrink-0 text-rojo">
            <Icono nombre="cerrar" tam={15} />
          </span>
          {error}
        </p>
      )}

      {modo === 'registro' && (
        <Campo
          etiqueta="Nombre de usuario"
          name="username"
          type="text"
          required
          autoComplete="username"
          placeholder="comoquierasllamarte"
          ayuda="Es el que verá la gente en tu perfil público."
        />
      )}

      <Campo
        etiqueta="Correo"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="tu@correo.com"
      />

      <Campo
        etiqueta="Contraseña"
        name="password"
        type="password"
        required
        autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
        placeholder="••••••••"
      />

      {modo === 'registro' && (
        <Campo
          etiqueta="Repite la contraseña"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          placeholder="••••••••"
        />
      )}

      <button
        type="submit"
        disabled={enviando}
        className="mt-e2 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-radio border border-transparent bg-ambar px-[1.35rem] py-3 text-paso-2 font-semibold text-ambar-tinta transition-colors duration-200 ease-sal hover:bg-ambar-claro active:translate-y-px disabled:cursor-wait disabled:opacity-60"
      >
        {enviando
          ? 'Un momento…'
          : modo === 'login'
            ? 'Entrar'
            : 'Crear cuenta'}
      </button>
    </form>
  )
}
