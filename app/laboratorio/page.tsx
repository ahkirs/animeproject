import type { Metadata } from 'next'
import Cabecera from '@/components/Cabecera'
import Pie from '@/components/Pie'
import Lamina from '@/components/Lamina'
import EfectosSala, {
  CapaGrano,
  CapaVineteado,
  SiluetaMarca,
} from '@/components/EfectosSala'

export const metadata: Metadata = {
  title: 'Laboratorio',
  description: 'Pruebas de atmósfera y marca para el sistema visual Sala Oscura.',
  robots: { index: false, follow: false },
}

/** Comparación lado a lado del mismo fotograma con y sin una capa. */
function Comparativa({
  titulo,
  nota,
  children,
}: {
  titulo: string
  nota: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-e6">
      <div className="mb-e3 flex items-baseline gap-e3 border-b border-borde pb-e2">
        <h2 className="font-display text-paso-4 tracking-[-0.03em]">{titulo}</h2>
      </div>
      <p className="mb-e3 max-w-[70ch] text-paso-1 text-hueso-70">{nota}</p>
      <div className="grid grid-cols-2 gap-e3 max-[720px]:grid-cols-1">{children}</div>
    </section>
  )
}

function Panel({
  etiqueta,
  children,
}: {
  etiqueta: string
  children?: React.ReactNode
}) {
  return (
    <figure className="m-0">
      <div className="relative isolate aspect-video overflow-hidden rounded-radio border border-borde">
        <Lamina arte="panoramica-obra" />
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_top,#0b0a09_6%,rgba(11,10,9,0.6)_50%,transparent_100%)]"
        />
        {children}
      </div>
      <figcaption className="mt-e2 text-paso-0 font-bold tracking-[0.11em] text-hueso-45 uppercase">
        {etiqueta}
      </figcaption>
    </figure>
  )
}

export default function Laboratorio() {
  return (
    <>
      <a
        href="#principal"
        className="absolute left-margen -top-[100px] z-100 rounded-radio bg-ambar px-[1.1rem] py-[0.7rem] font-bold text-ambar-tinta no-underline transition-all duration-200 ease-sal focus:top-e2"
      >
        Saltar al contenido
      </a>

      <Cabecera />

      <main id="principal" className="mx-auto max-w-[1400px] px-margen">
        <div className="border-b border-borde pt-e4 pb-e4">
          <p className="mb-e2 text-paso-0 font-bold tracking-[0.12em] text-ambar uppercase">
            Página de pruebas
          </p>
          <h1 className="font-display text-paso-5 tracking-[-0.035em]">Laboratorio</h1>
          <p className="mt-e2 max-w-[65ch] text-hueso-70">
            Aquí se prueban las capas de atmósfera antes de decidir si entran en el
            sitio. No está enlazada desde ningún sitio ni se indexa. Todo lo de esta
            página es CSS: ni una imagen, ni un kilobyte de red.
          </p>
        </div>

        {/* ---------- Prueba interactiva ---------- */}
        <section className="py-e5">
          <div className="mb-e3 border-b border-borde pb-e2">
            <h2 className="font-display text-paso-4 tracking-[-0.03em]">
              Las tres capas juntas
            </h2>
          </div>
          <p className="mb-e4 max-w-[70ch] text-paso-1 text-hueso-70">
            Enciende y apaga cada una para ver qué aporta. Lo interesante es quitarlas
            todas y volver a encenderlas: por separado casi no se notan, y juntas
            cambian bastante la sensación de la imagen.
          </p>
          <EfectosSala />
        </section>

        {/* ---------- Comparativas aisladas ---------- */}
        <div className="border-t border-borde pt-e5">
          <Comparativa
            titulo="Viñeteado"
            nota="Un degradado radial que oscurece los bordes. El efecto es sutil a propósito: si se nota, está mal calibrado. Su trabajo es hacer que la imagen parezca proyectada y que la mirada caiga al centro."
          >
            <Panel etiqueta="Sin viñeteado" />
            <Panel etiqueta="Con viñeteado">
              <CapaVineteado />
            </Panel>
          </Comparativa>

          <Comparativa
            titulo="Grano de proyección"
            nota="Ruido generado con un filtro SVG y repetido como textura. Mira sobre todo las zonas oscuras y planas: sin grano se ven como un vacío liso, con grano parecen una superficie. En pantallas buenas la diferencia es clara; en móviles con brillo bajo casi desaparece."
          >
            <Panel etiqueta="Sin grano" />
            <Panel etiqueta="Con grano">
              <CapaGrano opacidad={0.09} />
            </Panel>
          </Comparativa>
        </div>

        {/* ---------- Marca ---------- */}
        <section className="border-t border-borde py-e5">
          <div className="mb-e3 border-b border-borde pb-e2">
            <h2 className="font-display text-paso-4 tracking-[-0.03em]">
              Marca: silueta en vez de mascota
            </h2>
          </div>
          <p className="mb-e4 max-w-[70ch] text-paso-1 text-hueso-70">
            Esto es lo que se puede dibujar en vector plano: un recorte contra el disco
            del proyector. No es una ilustración de personaje, y no pretende serlo. Una
            mascota anime de verdad necesita un ilustrador; esto funciona como marca
            porque se lee a cualquier tamaño y no compite con las carátulas.
          </p>

          <div className="flex flex-wrap items-end gap-e5 rounded-radio border border-borde bg-sala-800 p-e4">
            <figure className="m-0 text-center">
              <SiluetaMarca tam={128} />
              <figcaption className="mt-e2 text-paso-0 text-hueso-45">128 px</figcaption>
            </figure>
            <figure className="m-0 text-center">
              <SiluetaMarca tam={56} />
              <figcaption className="mt-e2 text-paso-0 text-hueso-45">56 px</figcaption>
            </figure>
            <figure className="m-0 text-center">
              <SiluetaMarca tam={32} />
              <figcaption className="mt-e2 text-paso-0 text-hueso-45">32 px</figcaption>
            </figure>
            <figure className="m-0 text-center">
              <SiluetaMarca tam={16} />
              <figcaption className="mt-e2 text-paso-0 text-hueso-45">
                16 px · pestaña
              </figcaption>
            </figure>

            <div className="ml-auto flex items-center gap-e2">
              <SiluetaMarca tam={40} />
              <span className="font-display text-paso-4 tracking-[-0.035em]">KUROBA</span>
            </div>
          </div>

          <p className="mt-e3 max-w-[70ch] text-paso-1 text-hueso-45">
            Fíjate en el tamaño de 16 píxeles, que es el de la pestaña del navegador. Es
            la prueba que suspende casi cualquier mascota: a ese tamaño una cara se
            convierte en una mancha. Una silueta contra un disco sigue leyéndose.
          </p>
        </section>
      </main>

      <Pie />
    </>
  )
}
