"use client";

// Arrastra 4 gotas de lluvia a su nube del mismo color
import { useState, useRef, useEffect } from "react";
import { Estrellita, Bocadillo } from "./Piezas";
import { pip, fanfarria, hablar } from "./utils";
import type { JuegoProps } from "./utils";

const COLORES = [
  { id: "rojo",     hex: "#FF6B6B", nubeX: 18, nubeY: 38 },
  { id: "azul",     hex: "#6BA8FF", nubeX: 40, nubeY: 28 },
  { id: "verde",    hex: "#5BCB77", nubeX: 62, nubeY: 38 },
  { id: "amarillo", hex: "#FFC93D", nubeX: 84, nubeY: 28 },
];
const GOTAS_INICIO = [
  { colorId: "rojo",     ix: 18, iy: 78 },
  { colorId: "azul",     ix: 38, iy: 82 },
  { colorId: "verde",    ix: 62, iy: 78 },
  { colorId: "amarillo", ix: 82, iy: 82 },
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

  function soltarDrag() {
    if (!drag) return;
    const gota = GOTAS_INICIO[drag.idx];
    const nube = COLORES.find(c => c.id === gota.colorId)!;
    const dx = drag.x - nube.nubeX;
    const dy = drag.y - nube.nubeY;
    if (Math.sqrt(dx * dx + dy * dy) < 20) {
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
      style={{ background: "linear-gradient(180deg, #87CEEB 0%, #C8E8FF 60%, #EAF6FF 100%)", touchAction: "none" }}
      onPointerMove={moverDrag}
      onPointerUp={soltarDrag}
    >
      <Bocadillo texto="Lleva la gota a su nube 🌧️" />
      <Estrellita x={10} y={150} size={60} celebrando={celebrando} />

      {/* Nubes */}
      {COLORES.map(c => (
        <div key={c.id} style={{
          position: "absolute",
          left: `${c.nubeX}%`, top: `${c.nubeY}%`,
          transform: "translate(-50%,-50%)",
          pointerEvents: "none",
          filter: colocadas.has(c.id) ? "drop-shadow(0 0 12px rgba(255,255,255,.9))" : "none",
          transition: "filter .3s",
        }}>
          <svg viewBox="0 0 120 70" width={100} height={58}>
            <ellipse cx="60" cy="45" rx="55" ry="25" fill={c.hex} opacity="0.85" />
            <ellipse cx="38" cy="34" rx="27" ry="22" fill={c.hex} opacity="0.85" />
            <ellipse cx="76" cy="32" rx="24" ry="19" fill={c.hex} opacity="0.85" />
            {/* Brillo si está completa */}
            {colocadas.has(c.id) && (
              <ellipse cx="60" cy="38" rx="50" ry="22" fill="white" opacity="0.3" />
            )}
            {/* Indicador destino */}
            {!colocadas.has(c.id) && (
              <ellipse cx="60" cy="55" rx="12" ry="5" fill="white" opacity="0.5" />
            )}
          </svg>
        </div>
      ))}

      {/* Líneas de lluvia para gotas ya colocadas */}
      {COLORES.filter(c => colocadas.has(c.id)).map(c => (
        <div key={`lluvia-${c.id}`} style={{
          position: "absolute",
          left: `${c.nubeX}%`, top: `${c.nubeY + 6}%`,
          transform: "translateX(-50%)",
          pointerEvents: "none",
        }}>
          {[0,1,2].map(j => (
            <div key={j} style={{
              width: 3, height: 18, background: c.hex,
              borderRadius: 2, opacity: 0.7,
              display: "inline-block", margin: "0 4px",
              animation: `caer 0.8s ease-in infinite`,
              animationDelay: `${j * 0.2}s`,
            }} />
          ))}
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
            <svg viewBox="0 0 50 65" width={52} height={66}>
              <path d="M25 5 C25 5 5 35 5 47 A20 20 0 0 0 45 47 C45 35 25 5 25 5Z"
                fill={color.hex} stroke="rgba(0,0,0,.1)" strokeWidth="1" />
              <ellipse cx="18" cy="42" rx="5" ry="7" fill="white" opacity="0.35" />
            </svg>
          </div>
        );
      })}

      <style>{`
        @keyframes caer {
          0%   { transform: translateY(0); opacity: .7; }
          100% { transform: translateY(24px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
