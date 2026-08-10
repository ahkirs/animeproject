# Componentes

Los de `components/`. Los marcados **cliente** envían JavaScript al navegador; el resto se
renderiza en el servidor.

Para verlos pintados: **`/laboratorio`**.

## El marco

Lo monta `app/(marco)/layout.tsx` una sola vez, y todas las páginas del grupo van dentro.
La consecuencia que hay que tener presente todo el rato: **la ventana no se desplaza**. El
contenedor exterior mide el alto de la pantalla y recorta; el que se desplaza es `#panel`.
Cualquier cosa que lea la posición del scroll tiene que mirar ese elemento, no `window`.

**`RielLateral.tsx`** — *cliente*. La columna de 48px de la izquierda. Cliente solo por
`usePathname`, para marcar el destino activo; la sesión se la pasa el layout ya resuelta.
Desaparece por debajo de 768px. **No puede llevar `overflow: hidden`**: las etiquetas
emergentes salen fuera de sus 48px.

**`BarraSuperior.tsx`** — *cliente*. Tres zonas de ancho fijo para que el buscador quede
centrado respecto a la ventana y no respecto a lo que le dejen los vecinos. Lleva los dos
cheurones de historial y la campana con su punto de no leídas.

**`BarraInferior.tsx`** — *cliente*. La navegación en móvil. Recibe la misma lista de
destinos que el riel: dos navegaciones que no coincidan son dos navegaciones que mantener.

**`PaletaBuscador.tsx`** — *cliente*. El buscador, ahora como diálogo con `Ctrl/⌘+K` y `/`.
Conserva la lógica del campo anterior: espera de 300 ms, `/api/buscar`, flechas y Enter.

**`Consejo.tsx`** — Etiqueta emergente en CSS puro, sin estado ni portal. No sustituye al
`aria-label` del elemento que envuelve: por eso va `aria-hidden`.

**`Marca.tsx`** — El logotipo. Con `soloIcono` cabe en el riel.

**`MenuUsuario.tsx`** — *cliente*. El avatar y su menú, con teclado resuelto (Escape,
flechas, Inicio/Fin). `direccion` decide hacia dónde se despliega: al pie del riel sale
hacia arriba y a la derecha.

**`Pie.tsx`** — Va al final del panel con scroll, así que sale en todas las páginas del
grupo sin que ninguna lo monte.

**`MarcoCuenta.tsx`** — Marco de `/acceder` y `/registro`, que quedan **fuera** del grupo:
a sangre y sin navegación, porque en ellas no hay nada más que hacer que entrar.

## Catálogo

**`Lamina.tsx`** — Carátulas y fotogramas SVG de reserva. Si `arte` empieza por `http` pinta
la imagen; si no, una de las trece láminas dibujadas.

**`FichaSerie.tsx`** — La tarjeta de una obra. **Ancho fijo** (140 / 160 / 180px), no
fluido: en un riel, las columnas elásticas hacen que cada fila tenga tarjetas de un tamaño
distinto según cuántas quepan. Exporta también `Cartel`, el marco suelto de una carátula.

**`Riel.tsx`** — *cliente*. El carril horizontal. Cliente por las flechas, que existen
porque la barra de desplazamiento está oculta; se esconden solas cuando no queda nada hacia
ese lado, así que nunca hay un botón que no haga nada.

**`FilaPortada.tsx`** — Una fila entera. La forma la decide `lib/portada.ts`, no el
componente. Incluye la variante numerada.

**`CarruselDestacado.tsx`** — *cliente*. El destacado. Carga el tráiler con retraso y solo
si la obra lo tiene: primero entra la imagen, que es instantánea. Con
`prefers-reduced-motion` no se carga nunca y no hay avance automático.

**`TituloSeccion.tsx`**, **`FranjaPromo.tsx`**, **`Datos.tsx`**, **`Esqueleto.tsx`** — Cabeza
de sección, franja que corta la pila de filas, línea de metadatos y esqueletos de carga.

## Interacción con la cuenta

Todos son *cliente* y todos envuelven una acción de servidor que devuelve `{ok, error}`.

**`BotonFavorito.tsx`** — Guarda en favoritos o en «ver después» según el icono que reciba.
Con `compacto` es el botón de la esquina de una tarjeta.

**`BotonQuitar.tsx`**, **`VaciarHistorial.tsx`** — Quitar una entrada y vaciar el historial,
con confirmación en línea.

**`Comentarios.tsx`** — *servidor*. La conversación de una obra o de un episodio: pide los
datos y compone. **`Comentario.tsx`** — *cliente*. Uno solo, con «me gusta» optimista,
responder, editar y borrar. **`FormularioComentario.tsx`** — *cliente*. Sirve para publicar
y para responder: lo único que cambia es si lleva `parentId`.

**`NotaComunidad.tsx`** — *cliente*. Diez botones, no cinco estrellas: el backend guarda de
1 a 10, y una escala de estrellas con medias obliga a traducir entre lo que se pulsa y lo
que se guarda.

**`MarcarLeidas.tsx`** — *cliente*. Marca todas las notificaciones.

**`AjustesPerfil.tsx`**, **`AjustesSeguridad.tsx`** (contraseña, correo y doble factor),
**`AjustesSesiones.tsx`**, **`BorrarCuenta.tsx`** — *cliente*. Las cuatro piezas de
`/cuenta`. El QR del 2FA lo genera el backend y llega como data URL: no hace falta ninguna
librería de códigos.

**`FormularioSesion.tsx`** — *cliente*. Entrar y registrarse.

## Reproductor

**`Reproductor.tsx`** — *cliente*. Elige variante de audio y servidor, resuelve los embeds
que se pueden resolver, cae a `<iframe>` con los que no y cambia de servidor solo cuando uno
falla.

**`ControlesVideo.tsx`** — *cliente*. El mando: línea de tiempo, volumen, calidad,
velocidad, PiP, pantalla completa y atajos de teclado. **Además guarda el progreso**: cada
quince segundos mientras corre, y al pausar, al terminar, al salir de la página y al
desmontar. Es lo que hace real el historial y la fila de «Seguir viendo».

**`VideoConHls.tsx`** — *cliente*. Carga `hls.js` solo cuando hace falta.

## Comunes

**`Boton.tsx`** — `Boton`, `BotonEnlace`, `BotonIcono` y `EnlaceIcono`. Tres variantes
(`primario`, `secundario`, `fantasma`) declaradas en un mapa, no en cada llamada.

**`Campo.tsx`** — Etiqueta, campo, ayuda y error, conectados con `aria-describedby`.

**`Icono.tsx`** — Los 41 iconos, dibujados a trazo 1,8. Exporta `NombreIcono`.

**`Pronto.tsx`**, **`NoEncontrado.tsx`** — Los dos estados vacíos con nombre: «esto todavía
no existe» y el 404.

**`PreferenciaHora.tsx`** — *cliente*. Contexto de zona horaria con persistencia local.
