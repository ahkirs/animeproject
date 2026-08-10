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
| `fondo` | `#1c1c1e` | El marco exterior: riel lateral y barra superior |
| `lienzo` | `#191919` | El panel de contenido |
| `tarjeta` | `#212124` | Tarjetas, campos, píldoras, diálogos |
| `apagado` | `#2e2e33` | Superficie tenue: pistas de progreso, separadores |

La jugada está en que **el marco es más claro que el contenido**. Esa inversión —`fondo`
por encima de `lienzo`— es lo que hace que el panel parezca hundido sin necesidad de
dibujarle un borde ni una sombra. Si se igualan, el marco desaparece y la página pierde
su arquitectura.

## Tinta

`tinta` (`#fafafa`) para lo que se lee, `tinta-apagada` (`#a1a1aa`) para lo secundario,
`tinta-tenue` (`#71717a`) para los datos de apoyo. Los tres pasan de sobra sobre las
cuatro superficies.

## Bordes

`borde` es blanco al 6 %, `borde-vivo` al 14 %. **Blanco a baja opacidad, no un gris
opaco**: sobre cualquiera de las cuatro superficies da el mismo resultado óptico, y sobre
una imagen se comporta como un filo de luz en vez de como una caja. Un gris fijo se ve
como una línea sucia en cuanto lo que hay detrás cambia.

## Acento

Uno solo: `acento` (`#f59e42`), naranja cálido. Es lo único saturado del sistema.

Dos lecturas, las dos seguras:

- **Como campo**, con `acento-tinta` (`#1c1c1e`) encima. Ronda 9:1.
- **Como texto pequeño** sobre `lienzo` o `fondo`. Ronda 8:1.

Lo que no vale: naranja sobre naranja, y un halo naranja a desplazamiento cero. `exito`
(verde) es solo para «en emisión»; `error` (rojo) es solo para lo destructivo. Ninguno de
los dos es un acento: no se usan para llamar la atención, se usan para decir un estado.

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

- **Karla** (`font-titulo`), eje 200–800. Los títulos van a 800.
- **Inter** (`font-texto`). Cuerpo, datos y cifras.

Karla sustituyó a Archivo Black, que era una display de un solo peso: a cuerpo grande iba
bien, pero no servía para un título de sección de 20px, así que había que saltar a la
familia de texto y la jerarquía se rompía por el medio. Karla cubre toda la escala.

**La escala es la de Tailwind**, no una propia. Las escalas `--text-paso-0..6` y
`--spacing-e1..e6` se retiraron: eran una capa de indirección sobre la misma base de 4px,
y obligaban a traducir mentalmente cada medida. Ahora `text-sm` es `text-sm`.

Toda cifra lleva `tabular-nums`. Sin eso, un contador que sube da saltos de ancho.

## Formas

`rounded-radio` son 6px, `rounded-radio-lg` 12px. El pequeño es deliberadamente poco: a
ese radio una carátula se sigue leyendo como una carátula.

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
- `.velo-heroe` — la del destacado: se desvanece hacia abajo siempre, y también hacia la
  izquierda a partir de `lg`.
- `.tinte-obra` — la tinta que toma el color de la obra al pasar por encima.

La diferencia con un degradado no es cosmética. Un degradado tiene que acertar el color
del fondo y deja de funcionar en cuanto ese fondo cambia; una máscara recorta el propio
elemento y funciona sobre cualquiera de las cuatro superficies sin tocarla.

---

## Las reglas

1. **Un solo acento.** Verde y rojo dicen estados, no llaman la atención.
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
