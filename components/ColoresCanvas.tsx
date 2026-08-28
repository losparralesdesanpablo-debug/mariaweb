"use client";

import { useState, useEffect, useRef } from "react";
import { pip, fanfarria, hablar } from "./aventura/utils";

// ─── Datos ────────────────────────────────────────────────────────────────────

const COLORES = [
  { id: "rojo",     nombre: "rojo",     hex: "#E8604F" },
  { id: "azul",     nombre: "azul",     hex: "#4A90D9" },
  { id: "amarillo", nombre: "amarillo", hex: "#F4C430" },
  { id: "verde",    nombre: "verde",    hex: "#5BCB77" },
  { id: "naranja",  nombre: "naranja",  hex: "#FF8C42" },
  { id: "morado",   nombre: "morado",   hex: "#9B59B6" },
];

type Color = (typeof COLORES)[number];

const TOTAL_RONDAS = 20;

interface ColoresCanvasProps {
  sonido: boolean;
  voz: boolean;
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

function generarRonda() {
  const cuantos = aleatorio(3, 4);
  const opciones = barajar(COLORES).slice(0, cuantos);
  const pedido = opciones[Math.floor(Math.random() * opciones.length)];
  return { opciones, pedido };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ColoresCanvas({ sonido, voz, onVolver }: ColoresCanvasProps) {
  const [ronda, setRonda] = useState(() => generarRonda());
  const [rondaNum, setRondaNum] = useState(1);
  const [estado, setEstado] = useState<"jugando" | "correcto" | "error">("jugando");
  const [idError, setIdError] = useState<string | null>(null);
  const [racha, setRacha] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (voz) hablar(`Toca lo que es de color ${ronda.pedido.nombre}`);
  }, [ronda, voz]);

  function limpiarTimer() {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }

  function tocarOpcion(color: Color) {
    if (estado !== "jugando") return;
    limpiarTimer();

    if (color.id === ronda.pedido.id) {
      setEstado("correcto");
      if (sonido) fanfarria();
      if (voz) setTimeout(() => hablar(`¡Sí! Es ${color.nombre}`), 300);
      setRacha(r => r + 1);
      timerRef.current = setTimeout(() => {
        if (rondaNum >= TOTAL_RONDAS) {
          onVolver(true);
          return;
        }
        setRondaNum(n => n + 1);
        setRonda(generarRonda());
        setEstado("jugando");
        setIdError(null);
      }, 1800);
    } else {
      setIdError(color.id);
      setEstado("error");
      if (sonido) pip(160, 0.3, 0.18, "sawtooth");
      if (voz) setTimeout(() => hablar(`Ese es ${color.nombre}, busca el ${ronda.pedido.nombre}`), 150);
      timerRef.current = setTimeout(() => {
        setEstado("jugando");
        setIdError(null);
      }, 2000);
    }
  }

  useEffect(() => () => limpiarTimer(), []);

  const { opciones, pedido } = ronda;

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
        background: "rgba(255,255,255,.85)", borderRadius: 28,
        padding: "12px 28px", fontSize: "clamp(18px,4vw,28px)", fontWeight: 800,
        color: "#1a3a5c", whiteSpace: "nowrap", zIndex: 10,
        boxShadow: "0 4px 16px rgba(0,0,0,.1)",
      }}>
        Toca el color <span style={{ color: pedido.hex }}>{pedido.nombre}</span>
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

      {/* Formas de colores */}
      <div style={{
        position: "fixed", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: "clamp(16px, 4vw, 40px)",
        padding: "0 24px",
        zIndex: 20,
      }}>
        {opciones.map(color => {
          const esCorrecto = estado === "correcto" && color.id === pedido.id;
          const esError    = idError === color.id;
          return (
            <button
              key={color.id}
              onPointerDown={() => tocarOpcion(color)}
              aria-label={color.nombre}
              style={{
                width: "clamp(100px, 22vw, 180px)",
                height: "clamp(100px, 22vw, 180px)",
                border: "none",
                borderRadius: "50%",
                background: color.hex,
                cursor: "pointer",
                touchAction: "none",
                transition: "transform .15s, box-shadow .15s, filter .15s",
                boxShadow: esCorrecto
                  ? `0 0 0 6px #fff, 0 8px 24px ${color.hex}`
                  : "0 8px 0 rgba(0,0,0,.18)",
                filter: esError ? "grayscale(.4) brightness(.85)" : "none",
                transform: esCorrecto ? "scale(1.14) translateY(-6px)"
                           : esError   ? "scale(.9) translateY(4px)"
                           : "scale(1)",
              }}
            />
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
