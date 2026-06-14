---
name: contar
description: Ajustar el juego de contar objetos (1–5 emojis en pantalla, elegir el número correcto de 3 opciones).
---

# Juego: Contar

Componente: `components/ContarCanvas.tsx`

## Mecánica
- Se muestran N objetos aleatorios (emojis) en posiciones fijas
- Abajo aparecen 3 botones con números; uno es el correcto
- Toca el número correcto → fanfarria + siguiente ronda
- Error → flash rojo, sin penalización

## Estructura clave
```ts
const EMOJIS = ["🐥","🐠","🌸","⭐","🍎","🦋","🎈","🚂","🐢","🍭"]
const MAX_OBJETOS = 5   ← rango 1–MAX_OBJETOS

function generarRonda() {
  const n = aleatorio(1, MAX_OBJETOS)
  const emoji = EMOJIS[aleatorio(0, EMOJIS.length-1)]
  // 3 opciones: correcto + 2 distractores adyacentes
}
```

## Props
```ts
{ sonido: boolean; voz: boolean; onVolver: () => void }
```

## Tareas comunes
- **Ampliar rango a 1–10**: cambiar `MAX_OBJETOS = 10` y ajustar `POSICIONES` para 10 objetos
- **Añadir emojis**: ampliar array `EMOJIS`
- **Cambiar número de opciones**: de 3 a 4 opciones ampliar `while (pool.size < 4)`
- **Cambiar fondo**: propiedad `background` del contenedor
- **Progresión automática de dificultad**: añadir `nivel` en estado, subir `MAX_OBJETOS` tras N rachas correctas

## Paleta
- Fondo: azul cielo `#87CEEB → #1E90FF`
- Botones: blanco semitransparente, verde al acertar, rojo al errar
- Racha: ⭐ repetidas (máx 5)
