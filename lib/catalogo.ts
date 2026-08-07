import type { EnCurso, Emision, Serie, Temporada } from './types'

/* ============================================================
   CATÁLOGO SINTÉTICO
   Todos los títulos, sinopsis, nombres, fechas y valoraciones se
   crearon para esta maqueta. Ninguna obra, estudio ni persona es
   real. Este archivo es el punto por el que entrará la API cuando
   se conecte: sustituir estas constantes por peticiones.
   ============================================================ */

export const SERIES: Serie[] = [
  {
    id: 'cielo-de-hierro',
    titulo: 'Cielo de Hierro',
    tituloOriginal: '鉄の空',
    romaji: 'Kurogane no Sora',
    anio: 2026,
    nota: 8.7,
    votos: 2418,
    clasificacion: '+16',
    duracionMin: 24,
    genero: 'Mecha',
    generos: ['Mecha', 'Drama', 'Distopía', 'Aviación', 'Protagonista femenina'],
    temporadaEtiqueta: 'T2',
    sinopsisCorta:
      'Cuando los dirigibles dejaron de volar, la ciudad aprendió a mirar hacia abajo. Rei pilota lo último que queda de una flota que nadie recuerda haber construido.',
    sinopsis:
      'Cuando los dirigibles dejaron de volar, la ciudad aprendió a mirar hacia abajo. Rei pilota lo último que queda de una flota que nadie recuerda haber construido, y cada vuelo la acerca menos al cielo y más a la pregunta de quién decidió bajarlo. Segunda temporada en emisión, episodios nuevos cada viernes.',
    lamina: 'mecha',
    panoramica: 'panoramica-obra',
    ficha: {
      estudio: 'Studio Hanabi',
      direccion: 'Mizuki Ono',
      guion: 'Sae Fujimoto',
      musica: 'Rei Katsuragi',
      emision: 'Viernes 21:00',
      origen: 'Manga (2021)',
      audio: 'Japonés, español',
      subtitulos: '5 idiomas',
    },
    reparto: [
      { nombre: 'Rei Amano', voz: 'Haru Nishimura', iniciales: 'RA' },
      { nombre: 'Kenzō Sano', voz: 'Tatsuya Mori', iniciales: 'KS' },
      { nombre: 'Yuna Ishii', voz: 'Mei Kobayashi', iniciales: 'YI' },
      { nombre: 'El Cartógrafo', voz: 'Jun Takeda', iniciales: 'DT' },
    ],
    temporadas: [
      {
        numero: 2,
        etiqueta: 'Temporada 2 · en emisión',
        enEmision: true,
        episodios: [
          {
            numero: 6,
            titulo: 'El peso del aire',
            sinopsis:
              'Rei acepta un encargo que la obliga a volar por debajo de la cota mínima. Abajo, la ciudad no se parece a los mapas.',
            duracionMin: 24,
            estado: 'visto',
            progreso: 100,
            lamina: 'ep-1',
          },
          {
            numero: 7,
            titulo: 'Lo que pesa el aire',
            sinopsis:
              'El taller recibe una pieza que no consta en ningún inventario. Kenzō reconoce la marca del fabricante y no dice nada.',
            duracionMin: 24,
            estado: 'en-curso',
            progreso: 38,
            lamina: 'ep-2',
          },
          {
            numero: 8,
            titulo: 'Hangar siete',
            sinopsis:
              'Una inspección rutinaria encuentra la puerta abierta. Dentro no falta nada, y eso es exactamente el problema.',
            duracionMin: 24,
            estado: 'disponible',
            disponible: 'Viernes 14',
            lamina: 'ep-3',
          },
          {
            numero: 9,
            titulo: 'Sin título todavía',
            sinopsis:
              'Se publica el viernes 21 de agosto a las 21:00. Disponible para toda la región al mismo tiempo.',
            duracionMin: 24,
            estado: 'bloqueado',
            disponible: 'En 14 días',
            lamina: 'ep-4',
          },
        ],
      },
    ],
  },

  {
    id: 'jardin-de-las-cenizas',
    titulo: 'El Jardín de las Cenizas',
    anio: 2026,
    nota: 8.1,
    votos: 940,
    clasificacion: '+12',
    duracionMin: 24,
    genero: 'Fantasía',
    generos: ['Fantasía', 'Drama', 'Botánica'],
    temporadaEtiqueta: 'T1',
    sinopsisCorta: 'Fantasía botánica con un ritmo que se toma su tiempo.',
    sinopsis:
      'Un jardín que solo florece sobre lo que se ha perdido, y la jardinera que decide no plantar nada nunca más. Primera temporada, lunes.',
    lamina: 'jardin',
    ficha: {
      estudio: 'Estudio Kawara',
      direccion: 'Aoi Terada',
      guion: 'Aoi Terada',
      musica: 'Nao Sugimoto',
      emision: 'Lunes 20:00',
      origen: 'Novela ligera (2023)',
      audio: 'Japonés',
      subtitulos: '5 idiomas',
    },
    temporadas: [
      {
        numero: 1,
        etiqueta: 'Temporada 1 · en emisión',
        enEmision: true,
        episodios: [
          {
            numero: 1,
            titulo: 'Suelo pobre',
            sinopsis:
              'Nadie recuerda quién plantó el primer brote, pero todos recuerdan lo que había antes en ese terreno.',
            duracionMin: 24,
            estado: 'visto',
            progreso: 100,
            lamina: 'ep-2',
          },
          {
            numero: 2,
            titulo: 'Injerto',
            sinopsis:
              'Una rama de otro jardín prende donde no debería. La jardinera decide no cortarla y esa noche no duerme.',
            duracionMin: 24,
            estado: 'visto',
            progreso: 100,
            lamina: 'ep-3',
          },
          {
            numero: 3,
            titulo: 'Ceniza fina',
            sinopsis:
              'Llega el viento del sur y con él una capa gris que cubre los senderos. El jardín florece más que nunca.',
            duracionMin: 24,
            estado: 'disponible',
            lamina: 'ep-1',
          },
          {
            numero: 4,
            titulo: 'Raíz amarga',
            sinopsis:
              'Se publica el lunes 10 de agosto a las 20:00, simultáneamente para toda la región.',
            duracionMin: 24,
            estado: 'bloqueado',
            disponible: 'En 3 días',
            lamina: 'ep-4',
          },
        ],
      },
    ],
  },

  {
    id: 'kaiju-blues',
    titulo: 'Kaijū Blues',
    anio: 2026,
    nota: 7.9,
    votos: 1502,
    clasificacion: '+16',
    duracionMin: 24,
    genero: 'Acción',
    generos: ['Acción', 'Comedia', 'Oficina'],
    temporadaEtiqueta: 'T1',
    sinopsisCorta: 'Los monstruos ya no son el problema; el papeleo sí.',
    sinopsis:
      'La oficina que tramita los daños causados por kaijū tiene más bajas por agotamiento que por ataque directo. Primera temporada completa.',
    lamina: 'kaiju',
    ficha: {
      estudio: 'Studio Hanabi',
      direccion: 'Gen Murakami',
      guion: 'Hana Oda',
      musica: 'Rei Katsuragi',
      emision: 'Temporada completa',
      origen: 'Original',
      audio: 'Japonés, español',
      subtitulos: '5 idiomas',
    },
    temporadas: [
      {
        numero: 1,
        etiqueta: 'Temporada 1 · completa',
        episodios: [
          {
            numero: 1,
            titulo: 'Formulario 12-B',
            sinopsis:
              'Un edificio menos y catorce copias que rellenar. El becario aprende que la parte difícil empieza cuando el monstruo ya se ha ido.',
            duracionMin: 24,
            estado: 'visto',
            progreso: 100,
            lamina: 'ep-4',
          },
          {
            numero: 2,
            titulo: 'Cobertura parcial',
            sinopsis:
              'La aseguradora alega que el daño fue por pisada y no por coletazo. La diferencia son ocho millones.',
            duracionMin: 24,
            estado: 'visto',
            progreso: 100,
            lamina: 'ep-1',
          },
          {
            numero: 3,
            titulo: 'Horas extra',
            sinopsis:
              'Nadie quiere el turno de noche desde que el de mantenimiento juró oír pasos en la planta doce.',
            duracionMin: 24,
            estado: 'en-curso',
            progreso: 68,
            lamina: 'ep-2',
          },
          {
            numero: 4,
            titulo: 'Reunión de coordinación',
            sinopsis:
              'Tres departamentos, un solo kaijū y ninguna intención de asumir la competencia sobre el expediente.',
            duracionMin: 24,
            estado: 'disponible',
            lamina: 'ep-3',
          },
        ],
      },
    ],
  },

  {
    id: 'noctambula',
    titulo: 'Noctámbula',
    anio: 2025,
    nota: 8.4,
    votos: 3110,
    clasificacion: '+16',
    duracionMin: 24,
    genero: 'Misterio',
    generos: ['Misterio', 'Sobrenatural'],
    temporadaEtiqueta: 'T2',
    sinopsisCorta: 'Alguien recorre la ciudad de noche y nadie recuerda haberla visto.',
    sinopsis:
      'Alguien recorre la ciudad de noche y nadie recuerda haberla visto. Ella tampoco recuerda por qué camina. Segunda temporada.',
    lamina: 'noche',
    ficha: {
      estudio: 'Kage Works',
      direccion: 'Sora Nishikawa',
      guion: 'Sora Nishikawa',
      musica: 'Yuu Hasegawa',
      emision: 'Temporada completa',
      origen: 'Manga (2019)',
      audio: 'Japonés, español',
      subtitulos: '5 idiomas',
    },
    temporadas: [
      {
        numero: 2,
        etiqueta: 'Temporada 2 · completa',
        episodios: [
          {
            numero: 10,
            titulo: 'Última parada',
            sinopsis:
              'El conductor jura que cerró las puertas. En la cámara aparece bajando alguien que no subió.',
            duracionMin: 24,
            estado: 'visto',
            progreso: 100,
            lamina: 'ep-3',
          },
          {
            numero: 11,
            titulo: 'Farola doce',
            sinopsis:
              'Doce farolas en la avenida y solo once encendidas, todas las noches, siempre la misma apagada.',
            duracionMin: 24,
            estado: 'visto',
            progreso: 100,
            lamina: 'ep-4',
          },
          {
            numero: 12,
            titulo: 'Nadie a estas horas',
            sinopsis:
              'La panadería abre a las cuatro. La panadera lleva meses dejando un café de más en el mostrador.',
            duracionMin: 24,
            estado: 'en-curso',
            progreso: 23,
            lamina: 'ep-2',
          },
          {
            numero: 13,
            titulo: 'Amanece igual',
            sinopsis:
              'Final de temporada. La ciudad despierta y, por primera vez, alguien la reconoce por la calle.',
            duracionMin: 24,
            estado: 'disponible',
            lamina: 'ep-1',
          },
        ],
      },
    ],
  },

  {
    id: 'perros-de-neon',
    titulo: 'Los Perros de Neón',
    anio: 2024,
    nota: 8.9,
    votos: 5240,
    clasificacion: '+18',
    duracionMin: 24,
    genero: 'Acción',
    generos: ['Acción', 'Cyberpunk', 'Thriller'],
    temporadaEtiqueta: 'T3',
    sinopsisCorta: 'En esta ciudad nadie llama dos veces a la misma puerta.',
    sinopsis:
      'Mensajeros que cruzan una ciudad partida en dos por un río de luz. Tercera temporada en emisión, domingos.',
    lamina: 'noche',
    ficha: {
      estudio: 'Kage Works',
      direccion: 'Ryō Sakamoto',
      guion: 'Hana Oda',
      musica: 'Yuu Hasegawa',
      emision: 'Domingos 23:15',
      origen: 'Manga (2018)',
      audio: 'Japonés, español',
      subtitulos: '5 idiomas',
    },
    temporadas: [
      {
        numero: 3,
        etiqueta: 'Temporada 3 · en emisión',
        enEmision: true,
        episodios: [
          {
            numero: 1,
            titulo: 'Entrega urgente',
            sinopsis:
              'Un paquete que no pesa nada y una dirección que en los mapas oficiales no existe.',
            duracionMin: 24,
            estado: 'visto',
            progreso: 100,
            lamina: 'ep-2',
          },
          {
            numero: 2,
            titulo: 'Nadie llama dos veces',
            sinopsis:
              'La norma del gremio es clara: si no abren a la primera, el encargo se cancela. Esta noche alguien la rompe.',
            duracionMin: 24,
            estado: 'disponible',
            disponible: 'Domingo 09',
            lamina: 'ep-3',
          },
          {
            numero: 3,
            titulo: 'Puente bajo',
            sinopsis: 'Se publica el domingo 16 de agosto a las 23:15.',
            duracionMin: 24,
            estado: 'bloqueado',
            disponible: 'En 9 días',
            lamina: 'ep-4',
          },
        ],
      },
    ],
  },

  {
    id: 'tren-de-medianoche',
    titulo: 'Tren de Medianoche a Sapporo',
    anio: 2026,
    nota: 8.6,
    votos: 1288,
    clasificacion: '+12',
    duracionMin: 24,
    genero: 'Drama',
    generos: ['Drama', 'Viajes'],
    temporadaEtiqueta: 'T1',
    sinopsisCorta: 'Nueve paradas, nueve conversaciones, un solo pasajero que no baja.',
    sinopsis:
      'Nueve paradas, nueve conversaciones, y un solo pasajero que en ninguna de ellas se baja del tren. Primera temporada.',
    lamina: 'tren',
    ficha: {
      estudio: 'Estudio Kawara',
      direccion: 'Mizuki Ono',
      guion: 'Sae Fujimoto',
      musica: 'Nao Sugimoto',
      emision: 'Miércoles 22:45',
      origen: 'Original',
      audio: 'Japonés',
      subtitulos: '5 idiomas',
    },
    temporadas: [
      {
        numero: 1,
        etiqueta: 'Temporada 1 · en emisión',
        enEmision: true,
        episodios: [
          {
            numero: 7,
            titulo: 'Coche restaurante',
            sinopsis:
              'A las dos de la mañana solo quedan dos clientes y una carta que ya no sirve casi nada.',
            duracionMin: 24,
            estado: 'visto',
            progreso: 100,
            lamina: 'ep-1',
          },
          {
            numero: 8,
            titulo: 'Литера B',
            sinopsis:
              'El billete lleva impresa una letra que no corresponde a ningún vagón de este tren.',
            duracionMin: 24,
            estado: 'en-curso',
            progreso: 91,
            lamina: 'ep-2',
          },
          {
            numero: 9,
            titulo: 'Andén cuatro',
            sinopsis:
              'Final de temporada. La estación de llegada tiene tres andenes y el altavoz anuncia el cuarto.',
            duracionMin: 24,
            estado: 'disponible',
            disponible: 'Miércoles 12',
            lamina: 'ep-3',
          },
        ],
      },
    ],
  },

  {
    id: 'la-espada-y-el-rio',
    titulo: 'La Espada y el Río',
    anio: 2026,
    nota: 8.0,
    votos: 870,
    clasificacion: '+16',
    duracionMin: 24,
    genero: 'Histórico',
    generos: ['Histórico', 'Drama'],
    temporadaEtiqueta: 'T1',
    sinopsisCorta: 'Dos orillas, una promesa y una hoja que nadie quiere desenvainar.',
    sinopsis:
      'Dos orillas, una promesa hecha hace cuarenta años y una hoja que ninguno de los dos quiere desenvainar primero.',
    lamina: 'espada',
    ficha: {
      estudio: 'Estudio Kawara',
      direccion: 'Gen Murakami',
      guion: 'Aoi Terada',
      musica: 'Rei Katsuragi',
      emision: 'Temporada completa',
      origen: 'Novela (2016)',
      audio: 'Japonés',
      subtitulos: '5 idiomas',
    },
    temporadas: [
      {
        numero: 1,
        etiqueta: 'Temporada 1 · completa',
        episodios: [
          {
            numero: 1,
            titulo: 'Aguas bajas',
            sinopsis:
              'El verano seca el cauce y por primera vez en cuarenta años se puede cruzar a pie.',
            duracionMin: 24,
            estado: 'visto',
            progreso: 100,
            lamina: 'ep-3',
          },
          {
            numero: 2,
            titulo: 'La orilla de enfrente',
            sinopsis:
              'Alguien ha dejado una ofrenda en la piedra del vado. Nadie de este lado admite haber cruzado.',
            duracionMin: 24,
            estado: 'en-curso',
            progreso: 44,
            lamina: 'ep-1',
          },
          {
            numero: 3,
            titulo: 'Filo mellado',
            sinopsis:
              'La hoja lleva cuatro décadas envainada y el herrero se niega a tocarla sin saber contra quién.',
            duracionMin: 24,
            estado: 'disponible',
            lamina: 'ep-4',
          },
        ],
      },
    ],
  },

  {
    id: 'ciudad-vertical',
    titulo: 'Ciudad Vertical',
    anio: 2026,
    nota: 7.7,
    votos: 640,
    clasificacion: '+12',
    duracionMin: 24,
    genero: 'Ciencia ficción',
    generos: ['Ciencia ficción', 'Misterio'],
    temporadaEtiqueta: 'T1',
    sinopsisCorta: 'Cien plantas, cien reglas distintas y un ascensor que no para en todas.',
    sinopsis:
      'Cien plantas, cien reglas distintas, y un ascensor que por motivos que nadie explica no para en todas.',
    lamina: 'mecha',
    ficha: {
      estudio: 'Kage Works',
      direccion: 'Sora Nishikawa',
      guion: 'Hana Oda',
      musica: 'Yuu Hasegawa',
      emision: 'Temporada completa',
      origen: 'Original',
      audio: 'Japonés, español',
      subtitulos: '5 idiomas',
    },
    temporadas: [
      {
        numero: 1,
        etiqueta: 'Temporada 1 · completa',
        episodios: [
          {
            numero: 1,
            titulo: 'Planta cuarenta',
            sinopsis:
              'Aquí el día dura diez horas por decisión administrativa y nadie recuerda quién la tomó.',
            duracionMin: 24,
            estado: 'disponible',
            lamina: 'ep-4',
          },
          {
            numero: 2,
            titulo: 'Sin parada',
            sinopsis:
              'El ascensor pasa de largo por la sesenta y siete. En los planos esa planta no aparece.',
            duracionMin: 24,
            estado: 'disponible',
            lamina: 'ep-2',
          },
          {
            numero: 3,
            titulo: 'Vecinos de abajo',
            sinopsis:
              'Bajar está permitido. Volver a subir requiere un permiso que tarda meses en concederse.',
            duracionMin: 24,
            estado: 'disponible',
            lamina: 'ep-1',
          },
        ],
      },
    ],
  },

  {
    id: 'cafe-yurei',
    titulo: 'Café Yūrei',
    anio: 2026,
    nota: 8.2,
    votos: 1105,
    clasificacion: '+7',
    duracionMin: 24,
    genero: 'Slice of life',
    generos: ['Slice of life', 'Sobrenatural', 'Comedia'],
    temporadaEtiqueta: 'T1',
    sinopsisCorta: 'Abre a medianoche y la clientela nunca pide la cuenta.',
    sinopsis:
      'Un café que abre a medianoche y cuya clientela, por razones evidentes, nunca pide la cuenta. Primera temporada, sábados.',
    lamina: 'jardin',
    ficha: {
      estudio: 'Studio Hanabi',
      direccion: 'Aoi Terada',
      guion: 'Aoi Terada',
      musica: 'Nao Sugimoto',
      emision: 'Sábados 18:30',
      origen: 'Manga (2022)',
      audio: 'Japonés, español',
      subtitulos: '5 idiomas',
    },
    temporadas: [
      {
        numero: 1,
        etiqueta: 'Temporada 1 · en emisión',
        enEmision: true,
        episodios: [
          {
            numero: 9,
            titulo: 'Mesa para uno',
            sinopsis:
              'El habitual de los jueves lleva tres semanas sin aparecer y su taza sigue puesta.',
            duracionMin: 24,
            estado: 'visto',
            progreso: 100,
            lamina: 'ep-2',
          },
          {
            numero: 10,
            titulo: 'Cierre tardío',
            sinopsis:
              'Amanece antes de que el último cliente termine, y eso nunca había pasado.',
            duracionMin: 24,
            estado: 'visto',
            progreso: 100,
            lamina: 'ep-3',
          },
          {
            numero: 11,
            titulo: 'La cuenta de la casa',
            sinopsis:
              'Alguien deja dinero sobre la barra por primera vez desde que el local abrió.',
            duracionMin: 24,
            estado: 'disponible',
            disponible: 'Sábado 08',
            lamina: 'ep-1',
          },
        ],
      },
    ],
  },
]

