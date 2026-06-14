"use client";

import { useState, useRef, useEffect } from "react";
import { pip, fanfarria, hablar } from "./aventura/utils";

// ─── Palabras ─────────────────────────────────────────────────────────────────

const PALABRAS = [
  { palabra: "manzana",   emoji: "🍎" },
  { palabra: "plátano",   emoji: "🍌" },
  { palabra: "casa",      emoji: "🏠" },
  { palabra: "pelota",    emoji: "⚽" },
  { palabra: "perro",     emoji: "🐶" },
  { palabra: "gato",      emoji: "🐱" },
  { palabra: "sol",       emoji: "☀️" },
  { palabra: "luna",      emoji: "🌙" },
  { palabra: "flor",      emoji: "🌸" },
  { palabra: "árbol",     emoji: "🌳" },
  { palabra: "pájaro",    emoji: "🐦" },
  { palabra: "pez",       emoji: "🐟" },
  { palabra: "libro",     emoji: "📚" },
  { palabra: "coche",     emoji: "🚗" },
  { palabra: "corazón",   emoji: "❤️" },
];

// ─── Similitud de texto (distancia de Levenshtein normalizada) ────────────────

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

function similitud(objetivo: string, dicho: string): number {
  const a = objetivo.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const b = dicho.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  // buscar la palabra más parecida dentro de lo reconocido (puede haber varias)
  const palabras = b.split(/\s+/);
  const mejorDist = Math.min(...palabras.map(p => levenshtein(a, p)));
  const maxLen = Math.max(a.length, 1);
  return Math.max(0, Math.round((1 - mejorDist / maxLen) * 100));
}

function estrellitas(pct: number): number {
  if (pct >= 95) return 5;
  if (pct >= 80) return 4;
  if (pct >= 60) return 3;
  if (pct >= 40) return 2;
  if (pct >= 20) return 1;
  return 0;
}

// ─── Tipos Web Speech API ────────────────────────────────────────────────────

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionResult {
  readonly length: number;
  [index: number]: SpeechRecognitionAlternative;
  readonly isFinal: boolean;
}
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}
interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: Event) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface PronunciarProps {
  sonido: boolean;
  voz: boolean;
  onVolver: (completado: boolean) => void;
}

type Estado = "presentando" | "grabando" | "evaluando" | "resultado";

// ─── Componente ───────────────────────────────────────────────────────────────

