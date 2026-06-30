"use client";

import { useState, useRef, useEffect } from "react";
import { pip, fanfarria, hablar } from "./aventura/utils";

interface FaltaProps {
  sonido: boolean;
  voz: boolean;
  nivel?: 1 | 2 | 3;
  onVolver: (completado: boolean) => void;
}

function aleatorio(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function barajar<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generarRonda() {
  // Secuencia de 5 números consecutivos entre 1 y 10
  const inicio = aleatorio(1, 6);
  const secuencia = [inicio, inicio+1, inicio+2, inicio+3, inicio+4];
  // Hueco en posición 1, 2 o 3 (no primera ni última)
  const huecoIdx = aleatorio(1, 3);
  const correcto = secuencia[huecoIdx];
  // Opciones: el correcto + 2 distractores cercanos
  const distractores = new Set<number>();
  while (distractores.size < 2) {
    const d = correcto + aleatorio(-3, 3);
    if (d !== correcto && d >= 1 && d <= 10) distractores.add(d);
  }
  const opciones = barajar([correcto, ...distractores]);
  return { secuencia, huecoIdx, correcto, opciones };
}

export default function FaltaCanvas({ sonido, voz, onVolver }: FaltaProps) {
  const [ronda, setRonda]     = useState(generarRonda);
  const [estado, setEstado]   = useState<"jugando" | "correcto" | "error">("jugando");
  const [errorOp, setErrorOp] = useState<number | null>(null);
  const [racha, setRacha]     = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (voz) setTimeout(() => hablar("¿Qué número falta?"), 300);
  }, [ronda]);

  function tocar(n: number) {
    if (estado !== "jugando") return;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (n === ronda.correcto) {
      setEstado("correcto");
      if (sonido) fanfarria();
      if (voz) setTimeout(() => hablar(`¡Sí! El ${ronda.correcto}`), 300);
      setRacha(r => r + 1);
      timerRef.current = setTimeout(() => {
        setRonda(generarRonda());
        setEstado("jugando");
        setErrorOp(null);
      }, 1700);
    } else {
      setErrorOp(n);
      setEstado("error");
      if (sonido) pip(160, 0.3, 0.18, "sawtooth");
      timerRef.current = setTimeout(() => { setEstado("jugando"); setErrorOp(null); }, 700);
    }
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const { secuencia, huecoIdx, opciones } = ronda;

  return (
    <div className="fixed inset-0" style={{
      background: "radial-gradient(ellipse at 70% 10%, #E8F5FF 0%, #B3D9FF 70%, #6BA8FF 100%)",
      height:"100dvh", touchAction:"none",
      fontFamily:"ui-rounded,'Arial Rounded MT Bold',system-ui,sans-serif",
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"space-between",
      padding:"0 20px 36px",
    }}>
      {/* Barra */}
      <div style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", paddingTop:16, flexShrink:0 }}>
        <button onClick={() => onVolver(racha > 0)} style={{ background:"rgba(255,255,255,.5)", border:"none", fontSize:30, borderRadius:18, width:56, height:56, cursor:"pointer" }}>🏠</button>
        <div style={{ background:"rgba(255,255,255,.75)", borderRadius:24, padding:"10px 24px", fontSize:"clamp(18px,4vw,26px)", fontWeight:800, color:"#1a3a5c" }}>
          ¿Qué número falta? 🔍
        </div>
        {racha > 0
          ? <div style={{ background:"rgba(255,255,255,.55)", borderRadius:20, padding:"6px 14px", fontSize:18, fontWeight:800 }}>{"⭐".repeat(Math.min(racha,5))}</div>
          : <div style={{ width:56 }} />
        }
      </div>

      {/* Secuencia */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", width:"100%", gap:"clamp(8px,2vw,16px)" }}>
        {secuencia.map((n, i) => {
          const esHueco = i === huecoIdx;
          const correcto = estado === "correcto" && esHueco;
          return (
            <div key={i} style={{
              width:"clamp(52px,12vw,80px)", height:"clamp(52px,12vw,80px)",
              borderRadius:20,
              background: correcto ? "#5BCB77" : esHueco ? "rgba(255,255,255,.3)" : "rgba(255,255,255,.85)",
              border: esHueco ? "3px dashed rgba(255,255,255,.8)" : "3px solid transparent",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:"clamp(24px,6vw,42px)", fontWeight:900,
              color: correcto ? "white" : esHueco ? "transparent" : "#1a3a5c",
              boxShadow: esHueco ? "none" : "0 4px 0 rgba(0,0,0,.12)",
              transition:"all .3s",
              animation: correcto ? "popIn .35s cubic-bezier(.34,1.56,.64,1)" : "none",
            }}>
              {correcto ? n : esHueco ? "?" : n}
            </div>
          );
        })}
      </div>

      {/* Opciones */}
      <div style={{ display:"flex", gap:16, width:"100%", maxWidth:420, flexShrink:0 }}>
        {opciones.map(op => {
          const esCorrecto = estado === "correcto" && op === ronda.correcto;
          const esError    = errorOp === op;
          return (
            <button key={op} onPointerDown={() => tocar(op)} style={{
              flex:1,
              height:"clamp(80px,16vw,110px)",
              border:"none", borderRadius:28,
              fontSize:"clamp(38px,9vw,58px)", fontWeight:900,
              cursor:"pointer", touchAction:"none",
              background: esCorrecto ? "#5BCB77" : esError ? "#FF5555" : "rgba(255,255,255,.9)",
              color: esCorrecto || esError ? "white" : "#1a3a5c",
              boxShadow: esCorrecto ? "0 6px 0 #3BA055" : esError ? "0 6px 0 #CC2222" : "0 6px 0 rgba(0,0,0,.15)",
              transform: esCorrecto ? "scale(1.08) translateY(-4px)" : esError ? "scale(.93) translateY(4px)" : "scale(1)",
              transition:"all .15s",
            }}>{op}</button>
          );
        })}
      </div>
      <style>{`@keyframes popIn{0%{transform:scale(.5);opacity:0}100%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}
