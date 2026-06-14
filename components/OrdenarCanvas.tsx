"use client";

import { useState, useRef, useEffect } from "react";
import { pip, fanfarria, hablar } from "./aventura/utils";

interface OrdenarProps {
  sonido: boolean;
  voz: boolean;
  onVolver: (completado: boolean) => void;
}

function barajar<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Genera una ronda: nivel 0 → números 1-5, nivel 1 → 1-10
function generarRonda(nivel: number) {
  const max = nivel === 0 ? 5 : 10;
  const numeros = Array.from({ length: max }, (_, i) => i + 1);
  return barajar(numeros);
}

export default function OrdenarCanvas({ sonido, voz, onVolver }: OrdenarProps) {
  const [nivel, setNivel] = useState(0);
  const [fichas, setFichas] = useState<number[]>(() => generarRonda(0));
  const [completado, setCompletado] = useState(false);
  const [racha, setRacha] = useState(0);
  // drag: { idx: índice en fichas, x: %, y: % }
  const [drag, setDrag] = useState<{ idx: number; x: number; y: number } | null>(null);
  const [soltadoIdx, setSoltadoIdx] = useState<number | null>(null); // resalta destino
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (voz) hablar("Ordena los números de menor a mayor");
  }, [nivel]);

  function estaOrdenado(arr: number[]) {
    return arr.every((v, i) => i === 0 || arr[i - 1] < v);
  }

  function iniciarDrag(e: React.PointerEvent, idx: number) {
    if (completado) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({
      idx,
      x: (e.clientX / window.innerWidth) * 100,
      y: (e.clientY / window.innerHeight) * 100,
    });
  }

  function moverDrag(e: React.PointerEvent) {
    if (!drag) return;
    setDrag(d => d ? {
      ...d,
      x: (e.clientX / window.innerWidth) * 100,
      y: (e.clientY / window.innerHeight) * 100,
    } : null);
  }

  function soltarDrag(e: React.PointerEvent) {
    if (!drag) return;
    // Detectar sobre qué slot cayó por posición X
    const max = fichas.length;
    const slotW = 100 / max;
    const destIdx = Math.min(max - 1, Math.max(0, Math.floor(drag.x / slotW)));

    if (destIdx !== drag.idx) {
      const nuevas = [...fichas];
      const [mov] = nuevas.splice(drag.idx, 1);
      nuevas.splice(destIdx, 0, mov);
      setSoltadoIdx(destIdx);
      if (sonido) pip(300 + destIdx * 40, 0.25, 0.15);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setSoltadoIdx(null), 400);
      setFichas(nuevas);
      if (estaOrdenado(nuevas)) {
        setCompletado(true);
        if (sonido) setTimeout(fanfarria, 200);
        if (voz) setTimeout(() => hablar("¡Muy bien! Los números están en orden"), 300);
        setRacha(r => r + 1);
      }
    }
    setDrag(null);
  }

  function siguiente() {
    const nextNivel = nivel === 0 ? 1 : nivel; // sube a 1-10 tras completar 1-5
    setNivel(nextNivel);
    setFichas(generarRonda(nextNivel));
    setCompletado(false);
  }

  const max = fichas.length;
  const COLORES = ["#FF6B6B","#FF8C42","#FFC93D","#5BCB77","#4ECDC4","#6BA8FF","#A78BFA","#FF6B9D","#26C6DA","#FF8C42"];

  return (
    <div
      className="fixed inset-0"
      style={{
        background: "radial-gradient(ellipse at 20% 10%, #FFF8E1 0%, #FFE082 70%, #FFB300 100%)",
        height: "100dvh", touchAction: "none",
        fontFamily: "ui-rounded, 'Arial Rounded MT Bold', system-ui, sans-serif",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "space-between",
        padding: "0 16px 32px",
      }}
      onPointerMove={moverDrag}
      onPointerUp={soltarDrag}
    >
      {/* Barra */}
      <div style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", paddingTop:16, flexShrink:0 }}>
        <button onClick={() => onVolver(racha > 0)} style={{ background:"rgba(255,255,255,.5)", border:"none", fontSize:30, borderRadius:18, width:56, height:56, cursor:"pointer" }}>🏠</button>
        <div style={{ background:"rgba(255,255,255,.75)", borderRadius:24, padding:"10px 24px", fontSize:"clamp(18px,4vw,26px)", fontWeight:800, color:"#1a3a00" }}>
          {completado ? "¡Perfecto! 🎉" : "Ordena de menor a mayor"}
        </div>
        {racha > 0
          ? <div style={{ background:"rgba(255,255,255,.55)", borderRadius:20, padding:"6px 14px", fontSize:18, fontWeight:800 }}>{"⭐".repeat(Math.min(racha, 5))}</div>
          : <div style={{ width:56 }} />
        }
      </div>

      {/* Área de fichas */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", width:"100%", gap:0 }}>
        <div style={{ display:"flex", gap:"clamp(6px,1.5vw,12px)", alignItems:"center", justifyContent:"center", width:"100%", maxWidth:640 }}>
          {fichas.map((n, i) => {
            const isDragging = drag?.idx === i;
            const esDestino  = soltadoIdx === i;
            return (
              <div
                key={`${n}-${i}`}
                onPointerDown={e => iniciarDrag(e, i)}
                style={{
                  flex:1,
                  aspectRatio: "1",
                  maxWidth: 80,
                  borderRadius: 20,
                  background: isDragging ? "rgba(255,255,255,.3)" : COLORES[n - 1] ?? "#ccc",
                  border: esDestino ? "3px solid white" : "3px solid rgba(255,255,255,.4)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"clamp(24px,5vw,40px)",
                  fontWeight:900, color:"white",
                  boxShadow: isDragging ? "none" : "0 5px 0 rgba(0,0,0,.2)",
                  cursor: isDragging ? "grabbing" : "grab",
                  touchAction:"none",
                  opacity: isDragging ? 0.4 : 1,
                  transition: "opacity .15s",
                  userSelect:"none",
                }}>
                {isDragging ? "" : n}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ficha en arrastre */}
      {drag && (
        <div style={{
          position:"fixed",
          left:`${drag.x}%`, top:`${drag.y}%`,
          transform:"translate(-50%,-50%) scale(1.15)",
          width:72, height:72,
          borderRadius:20,
          background: COLORES[fichas[drag.idx] - 1] ?? "#ccc",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:36, fontWeight:900, color:"white",
          boxShadow:"0 8px 20px rgba(0,0,0,.3)",
          pointerEvents:"none", zIndex:50,
          userSelect:"none",
        }}>
          {fichas[drag.idx]}
        </div>
      )}

      {/* Referencia visual */}
      <div style={{ display:"flex", gap:8, alignItems:"center", opacity:0.5, flexShrink:0, marginBottom:8 }}>
        {Array.from({ length: max }, (_, i) => (
          <div key={i} style={{
            width:"clamp(24px,4vw,32px)", height:"clamp(24px,4vw,32px)",
            borderRadius:8, background:"rgba(0,0,0,.15)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"clamp(11px,2vw,15px)", fontWeight:800, color:"rgba(0,0,0,.4)",
          }}>{i + 1}</div>
        ))}
      </div>

      {/* Botón siguiente */}
      {completado && (
        <button
          onPointerDown={siguiente}
          style={{
            height:90, width:"100%", maxWidth:400,
            border:"none", borderRadius:28,
            background:"#2ECC71", boxShadow:"0 7px 0 #1A9E55",
            fontSize:"clamp(22px,5vw,32px)", fontWeight:900, color:"white",
            cursor:"pointer", touchAction:"none", flexShrink:0,
          }}
        >
          {nivel === 0 ? "¡Ahora del 1 al 10! ➡️" : "¡Otra vez! 🔄"}
        </button>
      )}
    </div>
  );
}
