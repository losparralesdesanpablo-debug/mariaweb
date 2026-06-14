"use client";

// Arrastra el tesoro al cofre en el fondo del mar
import { useState, useRef, useEffect } from "react";
import { Estrellita, Bocadillo } from "./Piezas";
import { pip, fanfarria, hablar } from "./utils";
import type { JuegoProps } from "./utils";

const COFRE_X = 50; const COFRE_Y = 78;
const TESOROS = [
  { id: 0, emoji: "💎", ix: 20, iy: 30 },
  { id: 1, emoji: "🪙", ix: 65, iy: 25 },
  { id: 2, emoji: "💍", ix: 40, iy: 20 },
];

export default function Juego08Mar({ sonido, voz, onCompletado }: JuegoProps) {
  const [enCofre, setEnCofre] = useState<Set<number>>(new Set());
  const [drag, setDrag] = useState<{ id: number; x: number; y: number } | null>(null);
  const [celebrando, setCelebrando] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (voz) hablar("Lleva el tesoro al cofre del fondo del mar");
  }, [voz]);

  function iniciarDrag(e: React.PointerEvent, id: number) {
    if (enCofre.has(id)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ id, x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
  }

  function moverDrag(e: React.PointerEvent) {
    if (!drag) return;
    setDrag(d => d ? { ...d, x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 } : null);
  }

  function soltarDrag() {
    if (!drag) return;
    const dx = drag.x - COFRE_X; const dy = drag.y - COFRE_Y;
    if (Math.sqrt(dx * dx + dy * dy) < 22) {
      if (sonido) pip(523 + drag.id * 150, 0.35, 0.25);
      const next = new Set(enCofre).add(drag.id);
      setEnCofre(next);
      if (next.size === TESOROS.length) {
        setCelebrando(true);
        if (sonido) setTimeout(fanfarria, 300);
        if (voz) setTimeout(() => hablar("¡Muy bien! Encontraste el tesoro"), 400);
        setTimeout(onCompletado, 1800);
      }
    }
    setDrag(null);
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0"
      style={{
        background: "linear-gradient(180deg, #006994 0%, #004d6b 40%, #003355 100%)",
        touchAction: "none",
        overflow: "hidden",
        height: "100dvh",
      }}
      onPointerMove={moverDrag}
      onPointerUp={soltarDrag}
    >
      <Bocadillo texto="Lleva el tesoro al cofre 🏴‍☠️" />
      <Estrellita x={12} y={150} size={60} celebrando={celebrando} />

      {/* Burbujas flotantes */}
      {[...Array(12)].map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${(i * 41 + 5) % 95}%`,
          bottom: `${(i * 17 + 10) % 70}%`,
          width: 8 + (i % 4) * 4,
          height: 8 + (i % 4) * 4,
          borderRadius: "50%",
          border: "2px solid rgba(255,255,255,.4)",
          animation: `flotar ${2 + (i % 4)}s ease-in-out infinite`,
          animationDelay: `${i * 0.3}s`,
          pointerEvents: "none",
        }} />
      ))}

      {/* Algas */}
      {[15, 35, 62, 80].map((ax, i) => (
        <svg key={i} style={{ position:"absolute", bottom:0, left:`${ax}%`, pointerEvents:"none" }}
          viewBox="0 0 30 80" width={25} height={70}>
          <path d={`M15 80 Q${i%2?25:5} 60 15 40 Q${i%2?5:25} 20 15 5`}
            fill="none" stroke="#1a5c1a" strokeWidth="4" strokeLinecap="round">
            <animate attributeName="d"
              values={`M15 80 Q${i%2?25:5} 60 15 40 Q${i%2?5:25} 20 15 5;M15 80 Q${i%2?5:25} 60 15 40 Q${i%2?25:5} 20 15 5;M15 80 Q${i%2?25:5} 60 15 40 Q${i%2?5:25} 20 15 5`}
              dur="3s" repeatCount="indefinite" />
          </path>
        </svg>
      ))}

      {/* Fondo marino */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"18%", background:"#002244" }} />

      {/* Cofre */}
      <div style={{
        position: "absolute", left: `${COFRE_X}%`, top: `${COFRE_Y}%`,
        transform: "translate(-50%,-50%)",
        pointerEvents: "none",
        filter: enCofre.size === TESOROS.length ? "drop-shadow(0 0 20px #FFC93D)" : "drop-shadow(0 4px 8px rgba(0,0,0,.5))",
        transition: "filter .3s",
      }}>
        <svg viewBox="0 0 100 80" width={110} height={88}>
          {/* Sombra */}
          <ellipse cx="50" cy="76" rx="45" ry="6" fill="rgba(0,0,0,.4)" />
          {/* Cuerpo */}
          <rect x="5" y="38" width="90" height="38" rx="6" fill="#8B4513" />
          {/* Tapa */}
          <path d="M5 38 Q5 10 50 10 Q95 10 95 38Z" fill="#A0522D" />
          {/* Tiras */}
          <rect x="5" y="52" width="90" height="6" fill="#4a2a0a" />
          <rect x="44" y="10" width="12" height="66" fill="#4a2a0a" />
          {/* Cerradura */}
          <rect x="43" y="44" width="14" height="12" rx="3" fill="#FFD700" />
          <circle cx="50" cy="46" r="4" fill="#B8860B" />
          {/* Contenido si lleno */}
          {enCofre.size > 0 && (
            <text x="50" y="35" textAnchor="middle" fontSize="18" style={{ animation:"aparecer .3s ease" }}>
              {[...enCofre].map(id => TESOROS[id].emoji).join("")}
            </text>
          )}
        </svg>
      </div>

      {/* Tesoros */}
      {TESOROS.map(t => {
        if (enCofre.has(t.id)) return null;
        const isDragging = drag?.id === t.id;
        const cx = isDragging ? drag!.x : t.ix;
        const cy = isDragging ? drag!.y : t.iy;
        return (
          <div
            key={t.id}
            onPointerDown={e => iniciarDrag(e, t.id)}
            style={{
              position: "absolute",
              left: `${cx}%`, top: `${cy}%`,
              transform: "translate(-50%,-50%)",
              cursor: "grab",
              touchAction: "none",
              zIndex: isDragging ? 20 : 5,
              filter: isDragging ? "drop-shadow(0 6px 12px rgba(0,0,0,.5))" : "drop-shadow(0 2px 6px rgba(0,0,0,.4))",
              transition: "none",
            }}
          >
            <div style={{
              width: 72, height: 72,
              background: "rgba(255,255,255,.1)",
              borderRadius: 18, border: "2px solid rgba(255,255,255,.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 40,
            }}>
              {t.emoji}
            </div>
          </div>
        );
      })}
    </div>
  );
}
