import type { Metadata } from 'next'
import PaginaDocumento from '@/components/PaginaDocumento'

export const metadata: Metadata = {
  title: 'Privacidad',
  description: 'La política de privacidad de KUROBA.',
}

export default function Privacidad() {
  return (
    <PaginaDocumento
      titulo="Privacidad"
      subtitulo="Esta política de privacidad está vigente desde el 5 de enero de 2026."
    >
      <div className="prose-doc">
        <h2>1. Introducción</h2>
        <p>
          Bienvenido a KUROBA («nosotros», «nuestro» o «la plataforma»). Estamos
          comprometidos con la protección de tu privacidad. Esta política de privacidad
          describe cómo recopilamos, usamos y compartimos información sobre ti cuando
          usas nuestro sitio web y servicios (el «Servicio»), que dan acceso a contenido
          de anime y manga.
        </p>
        <p>
          Al usar nuestro Servicio, aceptas la recopilación y el uso de la información
          de acuerdo con esta política.
        </p>

        <h2>2. Información que recopilamos</h2>
        <p>
          Recopilamos información de varias maneras para proporcionarte y mejorar el
          Servicio.
        </p>
        <h3>Información de tu cuenta</h3>
        <p>
          Cuando te registras o inicias sesión en KUROBA, recibimos cierta información
          para crear y gestionar tu perfil. Los datos que recopilamos y almacenamos se
          limitan a:
        </p>
        <ul>
          <li>Tu nombre de usuario</li>
          <li>Tu dirección de correo electrónico</li>
          <li>Tu foto de perfil</li>
        </ul>
        <p>
          No recopilamos ni almacenamos tu contraseña en claro ni otra información
          personal sensible de tu cuenta.
        </p>
        <h3>Contenido generado por el usuario</h3>
        <p>Recopilamos la información que proporcionas voluntariamente en nuestro sitio. Esto incluye:</p>
        <ul>
          <li>Los comentarios que publicas en las secciones de comentarios.</li>
          <li>Las notas de la comunidad que dejas en cada obra.</li>
        </ul>
        <p>
          Ten en cuenta que esta información es pública y puede verla cualquier persona
          que visite el sitio.
        </p>
        <h3>Datos de uso</h3>
        <p>
          Recopilamos automáticamente datos de uso para el funcionamiento, la seguridad
          y el análisis del Servicio. Esto puede incluir información como la dirección
          de protocolo de Internet (IP) de tu dispositivo, el tipo y la versión del
          navegador, las páginas del Servicio que visitas, la hora y la fecha de tu
          visita, el tiempo que pasas en esas páginas y otros datos de diagnóstico.
        </p>

        <h2>3. Cómo usamos tu información</h2>
        <p>Usamos los datos recopilados para varios fines:</p>
        <ul>
          <li>
            <strong>Para proporcionar y mantener el Servicio:</strong> para que puedas
            ver anime y leer manga.
          </li>
          <li>
            <strong>Para crear tu perfil:</strong> para usar tu nombre de usuario, tu
            correo y tu foto de perfil a la hora de crear tu perfil público en KUROBA.
          </li>
          <li>
            <strong>Para habilitar las funciones de la comunidad:</strong> para mostrar
            tus comentarios y tus notas, facilitando las conversaciones dentro de la
            comunidad de KUROBA.
          </li>
          <li>
            <strong>Para analizar y proteger el sitio:</strong> para vigilar el uso del
            Servicio, entender cómo participan los usuarios y protegerlo frente a
            amenazas de seguridad.
          </li>
          <li>
            <strong>Para comunicarnos contigo:</strong> para responder a tus solicitudes
            o consultas si te pones en contacto directamente con nosotros.
          </li>
        </ul>

        <h2>4. Cómo compartimos tu información</h2>
        <p>
          Tu privacidad es importante para nosotros y no vendemos tu información
          personal. Tu información solo se comparte en las siguientes circunstancias:
        </p>
        <ul>
          <li>
            <strong>Públicamente en el Servicio:</strong> tu nombre de usuario, tu foto
            de perfil y cualquier contenido generado por el usuario (comentarios, notas)
            son visibles públicamente para los demás usuarios del Servicio.
          </li>
          <li>
            <strong>Con proveedores de servicios:</strong> compartimos información con
            empresas externas que prestan servicios en nuestro nombre, como la
            infraestructura de alojamiento. Estas empresas están obligadas a no
            divulgarla ni a usarla para ningún otro fin.
          </li>
          <li>
            <strong>Por cumplimiento legal:</strong> podemos divulgar tu información si
            la ley nos lo exige o en respuesta a solicitudes válidas de autoridades
            públicas (por ejemplo, un tribunal o una agencia gubernamental).
          </li>
        </ul>

        <h2>5. Servicios de terceros</h2>
        <p>Nuestro Servicio depende de plataformas de terceros para funcionar.</p>
        <ul>
          <li>
            <p>
              <strong>Catálogo y reproducción:</strong> el catálogo, las fichas y los
              enlaces de reproducción se obtienen de proveedores externos y se enlazan
              tal cual. Ten en cuenta que <strong>KUROBA es un servicio independiente y
              no está afiliado, patrocinado ni respaldado por esos proveedores</strong>;
              simplemente usamos su plataforma como servicio de terceros. Los derechos
              de cada obra pertenecen a sus autores y licenciatarios.
            </p>
          </li>
          <li>
            <p>
              <strong>MyAnimeList:</strong> en las fichas enlazamos a MyAnimeList cuando
              el proveedor identifica la obra. Ten en cuenta que <strong>KUROBA es un
              servicio independiente y no está afiliado, patrocinado ni respaldado por
              MyAnimeList</strong>. Tu interacción con el servicio de MyAnimeList se
              rige por su propia{' '}
              <a href="https://myanimelist.net/about/privacy_policy" target="_blank" rel="noopener noreferrer">
                política de privacidad
              </a>{' '}
              y{' '}
              <a href="https://myanimelist.net/about/terms_of_use" target="_blank" rel="noopener noreferrer">
                términos de uso
              </a>
              . Te recomendamos encarecidamente revisar sus políticas.
            </p>
          </li>
        </ul>

        <h2>6. Cookies y tecnologías de seguimiento</h2>
        <p>
          Usamos cookies y tecnologías similares para operar y proteger el Servicio. Las
          cookies son pequeños archivos que se colocan en tu dispositivo. Puedes indicar
          a tu navegador que rechace todas las cookies o que te avise cuando se envía
          una. Sin embargo, si no aceptas cookies, algunas partes del Servicio pueden no
          funcionar correctamente.
        </p>

        <h2>7. Seguridad de los datos</h2>
        <p>
          Tomamos medidas razonables para proteger la información que almacenamos.
          Nuestro Servicio está protegido con cifrado SSL y dependemos de la
          infraestructura de seguridad de nuestros proveedores de servicios. Sin
          embargo, recuerda que ningún método de transmisión por Internet ni de
          almacenamiento electrónico es seguro al 100 %.
        </p>

        <h2>8. Tus derechos sobre tus datos</h2>
        <p>Tienes ciertos derechos sobre los datos que tenemos sobre ti.</p>
        <ul>
          <li>
            <strong>Acceso y corrección:</strong> puedes revisar y editar la información
            de tu perfil desde la página de cuenta.
          </li>
          <li>
            <strong>Supresión:</strong> puedes solicitar la supresión de tu cuenta de
            KUROBA y del contenido asociado (comentarios y notas). Para hacerlo,
            ponte en contacto con nosotros en el correo indicado más abajo.
          </li>
        </ul>

        <h2>9. Privacidad de los menores</h2>
        <p>
          Nuestro Servicio no está pensado para ser usado por menores de 13 años. No
          recopilamos a sabiendas información personal identificable de menores de 13
          años. Si eres padre o tutor y sabes que tu hijo nos ha proporcionado datos
          personales, ponte en contacto con nosotros. Si tenemos constancia de que hemos
          recopilado datos personales de un menor de 13 años sin verificación del
          consentimiento parental, tomaremos medidas para eliminar esa información de
          nuestros servidores.
        </p>

        <h2>10. Enlaces a otros sitios web</h2>
        <p>
          Nuestro Servicio, especialmente en los comentarios y las fichas, puede
          contener enlaces a otros sitios web que no operamos nosotros. Si haces clic en
          un enlace de terceros, serás dirigido al sitio de ese tercero. No tenemos
          control sobre el contenido, las políticas de privacidad o las prácticas de los
          sitios o servicios de terceros, y no asumimos responsabilidad alguna por ellos.
        </p>

        <h2>11. Cambios en esta política de privacidad</h2>
        <p>
          Podemos actualizar nuestra política de privacidad de vez en cuando. Te
          notificaremos de cualquier cambio publicando la nueva política en esta página.
          Te recomendamos revisar esta política periódicamente. Los cambios entran en
          vigor cuando se publican en esta página.
        </p>

        <h2>12. Contacto</h2>
        <p>Si tienes alguna pregunta sobre esta política de privacidad, puedes ponerte en contacto con nosotros en:</p>
        <p>
          <strong>Correo:</strong>{' '}
          <a href="mailto:contacto@kuroba.app">contacto@kuroba.app</a>
        </p>
      </div>
    </PaginaDocumento>
  )
}
