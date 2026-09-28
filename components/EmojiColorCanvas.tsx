"use client";

import { useState, useEffect, useRef } from "react";
import { pip, fanfarria, hablar } from "./aventura/utils";

// ─── Colores base (paleta de respuestas) ───────────────────────────────────────

export const COLORES_BASE = [
  { id: "rojo",     nombre: "rojo",     hex: "#E8604F" },
  { id: "azul",     nombre: "azul",     hex: "#4A90D9" },
  { id: "amarillo", nombre: "amarillo", hex: "#F4C430" },
  { id: "verde",    nombre: "verde",    hex: "#5BCB77" },
  { id: "naranja",  nombre: "naranja",  hex: "#FF8C42" },
  { id: "morado",   nombre: "morado",   hex: "#9B59B6" },
] as const;

type ColorId = (typeof COLORES_BASE)[number]["id"];

export interface ItemEmoji {
  emoji: string;
  nombre: string;   // nombre del elemento, ej: "fresa"
  colorId: ColorId; // color correcto
}

// ─── Sets de datos ──────────────────────────────────────────────────────────────

export const SET_FRUTAS: ItemEmoji[] = [
  { emoji: "🍓", nombre: "la fresa",   colorId: "rojo" },
  { emoji: "🍎", nombre: "la manzana", colorId: "rojo" },
  { emoji: "🍅", nombre: "el tomate",  colorId: "rojo" },
  { emoji: "🍌", nombre: "el plátano", colorId: "amarillo" },
  { emoji: "🍋", nombre: "el limón",   colorId: "amarillo" },
  { emoji: "🍊", nombre: "la naranja", colorId: "naranja" },
  { emoji: "🥕", nombre: "la zanahoria", colorId: "naranja" },
  { emoji: "🍇", nombre: "las uvas",   colorId: "morado" },
  { emoji: "🍆", nombre: "la berenjena", colorId: "morado" },
  { emoji: "🥝", nombre: "el kiwi",    colorId: "verde" },
  { emoji: "🥑", nombre: "el aguacate", colorId: "verde" },
  { emoji: "🫐", nombre: "los arándanos", colorId: "azul" },
];

export const SET_NATURALEZA: ItemEmoji[] = [
  { emoji: "☀️", nombre: "el sol",     colorId: "amarillo" },
  { emoji: "🌻", nombre: "el girasol", colorId: "amarillo" },
  { emoji: "🌿", nombre: "la hierba",  colorId: "verde" },
  { emoji: "🌳", nombre: "el árbol",   colorId: "verde" },
  { emoji: "🍃", nombre: "la hoja",    colorId: "verde" },
  { emoji: "🌊", nombre: "el mar",     colorId: "azul" },
  { emoji: "💧", nombre: "el agua",    colorId: "azul" },
  { emoji: "🔥", nombre: "el fuego",   colorId: "rojo" },
  { emoji: "🌹", nombre: "la rosa",    colorId: "rojo" },
  { emoji: "🍂", nombre: "las hojas secas", colorId: "naranja" },
  { emoji: "🍇", nombre: "las uvas",   colorId: "morado" },
  { emoji: "🌷", nombre: "el tulipán", colorId: "morado" },
];

const TOTAL_RONDAS = 20;

interface EmojiColorCanvasProps {
  set: ItemEmoji[];
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

function color(id: ColorId) {
  return COLORES_BASE.find(c => c.id === id)!;
}

function generarRonda(set: ItemEmoji[]) {
  const item = set[Math.floor(Math.random() * set.length)];
  const correcto = color(item.colorId);
  const cuantos = aleatorio(3, 4);
  // Distractores: colores distintos al correcto
  const distractores = barajar(COLORES_BASE.filter(c => c.id !== correcto.id)).slice(0, cuantos - 1);
  const opciones = barajar([correcto, ...distractores]);
  return { item, correcto, opciones };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function EmojiColorCanvas({ set, sonido, voz, onVolver }: EmojiColorCanvasProps) {
  const [ronda, setRonda] = useState(() => generarRonda(set));
  const [rondaNum, setRondaNum] = useState(1);
  const [estado, setEstado] = useState<"jugando" | "correcto" | "error">("jugando");
  const [idError, setIdError] = useState<string | null>(null);
  const [racha, setRacha] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (voz) hablar(`¿De qué color es ${ronda.item.nombre}?`);
  }, [ronda, voz]);

