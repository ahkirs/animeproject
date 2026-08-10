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

## El acento pasa de ámbar a granate

El ámbar `#ffb03a` se sustituyó por un granate `#52050a`. La decisión es de gusto y vino
del encargo, no de un problema con el ámbar.

Lo que sí obligó a algo el color elegido es el contraste. `#52050a` contra el fondo
`sala-900` da **1,3:1**: como campo grande con tinta clara encima se lee de sobra —13:1—,
pero como forma no se despega del fondo, y en un filete de 3px o en una cifra pequeña
directamente no existe. El ámbar no tenía este problema porque era claro.

Así que el acento pasó de ser un token a ser dos registros del mismo color:

- `granate` (`#52050a`) es **campo**. Botones, chapas, pestaña activa, selección de texto.
  Siempre con `granate-tinta` encima y **filete de `granate-vivo`**, que es lo que le da
  forma al botón: sin borde es texto flotando sobre el fondo.
- `granate-vivo` (`#ee2b4a`) es **trazo**. Filetes de sección, anillo de foco, barras de
  progreso, cifras, iconos, el interruptor de encadenar. Llega a 4,8:1, que es lo que pide
  el texto pequeño.

No son dos acentos —la regla 1 del sistema visual sigue en pie—, son el mismo acento en
dos registros. La regla práctica está en [sistema-visual.md](sistema-visual.md).

Queda un cabo suelto: `--color-rojo` (`#e0453a`), el color de error y de las acciones
destructivas, ahora está a un paso del acento de marca. Se dejó como estaba porque cambiar
la semántica de error es una decisión aparte, pero si un día un mensaje de error se
confunde con un botón, **lo que hay que mover es el rojo de error, no el acento**.

## El campo primario pasa a blanco, y las chapas al color de la obra

Corrección de lo anterior, a los dos días. El acento granate se quedó, pero se retiró de
donde no funcionaba.

**Los botones y los estados seleccionados van en blanco con tinta negra.** El granate como
campo de botón necesitaba un filete de `granate-vivo` para tener forma —solo, no se
despegaba del fondo—, y ese borde rojo acabó siendo ruido en cuanto había dos o tres
controles juntos. `bg-hueso` + `text-sala-900` se despega sin ayuda. El acento sigue
siendo rojo, pero en el registro de trazo: filetes de sección, foco, progreso, cifras,
iconos, el logo.

**Las chapas de la ficha toman el color de la obra**, como en la referencia. Ahí el color
sale del `coverImage.color` de AniList; nuestro scraper no lo da, así que `colorDeObra()`
lo deriva del id. No es el color del arte y no hay que contarlo como si lo fuera, pero
cumple lo que se le pide —uno por obra, siempre el mismo, sin una petición de más— y el
día que el backend publique el dominante se sustituye el valor sin tocar nada más.

La saturación y la luminosidad van fijas (S=80%, L=72%) y eso no es estético: es lo que
garantiza más de 6:1 contra la tinta negra en cualquier tono. Bajar la L rompe las chapas
de los azules, que son los que menos luz tienen a igualdad de luminosidad.

## Reconstruida la web entera sobre un app shell

Cambio de raíz, no de piel. El punto de partida era una referencia externa de la que solo
sobrevivía el CSS compilado: ni componentes, ni datos, ni fuentes. Así que no se importó
nada — se reconstruyó el patrón leyendo ese CSS y el marcado.

Lo que se adopta es la **arquitectura**: riel lateral fijo de 48px, barra superior de 48px
con el buscador centrado, y el contenido con scroll propio dentro. Lo que se conserva es
todo lo nuestro: la marca, los 41 iconos dibujados y el código en español.

La decisión con más consecuencias es que **la ventana deja de desplazarse**. El marco mide
el alto de la pantalla y recorta; el que se desplaza es `#panel`. A cambio, el riel y la
barra se quedan quietos sin `position: sticky` ni peleas de `z-index`, y cada página deja
de montar su propia cabecera y su propio pie: once repeticiones que pasan a declararse una
vez en `app/(marco)/layout.tsx`.

`/acceder` y `/registro` quedan fuera del grupo a propósito. Son pantallas de una sola
tarea, y una navegación completa solo invita a irse a otro sitio.

## Sustituida la paleta cálida por una neutra con acento naranja

