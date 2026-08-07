import type { ComponentProps } from 'react'

interface Props extends ComponentProps<'input'> {
  etiqueta: string
  /** Texto de apoyo bajo el campo: requisitos, formato esperado. */
  ayuda?: string
}

export default function Campo({ etiqueta, ayuda, id, ...props }: Props) {
  const ayudaId = ayuda ? `${id}-ayuda` : undefined

  return (
    <div className="grid gap-[0.4rem]">
      <label
        htmlFor={id}
        className="text-paso-0 font-bold tracking-[0.11em] text-hueso-45 uppercase"
      >
        {etiqueta}
      </label>

      <input
        id={id}
        aria-describedby={ayudaId}
        className="w-full rounded-radio border border-borde-vivo bg-sala-800 px-e3 py-[0.7rem] text-paso-2 text-hueso transition-colors duration-200 ease-sal outline-none placeholder:text-hueso-45 focus:border-ambar"
        {...props}
      />

      {ayuda && (
        <p id={ayudaId} className="text-paso-0 text-hueso-45">
          {ayuda}
        </p>
      )}
    </div>
  )
}
