# Estado del proyecto

Qué funciona de verdad, qué es maqueta y qué falta. Actualizado tras conectar el catálogo
a la API del scraper (Railway).

## Funciona

- **Catálogo real por API.** La portada, `/explorar` y la búsqueda se alimentan del scraper
  (animeav1 y animeflv), deduplicando las obras que están en ambos proveedores
- **Ficha de serie** con sinopsis, nota, géneros, carátula y lista de episodios reales
- **Reproductor** con los servidores que da el proveedor: selector de audio (subtitulada /
  doblada), selector de servidor y fallback cuando no hay enlaces. Los embeds de los hosts
  soportados (mp4upload, UPNShare, Zilla/HLS) se resuelven a la URL directa del vídeo en el
  servidor (`/api/reproducir`) y se reproducen en un `<video>` propio vía el proxy
  `/api/stream` — mp4 con `<video>` nativo, HLS con hls.js (`VideoConHls`); los demás se
  incrustan en un `<iframe>`. No aloja ni descarga vídeo
- **Explorar** con filtro por género y cuatro órdenes. Los parámetros inválidos se ignoran
  en vez de romper
- **Buscador** con resultados mientras se escribe, manejable con teclado y con mínimo
  adaptado a la escritura latina o japonesa
- **Estados de carga y error.** Cada ruta de datos tiene su esqueleto (`loading.tsx`) y hay
  una frontera de error compartida con botón de reintento
- **Navegación completa** entre las rutas activas, sin enlaces rotos
- **Accesibilidad básica**: enlaces de salto, foco visible, navegación por teclado,
  `prefers-reduced-motion` respetado en todo lo que se mueve

## Es maqueta

- **Las cuentas no existen.** `/acceder` y `/registro` son formularios que no envían nada
- **La lista no guarda.** Los datos están fijos en el código; marcar una serie no persiste
- **El filtro de estado** de `/explorar` se deriva de la serie (en emisión / completa), no
  del proveedor

## Falta

Por orden de lo que más cambiaría el proyecto.

**Parrilla de emisión.** La página `/emision` está oculta y sin enlazar porque el scraper
no publica horarios. Entra con AniList o MAL, que sí dan `emitidoUtc`. El modelo
(`Programacion`) ya está preparado para ello.

**Dónde ver cada serie.** Es la razón de existir de un agregador y no está en ninguna
parte. En qué plataformas legales está disponible, en qué región, con enlace. También
entra con AniList o MAL.

**Backend, cuentas y listas.** Lo que convierte «Mi lista» de maqueta en función.

**Página 404 propia.** Ahora es la de Next por defecto y rompe el diseño entero. Es lo
primero que ve quien llega por un enlace roto.

**Añadir a la lista desde la ficha.** El botón está dibujado pero no hay dónde guardar.

**Prueba en móvil.** Hay puntos de ruptura escritos, pero escritos no es lo mismo que
probados, y la mayoría del tráfico de un sitio así será móvil.

**Despliegue.** El proyecto solo existe en local. Conviene hacerlo antes de meter
autenticación, porque los proveedores de acceso necesitan una URL de retorno real.

**Licencia.** El repositorio no tiene ninguna. Sin ella, aunque el código sea visible,
legalmente nadie puede reutilizarlo.

**Integración continua** que ejecute `typecheck` y `build` en cada push.

## Deuda conocida

**El nombre de marca sigue siendo provisional.** `KUROBA` vive en `components/Cabecera.tsx`
y en el título de `app/layout.tsx`.

**El rendimiento del catálogo depende del scraper.** Cada ficha de serie pide la info a la
API, y `/mi-lista` pide cada serie una a una. Funciona, pero es lento cuando el scraper va
justo. El filtro de género además se aplica dos veces (API y cliente para el estado).

**Las láminas SVG comparten receta** —fondo, disco, siluetas— y en la rejilla se leen como
repetición. Se resuelve solo con las portadas reales del proveedor, así que no merece la
pena invertir ahí.

**El lateral de la ficha se queda corto** respecto a la lista de episodios, y abajo queda
un hueco vertical largo.

**Los mandos del reproductor son los nuestros** para los servidores resueltos (mp4upload,
UPNShare, Zilla) y los del proveedor para los que se incrustan en iframe. La resolución de
embeds depende de que el host no cambie su formato: el de UPNShare usa una clave/IV fijos
derivados de su `location`, el de mp4upload depende de la forma del HTML de su embed, y el
de Zilla exige cabeceras `Sec-Fetch`/`Origin` en `/api/stream` más la reescritura de las
URLs de sus segmentos dentro del m3u8. Si un host cambia, ese servidor vuelve a iframe sin
romper el resto.

**El ritmo del scroll de la portada es plano.** Varios bloques seguidos con la misma
densidad y el mismo tamaño de titular. Falta contraste, y falta un cierre.

**Grano y viñeteado están calibrados a ojo** sobre una sola pantalla. Pueden pasarse o
desaparecer en otras. Los números están en `app/globals.css` y `components/EfectosSala.tsx`.
