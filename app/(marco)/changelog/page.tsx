import type { Metadata } from 'next'
import PaginaDocumento from '@/components/PaginaDocumento'

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'El registro de cambios de KUROBA.',
}

export default function Changelog() {
  return (
    <PaginaDocumento
      titulo="Changelog"
      subtitulo="Una línea de tiempo de las funciones nuevas, las mejoras y los avances en curso de la plataforma."
    >
      <div className="prose-doc">
        <h2>v0.1.0 — 2026</h2>
        <p>
          Primera versión del marco de la aplicación. La ventana deja de desplazarse: la
          estructura —riel, barra y pie— se declara una vez y las páginas solo traen su
          contenido.
        </p>
        <ul>
          <li>
            <p>
              <strong>marco</strong>:
            </p>
            <ul>
              <li>riel lateral fijo con estado activo</li>
              <li>barra superior con buscador centrado (Ctrl/⌘+K)</li>
              <li>campana con contador de no leídas</li>
              <li>barra inferior de navegación en móvil</li>
              <li>pie con enlaces legales y copyright</li>
            </ul>
          </li>
          <li>
            <p>
              <strong>catálogo</strong>:
            </p>
            <ul>
              <li>portada, explorar y búsqueda alimentados del scraper</li>
              <li>deduplicación de obras presentes en varios proveedores</li>
              <li>ficha de serie con relaciones reales, nota de la comunidad y comentarios</li>
            </ul>
          </li>
          <li>
            <p>
              <strong>reproductor</strong>:
            </p>
            <ul>
              <li>selector de audio y de servidor</li>
              <li>resolución de embeds y respaldo a iframe</li>
              <li>el progreso se guarda cada quince segundos</li>
            </ul>
          </li>
          <li>
            <p>
              <strong>comunidad</strong>:
            </p>
            <ul>
              <li>comentarios con respuestas anidadas y me gusta</li>
              <li>notas de la comunidad del 1 al 10</li>
              <li>notificaciones paginadas</li>
            </ul>
          </li>
          <li>
            <p>
              <strong>cuenta</strong>:
            </p>
            <ul>
              <li>perfil editable, cambio de contraseña y de correo</li>
              <li>doble factor con QR y sesiones revocables</li>
              <li>favoritos y ver después</li>
            </ul>
          </li>
        </ul>

        <h2>Próximamente</h2>
        <ul>
          <li>
            <p>
              <strong>emisión</strong>:
            </p>
            <ul>
              <li>calendario de estrenos, a la espera de una fuente de horarios</li>
            </ul>
          </li>
          <li>
            <p>
              <strong>manga</strong>:
            </p>
            <ul>
              <li>catálogo, capítulos y páginas, a la espera de un endpoint</li>
            </ul>
          </li>
          <li>
            <p>
              <strong>ficha</strong>:
            </p>
            <ul>
              <li>reparto y personajes</li>
            </ul>
          </li>
        </ul>
      </div>
    </PaginaDocumento>
  )
}
