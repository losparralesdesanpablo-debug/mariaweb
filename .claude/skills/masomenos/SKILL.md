---
name: masomenos
description: Ajustar el juego Más o menos (comparar dos grupos de objetos y tocar el mayor).
---

# Juego: Más o menos

Componente: `components/MasMenosCanvas.tsx`

## Mecánica
- Se muestran dos grupos de emojis (1–9 cada uno) en posiciones fijas
- La niña toca el grupo con más objetos
- Si son iguales, ninguna es correcta (no puede pasar con la generación actual)

## Estructura clave
```ts
const POSICIONES: {x,y}[] = [...]  // 9 posiciones fijas en % de viewport

function generarRonda() {
  const a = aleatorio(1, 9)
  let b = aleatorio(1, 9)
  while (b === a) b = aleatorio(1, 9)   // garantiza desigualdad
  const emoji = EMOJIS[aleatorio(...)]
}
```

## Tareas comunes
- **Ampliar a 1–15**: cambiar `aleatorio(1, 15)` y añadir más `POSICIONES`
- **Añadir números escritos** bajo cada grupo: renderizar `{n}` debajo del grupo
- **Mostrar diferencia tras acierto**: `"¡{mayor} es mayor que {menor}!"` en el feedback
- **Añadir modo igualdad**: incluir casos `a === b` con botón "¡Son iguales!"
- **Cambiar emojis por figuras geométricas**: sustituir emoji por `<div>` con `border-radius`

## Paleta
- Fondo: naranja `#FFA726 → #E65100`
- Grupos: fondo blanco semitransparente redondeado
- Acierto: verde, error: rojo
