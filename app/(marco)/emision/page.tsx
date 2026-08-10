import type { Metadata } from 'next'
import Pronto from '@/components/Pronto'

export const metadata: Metadata = {
  title: 'Emisión',
  description: 'El calendario de estrenos de la semana.',
}

export default function Emision() {
  return (
    <Pronto
      icono="calendario"
      titulo="El calendario todavía no está"
      explicacion="Para montar una parrilla hace falta saber qué día y a qué hora se estrena cada episodio, y el proveedor del catálogo no publica ese dato: solo dice qué series están en emisión, no cuándo. Mientras tanto, puedes filtrar por «En emisión» en Explorar."
    />
  )
}
