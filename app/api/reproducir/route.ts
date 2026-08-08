import { NextResponse } from 'next/server'
import { resolverEmbed } from '@/lib/reproducir'

export const dynamic = 'force-dynamic'

/** Dado el embed de un host, devuelve la URL directa del vídeo si se pudo
 *  resolver (patrón tokianime). El Reproductor la usa para alimentar su
 *  <video> propio en vez del iframe del host. */
export async function GET(peticion: Request) {
  const { searchParams } = new URL(peticion.url)
  const embed = searchParams.get('url') ?? ''
  if (!embed) return NextResponse.json({ directa: null }, { status: 400 })

  try {
    const directa = await resolverEmbed(embed)
    return NextResponse.json({ directa })
  } catch {
    return NextResponse.json({ directa: null })
  }
}
