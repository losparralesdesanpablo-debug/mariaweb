"use client";

import { useState, useEffect, useRef } from "react";
import { Estrellita, Bocadillo } from "./Piezas";
import { pip, fanfarria, hablar } from "./utils";
import type { JuegoProps } from "./utils";

const HONGOS = [
  { id: 0, x: 22, y: 60, color: "#FF6B6B" },
  { id: 1, x: 50, y: 52, color: "#FFC93D" },
  { id: 2, x: 78, y: 60, color: "#5BCB77" },
];

// Patrón simple de 4 pasos
const PATRON = [0, 1, 2, 0];

const INTERVALO  = 1000; // ms encendido
const APAGADO    = 400;  // ms apagado entre setas
const PAUSA_INIT = 1200; // ms de pausa antes de pedir input

export default function Juego07Bosque({ sonido, voz, onCompletado }: JuegoProps) {
  const [fase, setFase]         = useState<"mostrando" | "esperando">("mostrando");
  const [iluminado, setIluminado] = useState<number | null>(null);
  const [inputIdx, setInputIdx]  = useState(0);
  const [error, setError]        = useState(false);
  const [celebrando, setCelebrando] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function limpiarTimers() { timers.current.forEach(clearTimeout); timers.current = []; }

  function mostrarPatron() {
    limpiarTimers();
    setFase("mostrando");
    setIluminado(null);
    setError(false);
    setInputIdx(0);

    PATRON.forEach((hongoId, i) => {
      const t1 = setTimeout(() => {
        setIluminado(hongoId);
        if (sonido) pip(300 + hongoId * 180, 0.4, 0.18);
      }, i * (INTERVALO + APAGADO));
      const t2 = setTimeout(() => setIluminado(null), i * (INTERVALO + APAGADO) + INTERVALO);
      timers.current.push(t1, t2);
    });

    // Tras mostrar todo el patrón, esperar antes de pedir input
    const tFin = setTimeout(() => {
      setFase("esperando");
      if (voz) hablar("¡Ahora tú!");
    }, PATRON.length * (INTERVALO + APAGADO) + PAUSA_INIT);
    timers.current.push(tFin);
  }

  useEffect(() => {
    if (voz) hablar("Mira las setas y repite el orden");
    // Pequeña pausa antes de empezar
    const t = setTimeout(mostrarPatron, 800);
    timers.current.push(t);
    return limpiarTimers;
  }, []);

  function tocar(id: number) {
    if (fase !== "esperando" || celebrando) return;

    if (id === PATRON[inputIdx]) {
      // Correcto
      setIluminado(id);
      if (sonido) pip(400 + id * 180, 0.35, 0.2);
      setTimeout(() => setIluminado(null), 400);

      const next = inputIdx + 1;
      if (next >= PATRON.length) {
        // Completado
        setCelebrando(true);
        if (sonido) setTimeout(fanfarria, 400);
        if (voz) setTimeout(() => hablar("¡Muy bien! El bosque brilla"), 500);
        setTimeout(onCompletado, 2000);
      } else {
        setInputIdx(next);
      }
    } else {
      // Error — flash rojo, vuelve a mostrar
      setError(true);
      setIluminado(id);
      if (sonido) pip(150, 0.3, 0.15, "sawtooth");
      setTimeout(() => {
        setIluminado(null);
        setError(false);
        setTimeout(mostrarPatron, 600);
      }, 600);
    }
  }

  return (
    <div className="fixed inset-0" style={{
      background: "radial-gradient(ellipse at 50% 20%, #1e4d1e 0%, #0a1a0a 100%)",
      touchAction: "none",
      height: "100dvh",
    }}>
      <Bocadillo texto={fase === "mostrando" ? "¡Mira bien! 👀" : "¡Ahora tú! 👆"} />
      <Estrellita x={10} y={140} size={65} celebrando={celebrando} />

      {/* Árboles fondo */}
      {[8, 28, 52, 72, 88].map((tx, i) => (
        <svg key={i} style={{ position:"absolute", left:`${tx}%`, bottom:"28%", pointerEvents:"none" }}
          viewBox="0 0 60 100" width={45+i*7} height={75+i*8}>
          <polygon points="30,5 55,70 5,70" fill={`hsl(${118+i*8},${38+i*4}%,${14+i*3}%)`} />
          <rect x="26" y="68" width="8" height="22" fill="#3d2b1f" />
        </svg>
      ))}

      {/* Suelo */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"28%",
        background:"linear-gradient(180deg,#1a3d1a 0%,#0a1a0a 100%)" }} />

      {/* Indicador de progreso */}
      {fase === "esperando" && (
        <div style={{
          position:"absolute", bottom:"20%", left:"50%", transform:"translateX(-50%)",
          display:"flex", gap:10, zIndex:15,
        }}>
          {PATRON.map((_, i) => (
            <div key={i} style={{
              width: 16, height: 16, borderRadius:"50%",
              background: i < inputIdx ? "#5BCB77" : i === inputIdx ? "white" : "rgba(255,255,255,.25)",
              border: i === inputIdx ? "3px solid white" : "3px solid rgba(255,255,255,.3)",
              boxShadow: i === inputIdx ? "0 0 10px white" : "none",
              transition: "all .3s",
            }}/>
          ))}
        </div>
      )}

      {/* Hongos */}
      {HONGOS.map(h => {
        const lit = iluminado === h.id;
        return (
          <button
            key={h.id}
            onPointerDown={() => tocar(h.id)}
            style={{
              position:"absolute",
              left:`${h.x}%`, top:`${h.y}%`,
              transform:`translate(-50%,-50%) scale(${lit ? 1.35 : 1})`,
              cursor: fase === "esperando" ? "pointer" : "default",
              background:"none", border:"none",
              touchAction:"none", zIndex:10,
              transition:"transform .2s ease, filter .2s",
              filter: lit
                ? error
                  ? "drop-shadow(0 0 20px #FF4444) brightness(1.5)"
                  : `drop-shadow(0 0 22px ${h.color}) brightness(2)`
                : "drop-shadow(0 4px 8px rgba(0,0,0,.6))",
            }}
          >
            <svg viewBox="0 0 80 90" width={90} height={100}>
              {/* Tallo */}
              <rect x="28" y="54" width="24" height="28" rx="8" fill="#e8d9c0" />
              <ellipse cx="40" cy="80" rx="14" ry="8" fill="#d4c4a8" opacity="0.8" />
              {/* Sombrero */}
              <ellipse cx="40" cy="54" rx="38" ry="12"
                fill={lit ? (error ? "#FF4444" : "white") : h.color} />
              <ellipse cx="40" cy="38" rx="28" ry="24"
                fill={lit ? (error ? "#FF4444" : "white") : h.color} />
              {/* Puntos */}
              {[{cx:32,cy:30},{cx:50,cy:26},{cx:42,cy:46},{cx:28,cy:44}].map((p,i)=>(
                <circle key={i} cx={p.cx} cy={p.cy} r={5}
                  fill={lit ? h.color : "white"} opacity={lit ? 1 : 0.5} />
              ))}
              {/* Halo cuando brilla */}
              {lit && !error && (
                <ellipse cx="40" cy="44" rx="40" ry="28" fill={h.color} opacity="0.2">
                  <animate attributeName="opacity" values="0.15;0.35;0.15" dur="0.6s" repeatCount="indefinite"/>
                </ellipse>
              )}
            </svg>
            {/* Número identificador visible durante la demo */}
            {fase === "mostrando" && (
              <div style={{
                position:"absolute", bottom:-8, left:"50%", transform:"translateX(-50%)",
                width:24, height:24, borderRadius:"50%",
                background: h.color, border:"2px solid white",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:13, fontWeight:900, color:"white",
              }}>
                {h.id + 1}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