export default function PronunciarCanvas({ sonido, voz, onVolver }: PronunciarProps) {
  const [idxPalabra, setIdxPalabra] = useState(() => Math.floor(Math.random() * PALABRAS.length));
  const [estado, setEstado]         = useState<Estado>("presentando");
  const [puntuacion, setPuntuacion] = useState(0);
  const [dichoTexto, setDichoTexto] = useState("");
  const [hayAPI, setHayAPI]         = useState(true);
  const reconRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const item = PALABRAS[idxPalabra];

  useEffect(() => {
    const API = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!API) setHayAPI(false);
  }, []);

  useEffect(() => {
    // Al llegar a una nueva palabra, presentarla con voz
    if (voz) setTimeout(() => hablar(item.palabra), 400);
    setEstado("presentando");
    setDichoTexto("");
    setPuntuacion(0);
  }, [idxPalabra]);

  function limpiarTimer() {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }

  function escucharPalabra() {
    if (voz) hablar(item.palabra);
  }

  function iniciarGrabacion() {
    const API = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!API) return;

    const rec = new API();
    rec.lang = "es-ES";
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    reconRef.current = rec;

    rec.onresult = (e: SpeechRecognitionEvent) => {
      // Buscar la alternativa más parecida a la palabra objetivo
      let mejorSim = 0;
      let mejorTexto = "";
      const resultado = e.results[0];
      for (let i = 0; i < resultado.length; i++) {
        const t = resultado[i].transcript;
        const s = similitud(item.palabra, t);
        if (s > mejorSim) { mejorSim = s; mejorTexto = t; }
      }
      setDichoTexto(mejorTexto);
      setPuntuacion(mejorSim);
      setEstado("resultado");
      if (mejorSim >= 80 && sonido) fanfarria();
      else if (sonido) pip(400, 0.3, 0.2);
    };

    rec.onerror = () => {
      setEstado("presentando");
      reconRef.current = null;
    };

    rec.onend = () => {
      if (estado === "grabando") setEstado("evaluando");
      reconRef.current = null;
    };

    setEstado("grabando");
    rec.start();

    // Parar automáticamente tras 4 segundos
    timerRef.current = setTimeout(() => {
      reconRef.current?.stop();
    }, 4000);
  }

  function detenerGrabacion() {
    limpiarTimer();
    reconRef.current?.stop();
  }

  function siguiente() {
    limpiarTimer();
    reconRef.current?.abort();
    setIdxPalabra(i => {
      let next = Math.floor(Math.random() * PALABRAS.length);
      if (next === i) next = (next + 1) % PALABRAS.length;
      return next;
    });
  }

  useEffect(() => () => { limpiarTimer(); reconRef.current?.abort(); }, []);

  const estrellas = estrellitas(puntuacion);

  return (
    <div
      className="fixed inset-0"
      style={{
        background: "radial-gradient(ellipse at 30% 10%, #E8FFF0 0%, #A8E6C8 60%, #5BCB95 100%)",
        height: "100dvh",
        touchAction: "none",
        fontFamily: "ui-rounded, 'Arial Rounded MT Bold', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px 36px",
      }}
    >
      {/* Barra superior */}
      <div style={{
        width: "100%", display: "flex",
        alignItems: "center", justifyContent: "space-between",
        paddingTop: 16, flexShrink: 0,
      }}>
        <button
          onClick={() => onVolver(puntuacion > 0)}
          style={{
            background: "rgba(255,255,255,.55)", border: "none",
            fontSize: 30, borderRadius: 18, width: 56, height: 56, cursor: "pointer",
          }}
        >🏠</button>

        <div style={{
          background: "rgba(255,255,255,.7)", borderRadius: 24,
          padding: "10px 24px", fontSize: "clamp(18px,4vw,26px)",
          fontWeight: 800, color: "#1a5c3a",
        }}>
          {estado === "presentando" && "¿Puedes decirlo?"}
          {estado === "grabando"    && "🎙️ Escuchando..."}
          {estado === "evaluando"   && "Analizando..."}
          {estado === "resultado"   && (estrellas >= 4 ? "¡Muy bien! 🎉" : estrellas >= 2 ? "¡Casi! 💪" : "¡Inténtalo! 🔄")}
        </div>

        <button
          onClick={escucharPalabra}
          style={{
            background: "rgba(255,255,255,.55)", border: "none",
            fontSize: 30, borderRadius: 18, width: 56, height: 56, cursor: "pointer",
          }}
          aria-label="Escuchar palabra"
        >🔊</button>
      </div>

      {/* Zona central: emoji + palabra */}
      <div style={{
        flex: 1,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 20,
      }}>
        {/* Emoji grande */}
        <div style={{
          fontSize: "clamp(110px, 24vw, 160px)",
          lineHeight: 1,
          filter: "drop-shadow(0 8px 16px rgba(0,0,0,.15))",
          animation: estado === "grabando" ? "latir .7s ease-in-out infinite" : "none",
        }}>
          {item.emoji}
        </div>

        {/* Palabra */}
        <div style={{
          fontSize: "clamp(36px, 8vw, 56px)",
          fontWeight: 900, color: "#1a4a2a",
          letterSpacing: 2,
          textShadow: "0 3px 0 rgba(255,255,255,.6)",
        }}>
          {item.palabra}
        </div>

        {/* Resultado: estrellas + texto reconocido */}
        {estado === "resultado" && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
            animation: "popIn .4s cubic-bezier(.34,1.56,.64,1)",
          }}>
            <div style={{ fontSize: "clamp(36px,8vw,52px)", letterSpacing: 4 }}>
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} style={{
                  opacity: i < estrellas ? 1 : 0.2,
                  filter: i < estrellas ? "none" : "grayscale(1)",
                }}>⭐</span>
              ))}
            </div>
            <div style={{
              background: "rgba(255,255,255,.65)", borderRadius: 16,
              padding: "8px 20px", fontSize: 18, color: "#333", fontWeight: 700,
            }}>
              {dichoTexto ? `"${dichoTexto}" · ${puntuacion}%` : "No se escuchó nada"}
            </div>
          </div>
        )}

        {/* Sin soporte */}
        {!hayAPI && (
          <div style={{
            background: "rgba(255,100,100,.2)", borderRadius: 16,
            padding: "12px 24px", fontSize: 16, color: "#800", fontWeight: 700,
            textAlign: "center",
          }}>
            Tu navegador no soporta reconocimiento de voz.<br/>Prueba con Safari en iPad.
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div style={{
        display: "flex", gap: 16, width: "100%", maxWidth: 460, flexShrink: 0,
      }}>
        {(estado === "presentando" || estado === "resultado") && hayAPI && (
          <button
            onPointerDown={iniciarGrabacion}
            style={{
              flex: 1,
              height: "clamp(80px,16vw,110px)",
              border: "none", borderRadius: 28,
              background: "#2ECC71",
              boxShadow: "0 7px 0 #1A9E55",
              fontSize: "clamp(20px,4.5vw,30px)",
              fontWeight: 900, color: "white",
              cursor: "pointer", touchAction: "none",
            }}
          >
            🎙️ {estado === "resultado" ? "Repetir" : "¡Habla!"}
          </button>
        )}

        {estado === "grabando" && (
          <button
            onPointerDown={detenerGrabacion}
            style={{
              flex: 1,
              height: "clamp(80px,16vw,110px)",
              border: "none", borderRadius: 28,
              background: "#E74C3C",
              boxShadow: "0 7px 0 #A93226",
              fontSize: "clamp(20px,4.5vw,30px)",
              fontWeight: 900, color: "white",
              cursor: "pointer", touchAction: "none",
              animation: "parpadeo 1s ease-in-out infinite",
            }}
          >
            ⏹ Parar
          </button>
        )}

        {estado === "resultado" && (
          <button
            onPointerDown={siguiente}
            style={{
              flex: 1,
              height: "clamp(80px,16vw,110px)",
              border: "none", borderRadius: 28,
              background: "#3498DB",
              boxShadow: "0 7px 0 #1A6FA0",
              fontSize: "clamp(20px,4.5vw,30px)",
              fontWeight: 900, color: "white",
              cursor: "pointer", touchAction: "none",
            }}
          >
            Siguiente ➡️
          </button>
        )}
      </div>

      <style>{`
        @keyframes latir {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes popIn {
          0%   { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes parpadeo {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.65; }
        }
      `}</style>
    </div>
  );
}
