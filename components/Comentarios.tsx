import Link from 'next/link'
import Comentario from './Comentario'
import FormularioComentario from './FormularioComentario'
import { comentariosDe } from '@/lib/comentarios'
import { usuarioActual } from '@/lib/sesion'

/* La conversación de una obra o de un episodio.

   Es de servidor: la lista se pinta ya escrita, sin esperar a que
   hidrate nada, y solo bajan al navegador las piezas que de verdad
   necesitan estado (el formulario y cada comentario suelto).

   Con `episodeId` la conversación es la de ese episodio y no la de la
   obra entera. Es el mismo endpoint y el mismo componente: lo que cambia
   es a qué está enganchada. */
export default async function Comentarios({
  animeId,
  episodeId,
  titulo = 'Comentarios',
}: {
  animeId: string
  episodeId?: string
  titulo?: string
}) {
  const usuario = await usuarioActual()
  const pagina = await comentariosDe({
    animeId,
    episodeId,
    yo: usuario?.id ?? null,
  })

  return (
    <section aria-labelledby="t-comentarios" className="mt-12 px-bleed">
      <h2
        id="t-comentarios"
        className="flex items-baseline gap-2 text-xl font-semibold text-tinta"
      >
        {titulo}
        {pagina.total > 0 && (
          <span className="text-sm font-normal text-tinta-tenue tabular-nums">
            {pagina.total}
          </span>
        )}
      </h2>

      <div className="mt-4 max-w-[70ch]">
        {usuario ? (
          <FormularioComentario animeId={animeId} episodeId={episodeId} />
        ) : (
          <p className="rounded-radio border border-borde bg-tarjeta px-4 py-3 text-sm text-tinta-apagada">
            <Link href="/acceder" className="font-semibold text-acento">
              Entra en tu cuenta
            </Link>{' '}
            para comentar.
          </p>
        )}

        {pagina.filas.length === 0 ? (
          <p className="mt-6 text-sm text-tinta-tenue">
            Todavía no hay comentarios. Estrena la conversación.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-borde">
            {pagina.filas.map((c) => (
              <Comentario
                key={c.id}
                datos={c}
                animeId={animeId}
                episodeId={episodeId}
                haySesion={!!usuario}
              />
            ))}
          </div>
        )}

        {/* La paginación real llega cuando haya volumen que paginar: hoy
            no hay ni un comentario publicado en producción. Mientras
            tanto, decir cuántos quedan fuera es más honesto que un
            paginador que no lleva a ninguna parte. */}
        {pagina.paginas > 1 && (
          <p className="mt-6 text-xs text-tinta-tenue">
            Mostrando los {pagina.filas.length} más recientes de {pagina.total}.
          </p>
        )}
      </div>
    </section>
  )
}
