# animeproject

Un catálogo de anime construido como **agregador**, con Next.js, TypeScript y Tailwind CSS.
Los datos —títulos, sinopsis, carátulas, valoraciones y enlaces de reproducción— vienen de
una API de scraper (Railway); la interfaz no tiene datos propios.

La dirección de arte es **Sala Oscura**: la interfaz se comporta como una sala a oscuras.
Negro cálido, tipografía Archivo Black, filetes de 1px y un solo ámbar de proyector usado
siempre como campo sólido, nunca como resplandor.

> **La marca todavía no está decidida.** La interfaz usa `KUROBA` como nombre provisional.
> Vive en `components/Cabecera.tsx` y en el `title` de `app/layout.tsx`.

## Stack

| | |
|---|---|
| Next.js | 16 (App Router) |
| React | 19 |
| TypeScript | estricto |
| Tailwind CSS | 4, configuración en CSS con `@theme` |
| Datos | API de scraper en Railway, configurable con `API_BASE` |

## Empezar

```bash
npm install
npm run dev        # http://localhost:3000
```

Otros comandos:

```bash
npm run build      # compila para producción
npm run start      # sirve la compilación de producción
npm run typecheck  # solo comprobación de tipos
```

## Documentación

La guía completa está en [`docs/`](docs/README.md):

| Documento | Qué responde |
|---|---|
| [arquitectura.md](docs/arquitectura.md) | Stack, rutas y cómo se renderiza cada página |
| [sistema-visual.md](docs/sistema-visual.md) | Sala Oscura: tokens, tipografía y reglas |
| [datos.md](docs/datos.md) | La API del scraper y la costura que la une al modelo |
| [componentes.md](docs/componentes.md) | Qué hace cada componente |
| [decisiones.md](docs/decisiones.md) | Registro de decisiones, incluidas las descartadas |
| [estado.md](docs/estado.md) | Qué funciona, qué es maqueta y qué falta |

## Estructura

```
app/
  layout.tsx                              raíz, fuentes y metadatos
  globals.css                             tokens del sistema visual y capa base
  page.tsx                                portada
  explorar/page.tsx                       catálogo con filtros
  serie/[id]/page.tsx                     ficha de serie
  ver/[id]/[temporada]/[episodio]/page.tsx  reproductor
  mi-lista/page.tsx                       lista del usuario
  api/buscar/route.ts                     proxy de búsqueda para el cliente

components/                               piezas compartidas
  Cabecera · Pie · Boton · Datos · Riel · FichaSerie · Reproductor · Esqueleto
  Icono.tsx                               familia de iconos, un solo grosor de trazo
  Lamina.tsx                              carátulas y fotogramas SVG de reserva

lib/
  api-types.ts                            tipos crudos de la API del scraper
  api.ts                                  cliente de la API (única red)
  ids.ts                                  ids canónicos y deduplicación
  types.ts                                modelo de datos propio
  catalogo.ts                             costura: API → modelo, punto de entrada

docs/                                     documentación y dirección de arte previa
```

## El sistema visual

Los tokens viven en `app/globals.css` dentro de un bloque `@theme`, que es como Tailwind 4
sustituye al antiguo `tailwind.config.js`. Declarar `--color-sala-900` genera `bg-sala-900`,
`--spacing-e4` genera `p-e4` y `gap-e4`, y así con toda la escala. **Los valores son la fuente
de verdad del diseño**: si cambias un token, cambia en toda la interfaz.

Lo que no es una utilidad —el tematizado de la barra de desplazamiento, `::selection` y el
anillo de foco ámbar— está en `@layer base` del mismo archivo. Son parte del acabado del
diseño y no deben tratarse como detalles prescindibles.

## Estado

El catálogo es real y funciona de punta a punta (portada, ficha, explorar, búsqueda y
reproductor). Siguen siendo maqueta:

- Las cuentas y «Mi lista» (no hay backend ni persistencia).
- La parrilla de emisión, oculta a la espera de una fuente de horarios (AniList/MAL).

El reproductor usa un `<video>` propio para los servidores que se pueden resolver a URL
directa (mp4upload, UPNShare y el HLS de Zilla, reproducido con hls.js) y un `<iframe>` del
proveedor para el resto; no aloja ni descarga vídeo.

## Contenido

Los títulos, sinopsis, carátulas y valoraciones vienen del scraper. Las láminas SVG de
`components/Lamina.tsx` quedan como reserva cuando el proveedor no tiene imagen.

## docs/

Trabajo de dirección de arte anterior, conservado como referencia.

| Carpeta | Contenido |
|---|---|
| `docs/00-maqueta-html/` | La versión original en HTML estático, antes de migrar |
| `docs/02-editorial-japones/` | Dirección descartada: revista de programación impresa |
| `docs/03-vhs/` | Dirección descartada: videoclub y magnetoscopio |
| `docs/04-brutalista-neon/` | Dirección descartada, incompleta: solo portada |
| `docs/guia-10-estilos.html` | Catálogo de 10 sistemas de UI con paletas y tokens |

La guía de diez estilos documenta cada sistema con su paleta en hexadecimal, tokens CSS,
configuración de Tailwind y avisos de contraste.
