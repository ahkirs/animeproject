import type { ComponentProps } from 'react'

interface Props extends ComponentProps<'input'> {
  etiqueta: string
  /** Texto de apoyo bajo el campo: requisitos, formato esperado. */
  ayuda?: string
  /** Mensaje de error. Sustituye a la ayuda y marca el campo. */
  error?: string
}

export default function Campo({ etiqueta, ayuda, error, id, ...props }: Props) {
  const apoyoId = error || ayuda ? `${id}-apoyo` : undefined

  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-tinta-apagada">
        {etiqueta}
      </label>

      <input
        id={id}
        aria-describedby={apoyoId}
        aria-invalid={error ? true : undefined}
        className={`w-full rounded-radio border bg-fondo px-3 py-2.5 text-base text-tinta transition-colors duration-200 ease-sal outline-none placeholder:text-tinta-tenue focus:border-acento ${
          error ? 'border-error' : 'border-campo-borde'
        }`}
        {...props}
      />

      {(error || ayuda) && (
        <p
          id={apoyoId}
          role={error ? 'alert' : undefined}
          className={`text-xs ${error ? 'text-error' : 'text-tinta-tenue'}`}
        >
          {error ?? ayuda}
        </p>
      )}
    </div>
  )
}
