import type { Metadata } from 'next'
import PaginaDocumento from '@/components/PaginaDocumento'

export const metadata: Metadata = {
  title: 'Términos',
  description: 'Los términos de servicio de KUROBA.',
}

export default function Terminos() {
  return (
    <PaginaDocumento
      titulo="Términos de servicio"
      subtitulo="Estos términos de servicio están vigentes desde el 5 de enero de 2026."
    >
      <div className="prose-doc">
        <h2>1. Aceptación de los términos</h2>
        <p>
          Bienvenido a KUROBA (el «Servicio»), una plataforma independiente para ver
          anime y leer manga. Estos términos de servicio («Términos») rigen tu acceso y
          uso de nuestro sitio web y de todos los servicios relacionados.
        </p>
        <p>
          Al acceder o usar nuestro Servicio, aceptas quedar sujeto a estos Términos. Si
          no estás de acuerdo con ellos, no puedes acceder ni usar el Servicio.
        </p>

        <h2>2. Relación con los servicios de terceros</h2>
        <p>
          KUROBA utiliza interfaces de programación de aplicaciones (APIs) de terceros
          para obtener el catálogo y los enlaces de reproducción. Es importante que
          entiendas que <strong>KUROBA es un servicio independiente y no está afiliado,
          patrocinado, respaldado ni conectado oficialmente de ningún modo con estos
          servicios de terceros.</strong> Los derechos de cada obra pertenecen a sus
          autores y licenciatarios, y los enlaces apuntan a contenido alojado por
          terceros.
        </p>
        <p>
          <strong>Proveedores del catálogo:</strong> las fichas, los episodios y los
          enlaces de reproducción se obtienen de proveedores externos y se enlazan tal
          cual. Cualquier uso de su nombre es puramente para identificarlos. Tu
          interacción con esos servicios se rige por los términos de cada proveedor.
        </p>
        <p>
          <strong>MyAnimeList:</strong> en las fichas enlazamos a MyAnimeList cuando el
          proveedor identifica la obra. Cualquier uso del nombre de MyAnimeList es
          puramente para identificarlo. Tu interacción con el servicio de MyAnimeList se
          rige por sus propios{' '}
          <a href="https://myanimelist.net/about/terms_of_use" target="_blank" rel="noopener noreferrer">
            términos de uso
          </a>
          .
        </p>

        <h2>3. Cuentas de usuario</h2>
        <p>
          Para acceder a todas las funciones de KUROBA, debes registrarte creando una
          cuenta. Eres responsable de mantener la confidencialidad de las credenciales de
          tu cuenta y eres plenamente responsable de todas las actividades que se
          produzcan bajo tu cuenta en KUROBA.
        </p>

        <h2>4. El Servicio y la concesión de licencia</h2>
        <p>
          KUROBA proporciona una plataforma para ver anime y leer manga para tu
          entretenimiento personal y no comercial. Con sujeción a tu cumplimiento de
          estos Términos, te concedemos una licencia limitada, no exclusiva,
          intransferible y revocable para acceder y usar el Servicio.
        </p>

        <h2>5. Derechos de propiedad intelectual</h2>
        <p>Los derechos sobre los distintos contenidos del Servicio se reparten así:</p>
        <ul>
          <li>
            <strong>Nuestro Servicio:</strong> el nombre KUROBA, el logotipo, el diseño
            del sitio web, el código fuente y todas las funciones y características
            originales son propiedad exclusiva de KUROBA y de sus licenciantes.
          </li>
          <li>
            <strong>Medios transmitidos y mostrados:</strong> el anime, el manga y otros
            medios disponibles en KUROBA son propiedad de sus respectivos titulares de
            derechos. Tu uso del Servicio no te otorga ningún derecho de propiedad ni de
            propiedad intelectual sobre este contenido. Aceptas no descargar, copiar,
            reproducir, distribuir ni crear obras derivadas del contenido que se ofrece
            en KUROBA.
          </li>
          <li>
            <strong>Contenido generado por el usuario:</strong> conservas la propiedad
            del contenido que creas en el Servicio, tal y como se indica en la Sección 6.
          </li>
        </ul>

        <h2>6. Contenido generado por el usuario (UGC)</h2>
        <p>
          Puedes publicar contenido, incluidos comentarios y notas («Contenido generado
          por el usuario» o «UGC»).
        </p>
        <ul>
          <li>
            <strong>Tu responsabilidad:</strong> eres el único responsable del UGC que
            publiques. Garantizas que tienes todos los derechos necesarios para publicar
            tu UGC y que no infringe derechos de terceros ni leyes aplicables.
          </li>
          <li>
            <strong>Licencia para nosotros:</strong> al publicar UGC en KUROBA, nos
            concedes una licencia mundial, no exclusiva, libre de regalías y perpetua
            para usar, mostrar, reproducir y distribuir tu contenido en y a través de
            nuestro Servicio. Esto nos permite operar el sitio y mostrar tus publicaciones
            a los demás usuarios.
          </li>
        </ul>

        <h2>7. Normas de la comunidad y conducta prohibida</h2>
        <p>Para que la comunidad de KUROBA sea segura y agradable para todos, aceptas no:</p>
        <ul>
          <li>Usar el Servicio para cualquier fin ilegal o no autorizado.</li>
          <li>
            Publicar spoilers importantes de cualquier obra sin usar las etiquetas de
            spoiler adecuadas o avisos claros.
          </li>
          <li>
            Acosar, intimidar, incitar al odio, atacar personalmente o amenazar a otros
            usuarios.
          </li>
          <li>Publicar contenido difamatorio, obsceno, pornográfico o gratuitamente violento.</li>
          <li>
            Hacer spam en las secciones de comentarios con publicidad no solicitada,
            promociones o contenido repetitivo.
          </li>
          <li>Suplantar a otra persona, entidad o al equipo de KUROBA.</li>
          <li>Infringir los derechos de autor, marcas u otros derechos de propiedad intelectual de otros.</li>
          <li>
            Subir virus, malware o cualquier otro código que pueda dañar o alterar el
            Servicio o a sus usuarios.
          </li>
          <li>
            Intentar extraer, hacer ingeniería inversa u obtener acceso no autorizado a
            los sistemas del Servicio.
          </li>
        </ul>

        <h2>8. Moderación y terminación</h2>
        <p>
          Nos reservamos el derecho, pero no la obligación, de moderar el Servicio.
          Podemos, a nuestra entera discreción:
        </p>
        <ul>
          <li>
            Revisar, editar o eliminar cualquier contenido generado por el usuario que
            consideremos que infringe estos Términos o nuestras normas de la comunidad,
            con o sin previo aviso.
          </li>
          <li>
            Suspender o cancelar definitivamente tu acceso a KUROBA por cualquier motivo,
            en particular por infracciones graves o reiteradas de estos Términos. Esta
            acción puede llevarse a cabo sin previo aviso.
          </li>
        </ul>
        <p>La decisión de tomar cualquier medida de moderación es definitiva y queda a nuestra entera discreción.</p>

        <h2>9. Renuncia de garantías</h2>
        <p>
          El Servicio se presta «tal cual» y «según disponibilidad». KUROBA no otorga
          garantías, expresas o implícitas, de que el Servicio sea ininterrumpido,
          seguro o esté libre de errores. No garantizamos la exactitud, fiabilidad o
          calidad de ningún contenido disponible en el Servicio. Usas el Servicio bajo tu
          propio riesgo.
        </p>

        <h2>10. Limitación de responsabilidad</h2>
        <p>
          En la máxima medida permitida por la ley aplicable, en ningún caso KUROBA, sus
          propietarios o sus afiliados serán responsables de daños indirectos,
          incidentales, especiales, consecuentes o punitivos, incluidos, sin limitación,
          la pérdida de beneficios, datos, uso, buena voluntad u otras pérdidas
          intangibles, derivados de (i) tu acceso o uso, o de tu imposibilidad de
          acceder o usar, el Servicio; (ii) cualquier conducta o contenido de terceros en
          el Servicio; (iii) cualquier contenido obtenido del Servicio; y (iv) el acceso,
          uso o alteración no autorizados de tus transmisiones o contenido.
        </p>

        <h2>11. Ley aplicable</h2>
        <p>
          Estos Términos se regirán e interpretarán de acuerdo con las leyes de tu país o
          estado de residencia, sin perjuicio de sus disposiciones sobre conflictos de
          leyes.
        </p>

        <h2>12. Cambios en estos términos</h2>
        <p>
          Nos reservamos el derecho, a nuestra entera discreción, de modificar o
          sustituir estos Términos en cualquier momento. Notificaremos los cambios
          significativos publicando los nuevos términos en esta página. Al seguir
          accediendo o usando nuestro Servicio después de que esas revisiones entren en
          vigor, aceptas quedar sujeto a los términos revisados.
        </p>

        <h2>13. Contacto</h2>
        <p>Si tienes alguna pregunta sobre estos Términos, puedes ponerte en contacto con nosotros en:</p>
        <p>
          <strong>Correo:</strong>{' '}
          <a href="mailto:contacto@kuroba.app">contacto@kuroba.app</a>
        </p>
      </div>
    </PaginaDocumento>
  )
}
