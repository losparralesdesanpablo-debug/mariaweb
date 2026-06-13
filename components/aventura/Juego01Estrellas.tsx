"use client";

// Toca las 5 estrellas dormidas para despertarlas
import { useState, useEffect } from "react";
import { Estrellita, Bocadillo } from "./Piezas";
import { pip, fanfarria, hablar } from "./utils";
import type { JuegoProps } from "./utils";

const POS = [
  { x: 18, y: 25 }, { x: 72, y: 18 }, { x: 45, y: 55 },
  { x: 82, y: 60 }, { x: 28, y: 72 },
];

export default function Juego01Estrellas({ sonido, voz, onCompletado }: JuegoProps) {
  const [despiertas, setDespiertas] = useState<Set<number>>(new Set());
  const [celebrando, setCelebrando] = useState(false);

  useEffect(() => {
    if (voz) hablar("Toca las estrellas para despertarlas");
  }, [voz]);

  function tocar(i: number) {
    if (despiertas.has(i)) return;
    if (sonido) pip(440 + i * 110, 0.25, 0.22);
    const next = new Set(despiertas).add(i);
    setDespiertas(next);
    if (next.size === POS.length) {
      setCelebrando(true);
      if (sonido) setTimeout(fanfarria, 300);
      if (voz) setTimeout(() => hablar("¡Muy bien! Las estrellas están despiertas"), 400);
      setTimeout(onCompletado, 1800);
    }
  }

  return (
    <div className="fixed inset-0" style={{
      background: "radial-gradient(ellipse at 50% 0%, #1a3a6e 0%, #0A1628 80%)",
      touchAction: "none",
    }}>
      <Bocadillo texto="¡Despierta las estrellas! ✨" />
      <Estrellita x={30} y={140} size={70} celebrando={celebrando} />

      {POS.map((p, i) => {
        const ok = despiertas.has(i);
        return (
          <button
            key={i}
            onPointerDown={() => tocar(i)}
            style={{
              position: "absolute",
              left: `${p.x}%`, top: `${p.y}%`,
              transform: "translate(-50%,-50%)",
              width: 90, height: 90,
              borderRadius: "50%",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              touchAction: "none",
              transition: "transform .2s",
            }}
            aria-label={`Estrella ${i + 1}`}
          >
            <svg viewBox="0 0 100 100" width={80} height={80}>
              <polygon
                points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35"
                fill={ok ? "#FFC93D" : "#1e2d4a"}
                stroke={ok ? "#E6A800" : "#3a5080"}
                strokeWidth="3"
                style={{ filter: ok ? "drop-shadow(0 0 12px #FFC93D)" : "none", transition: "all .3s" }}
              />
              {ok && <>
                <circle cx="40" cy="44" r="4" fill="#2A4D69" />
                <circle cx="60" cy="44" r="4" fill="#2A4D69" />
                <path d="M 38 56 Q 50 64 62 56" fill="none" stroke="#2A4D69" strokeWidth="3" strokeLinecap="round" />
              </>}
              {!ok && <>
                <line x1="35" y1="48" x2="45" y2="48" stroke="#3a5080" strokeWidth="3" strokeLinecap="round" />
                <line x1="55" y1="48" x2="65" y2="48" stroke="#3a5080" strokeWidth="3" strokeLinecap="round" />
                <path d="M 40 58 Q 50 54 60 58" fill="none" stroke="#3a5080" strokeWidth="2" strokeLinecap="round" />
              </>}
            </svg>
          </button>
        );
      })}
    </div>
  );
}
