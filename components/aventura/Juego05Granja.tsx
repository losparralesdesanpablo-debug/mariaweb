"use client";

// Toca el animal que hace el sonido que escuchas
import { useState, useEffect } from "react";
import { Estrellita, Bocadillo } from "./Piezas";
import { pip, fanfarria, hablar } from "./utils";
import type { JuegoProps } from "./utils";

const ANIMALES = [
  { id: "vaca",   emoji: "🐄", sonido: "muuu",   x: 20, y: 50 },
  { id: "oveja",  emoji: "🐑", sonido: "beee",   x: 50, y: 55 },
  { id: "pato",   emoji: "🦆", sonido: "cuac",   x: 78, y: 52 },
  { id: "cerdo",  emoji: "🐷", sonido: "oink",   x: 35, y: 75 },
  { id: "gallina",emoji: "🐔", sonido: "cloc",   x: 65, y: 72 },
];

const ORDEN = ["vaca", "oveja", "pato", "cerdo", "gallina"];

export default function Juego05Granja({ sonido, voz, onCompletado }: JuegoProps) {
  const [paso, setPaso] = useState(0);
  const [acertados, setAcertados] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [celebrando, setCelebrando] = useState(false);

  const animalActual = ANIMALES.find(a => a.id === ORDEN[paso]);

  useEffect(() => {
    if (animalActual && voz) {
      const timer = setTimeout(() => hablar(`¿Qué animal dice ${animalActual.sonido}?`), 400);
      return () => clearTimeout(timer);
    }
  }, [paso, voz, animalActual]);

  function tocar(id: string) {
    if (acertados.has(id)) return;
    if (id === ORDEN[paso]) {
      if (sonido) pip(440 + paso * 80, 0.3, 0.25);
      const next = new Set(acertados).add(id);
      setAcertados(next);
      setError(null);
      if (next.size === ORDEN.length) {
        setCelebrando(true);
        if (sonido) setTimeout(fanfarria, 300);
        if (voz) setTimeout(() => hablar("¡Muy bien! Conoces todos los animales"), 400);
        setTimeout(onCompletado, 1800);
      } else {
        setPaso(p => p + 1);
      }
    } else {
      if (sonido) pip(180, 0.15, 0.12, "sawtooth");
      setError(id);
      setTimeout(() => setError(null), 600);
    }
  }

  return (
    <div className="fixed inset-0" style={{
      background: "linear-gradient(180deg, #87CEEB 0%, #C8E8FF 35%, #5BCB77 35%, #3BA055 100%)",
      touchAction: "none",
    }}>
      <Bocadillo texto={`¿Quién dice "${animalActual?.sonido}"? 🐾`} />
      <Estrellita x={10} y={140} size={65} celebrando={celebrando} />

      {/* Granja de fondo */}
      <svg style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", pointerEvents: "none" }}
        viewBox="0 0 200 100" width={200} height={100}>
        <rect x="60" y="40" width="80" height="60" fill="#D2691E" />
        <polygon points="60,40 100,10 140,40" fill="#8B0000" />
        <rect x="90" y="70" width="20" height="30" fill="#5D4037" />
        <rect x="70" y="55" width="15" height="15" fill="#87CEEB" stroke="#5D4037" strokeWidth="2" />
        <rect x="115" y="55" width="15" height="15" fill="#87CEEB" stroke="#5D4037" strokeWidth="2" />
      </svg>

      {ANIMALES.map(a => {
        const ok  = acertados.has(a.id);
        const err = error === a.id;
        const esActivo = a.id === ORDEN[paso] && !ok;
        return (
          <button
            key={a.id}
            onPointerDown={() => tocar(a.id)}
            style={{
              position: "absolute",
              left: `${a.x}%`, top: `${a.y}%`,
              transform: `translate(-50%,-50%) scale(${err ? 0.9 : esActivo ? 1.1 : 1})`,
              width: 90, height: 90,
              borderRadius: 20,
              border: ok ? "4px solid #FFC93D" : esActivo ? "4px solid white" : "3px solid rgba(255,255,255,.3)",
              background: ok ? "rgba(255,201,61,.3)" : err ? "rgba(255,100,100,.4)" : "rgba(255,255,255,.2)",
              cursor: ok ? "default" : "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 2,
              touchAction: "none",
              transition: "transform .15s, border .2s",
              backdropFilter: "blur(4px)",
              zIndex: 10,
            }}
            aria-label={a.id}
          >
            <span style={{ fontSize: 42, filter: ok ? "none" : "none" }}>{a.emoji}</span>
            {ok && <span style={{ fontSize: 18, color: "#FFC93D" }}>✓</span>}
          </button>
        );
      })}
    </div>
  );
}
