/* Color propio de cada obra.

   En la referencia las chapas toman el color dominante de la carátula:
   AniList publica un `coverImage.color` por obra y la ficha lo usa tal
   cual. Nuestro scraper no devuelve ese campo, y sacarlo aquí obligaría
   a descargar y analizar cada portada en el servidor —una imagen más por
   ficha, en una API que ya nos está devolviendo 429—.

   Así que el color se deriva del id. No es el color del arte y no hay
   que venderlo como si lo fuera, pero cumple lo que se le pide: cada
   obra tiene el suyo, siempre el mismo, y sin una petición de más. El
   día que el backend exponga el color dominante, esto se sustituye por
   ese valor y no cambia nada más.

   Saturación y luminosidad van fijas a propósito. Con L=72% cualquier
   tono queda por encima de 6:1 contra la tinta negra, así que el color
   se puede usar como campo sin comprobar el contraste caso por caso.
   Bajar esa luminosidad rompe las chapas de los tonos azules, que son
   los que menos luz tienen a igualdad de L. */

const LUZ = 72
const SATURACION = 80

/** Tono estable derivado del id canónico de la obra. */
export function colorDeObra(id: string): string {
  let acumulado = 0
  for (let i = 0; i < id.length; i++) {
    acumulado = (Math.imul(acumulado, 31) + id.charCodeAt(i)) | 0
  }
  const tono = Math.abs(acumulado) % 360
  return `hsl(${tono} ${SATURACION}% ${LUZ}%)`
}
