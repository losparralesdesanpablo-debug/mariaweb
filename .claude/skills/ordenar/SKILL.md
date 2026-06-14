---
name: ordenar
description: Ajustar el juego de ordenar números arrastrando (nivel 0: 1–5, nivel 1: 1–10).
---

# Juego: Ordenar

Componente: `components/OrdenarCanvas.tsx`

## Mecánica
- Se muestran números desordenados en una fila
- La niña los arrastra a la posición correcta (orden ascendente)
- Detección por posición X: ranura = `Math.floor(x / (innerWidth / n))`
- Al colocar todos en orden correcto → fanfarria + siguiente nivel

## Niveles
```ts
const NIVELES = [
  { nums: [1,2,3,4,5] },     // nivel 0: 1–5
  { nums: [1,2,3,4,5,6,7,8,9,10] },  // nivel 1: 1–10
]
```

## Tareas comunes
- **Añadir nivel con números salteados** (ej: 2,4,6,8,10): añadir entrada en `NIVELES`
- **Añadir nivel con letras**: cambiar tipo a `string[]`, mismo mecanismo
- **Cambiar número de posiciones**: ajustar array en `NIVELES` y el cálculo de `ranuraX`
- **Añadir snap visual al arrastrar**: mostrar hueco destino al pasar por encima
- **Cambiar fondo**: propiedad `background` del contenedor

## Paleta
- Fondo: verde `#5BCB77 → #3BA055`
- Fichas: blanco con sombra, amarillo al arrastrar, verde al colocar correctamente
