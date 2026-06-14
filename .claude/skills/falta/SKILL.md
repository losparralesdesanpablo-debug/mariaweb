---
name: falta
description: Ajustar el juego ¿Cuál falta? (secuencia de 5 números consecutivos con un hueco, elegir el que falta de 3 opciones).
---

# Juego: ¿Cuál falta?

Componente: `components/FaltaCanvas.tsx`

## Mecánica
- Se genera una secuencia de 5 números consecutivos (inicio aleatorio)
- Uno de los números intermedios (posiciones 1–3) se oculta con "?"
- 3 opciones abajo: la correcta + 2 distractores
- Toca la correcta → siguiente ronda; error → flash rojo

## Estructura clave
```ts
function generarRonda() {
  const inicio = aleatorio(1, 6)   // secuencia 1–10 máx
  const hueco  = aleatorio(1, 3)   // posición del hueco (nunca extremos)
  const correcto = inicio + hueco
  // 3 opciones: correcto + distractores adyacentes
}
```

## Tareas comunes
- **Ampliar rango** (1–20): cambiar `aleatorio(1, 16)` para inicio y ajustar distractores
- **Mostrar más números en la secuencia** (7 en vez de 5): cambiar longitud del array y `aleatorio(1, 5)` para la posición del hueco
- **Añadir modo descendente**: invertir la secuencia o añadir opción en la ronda
- **Cambiar número de opciones**: de 3 a 4 ampliar `while (pool.size < 4)`

## Paleta
- Fondo: cian `#26C6DA → #0097A7`
- Secuencia: tarjetas blancas grandes, la faltante con borde punteado
- Opciones: blanco semitransparente, verde acierto, rojo error
