# animeproject

Maqueta de una plataforma de streaming de anime. Sitio estático, sin dependencias
ni proceso de compilación: se abre directamente en el navegador.

La dirección de arte elegida es **Sala Oscura**: la interfaz se comporta como una sala
a oscuras y una parrilla de emisión, en lugar de como una cuadrícula uniforme de
carátulas. Negro cálido, tipografía en Archivo Black, filetes de 1px y un solo ámbar de
proyector usado siempre como campo sólido, nunca como resplandor.

> **La marca todavía no está decidida.** Las páginas usan `KUROBA` como nombre
> provisional. Aparece en la cabecera, el pie y el `<title>` de los tres archivos.

## Estructura

```
index.html      Portada: destacado, parrilla semanal, seguir viendo, estrenos, géneros
serie.html      Ficha de serie: sinopsis, temporadas, lista de episodios, ficha técnica
ver.html        Reproductor: fotograma, mandos, cola de episodios de la temporada
theme.css       Sistema visual completo (tokens, componentes, responsive)

docs/           Trabajo de dirección de arte previo, como referencia
```

## Cómo verlo

Basta con abrir `index.html` en el navegador. Si prefieres servirlo por HTTP:

```bash
python -m http.server 8000
# o
npx serve .
```

## Estado

Es una maqueta de diseño, no una aplicación:

- El reproductor no reproduce vídeo. Es una composición estática con la interfaz completa.
- No hay backend, búsqueda real, autenticación ni persistencia.
- Los controles (pestañas de temporada, casillas, deslizadores) están maquetados y
  accesibles por teclado, pero no llevan lógica.
- Las tipografías se cargan desde Google Fonts, así que hace falta conexión para verlas
  correctamente. Hay pila de respaldo definida.

## Contenido sintético

**Todo el catálogo es inventado para esta demostración.** Los títulos, sinopsis,
episodios, nombres de estudios y personas, fechas, horarios, valoraciones y carátulas se
crearon para la maqueta. No aparece ninguna obra, marca, estudio ni persona real, y las
carátulas son ilustraciones vectoriales propias hechas en SVG, no imágenes de terceros.

Sustituye este contenido por el catálogo real antes de publicar cualquier versión de cara
al público.

## docs/

Las otras direcciones visuales que se exploraron antes de elegir Sala Oscura, y la guía
comparativa de diez estilos de UI con sus tokens y paletas.

| Carpeta | Dirección | Estado |
|---|---|---|
| `docs/02-editorial-japones/` | Revista de programación impresa | Completa (3 páginas) |
| `docs/03-vhs/` | Videoclub y magnetoscopio | Completa (3 páginas) |
| `docs/04-brutalista-neon/` | Señalética brutalista | **Incompleta**: solo portada |
| `docs/guia-10-estilos.html` | Catálogo de 10 sistemas de UI | Completa |

La guía de diez estilos documenta cada sistema con su paleta en hexadecimal, tokens CSS,
configuración de Tailwind y avisos de contraste, por si en algún momento se quiere
reconsiderar la dirección.
