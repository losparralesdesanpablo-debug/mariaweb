# Caminitos — Resumen de la aplicación

## ¿Qué es?

Caminitos es una app web progresiva (PWA) pensada para tablet/iPad con Apple Pencil. Está dirigida a niñas de preescolar (3–6 años aprox.). El padre o la madre configura el entorno desde una zona privada; la niña juega en la zona principal sin fricciones.

Stack: Next.js 16 + Supabase + TypeScript. Desplegada en mariaweb.es.

---

## Zona de la niña — Actividades disponibles

### Grafomotricidad (trazo)

| Actividad | Componente | Descripción |
|---|---|---|
| **Trazos** | `TrazoCanvas` | Sigue caminos con el dedo/lápiz: ondas, zigzag, círculo. Mide % de acierto por tolerancia en píxeles. |
| **Números** | `NumeroTrazoCanvas` | Traza los números 0–9 con guía semitransparente. |
| **Vocales** | `VocalTrazoCanvas` | Traza A, E, I, O, U con el mismo sistema. |

### Reconocimiento visual / auditivo

| Actividad | Componente | Descripción |
|---|---|---|
| **Colorear** | `ColorearCanvas` | Rellena zonas de dibujos por colores. Feedback con estrellas. |
| **Contar** | `ContarCanvas` | Se muestran objetos (hasta 5); la niña elige el número correcto. |
| **Escucha número** | `ReconocerCanvas (numeros)` | Suena un número en voz, la niña lo reconoce entre 4 opciones. |
| **Escucha vocal** | `ReconocerCanvas (vocales)` | Igual con vocales (A/E/I/O/U). |
| **¿Cuál falta?** | `FaltaCanvas` | Secuencia de números con uno oculto; la niña lo identifica. |
| **Ordenar** | `OrdenarCanvas` | Ordena una serie de números barajados. |
| **Más o menos** | `MasMenosCanvas` | Compara dos cantidades y elige cuál es mayor. |
| **Sumar** | `SumarCanvas` | Suma visual con objetos (resultado hasta 10). |
| **Antes y después** | `AntesDepuesCanvas` | Dado un número, indica cuál va antes y cuál después. |

### Producción oral

| Actividad | Componente | Descripción |
|---|---|---|
| **Pronunciar** | `PronunciarCanvas` | Muestra una imagen; la niña dice el nombre en voz alta. Reconocimiento de voz del navegador. |

### Aventura (juego narrativo)

| Actividad | Componente | Descripción |
|---|---|---|
| **Aventura** | `AventuraCanvas` | Mapa-mundo con 10 escenas desbloqueables. Cada escena es un minijuego de interacción táctil (tocar estrellas, nubes, peces, animales…). |

---

## Sistema de motivación (premio)

- Contador de juegos completados visible en el menú principal (barra de progreso).
- Al llegar al umbral configurado (por defecto 5 juegos), se desbloquea un vídeo de YouTube a pantalla completa como premio.
- Los vídeos los añade el adulto desde la zona padres. Si no hay ninguno configurado, usa un vídeo de reserva hardcodeado.
- Un juego cuenta como "completado" solo si la niña superó el 50% del reto (o acertó al menos 1 respuesta en los juegos de opción múltiple).
- El adulto puede pulsar "¡Tu premio te espera!" manualmente si quiere activarlo antes de tiempo.

---

## Zona de padres

Acceso por PIN largo (3 s) en la esquina inferior izquierda del menú. Login con email/contraseña vía Supabase Auth.

| Panel | Función |
|---|---|
| **Usuarias** | Crear/editar perfiles de niñas. Configura PIN de acceso, notas, umbrales y ajustes. |
| **Ajustes** | Sonido, voz TTS, tolerancia de trazo, % mínimo para completar, juegos para premio. |
| **Rendimiento** | Estadísticas semanales por actividad: intentos, % medio, mejor marca, tiempo, pausas. Botón de borrado inline con selector de rango (hoy / última semana / todo). |
| **Vídeos premio** | Añadir vídeos de YouTube por URL, activar/desactivar, eliminar. |

---

## Parámetros pedagógicos configurables

- `tolerancia_px` — margen de error en píxeles para los trazos (mayor = más fácil).
- `porcentaje_para_completar` — % mínimo del camino correcto para dar el trazo por válido.
- `juegos_para_premio` — cuántos juegos hay que completar para ganar el vídeo (1–20).
- `sonido` — activa/desactiva efectos de audio.
- `voz` — activa/desactiva instrucciones en voz (TTS del navegador).

---

## Aspectos técnicos relevantes

- Funciona sin conexión parcialmente (los trazos se encolan en `trazo-store` y se reenvían cuando vuelve la red).
- Diseño pensado para pantalla táctil vertical (768×1024 px). Sin scroll lateral, todo en `100dvh`.
- No usa frameworks de UI: estilos inline + Tailwind mínimo.
- Los juegos de aventura son HTML+SVG puro, sin canvas.
- Los juegos de trazo usan `<canvas>` con `requestAnimationFrame` y tolerancia por distancia euclídea punto a punto.
