"use client";

// Arrastra 3 ingredientes a la olla en orden
import { useState, useRef, useEffect } from "react";
import { Estrellita, Bocadillo } from "./Piezas";
import { pip, fanfarria, hablar } from "./utils";
import type { JuegoProps } from "./utils";

const INGREDIENTES = [
  { id: 0, emoji: "⭐", nombre: "estrella",  ix: 15, iy: 72 },
  { id: 1, emoji: "🍄", nombre: "hongo",     ix: 50, iy: 78 },
  { id: 2, emoji: "💎", nombre: "cristal",   ix: 82, iy: 72 },
];
const OLLA_X = 50; const OLLA_Y = 42;

export default function Juego06Cocina({ sonido, voz, onCompletado }: JuegoProps) {
  const [paso, setPaso] = useState(0);
  const [enOlla, setEnOlla] = useState<Set<number>>(new Set());
  const [drag, setDrag] = useState<{ id: number; x: number; y: number } | null>(null);
  const [celebrando, setCelebrando] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (voz) hablar(`Pon la ${INGREDIENTES[0].nombre} en la olla`);
  }, [voz]);

  function iniciarDrag(e: React.PointerEvent, id: number) {
    if (enOlla.has(id) || id !== paso) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ id, x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
  }

  function moverDrag(e: React.PointerEvent) {
    if (!drag) return;
    setDrag(d => d ? { ...d, x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 } : null);
  }

  function soltarDrag() {
    if (!drag) return;
    const dx = drag.x - OLLA_X; const dy = drag.y - OLLA_Y;
    if (Math.sqrt(dx * dx + dy * dy) < 20) {
      if (sonido) pip(400 + drag.id * 140, 0.3, 0.22);
      const next = new Set(enOlla).add(drag.id);
      setEnOlla(next);
      const nextPaso = paso + 1;
      if (nextPaso >= INGREDIENTES.length) {
        setCelebrando(true);
        if (sonido) setTimeout(fanfarria, 300);
        if (voz) setTimeout(() => hablar("¡Muy bien! La poción está lista"), 400);
        setTimeout(onCompletado, 1800);
      } else {
        setPaso(nextPaso);
        if (voz) setTimeout(() => hablar(`Ahora pon el ${INGREDIENTES[nextPaso].nombre}`), 200);
      }
    }
    setDrag(null);
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0"
      style={{
        background: "radial-gradient(ellipse at 50% 0%, #2d1b69 0%, #1a0a3d 70%)",
        touchAction: "none",
        height: "100dvh",
      }}
      onPointerMove={moverDrag}
      onPointerUp={soltarDrag}
    >
      <Bocadillo texto={paso < 3 ? `Pon: ${INGREDIENTES[paso]?.emoji} en la olla 🫕` : "¡Listo!"} />
      <Estrellita x={10} y={140} size={65} celebrando={celebrando} />

      {/* Estrellas fondo */}
      {[...Array(20)].map((_, i) => (
        <div key={i} style={{ position:"absolute", left:`${(i*47)%100}%`, top:`${(i*31)%55}%`,
          width:2, height:2, borderRadius:"50%", background:"white", opacity:0.4 }} />
      ))}

      {/* Olla */}
      <div style={{
        position: "absolute", left: `${OLLA_X}%`, top: `${OLLA_Y}%`,
        transform: "translate(-50%,-50%)", pointerEvents: "none",
      }}>
        <svg viewBox="0 0 120 100" width={120} height={100}>
          {/* Asa izq */}
          <rect x="8" y="28" width="15" height="8" rx="4" fill="#8B6914" />
          {/* Asa der */}
          <rect x="97" y="28" width="15" height="8" rx="4" fill="#8B6914" />
          {/* Cuerpo */}
          <ellipse cx="60" cy="60" rx="48" ry="38" fill="#2d4a7a" />
          <ellipse cx="60" cy="35" rx="48" ry="16" fill="#3a5a8a" />
          {/* Contenido */}
          {enOlla.size > 0 && (
            <ellipse cx="60" cy="36" rx="40" ry="12" fill={enOlla.size === 3 ? "#7C3AED" : enOlla.size === 2 ? "#8B5CF6" : "#6B21A8"} opacity="0.9">
              <animate attributeName="ry" values="12;10;12" dur="1.5s" repeatCount="indefinite" />
            </ellipse>
          )}
          {/* Burbujas */}
          {enOlla.size > 0 && [20,50,75].slice(0,enOlla.size).map((bx,i)=>(
            <circle key={i} cx={bx} cy="30" r="4" fill={["#FFC93D","#FF6B6B","#6BA8FF"][i]} opacity="0.8">
              <animate attributeName="cy" values="30;15;30" dur={`${1+i*0.4}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0;0.8" dur={`${1+i*0.4}s`} repeatCount="indefinite" />
            </circle>
          ))}
          {/* Texto ingrediente */}
          {enOlla.size > 0 && (
            <text x="60" y="65" textAnchor="middle" fontSize="20" fill="white" opacity="0.6">
              {[...enOlla].map(id => INGREDIENTES[id].emoji).join("")}
            </text>
          )}
        </svg>
      </div>

      {/* Ingredientes */}
      {INGREDIENTES.map(ing => {
        const isDragging = drag?.id === ing.id;
        const colocado  = enOlla.has(ing.id);
        const esActivo  = ing.id === paso && !colocado;
        const cx = isDragging ? drag!.x : ing.ix;
        const cy = isDragging ? drag!.y : ing.iy;
        return (
          <div
            key={ing.id}
            onPointerDown={e => iniciarDrag(e, ing.id)}
            style={{
              position: "absolute",
              left: `${cx}%`, top: `${cy}%`,
              transform: "translate(-50%,-50%)",
              opacity: colocado ? 0 : esActivo ? 1 : 0.45,
              cursor: esActivo ? "grab" : "default",
              touchAction: "none",
              zIndex: isDragging ? 20 : 5,
              transition: isDragging || colocado ? "none" : "opacity .3s",
              filter: esActivo ? "drop-shadow(0 0 12px rgba(255,255,255,.6))" : "none",
            }}
          >
            <div style={{
              width: 80, height: 80, borderRadius: 20,
              background: esActivo ? "rgba(255,255,255,.2)" : "rgba(255,255,255,.08)",
              border: esActivo ? "3px solid rgba(255,255,255,.6)" : "2px solid rgba(255,255,255,.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 40,
            }}>
              {ing.emoji}
            </div>
          </div>
        );
      })}
    </div>
  );
}