export const SERIE_DESTACADA = SERIES[0]

export function obtenerSerie(id: string): Serie | undefined {
  return SERIES.find((s) => s.id === id)
}

export function obtenerTemporada(
  serie: Serie,
  numero?: number,
): Temporada | undefined {
  if (!serie.temporadas?.length) return undefined
  if (numero === undefined) return serie.temporadas[0]
  return serie.temporadas.find((t) => t.numero === numero) ?? serie.temporadas[0]
}

/** Episodio por el que tiene sentido entrar: el que está a medias,
 *  o si no el primero que aún no se ha visto, o si no el primero. */
export function episodioDeEntrada(serie: Serie) {
  const temporada = obtenerTemporada(serie)
  if (!temporada?.episodios.length) return undefined
  const eps = temporada.episodios
  const enCurso = eps.find((e) => e.estado === 'en-curso')
  const pendiente = eps.find((e) => e.estado === 'disponible')
  return { temporada, episodio: enCurso ?? pendiente ?? eps[0] }
}

/** Construye una URL de reproductor que sabemos que resuelve.
 *  Evita enlaces escritos a mano que apunten a episodios inexistentes. */
export function rutaReproductor(serieId: string): string | undefined {
  const serie = obtenerSerie(serieId)
  if (!serie) return undefined
  const entrada = episodioDeEntrada(serie)
  if (!entrada) return undefined
  return `/ver/${serie.id}/${entrada.temporada.numero}/${entrada.episodio.numero}`
}

