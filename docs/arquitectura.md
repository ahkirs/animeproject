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
  layout.tsx              raíz: fuentes y proveedor de zona horaria
  globals.css             tokens del sistema visual, capa base, utilidades
  error.tsx               frontera de error con reintento
  not-found.tsx           404 de la raíz
  acceder/, registro/     fuera del marco: a sangre y sin navegación
  api/                    auth, buscar, reproducir, stream
  (marco)/                todo lo demás, dentro del app shell
    layout.tsx            riel + barra + panel con scroll + pie
    not-found.tsx         404 dentro del marco
    page.tsx              portada
    explorar/             catálogo con filtros en la URL
    serie/[id]/           ficha: episodios, relaciones, nota, comentarios
    ver/[id]/[temporada]/[episodio]/    reproductor
    mi-lista/             historial, favoritos, ver después
    notificaciones/       lista paginada
    cuenta/               perfil, contraseña, correo, 2FA, sesiones, baja
    u/[alias]/            perfil público
    emision/, manga/      maquetadas: falta backend
    laboratorio/          galería del sistema visual, sin indexar

components/               piezas compartidas, ver componentes.md
lib/
  types.ts                modelo de datos propio
  api-types.ts            tipos crudos de la API del scraper
  api.ts                  cliente del catálogo (única red del catálogo)
  ids.ts                  ids canónicos y deduplicación
  catalogo.ts             costura: API → modelo, ver datos.md
  portada.ts              la portada como datos: qué filas y de qué forma
  color.ts                color estable por obra
  fechas.ts               «hace 2 h», «ayer» — puro, usable desde cliente
  sesion.ts               server-only: cookies y llamadas con sesión
  perfil.ts               cuenta, colecciones, historial, «seguir viendo»
  comentarios.ts          lectura de la conversación
  valoraciones.ts         nota de la comunidad
  notificaciones.ts       campana y lista
  cuenta.ts               sesiones activas y tipos de seguridad
  acciones.ts             escrituras del catálogo y de la cuenta
  acciones-cuenta.ts      escrituras de credenciales
  reproducir.ts           server-only: resolución de embeds
proxy.ts                  middleware de Next 16: refresco de token
docs/                     esta documentación
```

## El marco

Todo lo que cuelga de `app/(marco)/` comparte un layout que se monta **una sola vez**:
riel lateral de 48px, barra superior de 48px y un contenedor con scroll propio.

La consecuencia que condiciona el resto: **la ventana no se desplaza**. El contenedor
exterior mide el alto de la pantalla y recorta; el que se desplaza es `#panel`. Por eso el
riel y la barra se quedan quietos sin `position: sticky`, y por eso cualquier cosa que lea
la posición del scroll tiene que mirar ese elemento y no `window`.

`/acceder` y `/registro` quedan fuera del grupo: son pantallas de una sola tarea.

## Cómo se renderiza cada ruta

Todas van **bajo demanda**: el marco lee la sesión en cada petición, así que ninguna página
del grupo se puede prerenderizar. Lo que sí se cachea son las llamadas al catálogo, con el
`revalidate` que pone `lib/api.ts` (una hora para catálogo e info, quince minutos para los
enlaces de episodio, cinco para la búsqueda).

| Ruta | Qué pide | Caché |
|---|---|---|
| `/` | Catálogo + ficha de las 6 destacadas + historial | Catálogo 1 h; el historial nunca |
| `/serie/[id]` | Ficha, nota, comentarios, recomendaciones | Ficha 1 h; nota y comentarios nunca |
| `/explorar` | Catálogo entero de animeav1, paginado | 1 h |
| `/ver/...` | Ficha + enlaces del episodio | Enlaces 15 min |
| `/mi-lista`, `/cuenta`, `/notificaciones` | Solo la cuenta | Nunca |
| `/laboratorio`, `/emision`, `/manga` | Nada | — |
| `/api/*` | Proxy | Nunca |

`/mi-lista` ya no resuelve cada serie contra el catálogo: favoritos, watchlist e historial
traen el título y la imagen incrustados, que eran veinte llamadas por pantalla.

## Servidor frente a cliente

La regla es: **componente de servidor salvo que haya un motivo concreto**. Los que llevan
`'use client'` y por qué:

- **`RielLateral`** — solo por `usePathname`, para marcar el destino activo
- **`BarraSuperior`**, **`BarraInferior`** — historial del navegador y ruta actual
- **`PaletaBuscador`** — escribir y ver resultados es interacción pura
- **`CarruselDestacado`** — índice, avance automático y carga diferida del tráiler
- **`Riel`** — las flechas necesitan medir cuánto queda por desplazar
- **`Reproductor`**, **`ControlesVideo`**, **`VideoConHls`** — medios
- **`Comentario`**, **`FormularioComentario`**, **`NotaComunidad`**, los cuatro de
  `Ajustes*`, **`BotonFavorito`**, **`BotonQuitar`**, **`VaciarHistorial`**,
  **`MarcarLeidas`**, **`BorrarCuenta`** — envuelven una acción de servidor y tienen que
  enseñar el estado de espera y el error
- **`PreferenciaHora`** — guarda la preferencia en el navegador

Todo lo demás se renderiza en el servidor y no envía JavaScript.

### La regla de `server-only`

`lib/sesion.ts` lleva `server-only`. **Un módulo que lo importe no puede exportar nada que
un componente de cliente vaya a querer**: el build se cae con un rastro de importaciones
largo y poco obvio.

Por eso `haceCuanto` y `grupoDeDia` viven en `lib/fechas.ts` —cálculo puro— y por eso
`enCurso` está en `lib/perfil.ts` y no en `lib/catalogo.ts`, que lo importa el buscador.

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
