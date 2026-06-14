"use client";

import { useState, useRef, useEffect } from "react";
import { Estrellita, Bocadillo } from "./Piezas";
import { pip, fanfarria, hablar } from "./utils";
import type { JuegoProps } from "./utils";

const PECES = [
  { id: 0, ix: 15, iy: 75, color: "#FF6B6B", rot: 0   },
  { id: 1, ix: 38, iy: 80, color: "#FFC93D", rot: 180 },
  { id: 2, ix: 62, iy: 75, color: "#6BA8FF", rot: 0   },
  { id: 3, ix: 84, iy: 80, color: "#5BCB77", rot: 180 },
];
// El río ocupa del 35% al 62% de la altura de pantalla
const RIO_TOP = 35; const RIO_BOT = 62;

export default function Juego04Peces({ sonido, voz, onCompletado }: JuegoProps) {
  const [enRio, setEnRio] = useState<Set<number>>(new Set());
  const [drag, setDrag] = useState<{ id: number; x: number; y: number } | null>(null);
  const [celebrando, setCelebrando] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (voz) hablar("Lleva los peces al río");
  }, [voz]);

  function pct(e: React.PointerEvent) {
    return {
      x: (e.clientX / window.innerWidth) * 100,
      y: (e.clientY / window.innerHeight) * 100,
    };
  }

  function iniciarDrag(e: React.PointerEvent, id: number) {
    if (enRio.has(id)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const { x, y } = pct(e);
    setDrag({ id, x, y });
  }

  function moverDrag(e: React.PointerEvent) {
    if (!drag) return;
    const { x, y } = pct(e);
    setDrag(d => d ? { ...d, x, y } : null);
  }

  function soltarDrag() {
    if (!drag) return;
    if (drag.y >= RIO_TOP && drag.y <= RIO_BOT) {
      if (sonido) pip(400 + drag.id * 120, 0.3, 0.22);
      const next = new Set(enRio).add(drag.id);
      setEnRio(next);
      if (next.size === PECES.length) {
        setCelebrando(true);
        if (sonido) setTimeout(fanfarria, 300);
        if (voz) setTimeout(() => hablar("¡Muy bien! Los peces nadan felices"), 400);
        setTimeout(onCompletado, 1800);
      }
    }
    setDrag(null);
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0"
      style={{ touchAction: "none", overflow: "hidden", height: "100dvh" }}
      onPointerMove={moverDrag}
      onPointerUp={soltarDrag}
    >
      {/* Cielo */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #87CEEB 0%, #B0E0FF 34%)" }} />

      {/* Río */}
      <div style={{
        position: "absolute", left: 0, right: 0,
        top: `${RIO_TOP}%`, height: `${RIO_BOT - RIO_TOP}%`,
        background: "linear-gradient(180deg, #29B6F6 0%, #0277BD 100%)",
      }}>
        <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 24 }}
          viewBox="0 0 200 8" preserveAspectRatio="none">
          <path d="M0 4 Q25 0 50 4 Q75 8 100 4 Q125 0 150 4 Q175 8 200 4"
            fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="1.5" />
        </svg>
        <div style={{ position: "absolute", top: 18, left: "12%", color: "rgba(255,255,255,.6)", fontSize: 18 }}>~ ~ ~</div>
        <div style={{ position: "absolute", top: 24, left: "58%", color: "rgba(255,255,255,.6)", fontSize: 18 }}>~ ~ ~</div>
      </div>

      {/* Orilla inferior */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0,
        top: `${RIO_BOT}%`,
        background: "linear-gradient(180deg, #C8A96E 0%, #A07840 100%)",
      }} />

      <Bocadillo texto="Lleva los peces al río 🐟" />
      <Estrellita x={10} y={150} size={60} celebrando={celebrando} />

      {/* Peces */}
      {PECES.map(p => {
        const isDragging = drag?.id === p.id;
        const enAgua = enRio.has(p.id);
        const cx = isDragging ? drag!.x : p.ix;
        const cy = isDragging ? drag!.y : (enAgua ? (RIO_TOP + RIO_BOT) / 2 : p.iy);
        return (
          <div
            key={p.id}
            onPointerDown={e => iniciarDrag(e, p.id)}
            style={{
              position: "absolute",
              left: `${cx}%`, top: `${cy}%`,
              transform: `translate(-50%,-50%) scaleX(${p.rot ? -1 : 1})`,
              cursor: enAgua ? "default" : "grab",
              touchAction: "none",
              zIndex: isDragging ? 20 : 5,
              filter: isDragging ? "drop-shadow(0 6px 10px rgba(0,0,0,.3))" : "none",
              transition: "none",
            }}
          >
            <svg viewBox="0 0 80 50" width={70} height={45}>
              <polygon points="5,25 20,10 20,40" fill={p.color} opacity="0.8" />
              <ellipse cx="48" cy="25" rx="32" ry="20" fill={p.color} />
              <polygon points="40,5 55,5 48,18" fill={p.color} opacity="0.7" />
              <circle cx="70" cy="22" r="5" fill="white" />
              <circle cx="71" cy="22" r="3" fill="#1a1a2e" />
              <circle cx="72" cy="21" r="1" fill="white" />
              <path d="M35 15 Q42 20 35 25" fill="none" stroke="white" strokeWidth="1.5" opacity="0.5" />
              <path d="M50 12 Q57 18 50 24" fill="none" stroke="white" strokeWidth="1.5" opacity="0.5" />
            </svg>
          </div>
        );
      })}
    </div>
  );
}
