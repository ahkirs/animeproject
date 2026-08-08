# Arquitectura

## Stack

| | Versión | Por qué |
|---|---|---|
| Next.js | 16 (App Router) | Renderizado en servidor, que un catálogo necesita para ser indexable, y rutas de API para el proxy de búsqueda |
| React | 19 | Componentes de servidor por defecto |
| TypeScript | 7, modo estricto | El catálogo tiene forma compleja (series → temporadas → episodios) y la API cruda no coincide con el modelo propio: los tipos son la red que une ambos |
| Tailwind CSS | 4 | Configuración en CSS con `@theme`, sin `tailwind.config.js` |

No hay librería de componentes, ni de iconos, ni de gestión de estado. Todo se escribió a
medida.

## Estructura

```
app/
  layout.tsx                                 raíz, fuentes
  globals.css                                tokens del sistema visual, capa base, grano
  error.tsx                                  frontera de error con reintento
  loading.tsx                                esqueleto de la portada
  page.tsx                                   portada
  explorar/page.tsx                          catálogo con filtros
  serie/[id]/page.tsx                        ficha de serie
  ver/[id]/[temporada]/[episodio]/page.tsx   reproductor
  mi-lista/page.tsx                          lista del usuario
  acceder/page.tsx                           entrar
  registro/page.tsx                          crear cuenta
  laboratorio/page.tsx                       pruebas visuales, sin enlazar ni indexar
  api/buscar/route.ts                        proxy de búsqueda para el cliente

components/                                  piezas compartidas, ver componentes.md
lib/
  types.ts                                   modelo de datos propio
  api-types.ts                               tipos crudos de la API del scraper
  api.ts                                     cliente de la API (única red)
  ids.ts                                     ids canónicos y deduplicación
  catalogo.ts                                costura: API → modelo, ver datos.md
docs/                                        esta documentación
```

## Cómo se renderiza cada ruta

| Ruta | Modo | Motivo |
|---|---|---|
| `/` | Estática con ISR (1 h) | Tendencias del catálogo; el scraper no cambia más rápido que eso |
| `/acceder`, `/registro` | Estáticas | Formularios sin lógica |
| `/laboratorio` | Estática | Página de pruebas |
| `/serie/[id]` | Bajo demanda | Ficha pedida al scraper por id; revalidada una hora |
| `/explorar` | Bajo demanda | Lee filtros de la URL |
| `/mi-lista` | Bajo demanda | Lee el estado de la URL y pide cada serie al scraper |
| `/ver/...` | Bajo demanda | Pide la serie y los enlaces del episodio |
| `/api/buscar` | Bajo demanda | Proxy; nunca en caché |

## Servidor frente a cliente

La regla es: **componente de servidor salvo que haya un motivo concreto**. Los que llevan
`'use client'` y por qué:

- **`Buscador`** — escribir y ver resultados es interacción pura
- **`CarruselDestacado`** — estado del índice, avance automático, teclado
- **`Reproductor`** — selección de servidor y variante de audio en el navegador
- **`PreferenciaHora`** — guarda la preferencia en el navegador (usado por la parrilla,
  hoy oculta)
- **`HoraEmision`** — la hora local solo la sabe el navegador
- **`EfectosSala`** — los interruptores del laboratorio

Las páginas y los esqueletos (`loading.tsx`) se renderizan en el servidor y no envían
JavaScript.

## Decisiones de estado

**Los filtros viven en la URL, no en React.** `/explorar` y `/mi-lista` leen sus filtros
de los parámetros de búsqueda. Eso hace que un resultado concreto sea compartible y
guardable, y que la página funcione sin JavaScript, porque los controles son enlaces
normales.

**Los parámetros se validan contra listas conocidas.** Un `?genero=Inventado` se ignora en
lugar de romper la página o devolver una lista vacía engañosa.

## Reproductor

`/ver/...` pide los enlaces del episodio al scraper y se los pasa a `Reproductor`
(cliente), que:

- agrupa los servidores por variante de audio (subtitulada / doblada),
- para los hosts soportados resuelve el embed a la URL directa del vídeo y lo reproduce en
  un `<video>` propio — mp4 con `<video>` nativo, HLS con `VideoConHls` (hls.js en
  Chrome/Firefox, nativo en Safari), y
- para los hosts que no se pueden resolver incrusta el `<iframe>` del proveedor,
  con un fallback con enlace al proveedor cuando no hay servidores.

La resolución ocurre en el servidor:
- **`lib/reproducir.ts`** — dado el embed de un host devuelve la URL directa. `mp4upload`
  extrae la URL del HTML; `UPNShare` descifra (AES-CBC, clave/IV derivadas de su `location`)
  la respuesta de su API `/api/v1/download`; `Zilla` deriva el m3u8
  (`/m3u8/<token>`) del token de su embed `/play/<token>`.
- **`/api/reproducir`** — expone `resolverEmbed` como `GET ?url=<embed> → { directa }`.
- **`/api/stream`** — proxy de la URL directa: inyecta el Referer que el CDN espera y
  reenvía `Range`, con una lista blanca de hosts (mp4upload, uns.bio, zilla-networks, IPs
  del CDN de UPNShare solo si la ruta lleva su firma de archivo `.mp4/.m3u8` o `/v4/`) para
  no ser un proxy abierto. Para Zilla inyecta además `Origin` y `Sec-Fetch-*`, y si la
  respuesta es un m3u8 reescribe las URLs de sus segmentos (fMP4 con nombre `.html`) para
  que hls.js los pida a través del propio proxy — si el navegador los pidiera al host
  directo, responderían 403.

El catálogo no almacena ni descarga vídeo: el proxy solo reenvía el stream del proveedor al
navegador.

## Tipografía

Las fuentes se cargan con `next/font/google`, que las autoaloja en el propio dominio. Eso
elimina la petición a Google Fonts y el salto de composición al cargar. Se exponen como
variables CSS y se consumen desde `@theme`.

## Comandos

```bash
npm run dev        # desarrollo en localhost:3000
npm run build      # compila y genera la salida de producción
npm run start      # sirve la compilación
npm run preview    # idem (para quien venía de vite)
npm run typecheck  # solo tipos
```

`npm run typecheck` comprueba solo tipos; la build de Next también lo hace antes de
compilar.
