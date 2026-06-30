"use client";

import { useState, useEffect, useRef } from "react";
import { pip, fanfarria, hablar } from "./aventura/utils";

// ─── Datos ────────────────────────────────────────────────────────────────────

const OBJETOS = [
  { emoji: "🐥", nombre: "patitos"    },
  { emoji: "🐸", nombre: "ranitas"    },
  { emoji: "⭐", nombre: "estrellas"  },
  { emoji: "🍎", nombre: "manzanas"  },
  { emoji: "🌸", nombre: "flores"    },
  { emoji: "🐞", nombre: "mariquitas"},
  { emoji: "🦋", nombre: "mariposas" },
  { emoji: "🍭", nombre: "chupachups"},
  { emoji: "🐠", nombre: "peces"     },
  { emoji: "🎈", nombre: "globos"    },
];

const MAX_NUMERO = 5;

interface ContarJuegoProps {
  sonido: boolean;
  voz: boolean;
  nivel?: 1 | 2 | 3;
  onVolver: (completado: boolean) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function aleatorio(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function barajar<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generarOpciones(correcto: number): number[] {
  const set = new Set<number>([correcto]);
  while (set.size < 3) {
    const v = aleatorio(1, MAX_NUMERO);
    set.add(v);
  }
  return barajar([...set]);
}

function generarRonda() {
  const cantidad = aleatorio(1, MAX_NUMERO);
  const obj = OBJETOS[Math.floor(Math.random() * OBJETOS.length)];
  const opciones = generarOpciones(cantidad);
  // Posiciones aleatorias para los objetos (evitando la zona inferior de botones)
  const posiciones = Array.from({ length: cantidad }, () => ({
    x: aleatorio(8, 88),
    y: aleatorio(18, 62),
    rot: aleatorio(-18, 18),
    scale: 0.85 + Math.random() * 0.35,
  }));
  return { cantidad, obj, opciones, posiciones };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ContarCanvas({ sonido, voz, onVolver }: ContarJuegoProps) {
  const [ronda, setRonda]         = useState(() => generarRonda());
  const [estado, setEstado]       = useState<"jugando" | "correcto" | "error">("jugando");
  const [opcionError, setOpcionError] = useState<number | null>(null);
  const [mensajeError, setMensajeError] = useState<string>("");
  const [racha, setRacha]         = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (voz) hablar(`¿Cuántos ${ronda.obj.nombre} hay?`);
  }, [ronda]);

  function limpiarTimer() {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }

  function tocarOpcion(n: number) {
    if (estado !== "jugando") return;
    limpiarTimer();

    if (n === ronda.cantidad) {
      setEstado("correcto");
      if (sonido) fanfarria();
      if (voz) setTimeout(() => hablar(`¡Sí! ${ronda.cantidad} ${ronda.obj.nombre}`), 300);
      setRacha(r => r + 1);
      timerRef.current = setTimeout(() => {
        setRonda(generarRonda());
        setEstado("jugando");
        setOpcionError(null);
        setMensajeError("");
      }, 1800);
    } else {
      const esMayor = n > ronda.cantidad;
      const pista = esMayor ? "es demasiado grande" : "es demasiado pequeño";
      const msg = `${n} ${pista}`;
      setOpcionError(n);
      setMensajeError(esMayor ? `El ${n} es muy grande` : `El ${n} es muy pequeño`);
      setEstado("error");
      if (sonido) pip(160, 0.3, 0.18, "sawtooth");
      if (voz) setTimeout(() => hablar(msg), 150);
      timerRef.current = setTimeout(() => {
        setEstado("jugando");
        setOpcionError(null);
        setMensajeError("");
      }, 2000);
    }
  }

  useEffect(() => () => limpiarTimer(), []);

  const { cantidad, obj, opciones, posiciones } = ronda;

  return (
    <div
      className="fixed inset-0"
      style={{
        background: "radial-gradient(ellipse at 20% 10%, #E8F5FF 0%, #B3D9FF 60%, #7DB8E8 100%)",
        height: "100dvh",
        touchAction: "none",
        fontFamily: "ui-rounded, 'Arial Rounded MT Bold', system-ui, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Botón volver */}
      <button
        onClick={() => onVolver(racha > 0)}
        style={{
          position: "fixed", top: 16, left: 16, zIndex: 50,
          background: "rgba(255,255,255,.5)", border: "none",
          fontSize: 30, borderRadius: 18, width: 56, height: 56,
          cursor: "pointer",
        }}
        aria-label="Volver al menú"
      >
        🏠
      </button>

      {/* Racha */}
      {racha > 0 && (
        <div style={{
          position: "fixed", top: 20, right: 16, zIndex: 50,
          background: "rgba(255,255,255,.55)", borderRadius: 20,
          padding: "6px 16px", fontSize: 18, fontWeight: 800, color: "#2A4D69",
        }}>
          {"⭐".repeat(Math.min(racha, 5))}
        </div>
      )}

      {/* Pregunta */}
      <div style={{
        position: "absolute", top: "6%", left: "50%", transform: "translateX(-50%)",
        background: "rgba(255,255,255,.75)", borderRadius: 28,
        padding: "10px 28px", fontSize: "clamp(18px,4vw,26px)", fontWeight: 800,
        color: "#1a3a5c", whiteSpace: "nowrap", zIndex: 10,
        boxShadow: "0 4px 16px rgba(0,0,0,.1)",
      }}>
        ¿Cuántos {obj.nombre} hay? {obj.emoji}
      </div>

      {/* Celebración overlay */}
      {estado === "correcto" && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 30,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(255,255,255,.15)",
          pointerEvents: "none",
        }}>
          <div style={{
            fontSize: "clamp(80px,18vw,140px)",
            animation: "popIn .35s cubic-bezier(.34,1.56,.64,1)",
          }}>
            🎉
          </div>
        </div>
      )}

      {/* Objetos en pantalla */}
      {posiciones.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            transform: `translate(-50%,-50%) rotate(${p.rot}deg) scale(${p.scale})`,
            fontSize: "clamp(72px, 16vw, 110px)",
            pointerEvents: "none",
            userSelect: "none",
            filter: estado === "correcto"
              ? "drop-shadow(0 0 14px rgba(91,203,119,.9))"
              : "drop-shadow(0 4px 8px rgba(0,0,0,.18))",
            transition: "filter .3s",
            zIndex: 5,
          }}
        >
          {obj.emoji}
        </div>
      ))}

      {/* Botones de números */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        padding: "16px 20px 32px",
        display: "flex", gap: 14, justifyContent: "center",
        background: "linear-gradient(0deg, rgba(100,170,230,.55) 0%, transparent 100%)",
        zIndex: 20,
      }}>
        {opciones.map(n => {
          const esCorrecto = estado === "correcto" && n === cantidad;
          const esError    = opcionError === n;
          return (
            <div key={n} style={{ flex: 1, maxWidth: 140, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              {/* Bocadillo de pista (solo en el botón erróneo) */}
              {esError && mensajeError && (
                <div style={{
                  background: "#FF5555",
                  color: "white",
                  borderRadius: 16,
                  padding: "6px 14px",
                  fontSize: "clamp(13px, 2.8vw, 17px)",
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                  boxShadow: "0 3px 0 #CC2222",
                  animation: "popIn .25s cubic-bezier(.34,1.56,.64,1)",
                }}>
                  {mensajeError}
                </div>
              )}
              <button
                onPointerDown={() => tocarOpcion(n)}
                style={{
                  width: "100%",
                  height: "clamp(100px, 18vw, 130px)",
                  border: "none",
                  borderRadius: 28,
                  fontSize: "clamp(52px, 11vw, 80px)",
                  fontWeight: 900,
                  cursor: "pointer",
                  touchAction: "none",
                  transition: "transform .15s, background .15s, box-shadow .15s",
                  background: esCorrecto
                    ? "#5BCB77"
                    : esError
                      ? "#FF5555"
                      : "rgba(255,255,255,.85)",
                  color: esCorrecto || esError ? "white" : "#2A4D69",
                  boxShadow: esCorrecto
                    ? "0 6px 0 #3BA055"
                    : esError
                      ? "0 6px 0 #CC2222"
                      : "0 6px 0 rgba(0,0,0,.18)",
                  transform: esCorrecto ? "scale(1.12) translateY(-4px)"
                             : esError   ? "scale(.94) translateY(4px)"
                             : "scale(1)",
                }}
              >
                {n}
              </button>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes popIn {
          0%   { transform: scale(0.4); opacity: 0; }
          100% { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}
