import Link from 'next/link'
import type { Metadata } from 'next'
import MarcoCuenta from '@/components/MarcoCuenta'
import Campo from '@/components/Campo'

export const metadata: Metadata = {
  title: 'Acceder',
  description: 'Entra en tu cuenta para recuperar tu lista y tu progreso.',
}

export default function Acceder() {
  return (
    <MarcoCuenta
      titulo="Entrar"
      entradilla="Recupera tu lista, tu progreso y los avisos de estreno."
      pie={{ texto: '¿Todavía no tienes cuenta?', enlace: 'Créala', href: '/registro' }}
    >
      <form className="grid gap-e3">
        <Campo
          id="correo"
          name="correo"
          type="email"
          etiqueta="Correo"
          placeholder="tu@correo.com"
          autoComplete="email"
          required
        />

        <div className="grid gap-[0.4rem]">
          <div className="flex items-baseline justify-between gap-e2">
            <label
              htmlFor="clave"
              className="text-paso-0 font-bold tracking-[0.11em] text-hueso-45 uppercase"
            >
              Contraseña
            </label>
            <Link
              href="/acceder"
              className="text-paso-0 text-hueso-45 hover:text-ambar"
            >
              ¿La olvidaste?
            </Link>
          </div>
          <input
            id="clave"
            name="clave"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            className="w-full rounded-radio border border-borde-vivo bg-sala-800 px-e3 py-[0.7rem] text-paso-2 text-hueso transition-colors duration-200 ease-sal outline-none placeholder:text-hueso-45 focus:border-ambar"
          />
        </div>

        <label className="flex cursor-pointer items-center gap-e2 text-paso-1 text-hueso-70">
          <input type="checkbox" defaultChecked className="peer sr-only" />
          <span
            aria-hidden="true"
            className="grid size-[18px] shrink-0 place-items-center rounded-[2px] border border-borde-vivo bg-sala-800 transition-colors duration-200 ease-sal peer-checked:border-ambar peer-checked:bg-ambar peer-checked:[&>svg]:opacity-100 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-[3px] peer-focus-visible:outline-ambar"
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2a1c06"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-0"
            >
              <path d="M5 12.5l4.5 4.5L19 7" />
            </svg>
          </span>
          No cerrar sesión
        </label>

        <button
          type="submit"
          className="mt-e2 inline-flex w-full cursor-pointer items-center justify-center rounded-radio border border-transparent bg-ambar px-[1.35rem] py-3 text-paso-2 font-semibold text-ambar-tinta transition-colors duration-200 ease-sal hover:bg-ambar-claro active:translate-y-px"
        >
          Entrar
        </button>
      </form>
    </MarcoCuenta>
  )
}
