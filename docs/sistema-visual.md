# Sistema visual — Sala Oscura

## La tesis

La interfaz se comporta como **una sala a oscuras y una parrilla de emisión**, no como una
cuadrícula uniforme de carátulas. El arte manda y el cromo se retira.

De ahí salen todas las decisiones: el fondo es negro cálido y no negro puro; el acento es
un único ámbar de proyector usado siempre como campo sólido; la portada organiza el
catálogo por días de emisión antes que por carruseles de novedades.

## Dónde viven los tokens

En `app/globals.css`, dentro de un bloque `@theme`. Tailwind 4 sustituyó
`tailwind.config.js` por esto: declarar `--color-sala-900` genera automáticamente
`bg-sala-900`, `text-sala-900` y demás.

**Los tokens son la fuente de verdad del diseño.** Cambiar uno cambia el sitio entero.

### Color

| Token | Valor | Uso |
|---|---|---|
| `--color-sala-900` | `#0b0a09` | Fondo de la aplicación |
| `--color-sala-800` | `#141210` | Superficie elevada, fila al pasar el ratón |
| `--color-sala-700` | `#1e1b18` | Fondo de carátula, campos |
| `--color-sala-600` | `#2b2723` | Avatares, pistas de progreso |
| `--color-sala-500` | `#3d3833` | Texto muy apagado, géneros en reposo |
| `--color-hueso` | `#f4efe6` | Texto primario |
| `--color-hueso-70` | `#b8b0a4` | Texto secundario |
| `--color-hueso-45` | `#8a8278` | Texto terciario, etiquetas |
| `--color-ambar` | `#ffb03a` | Acento único |
| `--color-ambar-claro` | `#ffc061` | Acento al pasar el ratón |
| `--color-ambar-tinta` | `#2a1c06` | Texto sobre ámbar |
| `--color-rojo` | `#e0453a` | Reservado, apenas usado |
| `--color-borde` | `#292522` | Filetes de separación |
| `--color-borde-vivo` | `#3f3934` | Contornos de elementos interactivos |

El fondo **no es negro puro**. `#0b0a09` tiene una desviación cálida mínima que evita el
aspecto de vacío digital. Igual el texto: `#f4efe6` en vez de blanco, porque blanco puro
sobre negro produce un halo desagradable en pantallas grandes.

### Tipografía

Dos familias, un trabajo cada una.

- **Archivo Black** (`--font-display`) — titulares, cifras grandes, nombres de sección
- **Archivo** (`--font-texto`) — todo lo demás

Escala, de `--text-paso-0` a `--text-paso-6`: `0.8125` · `0.9375` · `1.0625` · `1.375` ·
`2` · `clamp(2.5, 6vw, 4.5)` · `clamp(3.5, 11vw, 5.75)` rem.

Los dos últimos pasos son fluidos: crecen con la ventana en vez de saltar por puntos de
ruptura.

### Espaciado

Ritmo único de `--spacing-e1` a `--spacing-e6`: `0.375` · `0.75` · `1.25` · `2` · `3.25` ·
`5.5` rem. Más `--spacing-margen`, que es `clamp(1.25rem, 4vw, 4rem)` y define el margen
lateral de todas las páginas.

No hay valores de espaciado fuera de esta escala. Si algo necesita un hueco intermedio, es
señal de que la composición está mal.

### Forma y profundidad

- `--radius-radio: 3px`. Casi cuadrado. Las píldoras usan radio completo, y esa es la
  única excepción.
- `--shadow-baja`, `--shadow-alta`: sombras **con desplazamiento y desenfoque reales**.
- `--ease-sal: cubic-bezier(0.16, 1, 0.3, 1)`. Salida exponencial, arranca rápido y frena.

## Capas de atmósfera

Definidas en `components/EfectosSala.tsx`, aplicadas en la portada y la ficha.

**Grano de proyección.** Una capa fija sobre todo el documento, al 4,5 % de opacidad, con
`mix-blend-mode: overlay`. El ruido se genera con un filtro SVG embebido como data URI: no
cuesta ni una petición. Su trabajo es quitarle al negro la planitud de vacío liso.

**Viñeteado.** Degradado radial que oscurece los bordes de los paneles a sangre. Hace que
la imagen parezca proyectada y no pegada al fondo.

Ambos están calibrados a ojo. Si en tu pantalla se pasan o desaparecen, los números están
en `app/globals.css` (opacidad del grano) y en `EfectosSala.tsx` (porcentajes del
viñeteado).

Hubo una tercera capa, una luz de proyector ámbar, que se descartó. Ver
[decisiones.md](decisiones.md).

## Reglas que sostienen el sistema

Estas no son preferencias, son lo que hace que el conjunto se lea como una sola cosa.

1. **Un solo acento.** El ámbar es el único color cromático de la interfaz. Añadir un
   segundo acento rompe el sistema. Cuando hizo falta distinguir dos datos —la hora y la
   cuenta atrás en la parrilla—, se resolvió con peso y tamaño, no con otro color.

2. **El ámbar siempre como campo sólido, nunca como resplandor.** Sin halos, sin sombras
   de color, sin `box-shadow` sin desplazamiento.

3. **Sombras con desplazamiento y desenfoque.** Una sombra a offset cero es decoración,
   no profundidad.

4. **Más espacio encima de un titular que debajo.** Un titular pertenece a lo que va
   después, no a lo que va antes.

5. **Los iconos se dibujan, no se toman prestados.** Los veinte de `Icono.tsx` comparten
   un solo grosor de trazo. Nada de emojis ni glifos Unicode como iconos.

6. **Las superficies del navegador también son del diseño.** Barra de desplazamiento,
   selección de texto y anillo de foco están tematizados en `@layer base`. Es lo que más
   se nota cuando falta.

7. **Cifras tabulares en todo dato numérico.** Horas, notas, contadores de episodios.
   Sin esto, las columnas de números bailan.

## Lo que hay que evitar

- Tarjetas del mismo tamaño con icono, titular y texto como estructura de página
- Texto con degradado — el énfasis se hace con peso o tamaño
- Cristal y desenfoque como decoración
- Bordes laterales de color de más de 1px
- Sombras duras sin desenfoque, salvo en un mundo que sea de verdad neobrutalista
- Elegir claro u oscuro por categoría en vez de por la escena de uso real
