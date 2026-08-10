# Sistema visual

La fuente de verdad es el bloque `@theme` de `app/globals.css`. Este documento explica
**por qué** los valores son los que son; si hay discrepancia, manda el CSS.

Para verlo todo junto y de una vez: **`/laboratorio`**, que es la galería del sistema.

---

## La tesis

Esto es una aplicación, no una sala de cine.

La versión anterior («Sala Oscura») partía de una metáfora física: negro cálido, grano de
proyección, un granate de butaca, sombras con desplazamiento real. Era coherente, pero
pedía a cada pantalla que se comportara como un objeto iluminado, y una web que se recorre
con el pulgar no lo es.

El sistema actual parte de otro sitio: **la profundidad la da la luminosidad, nunca una
sombra**. No hay una sola sombra de elevación en toda la web. Tres escalones de gris
neutro frío, bordes casi invisibles, un único color saturado. Lo que destaca, destaca
porque es más claro o porque es naranja, no porque flote.

---

## Superficies

Cuatro tokens, y el orden importa.

| Token | Valor | Dónde |
|---|---|---|
| `fondo` | `oklch(18% 0 285.99)` | El marco exterior: riel lateral y barra superior |
| `lienzo` | `oklch(16% 0 285.99)` | El panel de contenido |
| `tarjeta` | `oklch(21% .006 285.885)` | Tarjetas, campos, píldoras, diálogos |
| `apagado` | `oklch(27.4% .006 286.033)` | Superficie tenue: pistas de progreso, separadores |
| `buscador` | `#121212` | El campo del buscador de la barra |
| `buscador-borde` | `#2e2e2e` | Su filete |

El buscador es el único control con un gris opaco en vez de blanco a baja opacidad, y es
a propósito: vive centrado en la barra, que encima de un destacado es transparente, así
que por detrás le pasa lo que traiga la página. Un borde al 3 % se lo tragaría una
carátula clara justo cuando hace falta distinguir dónde se escribe.

Ojo con confundirlo con `lienzo`, que es `#0d0d0d` en sRGB: son dos grises muy próximos
y el campo tiene que quedar por encima del panel, no fundido con él.

Van en oklch y no en hexadecimal porque la luminosidad es el primer número:
los cuatro escalones se leen en columna (18 → 16 → 21 → 27,4) sin descifrar
pares hexadecimales. El croma ronda cero, así que el gris es neutro de verdad.

La jugada está en que **el marco es más claro que el contenido**. Esa inversión —`fondo`
por encima de `lienzo`— es lo que hace que el panel parezca hundido sin necesidad de
dibujarle un borde ni una sombra. Si se igualan, el marco desaparece y la página pierde
su arquitectura.

## Tinta

`tinta` a `oklch(98.5% 0 0)` para lo que se lee, `tinta-apagada` a
`oklch(70.5% .015 286.067)` para lo secundario, `tinta-tenue` a
`oklch(55.2% .016 285.938)` para los datos de apoyo. Los tres pasan de sobra sobre las
cuatro superficies.

## Bordes

`borde` es blanco al 3 %, `borde-vivo` al 10 %. **Blanco a baja opacidad, no un gris
opaco**: sobre cualquiera de las cuatro superficies da el mismo resultado óptico, y sobre
una imagen se comporta como un filo de luz en vez de como una caja. Un gris fijo se ve
como una línea sucia en cuanto lo que hay detrás cambia.

El 3 % es muy poco a propósito: dentro del panel las cosas se separan por luminosidad,
no por línea. El 10 % queda para el filo del marco, que sí tiene que recortarse contra
el contenido.

## Llamada a la acción y acento

Son dos tokens distintos y conviene no confundirlos, porque de esto depende cómo se lee
la página entera.

`primario` es `oklch(85.31% .004 286.32)` —un gris casi blanco— con `primario-tinta`
oscura encima, y **es el botón**. Ronda 15:1. Va sin color a propósito: en una página que
es toda carátulas, el campo claro es lo único que no compite con el arte.

`acento` es `oklch(70.68% .1556 64.04)`, naranja cálido, lo único saturado del sistema, y
**no es un botón**. Se usa como tinte (`acento-tenue`), como filo, como texto pequeño y
para lo que informa de una magnitud o un estado activo: la barra de progreso del
reproductor, el punto de no leídas, la nota que has puesto, el filtro seleccionado.

