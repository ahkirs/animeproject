import Link from 'next/link'
import type { Metadata } from 'next'
import MarcoCuenta from '@/components/MarcoCuenta'
import Campo from '@/components/Campo'

export const metadata: Metadata = {
  title: 'Crear cuenta',
  description:
    'Crea una cuenta para guardar tu lista, tu progreso y recibir avisos de estreno.',
}

export default function Registro() {
  return (
    <MarcoCuenta
      titulo="Crear cuenta"
      entradilla="Guarda tu lista, sigue tu progreso y entérate cuando salga un episodio."
      pie={{ texto: '¿Ya tienes cuenta?', enlace: 'Entra', href: '/acceder' }}
    >
      <form className="grid gap-e3">
        <Campo
          id="alias"
          name="alias"
          type="text"
          etiqueta="Nombre de usuario"
          placeholder="comoquierasllamarte"
          autoComplete="username"
          ayuda="Es el nombre con el que aparecerás. Se puede cambiar luego."
          required
        />

        <Campo
          id="correo"
          name="correo"
          type="email"
          etiqueta="Correo"
          placeholder="tu@correo.com"
          autoComplete="email"
          required
        />

        <Campo
          id="clave"
          name="clave"
          type="password"
          etiqueta="Contraseña"
          placeholder="••••••••"
          autoComplete="new-password"
          ayuda="Mínimo 8 caracteres."
          minLength={8}
          required
        />

        <label className="flex cursor-pointer items-start gap-e2 text-paso-1 text-hueso-70">
          <input type="checkbox" required className="peer sr-only" />
          <span
            aria-hidden="true"
            className="mt-[0.2rem] grid size-[18px] shrink-0 place-items-center rounded-[2px] border border-borde-vivo bg-sala-800 transition-colors duration-200 ease-sal peer-checked:border-ambar peer-checked:bg-ambar peer-checked:[&>svg]:opacity-100 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-[3px] peer-focus-visible:outline-ambar"
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
          <span>
            Acepto las{' '}
            <Link href="/registro" className="text-ambar hover:underline">
              condiciones de uso
            </Link>{' '}
            y la{' '}
            <Link href="/registro" className="text-ambar hover:underline">
              política de privacidad
            </Link>
            .
          </span>
        </label>

        <button
          type="submit"
          className="mt-e2 inline-flex w-full cursor-pointer items-center justify-center rounded-radio border border-transparent bg-ambar px-[1.35rem] py-3 text-paso-2 font-semibold text-ambar-tinta transition-colors duration-200 ease-sal hover:bg-ambar-claro active:translate-y-px"
        >
          Crear cuenta
        </button>
      </form>
    </MarcoCuenta>
  )
}
