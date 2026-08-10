import type { Metadata } from 'next'
import Pronto from '@/components/Pronto'

export const metadata: Metadata = {
  title: 'Manga',
  description: 'Lectura de manga.',
}

export default function Manga() {
  return (
    <Pronto
      icono="biblioteca"
      titulo="El manga aún no está conectado"
      explicacion="El backend de KUROBA solo rasca catálogos de anime: no hay ningún endpoint de manga, ni de capítulos, ni de páginas. Esta sección espera a que lo haya en lugar de enseñarte una lista vacía."
    />
  )
}