El detalle que obliga a esa separación: a 70 % de luminosidad, un campo naranja con tinta
blanca encima se queda en 2:1. Si alguna vez hay que rellenar con acento, la tinta va
oscura (`acento-tinta`), nunca clara.

`exito` (verde) es solo para «en emisión»; `error` (rojo) es solo para lo destructivo.
Ninguno de los dos es un acento: no se usan para llamar la atención, se usan para decir
un estado.

## Color de la obra

`colorDeObra(id)` (`lib/color.ts`) deriva un tono estable del id canónico. Se usa en las
chapas de la ficha, en el punto del destacado y en el tinte del título al pasar por encima
de una tarjeta (la clase `.tinte-obra`).

No es el color del arte y no hay que contarlo como si lo fuera. Cumple lo que se le pide
—uno por obra, siempre el mismo, sin una petición de más— y el día que el backend publique
el color dominante se sustituye ese valor sin tocar nada más.

Saturación y luminosidad van fijas (S=80 %, L=72 %) y eso no es estético: es lo que
garantiza más de 6:1 contra tinta oscura en cualquier tono.

---

## Tipografía

Dos familias, las dos variables, las dos autoalojadas por `next/font`.

- **Karla** (`font-titulo`), eje 200–800. **Todo**: títulos a 800 y también el cuerpo
  del texto, como en la referencia.
- **Inter** (`font-texto`) queda solo para las cifras, vía la utilidad `.cifras`. Es
  donde le saca ventaja: sus números son de ancho fijo y de altura más pareja, así que
  un contador que sube no da saltos de ancho ni de peso óptico.

`.cifras` une las dos cosas que siempre iban juntas —la familia y `tabular-nums`— para
que no se pueda poner una sin la otra. En el marcado no queda ni un `tabular-nums`
suelto.

**El cuerpo del texto no va en blanco.** El `body` escribe a `tinta-cuerpo`
(`oklch(85.31% …)`); el 98,5 % de `tinta` se reserva para títulos y para lo que tiene
que destacar sobre ese cuerpo. Si todo va en blanco, no destaca nada.

Karla sustituyó a Archivo Black, que era una display de un solo peso: a cuerpo grande iba
bien, pero no servía para un título de sección de 20px, así que había que saltar a la
familia de texto y la jerarquía se rompía por el medio. Karla cubre toda la escala.

**La escala es la de Tailwind**, no una propia. Las escalas `--text-paso-0..6` y
`--spacing-e1..e6` se retiraron: eran una capa de indirección sobre la misma base de 4px,
y obligaban a traducir mentalmente cada medida. Ahora `text-sm` es `text-sm`.

Toda cifra lleva `tabular-nums`. Sin eso, un contador que sube da saltos de ancho.

## Formas

`rounded-radio` son `0.4rem` (6,4px), `rounded-radio-lg` 12px. El pequeño es
deliberadamente poco: a ese radio una carátula se sigue leyendo como una carátula.

**Los botones son la excepción**: van redondeados del todo. En una página cubierta de
rectángulos —carátulas, tarjetas, píldoras— la única forma que hay que distinguir de un
vistazo es la que se pulsa.

## Medidas del marco

`--ancho-riel` y `--alto-barra` valen los dos `3rem`. Miden lo mismo a propósito: la
esquina superior izquierda queda cuadrada y ahí se apoya la marca.

`--spacing-bleed` es el margen lateral de página, y lo usan todas las secciones para
arrancar en la misma vertical. Los rieles lo usan además como relleno para sangrar hasta
el borde de la ventana.

---

## Utilidades propias

Cuatro, y las cuatro resuelven lo mismo: **recortar con una máscara en vez de tapar con un
degradado**.

- `.sin-barra` — carril que se desplaza sin enseñar barra.
- `.velo-derecha`, `.velo-abajo` — difuminan un borde.
- `.velo-heroe` — la del destacado. Se desvanece hacia abajo siempre, hacia la izquierda
  a partir de `lg`, y **hacia arriba en los primeros 160px**. Ese corte de arriba es el
  que sostiene la barra transparente: apaga la imagen contra el borde superior, así que
  lo que queda detrás de la barra es fondo de página y no arte. Sin él, los cheurones y
  el buscador se apoyan sobre una carátula y dejan de leerse.
- `.bajo-barra` — sube una sección el alto de la barra para que arranque por debajo de
  ella. El panel deja ese hueco arriba para que el contenido normal no quede tapado;
  esto lo anula. La usan el destacado de la portada y el cabezal de una ficha.
