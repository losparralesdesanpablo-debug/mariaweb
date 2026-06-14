---
name: colorear
description: Ajustar o ampliar el juego de colorear. Figuras, paletas de colores, detección de relleno.
---

# Juego: Colorear

Componente: `components/ColorearCanvas.tsx`

## Props
```ts
interface ColorearProps {
  sonido: boolean;
  voz: boolean;
  onCambiarModo: () => void;
}
```

## Mecánica
- Se muestra una figura SVG con áreas delimitadas
- La niña toca una zona y elige un color de la paleta inferior
- Relleno flood-fill sobre canvas o coloreado de path SVG
- Al completar todas las zonas: fanfarria + confeti

## Tareas comunes
- **Añadir figura nueva**: añadir SVG path al array de figuras y definir sus zonas coloreables
- **Cambiar paleta**: array de colores en la parte superior del componente
- **Cambiar figura de inicio**: índice inicial en `useState(0)`
- **Cambiar fondo**: propiedad `background` del contenedor principal
