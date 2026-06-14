---
name: trazos
description: Ajustar o ampliar el juego de trazos (caminos que la niña repasa con el dedo). Formas disponibles, tolerancia, colores, guía visual, animaciones.
---

# Juego: Trazos

Componente principal: `components/TrazoCanvas.tsx`
Tipos de forma: `lib/types.ts` → `Actividad.datos.forma`
Frases por actividad: `lib/types.ts` → `FRASES_NIVEL`
Rutas en Supabase: tabla `actividades` (campo `datos.forma`)

## Formas disponibles
`onda | zigzag | circulo | espiral | ocho | rampa | escalera | eses | bucles | diagonal`

## Cómo añadir una forma nueva

1. Añadir el nuevo nombre al union type en `lib/types.ts`:
   ```ts
   datos: { forma: "onda" | ... | "nueva_forma" }
   ```
2. Añadir un `case "nueva_forma":` en `construirCamino()` dentro de `TrazoCanvas.tsx` usando los helpers `segmento()`, `arco()` y `concat()`.
3. Añadir la frase en `FRASES_NIVEL` en `lib/types.ts`.
4. Insertar la fila en Supabase:
   ```sql
   INSERT INTO actividades (codigo, tipo, titulo, nivel, activa, datos)
   VALUES ('trazo_nueva', 'trazo', 'Nombre visible', 11, true, '{"forma":"nueva_forma"}');
   ```

## Parámetros ajustables (config por niña)
- `tolerancia_px` (20–100): radio de captura del trazo. Más alto = más fácil.
- `porcentaje_para_completar` (50–100): % del camino necesario para ganar la estrella.

## Paleta visual
- Guía: borde `#BFE0F2`, relleno `#FFFFFF`
- Tramos visitados: arcoíris `hsl(0–300, 85%, 60%)`
- Punto inicio: `#5BCB77` pulsante
- Estrella final: ⭐ emoji

## Flujo interno
```
construirCamino() → array de ~800 Punto[]
onPointerMove → marcarCerca() → visitados[] → calcPorcentaje()
pct >= porcentaje_para_completar → celebrar() → confeti + fanfarria
```

## Tareas comunes
- **Cambiar grosor del trazo**: constante `GROSOR = 52` al inicio del archivo
- **Cambiar animación del punto de inicio**: `lat = 1 + Math.sin(Date.now()/280)*0.12`
- **Cambiar N (densidad de puntos)**: constante `N = 220` — más alto = más preciso pero más pesado
