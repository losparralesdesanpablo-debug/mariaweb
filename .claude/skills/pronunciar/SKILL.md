---
name: pronunciar
description: Ajustar el juego de pronunciar palabras. La niña ve un objeto, lo dice en voz alta y recibe una puntuación de 1–5 estrellas.
---

# Juego: Pronunciar

Componente: `components/PronunciarCanvas.tsx`

## Mecánica
- Se muestra un emoji + palabra escrita
- La niña pulsa el botón de micrófono y dice la palabra
- `webkitSpeechRecognition` captura el audio (es-ES, sin API externa)
- Distancia Levenshtein entre lo dicho y el objetivo → 1–5 estrellas

## Palabras actuales (15)
`manzana, plátano, casa, pelota, perro, gato, sol, luna, flor, árbol, pájaro, pez, libro, coche, corazón`

## Funciones clave
```ts
function levenshtein(a: string, b: string): number  // distancia de edición
function similitud(objetivo: string, dicho: string): number  // 0–100
function estrellitas(pct: number): number  // 0–5 estrellas
// pct >= 95 → 5★, >= 80 → 4★, >= 60 → 3★, >= 40 → 2★, >= 20 → 1★
```

## Normalización del texto reconocido
- `NFD + replace(/[̀-ͯ]/g, "")` elimina tildes
- Busca el mejor match en cada palabra del resultado (por si dice "la manzana")

## Tareas comunes
- **Añadir palabras**: ampliar el array `PALABRAS` con `{ emoji, palabra }`
- **Cambiar umbral de estrellas**: función `estrellitas()`
- **Ajustar velocidad de voz de referencia**: `u.rate = 0.85` en `hablar()`
- **Añadir categorías** (animales, frutas…): agrupar `PALABRAS` por categoría y añadir selector
- **Mostrar la transcripción**: renderizar `textoReconocido` debajo de la puntuación para ayudar al diagnóstico

## Limitación
`webkitSpeechRecognition` solo funciona en Safari/Chrome con micrófono disponible. En dispositivos sin permisos de micro muestra mensaje de error.
