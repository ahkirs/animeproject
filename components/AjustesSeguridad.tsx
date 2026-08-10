'use client'

/* Contraseña, correo y verificación en dos pasos.

   Las tres cosas van juntas porque las tres piden la contraseña actual:
   separarlas en tres pantallas obligaría a teclearla tres veces.

   El QR del 2FA lo genera el backend y llega como data URL, así que va
   directo a un <img>. No hace falta ninguna librería de códigos en el
   navegador. */

import { useState, useTransition } from 'react'
import Campo from './Campo'
import Boton from './Boton'
import {
  activarDobleFactor,
  cambiarContrasena,
  cambiarEmail,
  desactivarDobleFactor,
  prepararDobleFactor,
} from '@/lib/acciones-cuenta'
import type { Alta2FA } from '@/lib/cuenta'

/** Aviso de resultado, verde o rojo. Se declara una vez porque los tres
 *  formularios de esta pantalla terminan igual. */
function Aviso({ ok, texto }: { ok: boolean; texto: string }) {
  return (
    <span
      role={ok ? undefined : 'alert'}
      className={`text-xs font-semibold ${ok ? 'text-exito' : 'text-error'}`}
    >
      {texto}
    </span>
  )
}

export function CambiarContrasena() {
  const [actual, setActual] = useState('')
  const [nueva, setNueva] = useState('')
  const [repetida, setRepetida] = useState('')
  const [resultado, setResultado] = useState<{ ok: boolean; texto: string } | null>(null)
  const [pendiente, empezar] = useTransition()

  const noCoincide = repetida.length > 0 && nueva !== repetida

  function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (noCoincide) return
    setResultado(null)
    empezar(async () => {
      const r = await cambiarContrasena(actual, nueva)
      if (r.ok) {
        setActual('')
        setNueva('')
        setRepetida('')
        setResultado({
          ok: true,
          texto: 'Contraseña cambiada. Las demás sesiones se han cerrado.',
        })
      } else {
        setResultado({ ok: false, texto: r.error ?? 'No se pudo cambiar.' })
      }
    })
  }

  return (
    <form onSubmit={enviar} className="grid max-w-md gap-4">
      <Campo
        id="pass-actual"
        etiqueta="Contraseña actual"
        type="password"
        autoComplete="current-password"
        value={actual}
        onChange={(e) => setActual(e.target.value)}
      />
      <Campo
        id="pass-nueva"
        etiqueta="Contraseña nueva"
        type="password"
        autoComplete="new-password"
        value={nueva}
        onChange={(e) => setNueva(e.target.value)}
        ayuda="Ocho caracteres o más."
      />
      <Campo
        id="pass-repetir"
        etiqueta="Repite la nueva"
        type="password"
        autoComplete="new-password"
        value={repetida}
        onChange={(e) => setRepetida(e.target.value)}
        error={noCoincide ? 'Las dos contraseñas no coinciden.' : undefined}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Boton
          type="submit"
          variante="primario"
          tam="compacto"
          disabled={pendiente || !actual || !nueva || noCoincide}
        >
          {pendiente ? 'Cambiando…' : 'Cambiar contraseña'}
        </Boton>
        {resultado && <Aviso {...resultado} />}
      </div>
    </form>
  )
}

