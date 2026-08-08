# Componentes

Los componentes en `components/`. Los que llevan **cliente** envían JavaScript al
navegador; el resto se renderiza en el servidor.

## Estructura de página

**`Cabecera.tsx`** — Cabecera pegajosa con degradado hacia el fondo, navegación (Inicio,
Explorar), buscador y avatar que lleva a la lista. Recibe `activa` para marcar la sección
actual. Exporta también `Marca`, el logotipo, reutilizado en el pie y en el reproductor.

**`Pie.tsx`** — Tres columnas de enlaces y el aviso legal. El aviso se puede cambiar con la
prop `aviso`, que usa el reproductor para explicar que incrusta el vídeo del proveedor.

**`MarcoCuenta.tsx`** — Marco compartido por `/acceder` y `/registro`: lámina panorámica
apagada al fondo y formulario centrado. Se sale del esqueleto de catálogo a propósito,
porque son pantallas de una sola tarea.

## Piezas de catálogo

**`Lamina.tsx`** — Carátulas y fotogramas SVG de reserva: seis carteles verticales, tres
panorámicas y cuatro miniaturas de episodio. Antes eran el único arte del proyecto; ahora
son el respaldo cuando el proveedor no tiene imagen.

**`FichaSerie.tsx`** — Tarjeta de serie para los rieles. Exporta también `Cartel`, el marco
de una carátula, que acepta proporción 2:3 o panorámica.

**`Riel.tsx`** — Carrusel horizontal con anclaje de desplazamiento. Sangra hasta el borde
de la ventana para que las tarjetas puedan salirse del margen al desplazarse.

**`Datos.tsx`** — La línea de metadatos separada por puntos: nota, año, episodios,
clasificación. Exporta `Nota`, `NotaOpcional` (oculta si no hay valor) y `Clasificacion`
como piezas sueltas.

**`Esqueleto.tsx`** — Esqueletos de carga de las rutas con datos: `EsqueletoPortada`,
`EsqueletoExplorar`, `EsqueletoFicha` y `EsqueletoReproductor`. Bloques con la clase
`esqueleto`, que respira con la animación `respirar` y se apaga bajo
`prefers-reduced-motion`.

## Controles

**`Boton.tsx`** — Dos variantes, primario ámbar y fantasma. Exporta `Boton` para acciones,
`BotonEnlace` para navegación y `BotonIcono` para los circulares de 44px.

**`Campo.tsx`** — Campo de formulario con etiqueta y texto de ayuda opcional, conectado por
`aria-describedby`.

**`Icono.tsx`** — Los veinte iconos del sistema, dibujados con un solo grosor de trazo. Se
usan como `<Icono nombre="play" />`. El tipo `NombreIcono` hace que un nombre inventado sea
un error de compilación, no un hueco en blanco.

## Interactivos

**`Buscador.tsx`** — *cliente*. Resultados mientras se escribe, hasta seis, con carátula,
motivo de la coincidencia y nota. Se maneja con flechas, Enter y Escape, cierra al pulsar
fuera, y sigue el patrón de combobox accesible con `aria-activedescendant`. Pide resultados
a `/api/buscar`, el proxy que evita el CORS del scraper.

**`CarruselDestacado.tsx`** — *cliente*. El destacado de la portada, con las tendencias del
catálogo. Avanza solo cada siete segundos, **se detiene al pasar el ratón o al recibir el
foco** —si no, es imposible leerlo o pulsar un botón—, responde a las flechas del teclado y
se desactiva del todo bajo `prefers-reduced-motion`.

**`Reproductor.tsx`** — *cliente*. El reproductor de `/ver/...`. Recibe los enlaces del
episodio y agrupa los servidores por variante de audio (subtitulada / doblada); los hosts
que se resuelven a URL directa se reproducen en un `<video>` propio (mp4 nativo, HLS con
`VideoConHls`) y el resto se incrusta en un `<iframe>`. Sin servidores, muestra un fallback
con enlace al proveedor.

**`VideoConHls.tsx`** — *cliente*. `<video>` con soporte HLS automático: para `.m3u8` usa
hls.js en Chrome/Firefox y el HLS nativo en Safari; para el resto de archivos, reproducción
nativa. Acepta `esHls` explícito para los m3u8 servidos por nuestro proxy (cuya URL no
termina en `.m3u8`).

**`PreferenciaHora.tsx`** — *cliente*. Proveedor de contexto con la zona horaria elegida,
guardada en el navegador, y el selector de dos opciones. Lo usa la parrilla, que hoy está
oculta.

**`HoraEmision.tsx`** — *cliente*. Pinta una hora según la preferencia. Exporta también
`CuentaAtras`. Al servicio de la parrilla, hoy oculta.

**`EfectosSala.tsx`** — Las capas de atmósfera: `CapaGrano` y `CapaVineteado`, más
`SiluetaMarca`. El componente por defecto es la demostración interactiva del laboratorio y
sí es de cliente; las capas sueltas no.
