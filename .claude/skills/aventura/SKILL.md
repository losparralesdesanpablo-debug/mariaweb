---
name: aventura
description: Ajustar o crear niveles del juego de aventura (memoria/secuencia con mundos temáticos). Cada nivel es un archivo Juego0X*.tsx.
---

# Juego: Aventura

Componente raíz: `components/AventuraCanvas.tsx`
Mapa: `components/aventura/MapaMundo.tsx`
Niveles: `components/aventura/Juego01Estrellas.tsx` … `Juego10Casa.tsx`
Utilidades: `components/aventura/utils.ts` → `pip()`, `fanfarria()`, `hablar()`

## Niveles actuales
| Archivo | Mundo | Mecánica |
|---|---|---|
| Juego01Estrellas | Estrellas | Secuencia memoria |
| Juego02Nubes | Nubes | Secuencia memoria |
| Juego03Jardin | Jardín | Secuencia memoria |
| Juego04Peces | Peces | Secuencia memoria |
| Juego05Granja | Granja | Secuencia memoria |
| Juego06Cocina | Cocina | Secuencia memoria |
| Juego07Bosque | Bosque | Secuencia memoria (3 setas, patrón ABABC) |
| Juego08Mar | Mar | Secuencia memoria |
| Juego09Ciudad | Ciudad | Secuencia memoria |
| Juego10Casa | Casa | Secuencia memoria |

## Estructura de un nivel (patrón estándar)
```tsx
const ELEMENTOS = [emoji1, emoji2, emoji3]   // 3–5 elementos
const PATRON = [0, 1, 2, 0, 1]               // índices, crece cada ronda
const INTERVALO = 1000                        // ms entre flashes en demo
const APAGADO = 400                          // ms elemento apagado entre flashes
const PAUSA_INIT = 1200                      // ms antes de empezar demo

export default function JuegoXX({ sonido, voz, onSiguiente }) {
  // estados: fase ("demo"|"input"), posDemo, posInput, error, completado
  // demo: setTimeout loop mostrando PATRON[0..posDemo]
  // input: onPress → verificar PATRON[posInput] === toque
}
```

## Cómo añadir un nivel nuevo
1. Copiar `Juego10Casa.tsx` → `Juego11Nuevo.tsx`
2. Cambiar `ELEMENTOS`, `PATRON`, colores y emojis
3. Importar en `AventuraCanvas.tsx` y añadir al array de niveles
4. Añadir entrada en `MapaMundo.tsx` si el mapa es visual

## Parámetros de dificultad
- Más elementos en `ELEMENTOS` → más opciones a distinguir
- Más largo `PATRON` → más pasos a memorizar
- `INTERVALO` más corto → demo más rápida (más difícil)
- Añadir rondas → `PATRON` crece automáticamente si usas `ronda` como índice límite

## Tareas comunes
- **Cambiar velocidad demo**: `INTERVALO` y `APAGADO`
- **Cambiar emojis**: array `ELEMENTOS`
- **Cambiar fondo**: propiedad `background` del contenedor
- **Añadir feedback de error**: flash rojo + `pip(160, 0.3, 0.18, "sawtooth")`
