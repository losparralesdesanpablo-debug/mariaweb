---
name: sumar
description: Ajustar el juego de sumar con objetos (A + B = ?, grupos visuales de emojis, dos niveles de dificultad).
---

# Juego: Sumar

Componente: `components/SumarCanvas.tsx`

## Mecánica
- Se muestran dos grupos de emojis con un "+" entre ellos
- La niña elige el resultado de entre 3 opciones numéricas
- Nivel 0: sumas ≤ 5; nivel 1: sumas ≤ 10
- Avanza de nivel tras 4 aciertos consecutivos

## Estructura clave
```ts
const NIVELES = [
  { maxSuma: 5,  rachaParaSubir: 4 },
  { maxSuma: 10, rachaParaSubir: 999 },  // nivel final
]

function generarRonda(maxSuma: number) {
  const a = aleatorio(1, maxSuma - 1)
  const b = aleatorio(1, maxSuma - a)
  // 3 opciones: a+b correcto + 2 distractores
}
```

## Tareas comunes
- **Añadir nivel 3** (sumas ≤ 15): añadir `{ maxSuma: 15, rachaParaSubir: 5 }` a `NIVELES`
- **Cambiar racha para subir de nivel**: campo `rachaParaSubir`
- **Añadir resta**: nuevo modo `"restar"`, cambiar operador y cálculo de opciones
- **Mostrar la operación escrita** junto a los emojis: `{a} + {b} = ?` en texto grande
- **Cambiar número de opciones**: de 3 a 4 ampliar `while (pool.size < 4)`

## Paleta
- Fondo: rosa `#EC407A → #AD1457`
- Grupos de objetos: fondo blanco semitransparente
- Opciones: blanco, verde acierto, rojo error
- Indicador de nivel: esquina superior derecha
