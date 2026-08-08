# Registro de decisiones

Qué se decidió, por qué, y qué se descartó. Sirve sobre todo para no volver a discutir lo
mismo dentro de tres meses.

## Dirección de arte: Sala Oscura

Se exploraron cuatro direcciones completas antes de elegir. Las descartadas siguen en
`docs/`: editorial japonés, videoclub VHS y brutalismo neón. Existe además una guía
comparativa de diez sistemas de interfaz con paletas y tokens, por si hiciera falta
reconsiderar.

Se eligió Sala Oscura porque organiza el catálogo por **emisión** en lugar de por
novedades, que es la pregunta real de quien sigue anime semanal.

## De HTML estático a Next.js

La maqueta original eran tres archivos HTML con un CSS compartido. Se migró por tres
razones concretas: la cabecera, el pie y los sprites SVG estaban copiados literalmente en
los tres archivos; el catálogo vivía dentro del marcado y repetido entre páginas; y añadir
una cuarta página significaba copiar seiscientas líneas.

Se eligió Next.js sobre una SPA de Vite porque **un catálogo necesita renderizado en
servidor para ser indexable**, y el tráfico natural de un agregador es gente buscando el
nombre de una serie.

El original se conservó en `docs/00-maqueta-html/` para poder comparar que la migración no
cambiara el aspecto.

## Tokens en `@theme` en vez de traducirlos a mano

Tailwind 4 sustituyó `tailwind.config.js` por configuración en CSS. Los cuarenta tokens del
sistema se declararon con los mismos valores hexadecimales y Tailwind genera las utilidades
a partir de ellos. Nadie reinterpretó el diseño en el camino.

## Filtros en la URL, no en estado de React

En `/explorar` y `/mi-lista`. Hace los resultados compartibles y guardables, funciona sin
JavaScript porque los controles son enlaces, y cuando el catálogo venga de una API filtrar
en servidor será lo correcto.

## Instantes UTC en la parrilla

La hora se guardaba como la cadena `'21:00'`. No servía: una cadena suelta no dice a qué
zona pertenece, así que no se puede convertir a nada. Se cambió a instantes UTC, de los que
se derivan el día, las horas y la cuenta atrás.

**Los días agrupan por la emisión japonesa** aunque cambies de huso. Un episodio de las
00:30 del sábado en Japón cae en viernes por la noche en España; si se agrupara por hora
local, la parrilla dejaría de coincidir con la de cualquier otro sitio de anime y con lo
que publican los estudios. Cambia la hora, no el día de estreno.

## El selector de zona horaria perdió la opción de Japón

Empezó con tres opciones: tu hora, Japón y UTC. Se quitó Japón por petición, y con ello
UTC pasó a ser lo que renderiza el servidor, porque hace falta un valor que servidor y
navegador calculen igual. Japón sigue usándose por dentro para agrupar los días.

## La portada muestra solo hoy

La franja semanal mostraba cinco emisiones de toda la semana, que era una versión reducida
de `/emision` y competía con ella. Ahora la portada responde solo a «qué sale hoy» y el
enlace lleva a la semana entera. Cada página tiene un trabajo distinto.

Se valoró sustituir la sección por un botón que llevara a `/emision`, y se descartó: un
botón que dice «ve a ver la parrilla» no le da nada al visitante, y las portadas se ganan
el sitio mostrando, no señalando.

## Capas de atmósfera: dos de tres

Se probaron tres en `/laboratorio`. Se quedaron el **grano de proyección** y el
**viñeteado**. Se descartó la **luz de proyector** por preferencia.

Vale la pena anotar el efecto secundario: esa capa era lo único que justificaba el ámbar
dentro de la metáfora —la lámpara de la sala—. Sin ella, el ámbar vuelve a ser un color de
acento elegido sin más. Funciona igual, pero si algún día se quiere recuperar esa idea,
tendrá que ser por otra vía.

## Mascota descartada como marca

Se planteó usar un personaje de anime como identidad. Se descartó por tres motivos: una
ilustración de personaje necesita un ilustrador de verdad, y una mal dibujada hace más daño
que ninguna; **a 16 píxeles, el tamaño de la pestaña del navegador, una cara se convierte
en una mancha**, así que haría falta igualmente una marca simple; y un personaje propio
compite con las carátulas, que es justo lo contrario de la tesis del diseño.

En `/laboratorio` hay una silueta a cuatro tamaños que muestra el problema.

## Estilo de los mensajes de commit

