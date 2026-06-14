"use client";

import { useState, useRef, useEffect } from "react";
import { pip, fanfarria, hablar } from "./aventura/utils";

interface SumarProps {
  sonido: boolean;
  voz: boolean;
  onVolver: () => void;
}

const EMOJIS = ["🍎","🐥","⭐","🌸","🍭","🎈","🐞","🦋","🍊","🐠"];

function aleatorio(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function barajar<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function generarRonda(nivel: number) {
  const maxSuma = nivel === 0 ? 5 : 10;
  const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  let a = aleatorio(1, maxSuma - 1);
  let b = aleatorio(1, maxSuma - a);
  const correcto = a + b;
  const pool = new Set<number>([correcto]);
  while (pool.size < 3) {
    const d = correcto + aleatorio(-2, 2);
    if (d > 0 && d <= 10 && d !== correcto) pool.add(d);
  }
  return { emoji, a, b, correcto, opciones: barajar([...pool]) };
}

export default function SumarCanvas({ sonido, voz, onVolver }: SumarProps) {
  const [nivel, setNivel]     = useState(0);
  const [ronda, setRonda]     = useState(() => generarRonda(0));
  const [estado, setEstado]   = useState<"jugando"|"correcto"|"error">("jugando");
  const [errorOp, setErrorOp] = useState<number|null>(null);
  const [racha, setRacha]     = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (voz) setTimeout(() => hablar(`¿Cuántos ${ronda.emoji} hay en total?`), 300);
  }, [ronda]);

  function tocar(n: number) {
    if (estado !== "jugando") return;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (n === ronda.correcto) {
      setEstado("correcto");
      if (sonido) fanfarria();
      if (voz) setTimeout(() => hablar(`¡Muy bien! ${ronda.a} más ${ronda.b} son ${ronda.correcto}`), 300);
      setRacha(r => r + 1);
      timerRef.current = setTimeout(() => {
        const nextNivel = racha > 0 && racha % 4 === 0 ? 1 : nivel;
        setNivel(nextNivel);
        setRonda(generarRonda(nextNivel));
        setEstado("jugando"); setErrorOp(null);
      }, 1800);
    } else {
      setErrorOp(n); setEstado("error");
      if (sonido) pip(160, 0.3, 0.18, "sawtooth");
      timerRef.current = setTimeout(() => { setEstado("jugando"); setErrorOp(null); }, 700);
    }
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const { emoji, a, b, opciones } = ronda;

  // Fila de emojis para cada sumando
  function Fila({ n }: { n: number }) {
    return (
      <div style={{ display:"flex", flexWrap:"wrap", gap:6, justifyContent:"center", alignItems:"center" }}>
        {Array.from({ length: n }, (_, i) => (
          <span key={i} style={{ fontSize:"clamp(28px,7vw,44px)", lineHeight:1, filter: estado==="correcto" ? "drop-shadow(0 0 8px rgba(91,203,119,.8))" : "none", transition:"filter .3s" }}>{emoji}</span>
        ))}
      </div>
    );
  }

  return (
    <div className="fixed inset-0" style={{
      background:"radial-gradient(ellipse at 20% 10%, #FFE0F0 0%, #FFB3D1 60%, #FF80AB 100%)",
      height:"100dvh", touchAction:"none",
      fontFamily:"ui-rounded,'Arial Rounded MT Bold',system-ui,sans-serif",
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"space-between",
      padding:"0 20px 36px",
    }}>
      {/* Barra */}
      <div style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", paddingTop:16, flexShrink:0 }}>
        <button onClick={onVolver} style={{ background:"rgba(255,255,255,.5)", border:"none", fontSize:30, borderRadius:18, width:56, height:56, cursor:"pointer" }}>🏠</button>
        <div style={{ background:"rgba(255,255,255,.75)", borderRadius:24, padding:"10px 24px", fontSize:"clamp(16px,3.5vw,24px)", fontWeight:800, color:"#5a1a30" }}>
          {estado === "correcto" ? "¡Muy bien! 🎉" : "¿Cuántos hay en total?"}
        </div>
        {racha > 0
          ? <div style={{ background:"rgba(255,255,255,.55)", borderRadius:20, padding:"6px 14px", fontSize:18, fontWeight:800 }}>{"⭐".repeat(Math.min(racha,5))}</div>
          : <div style={{ width:56 }} />
        }
      </div>

      {/* Operación visual */}
      <div style={{
        flex:1, display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center", gap:12, width:"100%",
      }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:16, flexWrap:"wrap" }}>
          {/* Grupo A */}
          <div style={{ background:"rgba(255,255,255,.6)", borderRadius:24, padding:"16px 20px", minWidth:"clamp(90px,20vw,130px)" }}>
            <Fila n={a} />
          </div>

          {/* Signo + */}
          <div style={{ fontSize:"clamp(40px,9vw,60px)", fontWeight:900, color:"white", textShadow:"0 3px 0 rgba(0,0,0,.2)" }}>+</div>

          {/* Grupo B */}
          <div style={{ background:"rgba(255,255,255,.6)", borderRadius:24, padding:"16px 20px", minWidth:"clamp(90px,20vw,130px)" }}>
            <Fila n={b} />
          </div>

          {/* Signo = */}
          <div style={{ fontSize:"clamp(40px,9vw,60px)", fontWeight:900, color:"white", textShadow:"0 3px 0 rgba(0,0,0,.2)" }}>=</div>

          {/* Resultado */}
          <div style={{
            background: estado === "correcto" ? "rgba(91,203,119,.5)" : "rgba(255,255,255,.4)",
            borderRadius:24, padding:"16px 20px", minWidth:"clamp(70px,16vw,100px)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"clamp(40px,9vw,60px)", fontWeight:900, color:"white",
            textShadow:"0 3px 0 rgba(0,0,0,.2)",
            border:"3px dashed rgba(255,255,255,.6)",
            transition:"background .3s",
          }}>
            {estado === "correcto" ? ronda.correcto : "?"}
          </div>
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
              color: esCorrecto||esError ? "white" : "#5a1a30",
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
