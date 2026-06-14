---
name: escuchar
description: Ajustar los juegos de escuchar (Escucha el número / Escucha la vocal). La app habla y la niña toca la opción correcta en una cuadrícula 2×2.
---

# Juego: Escuchar (números y vocales)

Componente: `components/ReconocerCanvas.tsx`

## Props
```ts
interface ReconocerProps {
  modo: "numeros" | "vocales";
  sonido: boolean;
  voz: boolean;
  onVolver: () => void;
}
```

## Mecánica
- `hablar()` dice el número o vocal al inicio de cada ronda
- Se muestran 4 opciones en cuadrícula 2×2
- Toca la correcta → correcto; toca otra → flash rojo

## Conjuntos de opciones
- **números**: 1–10
- **vocales**: A, E, I, O, U

## Cómo ampliar
- **Más opciones (2×3 o 3×2)**: cambiar `while (pool.size < 6)` y el grid `gridTemplateColumns: "repeat(3, 1fr)"`
- **Añadir imágenes**: sustituir el texto grande por un `<img>` o emoji representativo
- **Añadir modo sílabas**: nuevo valor `modo: "silabas"` con su propio array de opciones
- **Botón repetir audio**: `<button onClick={() => hablar(textoActual)}>🔊</button>` en la barra superior

## Paleta
- **números**: naranja `#FF8C42 → #CC6010`
- **vocales**: morado `#C792EA → #8A4FBF`
- Opciones: blanco semitransparente, verde acierto, rojo error