Se cambió de imperativo a participio: «Añadida la página», no «Añade la página». El
imperativo es la convención de git, pero es una herencia del inglés donde *Add* y *Added*
se distinguen bien; en español «Añade» es ambiguo entre imperativo y tercera persona. Los
tres primeros commits del proyecto se quedaron en el estilo viejo.

## El catálogo viene de una API de scraper

Se descartó montar un scraper propio y en su lugar se consume una API de agregación ya
desplegada (Railway) que expone catálogo, ficha, búsqueda y enlaces de reproducción de
varios proveedores. Los motivos:

- **El catálogo real era el siguiente paso inevitable.** Nueve series inventadas hacían que
  todo lo demás pareciera vacío y no se pudiera evaluar.
- **No vale la pena el scraper propio.** Mantener dos o tres extractores, actualizarlos
  cuando cambian los sitios y hospedarlos es mucho trabajo para nada nuevo: la API ya lo
  hace.
- **La interfaz no se entera del cambio.** `lib/catalogo.ts` estaba construido como costura
  precisamente para esto: se sustituyeron las constantes por peticiones y TypeScript
  señaló cada página que había que adaptar.

El acceso se hace desde el servidor y con revalidación (una hora de catálogo), de modo que
las páginas no martillean la API y siguen siendo indexables.

## Reproductor híbrido: resolver embeds a directa cuando el host lo permite

El reproductor usa un `<video>` propio cuando el host publica el archivo de forma resoluble:
el servidor raspa/descifra el embed (`/api/reproducir`) y el proxy `/api/stream` lo sirve con
el Referer que el CDN exige (patrón tokianime). Esto da un reproductor con mandos propios,
seek y sin depender de que el iframe del host funcione.

Hoy se resuelven tres hosts:
- **mp4upload** — su embed HTML contiene la URL del `.mp4`.
- **UPNShare** — su API `/api/v1/download` devuelve el `.mp4` cifrado en AES-CBC; se
  descifra con la clave/IV que el bundle del sitio deriva de su `location` (hoy constantes).
- **Zilla (HLS)** — la SPA de `player.zilla-networks.com/play/<token>` monta JWPlayer con
  `file = https://player.zilla-networks.com/m3u8/<token>`; ese m3u8 es la directa. El CDN
  exige cabeceras `Origin` + `Sec-Fetch-*` para servir m3u8 y segmentos, y sus segmentos
  son fMP4 con nombre `.html`. `/api/stream` inyecta esas cabeceras y reescribe las URLs
  de los segmentos dentro del m3u8 para que hls.js los pida a través de nuestro proxy
  (si el navegador pidiera `player.zilla-networks.com` directo, respondería 403). En el
  cliente, `VideoConHls` reproduce los `.m3u8` con hls.js en Chrome/Firefox y nativo en
  Safari.

Los hosts que no se pueden resolver se incrustan en `<iframe>`. El sitio **no aloja ni
descarga vídeo**: el proxy solo reenvía el stream del proveedor al navegador. Esta
resolución es frágil por naturaleza —si un host cambia su esquema, ese servidor vuelve a
iframe sin romper el resto.

## Deduplicación por título, no por URL

animeav1 y animeflv tienen la misma obra con urls distintas. Antes de pintar nada, los
resultados de ambos se agrupan por título normalizado: el primero queda como principal y el
resto como `alternativas` («También en…» en la ficha). Sin esto, el catálogo mostraría
cada serie dos veces.

## La parrilla se queda fuera de la primera fase

El scraper no publica horarios de emisión, así que la página `/emision` y la sección de la
portada quedaron fuera hasta que haya una fuente que los dé. AniList y MAL publican
`emitidoUtc`, que es exactamente el formato que ya usa el modelo (`Programacion`), así que
entran sin tocar la estructura.

## Backend de scraping descartado

Se evaluó un backend propio que agregaba varios sitios de streaming pirata y exponía
endpoints para resolver embeds a URL directas y descargar episodios al servidor. **No se
integró.**

El motivo es que distribuir episodios con derechos sin licencia es infracción, y saltarse
el reproductor del host lo agrava. Con el repositorio público y bajo un nombre real, y el
backend en un proveedor comercial, el riesgo recae sobre el autor del proyecto.

En la práctica esto se resolvió consumiendo una API de terceros ya existente (metadatos y
enlaces de los proveedores) e incrustando el reproductor del proveedor, sin descargar ni
resolver vídeo por nuestra cuenta.
