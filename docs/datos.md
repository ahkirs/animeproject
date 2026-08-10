# Datos

## La idea central: `lib/catalogo.ts` es una costura

Todo el acceso a datos pasa por ese archivo. Las páginas **nunca** filtran, ordenan ni
buscan por su cuenta: llaman a una función y reciben el resultado ya resuelto.

`lib/types.ts` define las formas del modelo propio (Serie, Temporada, Episodio…). Son el
contrato de la interfaz, y no tienen por qué coincidir con lo que devuelve el scraper:
`lib/catalogo.ts` traduce de un lado al otro.

## La API

El catálogo viene de un scraper desplegado en Railway, en
`lib/api.ts` (`API_BASE`, configurable con la variable de entorno `API_BASE`). El cliente
de esa API es el **único archivo que habla con la red**; el resto del catálogo consume
`lib/catalogo.ts` y no se entera de dónde salen los datos.

La fuente de verdad de los tipos crudos (`ApiResultado`, `ApiAnimeInfo`,
`ApiEnlacesEpisodio`…) es el OpenAPI del backend; están copiados en `lib/api-types.ts`.
Los campos no son los del modelo propio: son los que llegan por red.

> **Dónde está el OpenAPI.** En `/api/docs/swagger-ui-init.js`, dentro de la clave
> `swaggerDoc`. Los `/api/docs-json`, `/api-json` y demás de costumbre devuelven **404**.
> Anotado aquí porque encontrarlo cuesta un rato y es lo único que evita deducir formas.

### Lo que la API da y lo que no

Dos cosas condicionan el diseño entero y conviene tenerlas delante:

**`search` y `catalog` devuelven `score`, `status`, `year` y `backdrop` SIEMPRE a nulo.**
Solo llegan `id`, `title`, `image`, `type` y `url`. Las píldoras de estado y de número de
episodios no se pueden pintar desde una lista: hacen falta llamadas a `/anime/info` una por
obra. `tendencias(limite, conFicha)` ya resuelve eso pidiendo ficha solo de las primeras N.
**No ampliar ese patrón sin medir**: la API devuelve 429 con facilidad.

**`/anime/info` da bastante más de lo que parecía.** Además de la sinopsis y los episodios:
`backdrop`, `trailer`, `score`/`votes`, `startDate`/`endDate`, `malId` y **`relations`** (29
entradas en One Piece). De ahí salen el tráiler del destacado y la sección «Relacionadas».

Lo que **no** existe: `characters` —el tipo `ApiPersonaje` estaba deducido y se ha
borrado—, calendario de emisión, manga y música.

El código `type` de una relación no está documentado; se ha deducido comparando fichas
conocidas y solo se etiquetan los dos seguros (1 = precuela, 2 = secuela). El resto cae en
un rótulo genérico antes que llamar «secuela» a una película. Está explicado en
`ApiRelacion`.

### Más allá del catálogo

Solo `/anime/*` cuelga de `/v1`. La cuenta, la autenticación, los comentarios, las notas y
las notificaciones van directos bajo `/api` — de ahí `API_CUENTA` en `lib/api.ts`.

| Módulo | Rutas | Dónde vive |
|---|---|---|
| Cuenta | `/user/profile`, `/user/favorites`, `/user/watchlist`, `/user/history` | `lib/perfil.ts` |
| Seguridad | `/user/change-password`, `/user/email`, `/user/2fa/*`, `/user/sessions` | `lib/cuenta.ts` + `lib/acciones-cuenta.ts` |
| Comentarios | `/comments` (+ `/like`, `/report`) | `lib/comentarios.ts` |
| Notas | `/ratings` | `lib/valoraciones.ts` |
| Notificaciones | `/notifications` | `lib/notificaciones.ts` |

Todas las **escrituras** son Server Actions y viven en `lib/acciones.ts` (catálogo y
cuenta) o `lib/acciones-cuenta.ts` (credenciales). Las **lecturas** viven en los módulos de
arriba. La separación no es cosmética: un archivo con `use server` solo puede exportar
funciones asíncronas, así que los tipos tienen que estar en otro sitio.

### La regla de `server-only`

`lib/sesion.ts` lleva `server-only`. **Un módulo que lo importe no puede exportar nada que
un componente de cliente vaya a querer**, o el build se cae con un rastro de importaciones
largo y poco obvio.

