"use client";

import { Estrellita } from "./Piezas";

const LUGARES = [
  { id: 1,  x: 50,  y: 72, emoji: "🌙", nombre: "Luna"    },
  { id: 2,  x: 78,  y: 55, emoji: "☁️", nombre: "Nube"    },
  { id: 3,  x: 30,  y: 58, emoji: "🌸", nombre: "Jardín"  },
  { id: 4,  x: 62,  y: 80, emoji: "🐟", nombre: "Río"     },
  { id: 5,  x: 18,  y: 78, emoji: "🐄", nombre: "Granja"  },
  { id: 6,  x: 85,  y: 75, emoji: "🏰", nombre: "Castillo"},
  { id: 7,  x: 42,  y: 40, emoji: "🍄", nombre: "Bosque"  },
  { id: 8,  x: 70,  y: 35, emoji: "🌊", nombre: "Mar"     },
  { id: 9,  x: 22,  y: 42, emoji: "🏙️", nombre: "Ciudad"  },
  { id: 10, x: 55,  y: 20, emoji: "🏠", nombre: "Casa"    },
];

export default function MapaMundo({
  completadas, onEntrar,
}: { completadas: Set<number>; onEntrar: (n: number) => void }) {
  const siguiente = Math.min(
    10,
    [...completadas].length + 1,
  );

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        background: "radial-gradient(ellipse at 50% 0%, #1a3a6e 0%, #0A1628 70%)",
        fontFamily: "ui-rounded, 'Arial Rounded MT Bold', system-ui, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Estrellas de fondo */}
      {Array.from({ length: 60 }, (_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${(i * 37 + i * i * 3) % 100}%`,
          top: `${(i * 53 + i * 7) % 90}%`,
          width: i % 5 === 0 ? 4 : 2,
          height: i % 5 === 0 ? 4 : 2,
          borderRadius: "50%",
          background: "white",
          opacity: 0.3 + (i % 7) * 0.07,
          animation: `flotar ${2 + (i % 4)}s ease-in-out infinite`,
          animationDelay: `${(i % 10) * 0.3}s`,
        }} />
      ))}

      {/* Título */}
      <div style={{
        position: "absolute", top: 80, left: "50%",
        transform: "translateX(-50%)",
        color: "#FFC93D",
        fontSize: "clamp(22px, 5vw, 36px)",
        fontWeight: 900,
        textShadow: "0 0 20px rgba(255,201,61,.6)",
        whiteSpace: "nowrap",
        zIndex: 5,
      }}>
        🗺️ Mapa de la Estrellita
      </div>

      {/* Localizaciones */}
      <div style={{ position: "relative", width: "min(90vw, 600px)", height: "min(80vh, 560px)" }}>
        {LUGARES.map(lugar => {
          const hecho     = completadas.has(lugar.id);
          const esActual  = lugar.id === siguiente;
          const bloqueado = lugar.id > siguiente;

          return (
            <button
              key={lugar.id}
              onClick={() => !bloqueado && onEntrar(lugar.id)}
              style={{
                position: "absolute",
                left: `${lugar.x}%`,
                top: `${lugar.y}%`,
                transform: "translate(-50%, -50%)",
                width: 80, height: 80,
                borderRadius: 40,
                border: hecho
                  ? "4px solid #FFC93D"
                  : esActual
                    ? "4px solid white"
                    : "4px solid rgba(255,255,255,.2)",
                background: hecho
                  ? "rgba(255,201,61,.3)"
                  : esActual
                    ? "rgba(255,255,255,.2)"
                    : "rgba(255,255,255,.06)",
                fontSize: 36,
                cursor: bloqueado ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexDirection: "column", gap: 0,
                animation: esActual ? "brincar .8s ease infinite alternate" : undefined,
                boxShadow: hecho
                  ? "0 0 18px rgba(255,201,61,.7)"
                  : esActual
                    ? "0 0 18px rgba(255,255,255,.5)"
                    : "none",
                opacity: bloqueado ? 0.35 : 1,
                transition: "opacity .3s",
                zIndex: 5,
              }}
              aria-label={lugar.nombre}
            >
              <span style={{ filter: bloqueado ? "grayscale(1)" : "none", fontSize: 32 }}>
                {lugar.emoji}
              </span>
              <span style={{
                fontSize: 9, color: "white", opacity: bloqueado ? 0.4 : 0.85,
                fontWeight: 700, lineHeight: 1.2,
              }}>
                {lugar.nombre}
              </span>
              {hecho && (
                <span style={{
                  position: "absolute", top: -8, right: -8,
                  fontSize: 18, background: "#FFC93D",
                  borderRadius: 12, width: 22, height: 22,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  ✓
                </span>
              )}
            </button>
          );
        })}

        {/* Camino entre localizaciones */}
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {LUGARES.slice(0, -1).map((lugar, i) => {
            const siguiente2 = LUGARES[i + 1];
            const linea_hecha = completadas.has(lugar.id);
            return (
              <line
                key={i}
                x1={lugar.x} y1={lugar.y}
                x2={siguiente2.x} y2={siguiente2.y}
                stroke={linea_hecha ? "#FFC93D" : "rgba(255,255,255,.15)"}
                strokeWidth="0.8"
                strokeDasharray="2 2"
              />
            );
          })}
        </svg>
      </div>

      {/* Estrellita flotando en el último completado o inicio */}
      <Estrellita
        x={
          completadas.size > 0
            ? (LUGARES[completadas.size - 1].x / 100) * Math.min(window.innerWidth * 0.9, 600) - 40
            : (LUGARES[0].x / 100) * Math.min(window.innerWidth * 0.9, 600) - 40
        }
        y={
          completadas.size > 0
            ? (LUGARES[completadas.size - 1].y / 100) * Math.min(window.innerHeight * 0.8, 560) - 40
            : (LUGARES[0].y / 100) * Math.min(window.innerHeight * 0.8, 560) - 40
        }
        size={60}
      />
    </div>
  );
}
