"use client";

import { useState, useRef, useEffect } from "react";
import { pip, fanfarria, hablar } from "./aventura/utils";

interface MasMenosProps {
  sonido: boolean;
  voz: boolean;
  nivel?: 1 | 2 | 3;
  onVolver: (completado: boolean) => void;
}

const EMOJIS = ["🍎","🐥","⭐","🌸","🐞","🦋","🍭","🎈","🐠","🍊"];

function aleatorio(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generarRonda() {
  const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  let a = aleatorio(1, 9), b = aleatorio(1, 9);
  while (b === a) b = aleatorio(1, 9);
  const mayor = a > b ? "izq" : "der";
  return { emoji, a, b, mayor };
}

// Posiciones fijas para hasta 9 objetos, distribuidos en zona de 40%×55% de pantalla
const POSICIONES = [
  [{x:50,y:50}],
  [{x:35,y:42},{x:65,y:58}],
  [{x:30,y:40},{x:60,y:40},{x:45,y:62}],
  [{x:28,y:38},{x:62,y:38},{x:28,y:62},{x:62,y:62}],
  [{x:28,y:36},{x:62,y:36},{x:45,y:52},{x:28,y:66},{x:62,y:66}],
  [{x:25,y:34},{x:50,y:34},{x:72,y:34},{x:35,y:60},{x:60,y:60},{x:47,y:72}],
  [{x:22,y:32},{x:50,y:32},{x:72,y:32},{x:30,y:55},{x:55,y:55},{x:22,y:70},{x:65,y:70}],
  [{x:20,y:30},{x:46,y:30},{x:72,y:30},{x:28,y:52},{x:55,y:52},{x:72,y:52},{x:20,y:70},{x:55,y:72}],
  [{x:20,y:28},{x:46,y:28},{x:72,y:28},{x:25,y:50},{x:50,y:50},{x:72,y:50},{x:20,y:68},{x:46,y:68},{x:72,y:68}],
];

export default function MasMenosCanvas({ sonido, voz, onVolver }: MasMenosProps) {
  const [ronda, setRonda]     = useState(generarRonda);
  const [estado, setEstado]   = useState<"jugando"|"correcto"|"error">("jugando");
  const [errorLado, setErrorLado] = useState<"izq"|"der"|null>(null);
  const [racha, setRacha]     = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (voz) setTimeout(() => hablar("¿Cuál grupo tiene más?"), 300);
  }, [ronda]);

  function tocar(lado: "izq"|"der") {
    if (estado !== "jugando") return;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (lado === ronda.mayor) {
      setEstado("correcto");
      if (sonido) fanfarria();
      const n = lado === "izq" ? ronda.a : ronda.b;
      if (voz) setTimeout(() => hablar(`¡Correcto! Hay ${n}`), 300);
      setRacha(r => r + 1);
      timerRef.current = setTimeout(() => { setRonda(generarRonda()); setEstado("jugando"); setErrorLado(null); }, 1700);
    } else {
      setErrorLado(lado);
      setEstado("error");
      if (sonido) pip(160, 0.3, 0.18, "sawtooth");
      timerRef.current = setTimeout(() => { setEstado("jugando"); setErrorLado(null); }, 700);
    }
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const { emoji, a, b, mayor } = ronda;

  function Grupo({ n, lado }: { n: number; lado: "izq"|"der" }) {
    const esMayor   = estado === "correcto" && lado === mayor;
    const esError   = errorLado === lado;
    const pos       = POSICIONES[Math.min(n - 1, 8)];
    return (
      <button onPointerDown={() => tocar(lado)} style={{
        flex:1, height:"clamp(200px,42vh,320px)",
        border:"none", borderRadius:32,
        background: esMayor ? "rgba(91,203,119,.35)" : esError ? "rgba(255,85,85,.25)" : "rgba(255,255,255,.55)",
        boxShadow: esMayor ? "0 0 0 4px #5BCB77" : esError ? "0 0 0 4px #FF5555" : "0 6px 0 rgba(0,0,0,.12)",
        cursor:"pointer", touchAction:"none", position:"relative",
        transition:"all .2s",
      }}>
        {pos.map((p, i) => (
          <div key={i} style={{
            position:"absolute",
            left:`${p.x}%`, top:`${p.y}%`,
            transform:"translate(-50%,-50%)",
            fontSize:"clamp(28px,6vw,40px)",
            pointerEvents:"none", userSelect:"none",
            filter: esMayor ? "drop-shadow(0 0 6px rgba(91,203,119,.8))" : "none",
          }}>{emoji}</div>
        ))}
      </button>
    );
  }

  return (
    <div className="fixed inset-0" style={{
      background:"radial-gradient(ellipse at 50% 0%, #FFF9C4 0%, #FFF176 50%, #F9A825 100%)",
      height:"100dvh", touchAction:"none",
      fontFamily:"ui-rounded,'Arial Rounded MT Bold',system-ui,sans-serif",
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"space-between",
      padding:"0 16px 32px",
    }}>
      {/* Barra */}
      <div style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", paddingTop:16, flexShrink:0 }}>
        <button onClick={() => onVolver(racha > 0)} style={{ background:"rgba(255,255,255,.5)", border:"none", fontSize:30, borderRadius:18, width:56, height:56, cursor:"pointer" }}>🏠</button>
        <div style={{ background:"rgba(255,255,255,.75)", borderRadius:24, padding:"10px 24px", fontSize:"clamp(16px,3.5vw,24px)", fontWeight:800, color:"#5a3a00" }}>
          {estado === "correcto" ? "¡Correcto! 🎉" : "¿Cuál grupo tiene más? 👆"}
        </div>
        {racha > 0
          ? <div style={{ background:"rgba(255,255,255,.55)", borderRadius:20, padding:"6px 14px", fontSize:18, fontWeight:800 }}>{"⭐".repeat(Math.min(racha,5))}</div>
          : <div style={{ width:56 }} />
        }
      </div>

      {/* Grupos */}
      <div style={{ flex:1, display:"flex", gap:16, width:"100%", padding:"8px 0", alignItems:"stretch" }}>
        <Grupo n={a} lado="izq" />
        <Grupo n={b} lado="der" />
      </div>
    </div>
  );
}
