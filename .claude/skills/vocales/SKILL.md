---
name: vocales
description: Ajustar o ampliar el juego de trazos de vocales minúsculas (a, e, i, o, u). Paths script con direccionalidad escolar, colores, progresión.
---

# Juego: Vocales

Componente: `components/VocalTrazoCanvas.tsx`

Misma mecánica que Trazos y Números: canvas con `segmento()` / `arco()` / `concat()`.

## Estructura del componente
```
VOCALES = ["a","e","i","o","u"]   ← minúsculas script
FRASES  = ["a","e","i","o","u"]   ← texto para hablar()
GROSOR  = 40                       ← grosor del trazo en px
vocalCamino(v, ox, oy, w, h)       ← devuelve Punto[] para cada vocal
calcCuadro()                       ← cuadro de trazo, MITAD DERECHA del viewport
calcCuadroRef()                    ← cuadro de la letra de referencia, MITAD IZQUIERDA
```

Layout: la letra de referencia grande se dibuja a la IZQUIERDA con los MISMOS
paths de `vocalCamino()` (idéntica al trazo por construcción). El cuadro donde
la niña traza está a la DERECHA. Un "dedo animado" 👆 recorre el path en bucle
cuando no se está dibujando.

## Grafía (direccionalidad escolar española, letra script)
Ángulos del canvas (Y hacia abajo): `-PI/2`=arriba, `0`=derecha, `PI/2`=abajo,
`PI`=izquierda. **Ángulo DECRECIENTE = antihorario en pantalla.**
- **a**: círculo antihorario desde arriba-derecha + palo derecho pegado bajando.
- **e**: barra horizontal (izq→der) en el medio + arco antihorario que abre abajo-der.
- **i**: palo vertical (arriba→abajo) + punto encima (se traza al final).
- **o**: círculo antihorario cerrado empezando arriba.
- **u**: palo izq baja + curva inferior + palo der sube y baja (colita).

## Props
```ts
interface VocalTrazoProps {
  sonido: boolean;
  voz: boolean;
  tolerancia_px: number;
  porcentaje_para_completar: number;
  onVolver: () => void;
}
```

## Paleta
- Fondo: `radial-gradient(ellipse at 30% 15%, #EEE0FF 0%, #C8A0F0 60%, #9B59D0 100%)`
- Guía: borde `#D8B4FE`, relleno `#FFFFFF`
- Tramos visitados: arcoíris morado `hsl(260–340, 80%, 65%)`
- Punto inicio: `#A855F7`
- Indicadores completados: `#A855F7`, actual: `#C792EA`

## Cómo modificar el path de una vocal
Editar el `case` correspondiente en `vocalCamino()` usando:
- `segmento(x0, y0, x1, y1, n?)` — línea recta
- `arco(cx, cy, rx, ry, a0, a1, n?)` — arco elíptico (ángulos en radianes)
- `concat(...arrays)` — une paths sin duplicar el punto de unión

Coordenadas relativas al rectángulo `(ox, oy, w, h)`. En `vocalCamino` se usa
la zona de la x: `xTop = T + h*0.32`, `xBot = B - h*0.06`, `cyC` centro.

**Verificar formas sin desplegar:** generar un SVG con los paths y convertir a
PNG (`rsvg-convert`) para inspeccionar. Marcar inicio (verde) y fin (rojo) del
trazo ayuda a validar la direccionalidad.

## Añadir más letras
1. Ampliar el array `VOCALES` y `FRASES`
2. Añadir `case` en `vocalCamino()`
3. Los indicadores de la barra superior se generan automáticamente con `VOCALES.map(...)`

## Tareas comunes
- **Cambiar fondo**: propiedad `background` en el `<div className="fixed inset-0">` al final del componente
- **Cambiar voz**: `hablar(\`la vocal ${FRASES[i]}\`)` en `cargarVocal()`
- **Cambiar grosor**: constante `GROSOR`
