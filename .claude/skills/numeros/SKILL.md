---
name: numeros
description: Ajustar o ampliar el juego de trazos de números (0–9). Paths de cada dígito, colores, progresión.
---

# Juego: Números

Componente: `components/NumeroTrazoCanvas.tsx`

Misma mecánica que Vocales. Canvas con `segmento()` / `arco()` / `concat()`.

## Estructura del componente
```
DIGITOS = [0,1,2,3,4,5,6,7,8,9]
FRASES  = ["cero","uno",…,"nueve"]   ← texto para hablar()
GROSOR  = 52
numeroCamino(d, ox, oy, w, h)        ← devuelve Punto[] para cada dígito
calcCuadro()                         ← caja centrada, w = min(55vw, 300px), h = w*1.35
```

## Props
```ts
interface NumeroTrazoProps {
  config: ConfiguracionNino;   ← tolerancia_px, porcentaje_para_completar, sonido, voz
  onVolver: () => void;
}
```

## Paleta
- Fondo: `radial-gradient(ellipse at 30% 15%, #FFF8E1 0%, #FFE082 60%, #FFB300 100%)`
- Guía: borde `#BFE0F2`, relleno `#FFFFFF`
- Tramos visitados: arcoíris `hsl(0–300, 85%, 60%)`
- Punto inicio: `#5BCB77`
- Indicadores completados: `#5BCB77`, actual: `#FF8C42`

## Cómo modificar el path de un número
Editar el `case` en `numeroCamino()`. Mismos helpers que vocales.

## Ampliar a números mayores (10, 11…)
1. Añadir valores a `DIGITOS` y `FRASES`
2. Añadir `case` en `numeroCamino()` — para dos dígitos usar `concat()` de dos paths desplazados
3. Los indicadores de la barra se generan automáticamente

## Tareas comunes
- **Cambiar fondo**: propiedad `background` en el div fondo del return
- **Cambiar número de referencia tenue**: el `<div>` con `color: "rgba(255,150,0,.08)"` y `fontSize: Math.min(innerWidth * 0.52, 280)`
- **Cambiar voz**: `hablar(\`el número ${FRASES[i]}\`)` en `cargarDigito()`