/** Parrilla de emisión de la semana en curso. */
export const EMISIONES: Emision[] = [
  {
    serieId: 'cielo-de-hierro',
    serieTitulo: 'Cielo de Hierro',
    diaCorto: 'Hoy',
    diaNumero: '07',
    hoy: true,
    episodio: 'T2 E07',
    tituloEpisodio: 'Lo que pesa el aire',
    hora: '21:00',
  },
  {
    serieId: 'cafe-yurei',
    serieTitulo: 'Café Yūrei',
    diaCorto: 'Sáb',
    diaNumero: '08',
    episodio: 'T1 E11',
    tituloEpisodio: 'La cuenta de la casa',
    hora: '18:30',
  },
  {
    serieId: 'perros-de-neon',
    serieTitulo: 'Los Perros de Neón',
    diaCorto: 'Dom',
    diaNumero: '09',
    episodio: 'T3 E02',
    tituloEpisodio: 'Nadie llama dos veces',
    hora: '23:15',
  },
  {
    serieId: 'jardin-de-las-cenizas',
    serieTitulo: 'El Jardín de las Cenizas',
    diaCorto: 'Lun',
    diaNumero: '10',
    episodio: 'T1 E04',
    tituloEpisodio: 'Raíz amarga',
    hora: '20:00',
  },
  {
    serieId: 'tren-de-medianoche',
    serieTitulo: 'Tren de Medianoche a Sapporo',
    diaCorto: 'Mié',
    diaNumero: '12',
    episodio: 'T1 E09',
    tituloEpisodio: 'Andén cuatro',
    hora: '22:45',
  },
]

/** Lo que el usuario dejó a medias. */
export const EN_CURSO: EnCurso[] = [
  {
    serieId: 'kaiju-blues',
    serieTitulo: 'Kaijū Blues',
    episodio: 'E03',
    restanteMin: 9,
    progreso: 68,
    lamina: 'ep-4',
  },
  {
    serieId: 'noctambula',
    serieTitulo: 'Noctámbula',
    episodio: 'E12',
    restanteMin: 18,
    progreso: 23,
    lamina: 'ep-2',
  },
  {
    serieId: 'tren-de-medianoche',
    serieTitulo: 'Tren de Medianoche',
    episodio: 'E08',
    restanteMin: 2,
    progreso: 91,
    lamina: 'ep-1',
  },
  {
    serieId: 'la-espada-y-el-rio',
    serieTitulo: 'La Espada y el Río',
    episodio: 'E02',
    restanteMin: 14,
    progreso: 44,
    lamina: 'ep-3',
  },
]

export const GENEROS = [
  'Mecha',
  'Slice of life',
  'Misterio',
  'Histórico',
  'Deportes',
  'Fantasía',
  'Terror',
  'Comedia',
  'Romance',
  'Ciencia ficción',
]
