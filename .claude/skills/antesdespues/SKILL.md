---
name: antesdespues
description: Ajustar el juego Antes y después (¿qué número va antes/después de N? con recta numérica visual).
---

# Juego: Antes y después

Componente: `components/AntesDepuesCanvas.tsx`

## Mecánica
- Se genera un número N (2–9) y se pregunta qué va antes o después
- Se muestra una recta numérica de 3 celdas: [?/n-1] [N] [n+1/?]
- El hueco (?) se resalta; las otras celdas muestran los vecinos reales
- 3 opciones numéricas abajo; toca la correcta

## Estructura clave
```ts
function generarRonda() {
  const n = aleatorio(2, 9)            // 2–9 para tener siempre vecinos en 1–10
  const pregunta = Math.random() < 0.5 ? "antes" : "despues"
  const correcto = pregunta === "antes" ? n - 1 : n + 1
  // 3 opciones: correcto + 2 distractores en rango ±3
}
```

## Tareas comunes
- **Ampliar rango a 1–20**: cambiar `aleatorio(2, 19)` y ajustar distractores para no salir de 1–20
- **Añadir modo "dos antes"/"dos después"**: `correcto = n - 2` o `n + 2`
- **Mostrar recta más larga** (5 celdas): ampliar la fila visual con más vecinos a izquierda/derecha
- **Cambiar número de opciones**: de 3 a 4 ampliar `while (pool.size < 4)`
- **Cambiar el rango de distractores**: `aleatorio(-3, 3)` en la generación de opciones

## Paleta
- Fondo: morado `#F0E8FF → #9B59D0`
- Celda principal (N): blanca grande
- Celda hueco: borde punteado, semitransparente
- Celda vecino conocido: blanca rellena semitransparente
- Opciones: blanco, verde acierto, rojo error
