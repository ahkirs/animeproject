/* Laboratorio: la galería del sistema visual.

   Antes era un banco de pruebas del grano de proyección y el viñeteado,
   que ya no existen. Ahora enseña lo que sí hay, y sirve para lo que
   sirve una galería: ver todas las piezas juntas y detectar la que se ha
   quedado descolgada de un cambio de tokens, que en una web de veinte
   páginas es fácil que pase inadvertido.

   No se indexa: es una herramienta, no una página del sitio. */

import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Boton, { BotonIcono } from '@/components/Boton'
import Campo from '@/components/Campo'
import Icono, { type NombreIcono } from '@/components/Icono'
import Datos, { Clasificacion, Nota } from '@/components/Datos'

export const metadata: Metadata = {
  title: 'Laboratorio',
  robots: { index: false, follow: false },
}

function Bloque({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="border-t border-borde py-8">
      <h2 className="mb-5 text-lg font-semibold text-tinta">{titulo}</h2>
      {children}
    </section>
  )
}

/** Una muestra de color con su nombre de token debajo. El nombre importa
 *  tanto como el color: es lo que hay que escribir para usarlo. */
function Muestra({ token, clase }: { token: string; clase: string }) {
  return (
    <div>
      <div className={`h-16 rounded-radio border border-borde ${clase}`} />
      <p className="mt-2 font-mono text-xs text-tinta-tenue">{token}</p>
    </div>
  )
}

const SUPERFICIES = [
  { token: 'fondo', clase: 'bg-fondo' },
  { token: 'lienzo', clase: 'bg-lienzo' },
  { token: 'tarjeta', clase: 'bg-tarjeta' },
  { token: 'apagado', clase: 'bg-apagado' },
]

const TINTAS = [
  { token: 'tinta', clase: 'bg-tinta' },
  { token: 'tinta-apagada', clase: 'bg-tinta-apagada' },
  { token: 'tinta-tenue', clase: 'bg-tinta-tenue' },
]

const ACENTOS = [
  { token: 'primario', clase: 'bg-primario' },
  { token: 'primario-tinta', clase: 'bg-primario-tinta' },
  { token: 'acento', clase: 'bg-acento' },
  { token: 'acento-tenue', clase: 'bg-acento-tenue' },
  { token: 'exito', clase: 'bg-exito' },
  { token: 'error', clase: 'bg-error' },
]

/* Todos los iconos dibujados. Si alguno se rompe al cambiar el trazo, se
   ve aquí antes que en producción. */
const ICONOS: NombreIcono[] = [
  'play', 'pausa', 'mas', 'buscar', 'menu', 'info', 'calendario', 'reloj',
  'episodios', 'flecha', 'atras', 'campana', 'marcador', 'estrella',
  'estrella-llena', 'cheuron', 'cheuron-izq', 'cheuron-der', 'casa',
  'brujula', 'biblioteca', 'mensajes', 'usuario', 'cambiar', 'cinta',
  'check', 'candado', 'compartir', 'descarga', 'siguiente', 'volumen',
  'silencio', 'cc', 'ajustes', 'pantalla', 'emitir', 'pip', 'teclado',
  'velocidad', 'calidad', 'cerrar',
]

export default function Laboratorio() {
  return (
    <div className="mx-auto max-w-[900px] px-bleed pb-16">
      <header className="pt-8 pb-2">
        <h1 className="font-titulo text-2xl font-extrabold tracking-[-0.02em]">
          Sistema visual
        </h1>
        <p className="mt-2 max-w-[60ch] text-sm text-tinta-tenue">
          Todas las piezas juntas. La regla que gobierna el sistema: la
          profundidad la dan los escalones de luminosidad, no las sombras. No
          hay ni una sombra de elevación en toda la web.
        </p>
      </header>

      <Bloque titulo="Superficies">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {SUPERFICIES.map((s) => (
            <Muestra key={s.token} {...s} />
          ))}
        </div>
      </Bloque>

      <Bloque titulo="Tinta">
        <div className="grid grid-cols-3 gap-4">
          {TINTAS.map((s) => (
            <Muestra key={s.token} {...s} />
          ))}
        </div>
      </Bloque>

      <Bloque titulo="Acento y estado">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {ACENTOS.map((s) => (
            <Muestra key={s.token} {...s} />
          ))}
        </div>
      </Bloque>

      <Bloque titulo="Tipografía">
        <div className="grid gap-4">
          <p className="font-titulo text-5xl font-extrabold tracking-[-0.03em]">
            Karla extrabold — títulos
          </p>
          <p className="font-titulo text-2xl font-extrabold tracking-[-0.02em]">
            Karla en cuerpo de sección
          </p>
          <p className="text-base">
            Inter regular — el cuerpo del texto, que es lo que se lee de
            verdad.
          </p>
          <p className="text-sm text-tinta-apagada">
            Inter pequeño, en tinta apagada: datos y apoyos.
          </p>
          <p className="text-xs text-tinta-tenue tabular-nums">
            Inter menudo con cifras tabulares — 1234567890
          </p>
        </div>
      </Bloque>

      <Bloque titulo="Botones">
        <div className="flex flex-wrap items-center gap-3">
          <Boton variante="primario">Primario</Boton>
          <Boton variante="secundario">Secundario</Boton>
          <Boton variante="fantasma">Fantasma</Boton>
          <Boton variante="primario" tam="compacto">
            Compacto
          </Boton>
          <Boton variante="secundario" disabled>
            Desactivado
          </Boton>
          <BotonIcono aria-label="Ejemplo de botón de icono">
            <Icono nombre="marcador" tam={18} />
          </BotonIcono>
        </div>
      </Bloque>

      <Bloque titulo="Campos">
        <div className="grid max-w-md gap-4">
          <Campo id="lab-normal" etiqueta="Campo normal" placeholder="Escribe algo" />
          <Campo
            id="lab-ayuda"
            etiqueta="Con ayuda"
            ayuda="Un texto de apoyo bajo el campo."
          />
          <Campo
            id="lab-error"
            etiqueta="Con error"
            error="Esto no se puede quedar vacío."
          />
        </div>
      </Bloque>

      <Bloque titulo="Datos">
        <Datos>
          <Nota valor={8.7} />
          <>2026</>
          <>1173 episodios</>
          <Clasificacion valor="+16" />
        </Datos>
      </Bloque>

      <Bloque titulo={`Iconos (${ICONOS.length})`}>
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(84px,1fr))] gap-2 p-0">
          {ICONOS.map((n) => (
            <li
              key={n}
              className="flex flex-col items-center gap-2 rounded-radio border border-borde bg-tarjeta px-2 py-3"
            >
              <Icono nombre={n} tam={22} />
              <span className="text-center font-mono text-[0.625rem] break-all text-tinta-tenue">
                {n}
              </span>
            </li>
          ))}
        </ul>
      </Bloque>

      <Bloque titulo="Radios y bordes">
        <div className="flex flex-wrap gap-4">
          <div className="grid size-24 place-items-center rounded-radio border border-borde bg-tarjeta text-xs text-tinta-tenue">
            radio 6px
          </div>
          <div className="grid size-24 place-items-center rounded-radio-lg border border-borde bg-tarjeta text-xs text-tinta-tenue">
            radio 12px
          </div>
          <div className="grid size-24 place-items-center rounded-full border border-borde-vivo bg-tarjeta text-center text-xs text-tinta-tenue">
            borde vivo
          </div>
        </div>
      </Bloque>
    </div>
  )
}