- `.tinte-obra` — la tinta que toma el color de la obra al pasar por encima.
- `.realce` / `.realce-texto` — el gesto de interacción básico: al pasar por encima
  se superpone un velo de acento al 5 % con su filo entero, en 200 ms. Va en un
  pseudoelemento y no en el fondo del elemento porque así hereda el radio sin
  repetirlo y se anima solo la opacidad, que el compositor resuelve sin repintar.
- `.velo-sinopsis` — sinopsis recortada que se destapa al pasar por encima. La
  máscara mide cuatro veces el alto y se encoge a uno, así que el texto no cambia de
  alto: un `max-height` haría saltar todo lo que tiene debajo.
- `.paralaje-scroll`, `.atenuar-scroll` — las dos animaciones que no mueve el tiempo
  sino el scroll (`animation-timeline: scroll()`, primeros 300px). Pixel y medio de
  desplazamiento; donde el navegador no las soporta, el elemento se queda quieto.

La diferencia con un degradado no es cosmética. Un degradado tiene que acertar el color
del fondo y deja de funcionar en cuanto ese fondo cambia; una máscara recorta el propio
elemento y funciona sobre cualquiera de las cuatro superficies sin tocarla.

---

## Movimiento

Lo que no lleva duración ni curva escritas cae en el reglaje por defecto: **150 ms** con
`cubic-bezier(.4, 0, .2, 1)`. Es corto a propósito. A esa duración un cambio de color o
de fondo se percibe como respuesta, no como animación, y eso es lo que se quiere en algo
que se pulsa cien veces por sesión.

Para lo que sí se anima hay dos curvas con nombre:

- **`ease-sal`** — `cubic-bezier(.32, .72, 0, 1)`. Arranca de golpe y frena muy largo,
  así que lo que entra parece que se posa en vez de que llega. Es la de los paneles: el
  diálogo de búsqueda, el menú de usuario, los desplegables.
- **La escala completa** (`ease-salida-cubica`, `ease-vaiven-quart`, `ease-vaiven-expo`…)
  para cuando hace falta una salida más seca o una ida y vuelta simétrica.

Tres animaciones con nombre, y las tres dicen algo:

| Token | Qué hace | Por qué |
|---|---|---|
| `respirar` | Opacidad de 0,4 a 0,98 | El esqueleto de carga. No llega a opacidad plena en ningún fotograma, así que nunca se confunde con contenido ya cargado |
| `animate-progreso` | Barra que cruza de lado a lado | Carga indeterminada: no se sabe cuánto queda, y una barra que avanza hasta el final mentiría |
| `animate-paralaje` | 1,5px en vertical, ida y vuelta | El fondo del destacado. Pixel y medio es casi nada, y ese es el punto: se nota que está vivo sin que nadie sepa decir qué se movió |

Todo esto se apaga entero con `prefers-reduced-motion`.

## Las reglas

1. **El botón es claro, el acento no es un botón.** `primario` para lo que se pulsa,
   `acento` para lo que informa. Verde y rojo dicen estados, no llaman la atención.
2. **Ninguna sombra de elevación.** Si algo tiene que despegarse, se sube un escalón de
   luminosidad o se le pone un borde.
3. **El color de una chapa sale de la obra**, vía `colorDeObra()`.
4. **Más espacio encima de un título que debajo.** El título pertenece a lo que abre.
5. **Los iconos se dibujan**, no se toman prestados. Los 41 viven en `components/Icono.tsx`
   a trazo 1,8. Nada de emoji, y nada de librerías de iconos.
6. **Las superficies del navegador son del diseño**: barra de desplazamiento, selección de
   texto y anillo de foco están definidas y son parte del sistema.
7. **Cifras siempre tabulares.**
8. **Nada de valores fuera de la escala.** Si hace falta una medida que no existe, se añade
   al `@theme`, no al `className`.

## Lo que hay que evitar

- Carátulas, iconos y texto del mismo tamaño usados como estructura de página: sin
  jerarquía, la portada se recorre sin que nada llame.
- Texto en degradado.
- El desenfoque como decoración. Se usa en el marco y en el diálogo de búsqueda porque hay
  contenido moviéndose detrás; en cualquier otro sitio es coste de composición gratis.
- Bordes de color de más de 1px.
- Un color a pelo en un `className`. Si aparece un `#` en un componente, es un fallo salvo
  que sea un degradado en negro puro sobre una imagen.
