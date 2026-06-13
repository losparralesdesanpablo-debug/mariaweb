"use client";

// Arrastra 4 peces desde la orilla al río
import { useState, useRef, useEffect } from "react";
import { Estrellita, Bocadillo } from "./Piezas";
import { pip, fanfarria, hablar } from "./utils";
import type { JuegoProps } from "./utils";

const PECES = [
  { id: 0, ix: 10, iy: 25, color: "#FF6B6B", rot: 0   },
  { id: 1, ix: 80, iy: 20, color: "#FFC93D", rot: 180 },
  { id: 2, ix: 20, iy: 82, color: "#6BA8FF", rot: 0   },
  { id: 3, ix: 75, iy: 78, color: "#5BCB77", rot: 180 },
];
const RIO_Y = 45; // % — zona del río

export default function Juego04Peces({ sonido, voz, onCompletado }: JuegoProps) {
  const [enRio, setEnRio] = useState<Set<number>>(new Set());
  const [drag, setDrag] = useState<{ id: number; x: number; y: number } | null>(null);
  const [celebrando, setCelebrando] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (voz) hablar("Lleva los peces al río");
  }, [voz]);

  function iniciarDrag(e: React.PointerEvent, id: number) {
    if (enRio.has(id)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = containerRef.current!.getBoundingClientRect();
    setDrag({ id, x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  }

  function moverDrag(e: React.PointerEvent) {
    if (!drag) return;
    const rect = containerRef.current!.getBoundingClientRect();
    setDrag(d => d ? { ...d, x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 } : null);
  }

  function soltarDrag() {
    if (!drag) return;
    if (drag.y >= 35 && drag.y <= 65) {
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
      style={{ background: "#87CEEB", touchAction: "none", position: "relative" }}
      onPointerMove={moverDrag}
      onPointerUp={soltarDrag}
    >
      <Bocadillo texto="Lleva los peces al río 🐟" />
      <Estrellita x={30} y={140} size={65} celebrando={celebrando} />

      {/* Río */}
      <div style={{
        position: "absolute", left: 0, top: "35%", width: "100%", height: "30%",
        background: "linear-gradient(180deg, #4FC3F7 0%, #0288D1 100%)",
        pointerEvents: "none",
      }}>
        {/* Olas */}
        <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 30, pointerEvents: "none" }}
          viewBox="0 0 100 8" preserveAspectRatio="none">
          <path d="M0 4 Q12.5 0 25 4 Q37.5 8 50 4 Q62.5 0 75 4 Q87.5 8 100 4" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="1.5" />
        </svg>
        <div style={{ position: "absolute", top: 14, left: "15%", color: "rgba(255,255,255,.5)", fontSize: 14 }}>~~~</div>
        <div style={{ position: "absolute", top: 20, left: "55%", color: "rgba(255,255,255,.5)", fontSize: 14 }}>~~~</div>
      </div>

      {/* Peces */}
      {PECES.map(p => {
        const isDragging = drag?.id === p.id;
        const enAgua = enRio.has(p.id);
        const cx = isDragging ? drag!.x : p.ix;
        const cy = isDragging ? drag!.y : (enAgua ? RIO_Y : p.iy);
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
              transition: isDragging ? "none" : "top .4s ease",
            }}
          >
            <svg viewBox="0 0 80 50" width={70} height={45}>
              {/* Cola */}
              <polygon points="5,25 20,10 20,40" fill={p.color} opacity="0.8" />
              {/* Cuerpo */}
              <ellipse cx="48" cy="25" rx="32" ry="20" fill={p.color} />
              {/* Aleta */}
              <polygon points="40,5 55,5 48,18" fill={p.color} opacity="0.7" />
              {/* Ojo */}
              <circle cx="70" cy="22" r="5" fill="white" />
              <circle cx="71" cy="22" r="3" fill="#1a1a2e" />
              <circle cx="72" cy="21" r="1" fill="white" />
              {/* Escamas */}
              <path d="M35 15 Q42 20 35 25" fill="none" stroke="white" strokeWidth="1.5" opacity="0.5" />
              <path d="M50 12 Q57 18 50 24" fill="none" stroke="white" strokeWidth="1.5" opacity="0.5" />
            </svg>
          </div>
        );
      })}
    </div>
  );
}
