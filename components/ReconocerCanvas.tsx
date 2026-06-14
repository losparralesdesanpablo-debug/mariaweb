"use client";

import { useState, useEffect, useRef } from "react";
import { pip, fanfarria, hablar } from "./aventura/utils";

interface ReconocerProps {
  modo: "numeros" | "vocales";
  sonido: boolean;
  voz: boolean;
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

const NUMEROS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const VOCALES = ["A", "E", "I", "O", "U"];

function generarRonda(modo: "numeros" | "vocales") {
  if (modo === "numeros") {
    const correcto = NUMEROS[aleatorio(0, NUMEROS.length - 1)];
    const pool = NUMEROS.filter(n => n !== correcto);
    const distractores = barajar(pool).slice(0, 3);
    return { correcto, opciones: barajar([correcto, ...distractores]) };
  } else {
    const correcto = VOCALES[aleatorio(0, VOCALES.length - 1)];
    const pool = VOCALES.filter(v => v !== correcto);
    const distractores = barajar(pool).slice(0, 3);
    return { correcto, opciones: barajar([correcto, ...distractores]) };
  }
}

function decir(valor: string | number, modo: "numeros" | "vocales") {
  if (modo === "numeros") {
    hablar(`el número ${valor}`);
  } else {
    hablar(`la vocal ${valor}`);
  }
}

export default function ReconocerCanvas({ modo, sonido, voz, onVolver }: ReconocerProps) {
  const [ronda, setRonda]           = useState(() => generarRonda(modo));
  const [estado, setEstado]         = useState<"esperando" | "correcto" | "error">("esperando");
  const [opcionError, setOpcionError] = useState<string | number | null>(null);
  const [racha, setRacha]           = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function limpiarTimer() {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }

  function anunciar(r = ronda) {
    if (voz) setTimeout(() => decir(r.correcto, modo), 300);
  }

  useEffect(() => {
    anunciar();
    return limpiarTimer;
  }, [ronda]);

  function tocar(opcion: string | number) {
    if (estado !== "esperando") return;
    limpiarTimer();

    if (opcion === ronda.correcto) {
      setEstado("correcto");
      if (sonido) fanfarria();
      if (voz) setTimeout(() => decir(ronda.correcto, modo), 300);
      setRacha(r => r + 1);
      timerRef.current = setTimeout(() => {
        const nueva = generarRonda(modo);
        setRonda(nueva);
        setEstado("esperando");
        setOpcionError(null);
      }, 1800);
    } else {
      setOpcionError(opcion);
      setEstado("error");
      if (sonido) pip(160, 0.3, 0.18, "sawtooth");
      timerRef.current = setTimeout(() => {
        setEstado("esperando");
        setOpcionError(null);
      }, 700);
    }
  }

  const esNumeros = modo === "numeros";
  const fondo = esNumeros
    ? "radial-gradient(ellipse at 25% 15%, #FFF3DC 0%, #FFD580 100%)"
    : "radial-gradient(ellipse at 70% 20%, #EEE0FF 0%, #C8A0F0 100%)";
  const acento = esNumeros ? "#FF8C42" : "#9B59D0";
  const sombra = esNumeros ? "#CC6010" : "#6A2FA0";

  return (
    <div
      className="fixed inset-0"
      style={{
        background: fondo,
        height: "100dvh",
        touchAction: "none",
        fontFamily: "ui-rounded, 'Arial Rounded MT Bold', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px 32px",
      }}
    >
      {/* Barra superior */}
      <div style={{
        width: "100%", display: "flex",
        alignItems: "center", justifyContent: "space-between",
        paddingTop: 16, flexShrink: 0,
      }}>
        <button
          onClick={() => onVolver(racha > 0)}
          style={{
            background: "rgba(255,255,255,.5)", border: "none",
            fontSize: 30, borderRadius: 18, width: 56, height: 56,
            cursor: "pointer",
          }}
        >🏠</button>

        {racha > 0 && (
          <div style={{
            background: "rgba(255,255,255,.55)", borderRadius: 20,
            padding: "6px 16px", fontSize: 20, fontWeight: 800, color: "#333",
          }}>
            {"⭐".repeat(Math.min(racha, 5))}
          </div>
        )}

        <button
          onClick={() => anunciar()}
          style={{
            background: "rgba(255,255,255,.5)", border: "none",
            fontSize: 30, borderRadius: 18, width: 56, height: 56,
            cursor: "pointer",
          }}
          aria-label="Repetir"
        >🔊</button>
      </div>

      {/* Zona central: instrucción + valor grande */}
      <div style={{
        flex: 1,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 24, width: "100%",
      }}>
        {/* Bocadillo instrucción */}
        <div style={{
          background: "rgba(255,255,255,.8)", borderRadius: 28,
          padding: "14px 36px", fontSize: "clamp(20px,4.5vw,30px)",
          fontWeight: 800, color: "#333",
          boxShadow: "0 4px 16px rgba(0,0,0,.1)",
          textAlign: "center",
        }}>
          {esNumeros ? "🔊 ¿Qué número escuchas?" : "🔊 ¿Qué vocal escuchas?"}
        </div>

        {/* Botón de escuchar grande (central) */}
        <button
          onPointerDown={() => anunciar()}
          style={{
            width: "clamp(140px,30vw,200px)",
            height: "clamp(140px,30vw,200px)",
            borderRadius: "50%",
            border: "none",
            background: acento,
            boxShadow: `0 10px 0 ${sombra}`,
            fontSize: "clamp(60px,14vw,90px)",
            cursor: "pointer",
            touchAction: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "transform .1s, box-shadow .1s",
          }}
          onPointerUp={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = "";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 10px 0 ${sombra}`;
          }}
          aria-label="Escuchar de nuevo"
        >
          🔊
        </button>

        <div style={{
          fontSize: "clamp(16px,3.5vw,22px)",
          color: "rgba(0,0,0,.45)", fontWeight: 700,
        }}>
          Toca el {esNumeros ? "número" : "vocal"} correcto
        </div>
      </div>

      {/* Grid de opciones */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
        width: "100%",
        maxWidth: 460,
        flexShrink: 0,
      }}>
        {ronda.opciones.map(op => {
          const esCorrecto = estado === "correcto" && op === ronda.correcto;
          const esError    = opcionError === op;
          return (
            <button
              key={String(op)}
              onPointerDown={() => tocar(op)}
              style={{
                height: "clamp(80px,17vw,110px)",
                border: "none",
                borderRadius: 28,
                fontSize: "clamp(40px,10vw,64px)",
                fontWeight: 900,
                cursor: "pointer",
                touchAction: "none",
                transition: "transform .15s, background .15s, box-shadow .15s",
                background: esCorrecto
                  ? "#5BCB77"
                  : esError
                    ? "#FF5555"
                    : "rgba(255,255,255,.85)",
                color: esCorrecto || esError ? "white" : "#2A4D69",
                boxShadow: esCorrecto
                  ? "0 6px 0 #3BA055"
                  : esError
                    ? "0 6px 0 #CC2222"
                    : `0 6px 0 rgba(0,0,0,.18)`,
                transform: esCorrecto ? "scale(1.08) translateY(-4px)"
                           : esError   ? "scale(.93) translateY(4px)"
                           : "scale(1)",
              }}
            >
              {op}
            </button>
          );
        })}
      </div>
    </div>
  );
}
