"use client";

import { useState, useEffect, useRef } from "react";
import { pip, fanfarria, hablar } from "./aventura/utils";
import type { Figura } from "@/lib/figuras";

interface PuntosCanvasProps {
  figuras: Figura[];
  tipo: "numeros" | "vocales";
  sonido: boolean;
  voz: boolean;
  onVolver: () => void;
}

const FONDOS = {
  numeros: "radial-gradient(ellipse at 30% 20%, #FFF3DC 0%, #FFD580 100%)",
  vocales: "radial-gradient(ellipse at 70% 20%, #EEE0FF 0%, #C8A0F0 100%)",
};

const COLORES_ACENTO = {
  numeros: "#FF8C42",
  vocales: "#9B59D0",
};

export default function PuntosCanvas({ figuras, tipo, sonido, voz, onVolver }: PuntosCanvasProps) {
  const [figIdx, setFigIdx] = useState(0);
  const [tocados, setTocados] = useState<Set<number>>(new Set());
  const [errorIdx, setErrorIdx] = useState<number | null>(null);
  const [celebrando, setCelebrando] = useState(false);
  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const figura = figuras[figIdx];
  const siguiente = tocados.size; // próximo índice a tocar
  const acento = COLORES_ACENTO[tipo];

  useEffect(() => {
    if (voz) hablar(figura.frase);
    setTocados(new Set());
    setErrorIdx(null);
    setCelebrando(false);
  }, [figIdx]);

  function tocar(idx: number) {
    if (celebrando) return;
    if (idx === siguiente) {
      // Correcto
      if (sonido) pip(400 + idx * 60, 0.3, 0.2);
      const next = new Set(tocados).add(idx);
      setTocados(next);
      if (next.size === figura.puntos.length) {
        // Completado
        setCelebrando(true);
        if (sonido) setTimeout(fanfarria, 300);
        if (voz) setTimeout(() => hablar("¡Muy bien!"), 400);
        setTimeout(() => {
          setFigIdx(i => (i + 1) % figuras.length);
          setCelebrando(false);
        }, 1800);
      }
    } else {
      // Error
      if (sonido) pip(160, 0.25, 0.15, "sawtooth");
      setErrorIdx(idx);
      if (errorTimer.current) clearTimeout(errorTimer.current);
      errorTimer.current = setTimeout(() => setErrorIdx(null), 500);
    }
  }

  return (
    <div
      className="fixed inset-0"
      style={{
        background: FONDOS[tipo],
        touchAction: "none",
        height: "100dvh",
        fontFamily: "ui-rounded, 'Arial Rounded MT Bold', system-ui, sans-serif",
      }}
    >
      {/* Botón volver */}
      <button
        onClick={onVolver}
        style={{
          position: "fixed", top: 16, left: 16, zIndex: 50,
          background: "rgba(0,0,0,.12)", border: "none",
          fontSize: 32, borderRadius: 20, width: 60, height: 60,
          cursor: "pointer",
        }}
        aria-label="Volver al menú"
      >
        🏠
      </button>

      {/* Bocadillo */}
      <div style={{
        position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)",
        background: "rgba(255,255,255,.85)", borderRadius: 24,
        padding: "10px 24px", fontSize: 20, fontWeight: 800,
        color: "#333", boxShadow: "0 4px 16px rgba(0,0,0,.12)",
        zIndex: 30, whiteSpace: "nowrap",
      }}>
        {celebrando ? "¡Muy bien! 🎉" : `¿Cuál es el ${tipo === "numeros" ? "número" : "vocal"} siguiente?`}
      </div>

      {/* Guía: letra/número grande semitransparente */}
      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        fontSize: "clamp(220px, 40vw, 340px)",
        fontWeight: 900,
        color: acento,
        opacity: 0.12,
        userSelect: "none",
        pointerEvents: "none",
        lineHeight: 1,
        zIndex: 1,
      }}>
        {figura.label}
      </div>

      {/* Puntos */}
      {figura.puntos.map((p, i) => {
        const tocado = tocados.has(i);
        const esSiguiente = i === siguiente && !celebrando;
        const esError = errorIdx === i;
        return (
          <button
            key={i}
            onPointerDown={() => tocar(i)}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              transform: "translate(-50%, -50%)",
              width: 80, height: 80,
              borderRadius: "50%",
              border: "none",
              cursor: "pointer",
              touchAction: "none",
              zIndex: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: tocado ? 32 : 28,
              fontWeight: 900,
              transition: "transform .15s, background .15s",
              background: tocado
                ? "#5BCB77"
                : esError
                  ? "#FF4444"
                  : esSiguiente
                    ? acento
                    : "rgba(180,180,180,.45)",
              color: tocado || esSiguiente || esError ? "white" : "rgba(80,80,80,.6)",
              boxShadow: tocado
                ? "0 4px 0 #3BA055"
                : esSiguiente
                  ? `0 4px 0 rgba(0,0,0,.2)`
                  : "none",
              animation: esSiguiente ? "pulsar .8s ease-in-out infinite" : "none",
            }}
          >
            {tocado ? "✓" : i + 1}
          </button>
        );
      })}

      <style>{`
        @keyframes pulsar {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.15); }
        }
      `}</style>
    </div>
  );
}
