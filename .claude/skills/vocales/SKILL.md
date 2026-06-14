---
name: vocales
description: Ajustar o ampliar el juego de trazos de vocales (A, E, I, O, U). Paths de cada letra, colores, progresión.
---

# Juego: Vocales

Componente: `components/VocalTrazoCanvas.tsx`

Misma mecánica que Trazos y Números: canvas con `segmento()` / `arco()` / `concat()`.

## Estructura del componente
```
VOCALES = ["A","E","I","O","U"]
FRASES  = ["a","e","i","o","u"]   ← texto para hablar()
GROSOR  = 52                       ← grosor del trazo en px
vocalCamino(v, ox, oy, w, h)       ← devuelve Punto[] para cada vocal
calcCuadro()                       ← caja centrada, w = min(55vw, 300px), h = w*1.35
```

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

Coordenadas relativas al rectángulo `(ox, oy, w, h)`:
- `T = oy`, `B = oy+h`, `L = ox`, `R = ox+w`, `MX = ox+w/2`, `MY = oy+h/2`

## Añadir más letras
1. Ampliar el array `VOCALES` y `FRASES`
2. Añadir `case` en `vocalCamino()`
3. Los indicadores de la barra superior se generan automáticamente con `VOCALES.map(...)`

## Tareas comunes
- **Cambiar fondo**: propiedad `background` en el `<div className="fixed inset-0">` al final del componente
- **Cambiar voz**: `hablar(\`la vocal ${FRASES[i]}\`)` en `cargarVocal()`
- **Cambiar grosor**: constante `GROSOR`
