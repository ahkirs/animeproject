import { NextResponse } from 'next/server'
import { buscarSeries, minimoParaBuscar } from '@/lib/catalogo'

export const dynamic = 'force-dynamic'

/** Proxy de búsqueda para el Buscador (cliente). El scraper no expone
 *  CORS, así que el navegador no puede pedirle directamente. */
export async function GET(peticion: Request) {
  const { searchParams } = new URL(peticion.url)
  const consulta = (searchParams.get('q') ?? '').trim()
  if (consulta.length < minimoParaBuscar(consulta)) {
    return NextResponse.json({ resultados: [] })
  }

  try {
    const coincidencias = await buscarSeries(consulta, 6)
    return NextResponse.json({
      resultados: coincidencias.map((c) => ({
        id: c.serie.id,
        titulo: c.serie.titulo,
        anio: c.serie.anio,
        nota: c.serie.nota,
        imagen: c.serie.lamina,
        motivo: c.motivo,
      })),
    })
  } catch {
    return NextResponse.json({ resultados: [] }, { status: 502 })
  }
}