  function limpiarTimer() {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }

  function tocarOpcion(c: (typeof COLORES_BASE)[number]) {
    if (estado !== "jugando") return;
    limpiarTimer();

    if (c.id === ronda.correcto.id) {
      setEstado("correcto");
      if (sonido) fanfarria();
      if (voz) setTimeout(() => hablar(`¡Sí! ${ronda.item.nombre} es ${c.nombre}`), 300);
      setRacha(r => r + 1);
      timerRef.current = setTimeout(() => {
        if (rondaNum >= TOTAL_RONDAS) { onVolver(true); return; }
        setRondaNum(n => n + 1);
        setRonda(generarRonda(set));
        setEstado("jugando");
        setIdError(null);
      }, 1800);
    } else {
      setIdError(c.id);
      setEstado("error");
      if (sonido) pip(160, 0.3, 0.18, "sawtooth");
      if (voz) setTimeout(() => hablar(`Ese es ${c.nombre}. Prueba otra vez`), 150);
      timerRef.current = setTimeout(() => {
        setEstado("jugando");
        setIdError(null);
      }, 1600);
    }
  }

  useEffect(() => () => limpiarTimer(), []);

  const { item, correcto, opciones } = ronda;

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
          fontSize: 30, borderRadius: 18, width: 56, height: 56, cursor: "pointer",
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

      {/* Emoji + pregunta arriba */}
      <div style={{
        position: "absolute", top: "8%", left: "50%", transform: "translateX(-50%)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
        zIndex: 10, width: "100%",
      }}>
        <div style={{
          fontSize: "clamp(90px, 24vw, 190px)", lineHeight: 1,
          filter: "drop-shadow(0 8px 12px rgba(0,0,0,.18))",
          transform: estado === "correcto" ? "scale(1.12)" : "scale(1)",
          transition: "transform .2s",
        }}>
          {item.emoji}
        </div>
        <div style={{
          background: "rgba(255,255,255,.85)", borderRadius: 28,
          padding: "10px 24px", fontSize: "clamp(16px,3.5vw,26px)", fontWeight: 800,
          color: "#1a3a5c", boxShadow: "0 4px 16px rgba(0,0,0,.1)", textAlign: "center",
        }}>
          ¿De qué color es {item.nombre}?
        </div>
      </div>

      {/* Celebración 🎉 abajo (no tapa la fila de colores) */}
      {estado === "correcto" && (
        <div style={{
          position: "fixed", left: 0, right: 0, bottom: "3%", zIndex: 30,
          display: "flex", justifyContent: "center", pointerEvents: "none",
        }}>
          <div style={{
            fontSize: "clamp(60px,13vw,110px)",
            animation: "popIn .35s cubic-bezier(.34,1.56,.64,1)",
          }}>
            🎉
          </div>
        </div>
      )}

      {/* Botones de color (fila centrada verticalmente, algo hacia abajo) */}
      <div style={{
        position: "fixed", left: 0, right: 0, bottom: "18%",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexWrap: "wrap",
        gap: "clamp(16px, 4vw, 40px)",
        padding: "0 24px",
        zIndex: 20,
      }}>
        {opciones.map(c => {
          const esCorrecto = estado === "correcto" && c.id === correcto.id;
          const esError    = idError === c.id;
          return (
            <button
              key={c.id}
              onPointerDown={() => tocarOpcion(c)}
              aria-label={c.nombre}
              style={{
                width: "clamp(90px, 20vw, 160px)",
                height: "clamp(90px, 20vw, 160px)",
                border: "none",
                borderRadius: "50%",
                background: c.hex,
                cursor: "pointer",
                touchAction: "none",
                transition: "transform .15s, box-shadow .15s, filter .15s",
                boxShadow: esCorrecto
                  ? `0 0 0 6px #fff, 0 8px 24px ${c.hex}`
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