Por eso las fechas relativas (`haceCuanto`, `grupoDeDia`) viven en `lib/fechas.ts`, que es
cálculo puro, y por eso `enCurso` está en `lib/perfil.ts` y no en `lib/catalogo.ts`: este
último lo importa el buscador, que es de cliente.

Detalles de la costura:

- **Imágenes.** Las carátulas del proveedor no se sirven directas: pasan por
  `/anime/image-proxy` del scraper (`urlImagenProxy`), que las devuelve en nuestro dominio.
- **Deduplicación.** Los dos proveedores (animeav1 y animeflv) tienen la misma obra.
  `deduplicar` de `lib/ids.ts` agrupa por título normalizado y deja la primera como
  principal y el resto como `alternativas`.
- **Orden y filtros.** El scraper solo filtra por género y por página. Los cuatro órdenes
  de `/explorar` (nota, año, título, episodios) se aplican en `explorar()` con los datos
  que vengan; el filtro de estado se deriva en la página a partir de `estaEnEmision`.
- **Revalidación.** `lib/api.ts` pasa `revalidate` a `fetch`: una hora para catálogo e
  info, quince minutos para los enlaces de episodio, cinco para la búsqueda.

## Modelo

```
Serie
 ├─ identidad      id, titulo, tituloOriginal, anio
 ├─ catálogo       nota, votos, clasificacion, duracionMin, genero, generos
 ├─ textos         sinopsisCorta, sinopsis
 ├─ arte           lamina, panoramica
 ├─ url            en el proveedor; es lo que se pasa para pedir info y episodios
 ├─ proveedor      animeav1 | animeflv
 ├─ alternativas   SerieAlternativa[] (la misma obra en el otro proveedor)
 └─ temporadas     Temporada[]
                    └─ episodios  Episodio[]
                                   numero, titulo, sinopsis, duracionMin,
                                   estado, lamina, url
```

El scraper no agrupa por temporada: todos los episodios van en una sola, con la etiqueta
«Episodios». `EstadoEpisodio` hoy es siempre `disponible`; los estados `visto`, `en-curso`
y `bloqueado` existen en el modelo para cuando haya cuentas y progreso real.

La parrilla de emisión (`Programacion`, `emitidoUtc`) sigue definida en `lib/types.ts`
porque AniList/MAL la publican con ese formato, pero **la página `/emision` está oculta**
hasta que llegue esa fuente: el scraper no da horarios.

## Funciones disponibles

### Consulta

- `obtenerSerie(id)` — ficha completa de una serie (async; pide info al scraper)
- `obtenerTemporada(serie, numero?)` — la temporada pedida, o la primera
- `episodioDeEntrada(serie)` — por dónde entrar: el primer episodio disponible
- `rutaReproductor(serieId)` — URL del reproductor del primer episodio (async)
- `enlacesDeEpisodio(serie, numero)` — servidores de reproducción de un episodio (async)

### Catálogo y tendencias

- `tendencias(limite)` — primeras obras de los dos proveedores, deduplicadas. Las cuatro
  primeras se enriquecen con la ficha para tener sinopsis y nota
- `estaEnEmision(serie)`, `totalEpisodios(serie)`

### Explorar

- `explorar({ genero, orden })` — catálogo completo de los dos proveedores, deduplicado
  y ordenado
- `generosDisponibles()` — la lista de géneros que acepta el scraper (fija: los slugs no
  se pueden descubrir)
- `aniosDisponibles()` — vacío: el catálogo no publica años

### Búsqueda

- `buscarSeries(consulta, limite)` — por título, deduplicada
- `minimoParaBuscar(consulta)` — dos caracteres en alfabeto latino, uno en japonés

### Lista

- `miLista(estado?)`, `cuantasEnEstado(estado)`, `resumenLista()` — datos de ejemplo en
  el propio `lib/catalogo.ts` mientras no hay cuentas. Los `serieId` apuntan a obras
  reales del scraper para que la página se vea con contenido

## Cómo entra un cambio de API

1. Ajustar `lib/api-types.ts` y `lib/api.ts` al nuevo contrato.
2. Ajustar el mapeo en `lib/catalogo.ts`; TypeScript señala todo lo que se rompe en las
   páginas.

Nada más debería cambiar. Ese es todo el propósito de haberlo montado así.

## Contenido

Los títulos, sinopsis, carátulas y valoraciones vienen del scraper, no son sintéticos.
Las láminas SVG de `components/Lamina.tsx` quedan como reserva cuando el proveedor no
tiene imagen o para los fotogramas de episodio.
