# Documentación de animeproject

Guía del proyecto: qué es, cómo está construido, por qué se tomó cada decisión y qué
falta. Escrita para que alguien que llega de cero —o tú dentro de seis meses— pueda
retomarlo sin arqueología.

## Por dónde empezar

| Documento | Qué responde |
|---|---|
| [arquitectura.md](arquitectura.md) | Stack, rutas, cómo se renderiza cada página y por qué |
| [sistema-visual.md](sistema-visual.md) | Sala Oscura: tokens, tipografía, reglas y qué no hacer |
| [datos.md](datos.md) | La API del scraper, el modelo del catálogo y la costura que los une |
| [componentes.md](componentes.md) | Qué hace cada componente y cuáles son de cliente |
| [decisiones.md](decisiones.md) | Registro de decisiones, incluidas las que se descartaron |
| [estado.md](estado.md) | Qué funciona, qué es maqueta y qué falta |

## Resumen en treinta segundos

Un catálogo de anime construido como **agregador**: los datos —títulos, sinopsis,
carátulas, valoraciones y enlaces de reproducción— vienen de una API de scraper en
Railway, y el sitio los presenta sin alojar vídeo. La interfaz **no tiene datos propios**:
todo pasa por `lib/catalogo.ts`, la costura entre la API y el modelo.

Construido con Next.js 16 (App Router), React 19, TypeScript en estricto y Tailwind 4. Las
cuentas y la parrilla de emisión están fuera: la parrilla necesita una fuente de horarios
(AniList/MAL) y las cuentas necesitan backend.

La dirección de arte se llama **Sala Oscura** y se eligió entre cuatro propuestas. Las
tres descartadas y una guía comparativa de diez sistemas de interfaz siguen en este mismo
directorio, en las carpetas numeradas.

## Material de dirección de arte

Trabajo previo, conservado como referencia y no como código vivo.

| Carpeta | Qué es |
|---|---|
| `00-maqueta-html/` | La versión original en HTML estático, antes de migrar a Next |
| `02-editorial-japones/` | Dirección descartada: revista de programación impresa |
| `03-vhs/` | Dirección descartada: videoclub y magnetoscopio |
| `04-brutalista-neon/` | Dirección descartada, incompleta: solo portada |
| `guia-10-estilos.html` | Catálogo de diez sistemas de interfaz con paletas y tokens |

La guía de diez estilos documenta cada sistema con su paleta en hexadecimal, tokens CSS,
configuración de Tailwind y avisos de contraste. Sirve si alguna vez se quiere
reconsiderar la dirección.

## Contenido

Los títulos, sinopsis, carátulas y valoraciones vienen del scraper. Las láminas SVG de
`components/Lamina.tsx` quedan como reserva cuando el proveedor no tiene imagen. El
reproductor usa un `<video>` propio para los servidores que se pueden resolver a URL directa
(mp4upload, UPNShare y el HLS de Zilla, reproducido con hls.js) y un `<iframe>` del
proveedor para el resto; el sitio no almacena ni descarga vídeo.
