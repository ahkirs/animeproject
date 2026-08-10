# Estado del proyecto

Qué funciona de verdad, qué falta y qué no se puede hacer todavía. Actualizado tras la
reconstrucción sobre el app shell.

## Funciona

- **El marco.** Riel lateral fijo, barra superior con buscador centrado (`Ctrl/⌘+K`),
  campana con punto de no leídas, y barra inferior en móvil. Montado una sola vez en
  `app/(marco)/layout.tsx`; la ventana no se desplaza, lo hace `#panel`
- **Catálogo real por API.** Portada, `/explorar` y búsqueda se alimentan del scraper,
  deduplicando las obras que están en varios proveedores
- **Destacado con tráiler.** `GET /anime/info` devuelve `trailer` y `backdrop`. El vídeo
  entra con retraso y solo si la obra lo tiene; con `prefers-reduced-motion` no se carga
- **Ficha de serie** con relaciones reales (precuelas, secuelas, películas), nota de la
  comunidad, comentarios, episodios y recomendaciones
- **Reproductor** con selector de audio y de servidor, resolución de embeds y respaldo a
  `<iframe>`. No aloja ni descarga vídeo
- **El progreso se guarda.** `ControlesVideo` llama a `POST /user/history` cada quince
  segundos y en los cuatro remates (pausa, fin, salida de página, desmontaje). De ahí sale
  el historial y la fila de «Seguir viendo», que ya no es una maqueta
- **Comentarios** por obra y por episodio, con respuestas anidadas, «me gusta» optimista,
  edición, borrado y reporte
- **Notas de la comunidad** del 1 al 10, con media, recuento y tu propia nota
- **Notificaciones** paginadas, con «marcar todas como leídas»
- **Cuenta completa**: perfil editable, cambio de contraseña y de correo, doble factor con
  QR, sesiones abiertas revocables una a una, y baja con doble confirmación
- **Favoritos y ver después**, ya con el cuerpo que el backend espera
- **404 propio**, en la raíz y dentro del marco. Antes salía el de Next y rompía el diseño
  entero — era la pantalla más vista sin haberla diseñado nunca
- **`/laboratorio`** como galería del sistema visual: sirve para cazar la pieza que se
  queda descolgada de un cambio de tokens

## Maquetado a propósito

- **`/emision`** y **`/manga`**. Están en el riel y explican qué falta y de quién depende,
  en vez de un «próximamente» que no informa de nada
- **La pestaña «Reparto»** de la ficha. `characters` no existe en la API y nunca existió:
  el tipo estaba deducido

## No se puede hacer todavía (falta backend)

- **Calendario de emisión.** No hay endpoint que diga qué día y a qué hora sale cada
  episodio. `status` solo dice si una obra está en emisión, no cuándo
- **Manga.** No hay catálogo, ni capítulos, ni páginas
- **Reparto y personajes**
- **Borrado en bloque del historial.** Solo existe `DELETE /user/history/{episodeId}`, así
  que vaciar va de diez en diez y avisa de cuántos quedaron sin borrar. Si la lista crece,
  merece la pena pedir un `DELETE /user/history`
- **`/v1/anime/trending`** existe y devuelve el ranking de uso real, pero hoy está casi
  vacío (`title: ""`, una entrada). Servirá cuando haya tráfico; mientras tanto la portada
  se nutre del catálogo

## Cabos sueltos conocidos

- **La forma de un comentario está deducida.** `GET /comments` está confirmado y devuelve
  `{items, page, limit, total, totalPages}`, pero hoy no hay ni un comentario publicado en
  producción, así que los nombres de campo de cada fila salen del cuerpo del POST. El mapeo
  acepta varios alias por campo; hay que contrastarlo en cuanto haya datos reales
- **`twoFactorEnabled`** va opcional en `PerfilUsuario`: el backend no documenta el esquema
  de `/user/profile`. Si el campo se llama de otra forma, la página de cuenta enseña el 2FA
  como apagado
- **La paginación de comentarios** dice cuántos quedan fuera en vez de paginar. Se hará
  cuando haya volumen que paginar
- **`search` y `catalog` devuelven `score`, `status`, `year` y `backdrop` siempre a nulo.**
  Las píldoras de las tarjetas solo se pueden rellenar pidiendo `/info` obra por obra, que
  es lo que hace `tendencias(limite, conFicha)` con las primeras. **No ampliar ese patrón**
  sin medirlo: la API ya devuelve 429 con cierta facilidad
- **Los móviles no se han probado en un dispositivo real**, solo a 390px en el navegador
- **`KUROBA` sigue siendo provisional** como nombre. Vive en `components/Marca.tsx` y en los
  metadatos de `app/layout.tsx`

## Sin verificar en navegador

La reconstrucción compila y pasa el `typecheck`, pero hay cosas que solo se ven corriendo:

1. Que ningún `position: fixed` del reproductor (menús de calidad y velocidad) quede
   atrapado por el contenedor con scroll
2. Pantalla completa entrando y saliendo
3. El ciclo completo de comentarios, notas, notificaciones y 2FA contra el backend real
4. Que el tráiler de YouTube cargue y se detenga como debe
