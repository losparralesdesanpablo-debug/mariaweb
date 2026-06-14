"use client";

// Toca los hongos que se iluminan en secuencia (sigue el patrón)
import { useState, useEffect, useRef } from "react";
import { Estrellita, Bocadillo } from "./Piezas";
import { pip, fanfarria, hablar } from "./utils";
import type { JuegoProps } from "./utils";

const HONGOS = [
  { id: 0, x: 20, y: 55, color: "#FF6B6B" },
  { id: 1, x: 40, y: 68, color: "#FFC93D" },
  { id: 2, x: 60, y: 58, color: "#6BA8FF" },
  { id: 3, x: 78, y: 65, color: "#5BCB77" },
];
const PATRON = [0, 2, 1, 3, 0, 2]; // secuencia a mostrar y repetir

export default function Juego07Bosque({ sonido, voz, onCompletado }: JuegoProps) {
  const [fase, setFase] = useState<"mostrando" | "esperando">("mostrando");
  const [paso, setPaso] = useState(0);         // cuántos han completado
  const [iluminado, setIluminado] = useState<number | null>(null);
  const [inputIdx, setInputIdx] = useState(0); // índice en PATRON que espera input
  const [error, setError] = useState<number | null>(null);
  const [celebrando, setCelebrando] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (voz) hablar("Mira el patrón y repítelo tocando los hongos");
    mostrarPatron(0, 3); // muestra los primeros 3 pasos
  }, []);

  function mostrarPatron(desde: number, cuantos: number) {
    setFase("mostrando");
    const steps = PATRON.slice(desde, desde + cuantos);
    steps.forEach((hongoId, i) => {
      const t1 = setTimeout(() => setIluminado(hongoId), i * 800);
      const t2 = setTimeout(() => setIluminado(null), i * 800 + 500);
      timerRef.current.push(t1, t2);
    });
    const tFin = setTimeout(() => {
      setFase("esperando");
      setInputIdx(0);
    }, steps.length * 800 + 600);
    timerRef.current.push(tFin);
  }

  useEffect(() => () => { timerRef.current.forEach(clearTimeout); }, []);

  function tocar(id: number) {
    if (fase !== "esperando") return;
    if (id === PATRON[inputIdx]) {
      if (sonido) pip(400 + id * 120, 0.2, 0.2);
      const next = inputIdx + 1;
      if (next >= PATRON.length) {
        setCelebrando(true);
        if (sonido) setTimeout(fanfarria, 300);
        if (voz) setTimeout(() => hablar("¡Muy bien! El bosque brilla"), 400);
        setTimeout(onCompletado, 1800);
      } else {
        setInputIdx(next);
      }
    } else {
      if (sonido) pip(180, 0.15, 0.12, "sawtooth");
      setError(id);
      setTimeout(() => setError(null), 500);
      // Vuelve a mostrar el patrón
      setInputIdx(0);
      setFase("mostrando");
      setTimeout(() => mostrarPatron(0, 3), 800);
    }
  }

  return (
    <div className="fixed inset-0" style={{
      background: "radial-gradient(ellipse at 50% 0%, #1a3d1a 0%, #0d1f0d 80%)",
      touchAction: "none",
      height: "100dvh",
    }}>
      <Bocadillo texto={fase === "mostrando" ? "¡Mira bien! 👀" : "¡Ahora tú! 👆"} />
      <Estrellita x={10} y={140} size={65} celebrando={celebrando} />

      {/* Árboles de fondo */}
      {[10, 30, 55, 75, 90].map((tx, i) => (
        <svg key={i} style={{ position:"absolute", left:`${tx}%`, bottom:"25%", pointerEvents:"none" }}
          viewBox="0 0 60 100" width={50 + i * 8} height={80 + i * 10}>
          <polygon points="30,5 55,70 5,70" fill={`hsl(${120+i*10},${40+i*5}%,${15+i*3}%)`} />
          <polygon points="30,20 52,75 8,75" fill={`hsl(${120+i*10},${40+i*5}%,${12+i*3}%)`} />
          <rect x="25" y="70" width="10" height="25" fill="#3d2b1f" />
        </svg>
      ))}

      {/* Suelo */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"25%",
        background:"linear-gradient(180deg,#1a3d1a 0%,#0d1f0d 100%)" }} />

      {/* Hongos */}
      {HONGOS.map(h => {
        const lit = iluminado === h.id || (fase === "mostrando" && false);
        const err = error === h.id;
        return (
          <button
            key={h.id}
            onPointerDown={() => tocar(h.id)}
            style={{
              position: "absolute",
              left: `${h.x}%`, top: `${h.y}%`,
              transform: `translate(-50%,-50%) scale(${err ? 0.85 : 1})`,
              cursor: "pointer",
              background: "none",
              border: "none",
              touchAction: "none",
              zIndex: 10,
              transition: "transform .15s",
            }}
          >
            <svg viewBox="0 0 80 90" width={75} height={85}>
              {/* Tallo */}
              <ellipse cx="40" cy="78" rx="14" ry="12" fill="#d4c4a8" opacity="0.9" />
              <rect x="28" y="52" width="24" height="30" rx="8" fill="#e8d9c0" />
              {/* Sombrero */}
              <ellipse cx="40" cy="52" rx="38" ry="12" fill={lit ? "white" : err ? "#FF4444" : h.color} style={{ transition:"fill .2s" }} />
              <ellipse cx="40" cy="38" rx="28" ry="22" fill={lit ? "white" : err ? "#FF4444" : h.color} style={{ transition:"fill .2s" }} />
              {/* Brillo */}
              {lit && <ellipse cx="30" cy="32" rx="8" ry="5" fill="white" opacity="0.5" style={{ animation:"aparecer .1s ease" }} />}
              {/* Puntos */}
              {[{cx:35,cy:32},{cx:50,cy:28},{cx:42,cy:44}].map((p,i)=>(
                <circle key={i} cx={p.cx} cy={p.cy} r={5} fill="white" opacity={lit ? 0.9 : 0.5} />
              ))}
              {/* Glow */}
              {lit && <ellipse cx="40" cy="45" rx="38" ry="25" fill={h.color} opacity="0.25">
                <animate attributeName="opacity" values="0.25;0.5;0.25" dur="0.5s" repeatCount="indefinite" />
              </ellipse>}
            </svg>
          </button>
        );
      })}
    </div>
  );
}
