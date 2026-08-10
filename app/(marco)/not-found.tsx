import NoEncontrado from '@/components/NoEncontrado'

/* El 404 de dentro del marco: lo que dispara `notFound()` desde una
   ficha o un episodio. Conserva el riel y la barra, que es lo que
   permite seguir navegando sin volver a empezar. */
export default function NoEncontradaEnMarco() {
  return <NoEncontrado conMarco />
}
