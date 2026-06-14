"use client";

// Toca las ventanas oscuras para encender las luces (6 ventanas)
import { useState, useEffect } from "react";
import { Estrellita, Bocadillo } from "./Piezas";
import { pip, fanfarria, hablar } from "./utils";
import type { JuegoProps } from "./utils";

const VENTANAS = [
  { id: 0, col: 0, fila: 0 }, { id: 1, col: 1, fila: 0 }, { id: 2, col: 2, fila: 0 },
  { id: 3, col: 0, fila: 1 }, { id: 4, col: 1, fila: 1 }, { id: 5, col: 2, fila: 1 },
];
// Posición base del edificio (centrado)
const BASE_X = 50; const BASE_Y = 55;
const COL_STEP = 14; const FILA_STEP = 16;

export default function Juego09Ciudad({ sonido, voz, onCompletado }: JuegoProps) {
  const [encendidas, setEncendidas] = useState<Set<number>>(new Set());
  const [celebrando, setCelebrando] = useState(false);

  useEffect(() => {
    if (voz) hablar("Toca las ventanas para encender las luces");
  }, [voz]);

  function tocar(id: number) {
    if (encendidas.has(id)) return;
    if (sonido) pip(330 + id * 55, 0.2, 0.18);
    const next = new Set(encendidas).add(id);
    setEncendidas(next);
    if (next.size === VENTANAS.length) {
      setCelebrando(true);
      if (sonido) setTimeout(fanfarria, 300);
      if (voz) setTimeout(() => hablar("¡Muy bien! La ciudad se iluminó"), 400);
      setTimeout(onCompletado, 1800);
    }
  }

  return (
    <div className="fixed inset-0" style={{
      background: "radial-gradient(ellipse at 50% 0%, #1a2a4a 0%, #0a0f1e 80%)",
      touchAction: "none",
      height: "100dvh",
    }}>
      <Bocadillo texto="¡Enciende las luces! 💡" />
      <Estrellita x={12} y={150} size={60} celebrando={celebrando} />

      {/* Estrellas fondo */}
      {[...Array(30)].map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${(i * 43 + 7) % 100}%`,
          top: `${(i * 31 + 5) % 70}%`,
          width: i % 7 === 0 ? 3 : 2,
          height: i % 7 === 0 ? 3 : 2,
          borderRadius: "50%",
          background: "white",
          opacity: 0.2 + (i % 5) * 0.08,
          pointerEvents: "none",
        }} />
      ))}

      {/* Luna */}
      <div style={{ position:"absolute", top:"8%", right:"12%", pointerEvents:"none" }}>
        <svg viewBox="0 0 60 60" width={55} height={55}>
          <circle cx="30" cy="30" r="25" fill="#FFF0A0" opacity="0.85" />
          <circle cx="38" cy="22" r="18" fill="#0a0f1e" />
        </svg>
      </div>

      {/* Edificio central */}
      <div style={{ position:"absolute", left:"50%", top:"30%", transform:"translate(-50%,-0%)", pointerEvents:"none" }}>
        <svg viewBox="0 0 200 220" width={200} height={220}>
          {/* Cuerpo */}
          <rect x="20" y="20" width="160" height="195" fill="#1e2d4a" />
          {/* Antena */}
          <rect x="95" y="5" width="10" height="20" fill="#3a4a6a" />
          <circle cx="100" cy="5" r="5" fill="#FF6B6B">
            <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
          </circle>
          {/* Líneas edificio */}
          <line x1="20" y1="80" x2="180" y2="80" stroke="#2a3d5a" strokeWidth="1.5" />
          <line x1="20" y1="130" x2="180" y2="130" stroke="#2a3d5a" strokeWidth="1.5" />
          <line x1="20" y1="175" x2="180" y2="175" stroke="#2a3d5a" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Edificios laterales */}
      {[{x:"8%",w:80,h:140,top:"42%"},{x:"72%",w:90,h:160,top:"38%"}].map((e,i)=>(
        <div key={i} style={{position:"absolute",left:e.x,top:e.top,pointerEvents:"none"}}>
          <div style={{width:e.w,height:e.h,background:"#152038",borderRadius:"4px 4px 0 0"}} />
        </div>
      ))}

      {/* Ventanas */}
      {VENTANAS.map(v => {
        const encendida = encendidas.has(v.id);
        const xPct = BASE_X + (v.col - 1) * COL_STEP;
        const yPct = BASE_Y + (v.fila - 1) * FILA_STEP;
        return (
          <button
            key={v.id}
            onPointerDown={() => tocar(v.id)}
            style={{
              position: "absolute",
              left: `${xPct}%`,
              top: `${yPct}%`,
              transform: "translate(-50%,-50%)",
              width: 52, height: 52,
              borderRadius: 8,
              border: encendida ? "3px solid #FFC93D" : "3px solid #3a4a6a",
              background: encendida ? "#FFF0A0" : "#0d1520",
              cursor: encendida ? "default" : "pointer",
              touchAction: "none",
              zIndex: 10,
              boxShadow: encendida ? "0 0 18px rgba(255,240,160,.8), 0 0 35px rgba(255,201,61,.3)" : "none",
              transition: "background .3s, box-shadow .3s, border .3s",
            }}
            aria-label={`Ventana ${v.id + 1}`}
          >
            {encendida && (
              <svg viewBox="0 0 40 40" width={36} height={36}>
                <line x1="20" y1="5" x2="20" y2="35" stroke="#D4A017" strokeWidth="2" />
                <line x1="5" y1="20" x2="35" y2="20" stroke="#D4A017" strokeWidth="2" />
              </svg>
            )}
          </button>
        );
      })}

      {/* Suelo / calle */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "12%",
        background: "#0a0f1e",
        borderTop: "3px solid #1a2a4a",
      }}>
        {/* Farolas */}
        {[20, 50, 80].map((fx, i) => (
          <div key={i} style={{
            position: "absolute", left: `${fx}%`, bottom: "100%",
            width: 6, height: 50, background: "#1e2d4a",
            transform: "translateX(-50%)",
          }}>
            <div style={{
              width: 16, height: 16, borderRadius: "50%",
              background: encendidas.size > i * 2 ? "#FFC93D" : "#1e2d4a",
              position: "absolute", top: -8, left: -5,
              boxShadow: encendidas.size > i * 2 ? "0 0 12px #FFC93D" : "none",
              transition: "all .3s",
            }} />
          </div>
        ))}
      </div>
    </div>
  );
}