Se va «Sala Oscura» entera: el negro cálido, el granate de butaca, el grano de proyección,
el viñeteado y las dos sombras. Entra un gris neutro frío en cuatro escalones y un solo
naranja.

La regla que gobierna el sistema nuevo: **la profundidad la da la luminosidad, nunca una
sombra**. No queda ni una sombra de elevación. Y el marco va **más claro** que el
contenido, que es lo que hace que el panel parezca hundido sin dibujarle un borde.

De paso se retiran las escalas propias `--text-paso-0..6` y `--spacing-e1..e6`. Eran una
capa de indirección sobre la misma base de 4px de Tailwind y obligaban a traducir cada
medida mentalmente. Karla (variable, 200–800) sustituye a Archivo Black, que al ser una
display de un solo peso no servía para un título de sección y rompía la jerarquía por el
medio.

El riesgo de este cambio estaba localizado: las clases de Tailwind son cadenas, así que
`tsc` no ve un `bg-sala-800` olvidado —se renderiza transparente y en silencio—. Por eso
la verificación incluye un grep a cero coincidencias, y no solo el build.

## Estrenados los endpoints que llevaban tiempo construidos

Al sondear el backend para adaptar el diseño aparecieron **50 rutas, de las que la web
usaba menos de la mitad**. No era una lista de deseos: estaban implementadas y
respondiendo.

Se conectan comentarios (con respuestas anidadas, «me gusta» y reportes), notas de la
comunidad, notificaciones y una página de cuenta de verdad — contraseña, correo, doble
factor con TOTP y sesiones abiertas revocables. Donde antes había dos botones
desactivados y un comentario diciendo qué endpoint había detrás.

También se descubrió que `GET /anime/info` devuelve bastante más de lo que declaraba
`api-types.ts`: `backdrop`, `trailer`, `malId` y **`relations`**. De ahí salen el tráiler
del destacado y la sección «Relacionadas», que sustituye a la pestaña de reparto — esa se
queda vacía y explicando por qué, porque `characters` no existe y nunca existió: estaba
deducido.

El OpenAPI real está en `/api/docs/swagger-ui-init.js`. Los `/api/docs-json` de costumbre
dan 404, y eso costó un rato encontrarlo.

## Arreglados dos fallos que el rediseño destapó

**Los favoritos no funcionaban.** `guardarEnFavoritos` mandaba `{ animeId }` porque el
cuerpo se había deducido en vez de leerlo; el esquema exige además `title`. El backend
rechazaba **todas** las altas. La estrella llevaba tiempo sin guardar nada.

**El progreso no se guardaba nunca.** `POST /user/history` existía desde el principio y no
lo llamaba nadie, así que el historial estaba siempre vacío. Por eso `EN_CURSO` era un
array escrito a mano: «Seguir viendo» era una maqueta con obras reales dentro, que es la
peor clase de maqueta porque no se distingue de lo que funciona.

Ahora lo llama `ControlesVideo` cada quince segundos mientras corre el vídeo, y además al
pausar, al terminar, al salir de la página y al desmontar. Los tres remates importan:
cerrar la pestaña a los diez segundos de un guardado perdía justo el trozo por el que se
quiere volver.

Con eso se van también `MI_LISTA`, `USUARIO` y `ESTADOS_LISTA` de `lib/catalogo.ts`, y de
`lib/types.ts` los tipos `EntradaLista` y `EstadoLista`: describían un modelo —«viendo»,
«en pausa», «abandonada»— que la base de datos no puede almacenar, y un tipo que describe
lo que no existe termina obligando a inventarse los datos.

## Separadas las funciones puras de los módulos con `server-only`

Dos veces seguidas falló el build por lo mismo: un componente de cliente importaba algo
inocente —`haceCuanto`, `minimoParaBuscar`— de un módulo que acababa arrastrando
`lib/sesion.ts`, que lleva `server-only`, al paquete del navegador.

Las fechas relativas se van a `lib/fechas.ts`, que es cálculo puro sobre una cadena ISO y
puede usarse desde los dos lados. Y `enCurso` se va de `catalogo.ts` a `perfil.ts`, que es
donde pertenecía: lee el historial, no el catálogo.

La regla que queda: **un módulo que importe `lib/sesion.ts` no puede exportar nada que un
componente de cliente vaya a querer**. Si hace falta compartirlo, se saca a su propio
archivo.
