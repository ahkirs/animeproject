# animeproject

Maqueta de una plataforma de streaming de anime, construida con Next.js, TypeScript y
Tailwind CSS.

La dirección de arte es **Sala Oscura**: la interfaz se comporta como una sala a oscuras y
una parrilla de emisión, en lugar de como una cuadrícula uniforme de carátulas. Negro cálido,
tipografía Archivo Black, filetes de 1px y un solo ámbar de proyector usado siempre como
campo sólido, nunca como resplandor.

> **La marca todavía no está decidida.** La interfaz usa `KUROBA` como nombre provisional.
> Vive en `components/Cabecera.tsx` y en el `title` de `app/layout.tsx`.

## Stack

| | |
|---|---|
| Next.js | 16 (App Router) |
| React | 19 |
| TypeScript | estricto |
| Tailwind CSS | 4, configuración en CSS con `@theme` |

## Empezar

```bash
npm install
npm run dev        # http://localhost:3000
```

Otros comandos:

```bash
npm run build      # comprueba tipos y compila para producción
npm run preview    # sirve la compilación de producción
npm run typecheck  # solo comprobación de tipos
```

## Estructura

```
app/
  layout.tsx                              raíz, fuentes y metadatos
  globals.css                             tokens del sistema visual y capa base
  page.tsx                                portada
  serie/[id]/page.tsx                     ficha de serie
  ver/[id]/[temporada]/[episodio]/page.tsx  reproductor

components/                               piezas compartidas
  Cabecera · Pie · Boton · Datos · Riel · FichaSerie
  Icono.tsx                               familia de iconos, un solo grosor de trazo
  Lamina.tsx                              carátulas y fotogramas en SVG

lib/
  types.ts                                modelo de datos del catálogo
  catalogo.ts                             datos sintéticos; punto de entrada de la API

docs/                                     trabajo de dirección de arte previo
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

Es una maqueta funcional de la interfaz, todavía no una aplicación:

- El reproductor no reproduce vídeo. Es la interfaz completa sobre un fotograma estático.
- No hay backend, autenticación ni persistencia. El catálogo es un archivo de datos local.
- Las pestañas de temporada y los controles del reproductor están maquetados y son accesibles
  por teclado, pero no llevan lógica.

Siguiente paso previsto: sustituir `lib/catalogo.ts` por una API real manteniendo las formas
definidas en `lib/types.ts`, y después cuentas de usuario y listas.

## Contenido sintético

**Todo el catálogo es inventado para esta demostración.** Los títulos, sinopsis, episodios,
nombres de estudios y personas, fechas, horarios y valoraciones se crearon para la maqueta. No
aparece ninguna obra, marca, estudio ni persona real, y las carátulas son ilustraciones
vectoriales propias hechas en SVG, no imágenes de terceros.

Sustituye este contenido por el catálogo real antes de publicar cualquier versión de cara al
público.

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
