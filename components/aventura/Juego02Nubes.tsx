"use client";

// Arrastra 4 gotas de lluvia a su nube del mismo color
import { useState, useRef, useEffect } from "react";
import { Estrellita, Bocadillo } from "./Piezas";
import { pip, fanfarria, hablar } from "./utils";
import type { JuegoProps } from "./utils";

const COLORES = [
  { id: "rojo",     hex: "#FF6B6B", nubeX: 15, nubeY: 20 },
  { id: "azul",     hex: "#6BA8FF", nubeX: 40, nubeY: 15 },
  { id: "verde",    hex: "#5BCB77", nubeX: 65, nubeY: 20 },
  { id: "amarillo", hex: "#FFC93D", nubeX: 88, nubeY: 18 },
];
const GOTAS_INICIO = [
  { colorId: "rojo",     ix: 12, iy: 75 },
  { colorId: "azul",     ix: 35, iy: 80 },
  { colorId: "verde",    ix: 60, iy: 78 },
  { colorId: "amarillo", ix: 82, iy: 74 },
];

export default function Juego02Nubes({ sonido, voz, onCompletado }: JuegoProps) {
  const [colocadas, setColocadas] = useState<Set<string>>(new Set());
  const [drag, setDrag] = useState<{ idx: number; x: number; y: number } | null>(null);
  const [celebrando, setCelebrando] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (voz) hablar("Lleva cada gota a su nube del mismo color");
  }, [voz]);

  function iniciarDrag(e: React.PointerEvent, idx: number) {
    if (colocadas.has(GOTAS_INICIO[idx].colorId)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = containerRef.current!.getBoundingClientRect();
    setDrag({ idx, x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  }

  function moverDrag(e: React.PointerEvent) {
    if (!drag) return;
    const rect = containerRef.current!.getBoundingClientRect();
    setDrag(d => d ? { ...d, x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 } : null);
  }

  function soltarDrag(e: React.PointerEvent) {
    if (!drag) return;
    const gota = GOTAS_INICIO[drag.idx];
    const nube = COLORES.find(c => c.id === gota.colorId)!;
    const dx = drag.x - nube.nubeX;
    const dy = drag.y - nube.nubeY;
    if (Math.sqrt(dx * dx + dy * dy) < 18) {
      if (sonido) pip(523 + COLORES.findIndex(c => c.id === gota.colorId) * 130, 0.3, 0.22);
      const next = new Set(colocadas).add(gota.colorId);
      setColocadas(next);
      if (next.size === COLORES.length) {
        setCelebrando(true);
        if (sonido) setTimeout(fanfarria, 300);
        if (voz) setTimeout(() => hablar("¡Muy bien! Las nubes tienen su lluvia"), 400);
        setTimeout(onCompletado, 1800);
      }
    }
    setDrag(null);
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0"
      style={{ background: "linear-gradient(180deg, #87CEEB 0%, #C8E8FF 100%)", touchAction: "none", position: "relative" }}
      onPointerMove={moverDrag}
      onPointerUp={soltarDrag}
    >
      <Bocadillo texto="Lleva la gota a su nube 🌧️" />
      <Estrellita x={20} y={140} size={65} celebrando={celebrando} />

      {/* Nubes */}
      {COLORES.map(c => (
        <div key={c.id} style={{
          position: "absolute",
          left: `${c.nubeX}%`, top: `${c.nubeY}%`,
          transform: "translate(-50%,-50%)",
          pointerEvents: "none",
        }}>
          <svg viewBox="0 0 120 70" width={110} height={65}>
            <ellipse cx="60" cy="45" rx="55" ry="25" fill={c.hex} opacity="0.9" />
            <ellipse cx="40" cy="35" rx="28" ry="22" fill={c.hex} opacity="0.9" />
            <ellipse cx="75" cy="32" rx="25" ry="20" fill={c.hex} opacity="0.9" />
            <ellipse cx="60" cy="45" rx="55" ry="25" fill="white" opacity="0.25" />
          </svg>
        </div>
      ))}

      {/* Gotas */}
      {GOTAS_INICIO.map((g, i) => {
        if (colocadas.has(g.colorId)) return null;
        const isDragging = drag?.idx === i;
        const cx = isDragging ? drag!.x : g.ix;
        const cy = isDragging ? drag!.y : g.iy;
        const color = COLORES.find(c => c.id === g.colorId)!;
        return (
          <div
            key={i}
            onPointerDown={e => iniciarDrag(e, i)}
            style={{
              position: "absolute",
              left: `${cx}%`, top: `${cy}%`,
              transform: "translate(-50%,-50%)",
              cursor: "grab",
              touchAction: "none",
              zIndex: isDragging ? 20 : 5,
              filter: isDragging ? "drop-shadow(0 6px 10px rgba(0,0,0,.3))" : "drop-shadow(0 2px 4px rgba(0,0,0,.2))",
              transition: isDragging ? "none" : "all .15s",
            }}
          >
            <svg viewBox="0 0 50 65" width={55} height={70}>
              <path d="M25 5 C25 5 5 35 5 47 A20 20 0 0 0 45 47 C45 35 25 5 25 5Z"
                fill={color.hex} stroke={color.hex} strokeWidth="2" />
              <ellipse cx="18" cy="42" rx="5" ry="7" fill="white" opacity="0.35" />
            </svg>
          </div>
        );
      })}
    </div>
  );
}
