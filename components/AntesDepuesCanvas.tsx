"use client";

import { useState, useRef, useEffect } from "react";
import { pip, fanfarria, hablar } from "./aventura/utils";

interface AntesDepuesProps {
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
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

type Pregunta = "antes" | "despues";

function generarRonda() {
  const n = aleatorio(2, 9); // 2-9 para tener siempre antes y después en 1-10
  const pregunta: Pregunta = Math.random() < 0.5 ? "antes" : "despues";
  const correcto = pregunta === "antes" ? n - 1 : n + 1;
  const pool = new Set<number>([correcto]);
  while (pool.size < 3) {
    const d = correcto + aleatorio(-3, 3);
    if (d >= 1 && d <= 10 && d !== correcto) pool.add(d);
  }
  return { n, pregunta, correcto, opciones: barajar([...pool]) };
}

export default function AntesDepuesCanvas({ sonido, voz, onVolver }: AntesDepuesProps) {
  const [ronda, setRonda]     = useState(generarRonda);
  const [estado, setEstado]   = useState<"jugando"|"correcto"|"error">("jugando");
  const [errorOp, setErrorOp] = useState<number|null>(null);
  const [racha, setRacha]     = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (voz) {
      const texto = ronda.pregunta === "antes"
        ? `¿Qué número va antes del ${ronda.n}?`
        : `¿Qué número va después del ${ronda.n}?`;
      setTimeout(() => hablar(texto), 300);
    }
  }, [ronda]);

  function tocar(n: number) {
    if (estado !== "jugando") return;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (n === ronda.correcto) {
      setEstado("correcto");
      if (sonido) fanfarria();
      if (voz) setTimeout(() => hablar(`¡Sí! El ${ronda.correcto}`), 300);
      setRacha(r => r + 1);
      timerRef.current = setTimeout(() => { setRonda(generarRonda()); setEstado("jugando"); setErrorOp(null); }, 1700);
    } else {
      setErrorOp(n); setEstado("error");
      if (sonido) pip(160, 0.3, 0.18, "sawtooth");
      timerRef.current = setTimeout(() => { setEstado("jugando"); setErrorOp(null); }, 700);
    }
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const { n, pregunta, opciones } = ronda;

  return (
    <div className="fixed inset-0" style={{
      background:"radial-gradient(ellipse at 75% 10%, #F0E8FF 0%, #D4B0FF 60%, #9B59D0 100%)",
      height:"100dvh", touchAction:"none",
      fontFamily:"ui-rounded,'Arial Rounded MT Bold',system-ui,sans-serif",
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"space-between",
      padding:"0 20px 36px",
    }}>
      {/* Barra */}
      <div style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", paddingTop:16, flexShrink:0 }}>
        <button onClick={() => onVolver(racha > 0)} style={{ background:"rgba(255,255,255,.5)", border:"none", fontSize:30, borderRadius:18, width:56, height:56, cursor:"pointer" }}>🏠</button>
        <div style={{ background:"rgba(255,255,255,.75)", borderRadius:24, padding:"10px 24px", fontSize:"clamp(16px,3.5vw,24px)", fontWeight:800, color:"#3a1a5c" }}>
          {estado === "correcto" ? "¡Correcto! 🎉" : pregunta === "antes" ? "¿Qué número va antes? ⬅️" : "¿Qué número va después? ➡️"}
        </div>
        {racha > 0
          ? <div style={{ background:"rgba(255,255,255,.55)", borderRadius:20, padding:"6px 14px", fontSize:18, fontWeight:800 }}>{"⭐".repeat(Math.min(racha,5))}</div>
          : <div style={{ width:56 }} />
        }
      </div>

      {/* Número central con flecha */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20 }}>
        {/* Recta numérica visual */}
        <div style={{ display:"flex", alignItems:"center", gap:"clamp(8px,3vw,20px)" }}>
          {/* Hueco antes */}
          <div style={{
            width:"clamp(64px,14vw,90px)", height:"clamp(64px,14vw,90px)",
            borderRadius:20, border:"3px dashed rgba(255,255,255,.7)",
            background: pregunta === "antes" ? "rgba(255,255,255,.2)" : "rgba(255,255,255,.55)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"clamp(28px,7vw,44px)", fontWeight:900,
            color: pregunta === "antes" ? "rgba(255,255,255,.5)" : "#3a1a5c",
            boxShadow: pregunta === "antes" ? "none" : "0 4px 0 rgba(0,0,0,.1)",
          }}>
            {estado === "correcto" && pregunta === "antes" ? ronda.correcto : pregunta === "antes" ? "?" : n - 1}
          </div>

          {/* Número principal */}
          <div style={{
            width:"clamp(90px,20vw,130px)", height:"clamp(90px,20vw,130px)",
            borderRadius:28, background:"white",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"clamp(44px,10vw,70px)", fontWeight:900, color:"#3a1a5c",
            boxShadow:"0 8px 0 rgba(0,0,0,.15)",
          }}>
            {n}
          </div>

          {/* Hueco después */}
          <div style={{
            width:"clamp(64px,14vw,90px)", height:"clamp(64px,14vw,90px)",
            borderRadius:20, border:"3px dashed rgba(255,255,255,.7)",
            background: pregunta === "despues" ? "rgba(255,255,255,.2)" : "rgba(255,255,255,.55)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"clamp(28px,7vw,44px)", fontWeight:900,
            color: pregunta === "despues" ? "rgba(255,255,255,.5)" : "#3a1a5c",
            boxShadow: pregunta === "despues" ? "none" : "0 4px 0 rgba(0,0,0,.1)",
          }}>
            {estado === "correcto" && pregunta === "despues" ? ronda.correcto : pregunta === "despues" ? "?" : n + 1}
          </div>
        </div>

        {/* Indicador de flecha */}
        <div style={{
          background:"rgba(255,255,255,.65)", borderRadius:20,
          padding:"10px 28px", fontSize:"clamp(18px,4vw,26px)", fontWeight:800, color:"#3a1a5c",
        }}>
          {pregunta === "antes" ? "⬅️ va antes del " : "va después del ➡️"} <strong>{n}</strong>
        </div>
      </div>

      {/* Opciones */}
      <div style={{ display:"flex", gap:16, width:"100%", maxWidth:420, flexShrink:0 }}>
        {opciones.map(op => {
          const esCorrecto = estado === "correcto" && op === ronda.correcto;
          const esError    = errorOp === op;
          return (
            <button key={op} onPointerDown={() => tocar(op)} style={{
              flex:1, height:"clamp(80px,16vw,110px)",
              border:"none", borderRadius:28,
              fontSize:"clamp(38px,9vw,58px)", fontWeight:900,
              cursor:"pointer", touchAction:"none",
              background: esCorrecto ? "#5BCB77" : esError ? "#FF5555" : "rgba(255,255,255,.9)",
              color: esCorrecto||esError ? "white" : "#3a1a5c",
              boxShadow: esCorrecto ? "0 6px 0 #3BA055" : esError ? "0 6px 0 #CC2222" : "0 6px 0 rgba(0,0,0,.15)",
              transform: esCorrecto ? "scale(1.08) translateY(-4px)" : esError ? "scale(.93) translateY(4px)" : "scale(1)",
              transition:"all .15s",
            }}>{op}</button>
          );
        })}
      </div>
    </div>
  );
}