export function CambiarCorreo({ actual }: { actual: string }) {
  const [nuevo, setNuevo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [resultado, setResultado] = useState<{ ok: boolean; texto: string } | null>(null)
  const [pendiente, empezar] = useTransition()

  function enviar(e: React.FormEvent) {
    e.preventDefault()
    setResultado(null)
    empezar(async () => {
      const r = await cambiarEmail(nuevo, contrasena)
      if (r.ok) {
        setNuevo('')
        setContrasena('')
        setResultado({
          ok: true,
          texto: 'Te hemos mandado un correo para verificar la dirección nueva.',
        })
      } else {
        setResultado({ ok: false, texto: r.error ?? 'No se pudo cambiar.' })
      }
    })
  }

  return (
    <form onSubmit={enviar} className="grid max-w-md gap-4">
      <p className="text-sm text-tinta-apagada">
        Ahora mismo: <b className="font-semibold text-tinta">{actual}</b>
      </p>

      <Campo
        id="correo-nuevo"
        etiqueta="Correo nuevo"
        type="email"
        autoComplete="email"
        value={nuevo}
        onChange={(e) => setNuevo(e.target.value)}
      />
      <Campo
        id="correo-pass"
        etiqueta="Tu contraseña"
        type="password"
        autoComplete="current-password"
        value={contrasena}
        onChange={(e) => setContrasena(e.target.value)}
        ayuda="Cambiar el correo obliga a verificarlo otra vez."
      />

      <div className="flex flex-wrap items-center gap-3">
        <Boton
          type="submit"
          variante="primario"
          tam="compacto"
          disabled={pendiente || !nuevo || !contrasena}
        >
          {pendiente ? 'Cambiando…' : 'Cambiar correo'}
        </Boton>
        {resultado && <Aviso {...resultado} />}
      </div>
    </form>
  )
}

export function DobleFactor({ activo }: { activo: boolean }) {
  const [alta, setAlta] = useState<Alta2FA | null>(null)
  const [codigo, setCodigo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [encendido, setEncendido] = useState(activo)
  const [resultado, setResultado] = useState<{ ok: boolean; texto: string } | null>(null)
  const [pendiente, empezar] = useTransition()

  function empezarAlta() {
    setResultado(null)
    empezar(async () => {
      const r = await prepararDobleFactor()
      if (r.ok && r.alta) setAlta(r.alta)
      else setResultado({ ok: false, texto: r.error ?? 'No se pudo empezar.' })
    })
  }

  function confirmar(e: React.FormEvent) {
    e.preventDefault()
    if (!alta) return
    setResultado(null)
    empezar(async () => {
      const r = await activarDobleFactor(alta.secreto, codigo)
      if (r.ok) {
        setEncendido(true)
        setAlta(null)
        setCodigo('')
        setResultado({ ok: true, texto: 'Verificación en dos pasos activada.' })
      } else {
        setResultado({ ok: false, texto: r.error ?? 'Ese código no vale.' })
      }
    })
  }

  function desactivar(e: React.FormEvent) {
    e.preventDefault()
    setResultado(null)
    empezar(async () => {
      const r = await desactivarDobleFactor(contrasena, codigo)
      if (r.ok) {
        setEncendido(false)
        setCodigo('')
        setContrasena('')
        setResultado({ ok: true, texto: 'Verificación en dos pasos desactivada.' })
      } else {
        setResultado({ ok: false, texto: r.error ?? 'No se pudo desactivar.' })
      }
    })
  }

  if (encendido) {
    return (
      <form onSubmit={desactivar} className="grid max-w-md gap-4">
        <p className="flex items-center gap-2 text-sm">
          <span className="size-2 rounded-full bg-exito" aria-hidden="true" />
          <span className="text-tinta-apagada">
            Activa. Al entrar te pediremos un código de tu aplicación.
          </span>
        </p>

        <details className="group/off">
          <summary className="cursor-pointer list-none text-sm font-semibold text-tinta-tenue transition-colors duration-150 hover:text-error [&::-webkit-details-marker]:hidden">
            Desactivarla
          </summary>

          <div className="mt-4 grid gap-4">
            <Campo
              id="2fa-pass"
              etiqueta="Tu contraseña"
              type="password"
              autoComplete="current-password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
            />
            <Campo
              id="2fa-codigo-off"
              etiqueta="Código de la aplicación"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
            />
            <div className="flex flex-wrap items-center gap-3">
              <Boton
                type="submit"
                tam="compacto"
                disabled={pendiente || !contrasena || codigo.length !== 6}
              >
                {pendiente ? 'Desactivando…' : 'Desactivar'}
              </Boton>
              {resultado && <Aviso {...resultado} />}
            </div>
          </div>
        </details>
      </form>
    )
  }

  if (!alta) {
    return (
      <div className="grid max-w-md gap-4">
        <p className="text-sm text-tinta-apagada">
          Añade un segundo paso al entrar: además de la contraseña, un código
          de seis cifras que genera una aplicación en tu móvil.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Boton
            type="button"
            variante="primario"
            tam="compacto"
            onClick={empezarAlta}
            disabled={pendiente}
          >
            {pendiente ? 'Preparando…' : 'Activar'}
          </Boton>
          {resultado && <Aviso {...resultado} />}
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={confirmar} className="grid max-w-md gap-4">
      <p className="text-sm text-tinta-apagada">
        Escanea este código con tu aplicación de autenticación y escribe
        después las seis cifras que te enseñe.
      </p>

      {/* El backend manda el PNG ya montado como data URL. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={alta.qr}
        alt="Código QR para la aplicación de autenticación"
        className="size-44 rounded-radio bg-white p-2"
      />

      <details>
        <summary className="cursor-pointer list-none text-xs font-semibold text-tinta-tenue [&::-webkit-details-marker]:hidden">
          ¿No puedes escanearlo?
        </summary>
        <code className="mt-2 block rounded-radio border border-borde bg-fondo px-3 py-2 font-mono text-xs break-all text-tinta-apagada">
          {alta.secreto}
        </code>
      </details>

      <Campo
        id="2fa-codigo"
        etiqueta="Código de la aplicación"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={codigo}
        onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Boton
          type="submit"
          variante="primario"
          tam="compacto"
          disabled={pendiente || codigo.length !== 6}
        >
          {pendiente ? 'Comprobando…' : 'Confirmar'}
        </Boton>
        <Boton type="button" tam="compacto" onClick={() => setAlta(null)}>
          Cancelar
        </Boton>
        {resultado && <Aviso {...resultado} />}
      </div>
    </form>
  )
}
