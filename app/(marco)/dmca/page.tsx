import type { Metadata } from 'next'
import PaginaDocumento from '@/components/PaginaDocumento'

export const metadata: Metadata = {
  title: 'DMCA',
  description: 'La política de derechos de autor (DMCA) de KUROBA.',
}

export default function Dmca() {
  return (
    <PaginaDocumento
      titulo="DMCA"
      subtitulo="Aviso de infracción de derechos de autor y descargo de responsabilidad."
    >
      <div className="prose-doc">
        <p>
          KUROBA está comprometido con el respeto de los derechos de propiedad
          intelectual de terceros y con el cumplimiento de la Digital Millennium
          Copyright Act (DMCA). Nos tomamos en serio la infracción de derechos de autor y
          responderemos a los avisos de presunta infracción que cumplan la DMCA y las
          demás leyes aplicables.
        </p>
        <p>
          Si crees que algún contenido de nuestro sitio infringe tus derechos de autor,
          envíanos un correo electrónico. Ten en cuenta que la respuesta puede tardar
          entre 2 y 5 días laborables. Enviar tu queja a otras partes, como nuestro
          proveedor de servicios de internet, nuestro proveedor de alojamiento u otros
          terceros, no agilizará tu solicitud y puede retrasar la respuesta por no haberse
          presentado correctamente.
        </p>
        <p>Para que podamos tramitar tu queja, facilita la siguiente información:</p>
        <ul>
          <li>
            Tu nombre, dirección y número de teléfono. Nos reservamos el derecho de
            verificar esta información.
          </li>
          <li>Identificación de la obra protegida por derechos de autor cuya infracción se alega.</li>
          <li>La URL exacta y completa donde se encuentra el material infractor.</li>
          <li>Escríbenos en español o en inglés.</li>
        </ul>
        <p>
          Ten en cuenta que los mensajes anónimos o incompletos no se atenderán. Gracias
          por tu comprensión.
        </p>

        <h2>Descargo de responsabilidad</h2>
        <p>
          Ninguno de los archivos que aparecen en KUROBA está alojado en nuestros
          servidores. Todos los enlaces apuntan a contenido alojado en sitios web de
          terceros. KUROBA no acepta responsabilidad por el contenido alojado en sitios
          web de terceros y no tiene ninguna participación en la descarga o subida de las
          obras. Solo publicamos enlaces que están disponibles en internet.
        </p>
        <p>
          Si crees que algún contenido de nuestro sitio infringe tus derechos de
          propiedad intelectual y eres el titular de los derechos de autor de ese
          contenido, repórtalo a{' '}
          <a href="mailto:contacto@kuroba.app">contacto@kuroba.app</a> y el contenido
          será retirado de inmediato.
        </p>
      </div>
    </PaginaDocumento>
  )
}
