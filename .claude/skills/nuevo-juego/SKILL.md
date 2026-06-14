---
name: nuevo-juego
description: Crear un juego nuevo completo para Caminitos desde cero. Sigue este checklist para no olvidar ningún paso.
---

# Crear un juego nuevo en Caminitos

Usa este skill cuando el usuario pida añadir un nuevo módulo de aprendizaje.

## Información necesaria antes de empezar
Pregunta si no está claro:
- **Nombre visible** en el menú (ej: "Restar")
- **Emoji** representativo (ej: ➖)
- **Mecánica**: ¿qué hace la niña? ¿qué aparece en pantalla?
- **Niveles o progresión**: ¿empieza fácil y sube?
- **Color de fondo** o parecido a qué juego existente

---

## Checklist de implementación

### 1. Componente principal
Crear `components/NombreCanvas.tsx` con esta estructura base:

```tsx
"use client";
import { useState, useRef, useEffect } from "react";
import { pip, fanfarria, hablar } from "./aventura/utils";

interface NombreProps {
  sonido: boolean;
  voz: boolean;
  onVolver: () => void;
}

function generarRonda() { /* ... */ }

export default function NombreCanvas({ sonido, voz, onVolver }: NombreProps) {
  const [ronda, setRonda]   = useState(generarRonda);
  const [estado, setEstado] = useState<"jugando"|"correcto"|"error">("jugando");
  const [racha, setRacha]   = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // voz al inicio de ronda
  useEffect(() => {
    if (voz) setTimeout(() => hablar("..."), 300);
  }, [ronda]);

  function tocar(opcion: unknown) {
    if (estado !== "jugando") return;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (/* correcto */) {
      setEstado("correcto");
      if (sonido) fanfarria();
      setRacha(r => r + 1);
      timerRef.current = setTimeout(() => { setRonda(generarRonda()); setEstado("jugando"); }, 1700);
    } else {
      setEstado("error");
      if (sonido) pip(160, 0.3, 0.18, "sawtooth");
      timerRef.current = setTimeout(() => setEstado("jugando"), 700);
    }
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <div className="fixed inset-0" style={{
      background: "...",
      height: "100dvh", touchAction: "none",
      fontFamily: "ui-rounded,'Arial Rounded MT Bold',system-ui,sans-serif",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "space-between",
      padding: "0 20px 36px",
    }}>
      {/* Barra superior */}
      <div style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", paddingTop:16 }}>
        <button onClick={onVolver} style={{ background:"rgba(255,255,255,.5)", border:"none", fontSize:30, borderRadius:18, width:56, height:56, cursor:"pointer" }}>🏠</button>
        {/* título / feedback */}
        {/* racha */}
      </div>

      {/* Zona central */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        {/* contenido principal */}
      </div>

      {/* Opciones */}
      <div style={{ display:"flex", gap:16, width:"100%", maxWidth:420 }}>
        {/* botones de respuesta */}
      </div>
    </div>
  );
}
```

### 2. Reglas de UX obligatorias
- Botones mínimo `height: "clamp(80px, 16vw, 110px)"`
- `touchAction: "none"` en el contenedor principal
- Sin campos de texto ni teclado
- Sin tiempo límite
- Error: flash rojo breve (700ms), sin penalización, sin retroceso
- `onPointerDown` en botones (no `onClick`) para respuesta instantánea en touch
- Botón 🏠 siempre visible, mínimo 56×56px
- `height: "100dvh"` en el contenedor para Safari iOS

### 3. Añadir al menú — `components/MenuInicio.tsx`
```tsx
// En onJuego type:
onJuego: (juego: "..." | "nombre_nuevo") => void

// En el grid:
<BotonazoMenu emoji="➖" etiqueta="Restar" color="#RRGGBB" sombra="#RRGGBB" textColor="#ffffff" onClick={() => onJuego("nombre_nuevo")} />
```

### 4. Añadir a ZonaNina — `components/ZonaNina.tsx`
```tsx
// En type Modo:
type Modo = "..." | "nombre_nuevo";

// Import:
import NombreCanvas from "./NombreCanvas";

// Bloque if antes del return final:
if (modo === "nombre_nuevo") {
  return <NombreCanvas sonido={config.sonido} voz={config.voz} onVolver={() => setModo("menu")} />;
}
```

### 5. Verificar
```bash
npm run build
```
Sin errores TypeScript = listo para desplegar.

---

## Paletas de colores disponibles (para no repetir)
| Juego | Color principal | Sombra |
|---|---|---|
| Trazos | `#FFC93D` | `#E6A800` |
| Colorear | `#5BCB77` | `#3BA055` |
| Aventura | `#6BA8FF` | `#3A72CC` |
| Números | `#FF8C42` | `#CC6010` |
| Vocales | `#C792EA` | `#8A4FBF` |
| Contar | `#26C6DA` | `#0097A7` |
| Escucha nº | `#4ECDC4` | `#2A9D94` |
| Escucha voc | `#A78BFA` | `#6D4FC4` |
| Pronunciar | `#2ECC71` | `#1A9E55` |
| Ordenar | `#FF6B6B` | `#CC3333` |
| ¿Cuál falta? | `#26C6DA` | `#0097A7` |
| Más o menos | `#FFA726` | `#E65100` |
| Sumar | `#EC407A` | `#AD1457` |
| Antes/después | `#7E57C2` | `#4527A0` |

Usar un color nuevo o reutilizar uno de juegos temáticamente similares.

---

## Crear skill para el nuevo juego
Una vez creado, añadir `.claude/skills/nombre-nuevo/SKILL.md` documentando:
- Mecánica
- Estructura de `generarRonda()`
- Props
- Paleta
- Tareas comunes de ajuste
