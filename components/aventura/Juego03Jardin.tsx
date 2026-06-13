"use client";

// Toca las flores cuando están abiertas (se abren en secuencia)
import { useState, useEffect, useRef } from "react";
import { Estrellita, Bocadillo } from "./Piezas";
import { pip, fanfarria, hablar } from "./utils";
import type { JuegoProps } from "./utils";

const FLORES_POS = [
  { x: 25, y: 60 },
  { x: 50, y: 55 },
  { x: 75, y: 62 },
];

export default function Juego03Jardin({ sonido, voz, onCompletado }: JuegoProps) {
  const [faseActual, setFaseActual] = useState(0);     // qué flor está abierta ahora
  const [tocadas, setTocadas] = useState<Set<number>>(new Set());
  const [abiertas, setAbiertas] = useState<Set<number>>(new Set());
  const [celebrando, setCelebrando] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (voz) hablar("Toca la flor cuando se abra");
    abrirFlor(0);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  function abrirFlor(idx: number) {
    if (idx >= FLORES_POS.length) return;
    setFaseActual(idx);
    setAbiertas(prev => new Set(prev).add(idx));
    // si no se toca en 3s, cierra y vuelve a abrir
    timerRef.current = setTimeout(() => {
      setAbiertas(prev => { const n = new Set(prev); n.delete(idx); return n; });
      timerRef.current = setTimeout(() => abrirFlor(idx), 800);
    }, 3000);
  }

  function tocarFlor(i: number) {
    if (!abiertas.has(i) || tocadas.has(i)) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (sonido) pip(523 + i * 150, 0.3, 0.25);
    const next = new Set(tocadas).add(i);
    setTocadas(next);
    setAbiertas(prev => { const n = new Set(prev); n.delete(i); return n; });

    if (next.size === FLORES_POS.length) {
      setCelebrando(true);
      if (sonido) setTimeout(fanfarria, 300);
      if (voz) setTimeout(() => hablar("¡Muy bien! El jardín floreció"), 400);
      setTimeout(onCompletado, 1800);
    } else {
      setTimeout(() => abrirFlor(i + 1), 500);
    }
  }

  return (
    <div className="fixed inset-0" style={{
      background: "linear-gradient(180deg, #87CEEB 0%, #5BCB77 60%, #3BA055 100%)",
      touchAction: "none",
    }}>
      <Bocadillo texto="¡Toca la flor abierta! 🌸" />
      <Estrellita x={10} y={140} size={65} celebrando={celebrando} />

      {/* Suelo ondulado */}
      <svg style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "45%", pointerEvents: "none" }}
        viewBox="0 0 100 45" preserveAspectRatio="none">
        <path d="M0 10 Q25 0 50 10 Q75 20 100 10 L100 45 L0 45Z" fill="#3BA055" />
      </svg>

      {FLORES_POS.map((p, i) => {
        const abierta = abiertas.has(i);
        const tocada  = tocadas.has(i);
        return (
          <div
            key={i}
            onPointerDown={() => tocarFlor(i)}
            style={{
              position: "absolute",
              left: `${p.x}%`, top: `${p.y}%`,
              transform: "translate(-50%,-50%)",
              cursor: abierta && !tocada ? "pointer" : "default",
              touchAction: "none",
              zIndex: 10,
              transition: "transform .2s",
            }}
          >
            <svg viewBox="0 0 80 100" width={75} height={95}>
              {/* Tallo */}
              <line x1="40" y1="95" x2="40" y2="65" stroke="#2d7a2d" strokeWidth="5" strokeLinecap="round" />
              {/* Pétalos */}
              {abierta && !tocada ? (
                <>
                  {[0,72,144,216,288].map((ang, pi) => (
                    <ellipse key={pi} cx={40 + 22*Math.cos(ang*Math.PI/180)} cy={45 + 22*Math.sin(ang*Math.PI/180)}
                      rx="12" ry="8"
                      fill={["#FF9FF3","#FFC93D","#FF6B6B","#A8E6CF","#74B9FF"][pi]}
                      transform={`rotate(${ang},${40 + 22*Math.cos(ang*Math.PI/180)},${45 + 22*Math.sin(ang*Math.PI/180)})`}
                      style={{ animation: "aparecer .3s ease" }}
                    />
                  ))}
                  <circle cx="40" cy="45" r="14" fill="#FFC93D" />
                </>
              ) : tocada ? (
                <>
                  {[0,72,144,216,288].map((ang, pi) => (
                    <ellipse key={pi} cx={40 + 22*Math.cos(ang*Math.PI/180)} cy={45 + 22*Math.sin(ang*Math.PI/180)}
                      rx="12" ry="8" fill="#FFD700"
                      transform={`rotate(${ang},${40 + 22*Math.cos(ang*Math.PI/180)},${45 + 22*Math.sin(ang*Math.PI/180)})`}
                    />
                  ))}
                  <circle cx="40" cy="45" r="14" fill="#FFD700" />
                  <text x="40" y="50" textAnchor="middle" fontSize="16">✓</text>
                </>
              ) : (
                /* Cerrada */
                <ellipse cx="40" cy="55" rx="10" ry="15" fill="#2d7a2d" />
              )}
            </svg>
          </div>
        );
      })}
    </div>
  );
}
