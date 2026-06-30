"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { pip, fanfarria, hablar } from "./aventura/utils";
import { createClient } from "@/lib/supabase-browser";
import type { Palabra, PalabraProgreso } from "@/lib/types";

// ─── Tipos Web Speech API ─────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function barajar<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Ronda {
  palabra: Palabra;
  fase: number;
  opciones: Palabra[];
}

function construirRondas(
  palabras: Palabra[],
  progresoMap: Map<string, PalabraProgreso>,
  numOpciones: number,
): Ronda[] {
  return palabras.map(p => {
    const prog = progresoMap.get(p.id);
    const fase = prog ? Math.min(prog.fase, 3) : 1;
    const distractores = barajar(palabras.filter(x => x.id !== p.id)).slice(0, numOpciones - 1);
    const opciones = barajar([p, ...distractores]);
    return { palabra: p, fase, opciones };
  });
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface LecturaCanvasProps {
  palabras: Palabra[];
  progreso: PalabraProgreso[];
  ninoId: string;
  sonido: boolean;
  voz: boolean;
  onVolver: (completado: boolean) => void;
}

type EstadoRonda = "jugando" | "correcto" | "error";
type EstadoNombrar = "presentando" | "grabando" | "evaluando" | "resultado";

// ─── Componente ───────────────────────────────────────────────────────────────

export default function LecturaCanvas({ palabras, progreso, ninoId, sonido, voz, onVolver }: LecturaCanvasProps) {
  const numOpciones = palabras.length >= 6 ? 3 : 2;

  const progresoMap = useRef(new Map<string, PalabraProgreso>());
  useEffect(() => {
    progresoMap.current = new Map(progreso.map(p => [p.palabra_id, p]));
  }, [progreso]);

  const [rondas] = useState<Ronda[]>(() =>
    construirRondas(palabras, new Map(progreso.map(p => [p.palabra_id, p])), numOpciones)
  );
  const [rondaIdx, setRondaIdx]     = useState(0);
  const [estado, setEstado]         = useState<EstadoRonda>("jugando");
  const [errorId, setErrorId]       = useState<string | null>(null);
  const [racha, setRacha]           = useState(0);
  const [mostrarImagen, setMostrarImagen] = useState(false);

  // Fase 3 nombrar
  const [estadoNombrar, setEstadoNombrar] = useState<EstadoNombrar>("presentando");
  const [hayAPI, setHayAPI]         = useState(true);
  const reconRef = useRef<SpeechRecognition | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const API = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!API) setHayAPI(false);
  }, []);

  function limpiarTimer() {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }

  useEffect(() => () => {
    limpiarTimer();
    reconRef.current?.abort();
  }, []);

  const rondaActual = rondas[rondaIdx] as Ronda | undefined;

  // Anunciar fase 2 al entrar en una ronda con fase 2
  useEffect(() => {
    if (!rondaActual) return;
    setMostrarImagen(false);
    setEstadoNombrar("presentando");
    setEstado("jugando");
    setErrorId(null);
    if (rondaActual.fase === 2 && voz) {
      setTimeout(() => hablar(rondaActual.palabra.texto), 400);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rondaIdx]);

  async function guardarProgreso(palabra: Palabra, nuevaFase: number) {
    const sb = createClient();
    const prev = progresoMap.current.get(palabra.id);
    const nuevoProg: PalabraProgreso = {
      id: prev?.id ?? "",
      nino_id: ninoId,
      palabra_id: palabra.id,
      fase: nuevaFase,
      aciertos: (prev?.aciertos ?? 0) + 1,
      intentos: (prev?.intentos ?? 0) + 1,
      dominada: nuevaFase > 3,
    };
    progresoMap.current.set(palabra.id, nuevoProg);

    await sb.from("palabras_progreso").upsert({
      nino_id: ninoId,
      palabra_id: palabra.id,
      fase: Math.min(nuevaFase, 3),
      aciertos: nuevoProg.aciertos,
      intentos: nuevoProg.intentos,
      dominada: nuevoProg.dominada,
      actualizado_en: new Date().toISOString(),
    }, { onConflict: "nino_id,palabra_id" });
  }

  function siguienteRonda() {
    limpiarTimer();
    if (rondaIdx + 1 >= rondas.length) {
      onVolver(racha > 0);
    } else {
      setRondaIdx(i => i + 1);
    }
  }

  // ── Fase 1 y 2: tocar tarjeta ────────────────────────────────────────────────

  function tocarTarjeta(opcion: Palabra) {
    if (estado !== "jugando") return;
    limpiarTimer();

    if (opcion.id === rondaActual!.palabra.id) {
      setEstado("correcto");
      if (sonido) fanfarria();
      const nuevaFase = rondaActual!.fase + 1;
      guardarProgreso(rondaActual!.palabra, nuevaFase).catch(() => null);
      setRacha(r => r + 1);

      // Fase 1: mostrar imagen + decir palabra antes de avanzar
      if (rondaActual!.fase === 1) {
        if (voz) setTimeout(() => hablar(rondaActual!.palabra.texto), 200);
        if (rondaActual!.palabra.imagen_url) setMostrarImagen(true);
        timerRef.current = setTimeout(siguienteRonda, 2200);
      } else {
        timerRef.current = setTimeout(siguienteRonda, 1600);
      }
    } else {
      setErrorId(opcion.id);
      setEstado("error");
      if (sonido) pip(160, 0.3, 0.18, "sawtooth");
      timerRef.current = setTimeout(() => {
        setEstado("jugando");
        setErrorId(null);
      }, 700);
    }
  }

  // ── Fase 3: nombrar (reconocimiento de voz) ───────────────────────────────

  const iniciarGrabacion = useCallback(() => {
    const API = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!API || !rondaActual) return;

    const rec = new API();
    rec.lang = "es-ES";
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    reconRef.current = rec;

    rec.onresult = (e: SpeechRecognitionEvent) => {
      const objetivo = rondaActual.palabra.texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
      let acierto = false;
      for (let i = 0; i < e.results[0].length; i++) {
        const t = e.results[0][i].transcript.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
        if (t.includes(objetivo) || objetivo.includes(t.split(/\s+/)[0])) {
          acierto = true;
          break;
        }
      }
      setEstadoNombrar("resultado");
      reconRef.current = null;
      if (acierto) {
        if (sonido) fanfarria();
        guardarProgreso(rondaActual.palabra, rondaActual.fase + 1).catch(() => null);
        setRacha(r => r + 1);
        timerRef.current = setTimeout(siguienteRonda, 2000);
      } else {
        if (sonido) pip(160, 0.3, 0.18, "sawtooth");
        timerRef.current = setTimeout(() => setEstadoNombrar("presentando"), 1500);
      }
    };

    rec.onerror = () => {
      setEstadoNombrar("presentando");
      reconRef.current = null;
    };
    rec.onend = () => {
      if (estadoNombrar === "grabando") setEstadoNombrar("evaluando");
      reconRef.current = null;
    };

    setEstadoNombrar("grabando");
    rec.start();
    timerRef.current = setTimeout(() => reconRef.current?.stop(), 5000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rondaActual, sonido, estadoNombrar]);

  // ── Pantalla sin palabras ────────────────────────────────────────────────────

  if (palabras.length === 0) {
    return (
      <div className="fixed inset-0" style={{
        background: "radial-gradient(ellipse at 30% 20%, #E0F7FA 0%, #4FC3F7 60%, #0288D1 100%)",
        height: "100dvh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        fontFamily: "ui-rounded, 'Arial Rounded MT Bold', system-ui, sans-serif",
        gap: 24, padding: "0 32px", textAlign: "center",
      }}>
        <div style={{ fontSize: 80 }}>📖</div>
        <div style={{
          background: "rgba(255,255,255,.85)", borderRadius: 28,
          padding: "24px 32px", fontSize: "clamp(18px,4vw,24px)",
          fontWeight: 800, color: "#2A4D69",
          boxShadow: "0 4px 16px rgba(0,0,0,.1)",
        }}>
          Pide a mamá o papá que añada<br />palabras en el panel de padres
        </div>
        <button
          onClick={() => onVolver(false)}
          style={{
            background: "rgba(255,255,255,.7)", border: "none",
            fontSize: 32, borderRadius: 18, width: 64, height: 64, cursor: "pointer",
          }}
        >🏠</button>
      </div>
    );
  }

  // ── Pantalla completada ──────────────────────────────────────────────────────

  if (!rondaActual) {
    return (
      <div className="fixed inset-0" style={{
        background: "radial-gradient(ellipse at 30% 20%, #E0F7FA 0%, #4FC3F7 60%, #0288D1 100%)",
        height: "100dvh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        fontFamily: "ui-rounded, 'Arial Rounded MT Bold', system-ui, sans-serif",
        gap: 24, padding: "0 32px", textAlign: "center",
      }}>
        <div style={{ fontSize: 80 }}>🌟</div>
        <div style={{
          background: "rgba(255,255,255,.85)", borderRadius: 28,
          padding: "24px 32px", fontSize: "clamp(20px,4.5vw,28px)",
          fontWeight: 800, color: "#2A4D69",
        }}>
          ¡Has terminado todas las palabras!
        </div>
        <button
          onClick={() => onVolver(racha > 0)}
          style={{
            background: "#5BCB77", border: "none", borderRadius: 24,
            padding: "16px 40px", fontSize: 22, fontWeight: 900,
            color: "white", cursor: "pointer",
            boxShadow: "0 6px 0 #3BA055",
          }}
        >🏠 Volver</button>
      </div>
    );
  }

  const { palabra, fase, opciones } = rondaActual;

  return (
    <div
      className="fixed inset-0"
      style={{
        background: "radial-gradient(ellipse at 30% 15%, #E0F7FA 0%, #81D4FA 55%, #0288D1 100%)",
        height: "100dvh",
        touchAction: "none",
        fontFamily: "ui-rounded, 'Arial Rounded MT Bold', system-ui, sans-serif",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "space-between",
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
          onClick={() => { reconRef.current?.abort(); onVolver(racha > 0); }}
          style={{
            background: "rgba(255,255,255,.55)", border: "none",
            fontSize: 30, borderRadius: 18, width: 56, height: 56, cursor: "pointer",
          }}
        >🏠</button>

        {/* Indicador de fase */}
        <div style={{
          background: "rgba(255,255,255,.75)", borderRadius: 20,
          padding: "8px 20px", fontSize: "clamp(14px,3vw,18px)",
          fontWeight: 900, color: "#0277BD",
          display: "flex", gap: 8, alignItems: "center",
        }}>
          {["Emparejar", "Seleccionar", "Nombrar"][fase - 1]}
          <span style={{ opacity: 0.5 }}>·</span>
          <span>{rondaIdx + 1}/{rondas.length}</span>
        </div>

        {racha > 0 ? (
          <div style={{
            background: "rgba(255,255,255,.55)", borderRadius: 20,
            padding: "8px 16px", fontSize: 20, fontWeight: 800, color: "#333",
          }}>
            {"⭐".repeat(Math.min(racha, 5))}
          </div>
        ) : (
          <div style={{ width: 56 }} />
        )}
      </div>

      {/* ── FASE 1: EMPAREJAR ─────────────────────────────────────────────── */}
      {fase === 1 && (
        <>
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 16, width: "100%",
          }}>
            {/* Imagen de celebración (tras acertar en fase 1) */}
            {mostrarImagen && estado === "correcto" && palabra.imagen_url && (
              <div style={{
                width: "clamp(140px,35vw,220px)", height: "clamp(140px,35vw,220px)",
                borderRadius: 28, overflow: "hidden",
                boxShadow: "0 8px 24px rgba(0,0,0,.2)",
                animation: "popIn .4s cubic-bezier(.34,1.56,.64,1)",
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={palabra.imagen_url} alt={palabra.texto}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}

            {/* Instrucción */}
            <div style={{
              background: "rgba(255,255,255,.8)", borderRadius: 28,
              padding: "12px 32px", fontSize: "clamp(16px,3.5vw,22px)",
              fontWeight: 800, color: "#333",
            }}>
              Toca la palabra igual
            </div>

            {/* Palabra objetivo */}
            <div style={{
              fontSize: "clamp(52px,12vw,80px)",
              fontWeight: 900, color: "#01579B",
              letterSpacing: 3,
              textShadow: "0 4px 0 rgba(255,255,255,.7)",
              background: "rgba(255,255,255,.7)",
              borderRadius: 28, padding: "16px 40px",
              boxShadow: "0 4px 0 rgba(1,87,155,.2)",
            }}>
              {palabra.texto}
            </div>
          </div>

          {/* Tarjetas opciones */}
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center",
            width: "100%", maxWidth: 520, flexShrink: 0,
          }}>
            {opciones.map(op => {
              const esCorrecto = estado === "correcto" && op.id === palabra.id;
              const esError    = errorId === op.id;
              return (
                <TarjetaPalabra
                  key={op.id}
                  texto={op.texto}
                  correcto={esCorrecto}
                  error={esError}
                  onClick={() => tocarTarjeta(op)}
                  ancho={numOpciones === 3 ? "30%" : "45%"}
                />
              );
            })}
          </div>
        </>
      )}

      {/* ── FASE 2: SELECCIONAR ───────────────────────────────────────────── */}
      {fase === 2 && (
        <>
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 20, width: "100%",
          }}>
            {/* Imagen o placeholder */}
            {palabra.imagen_url ? (
              <div style={{
                width: "clamp(150px,38vw,240px)", height: "clamp(150px,38vw,240px)",
                borderRadius: 28, overflow: "hidden",
                boxShadow: "0 8px 24px rgba(0,0,0,.18)",
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={palabra.imagen_url} alt={palabra.texto}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ) : (
              <div style={{
                width: "clamp(150px,38vw,240px)", height: "clamp(150px,38vw,240px)",
                borderRadius: 28, background: "rgba(255,255,255,.55)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 80,
              }}>🖼️</div>
            )}

            <div style={{
              background: "rgba(255,255,255,.8)", borderRadius: 28,
              padding: "10px 28px", fontSize: "clamp(16px,3.5vw,22px)",
              fontWeight: 800, color: "#333",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              Toca la palabra que escuchas
              <button
                onClick={() => { if (voz) hablar(palabra.texto); }}
                style={{
                  background: "#0288D1", border: "none", borderRadius: 14,
                  fontSize: 22, width: 42, height: 42, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
                aria-label="Repetir"
              >🔊</button>
            </div>
          </div>

          {/* Tarjetas opciones */}
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center",
            width: "100%", maxWidth: 520, flexShrink: 0,
          }}>
            {opciones.map(op => {
              const esCorrecto = estado === "correcto" && op.id === palabra.id;
              const esError    = errorId === op.id;
              return (
                <TarjetaPalabra
                  key={op.id}
                  texto={op.texto}
                  correcto={esCorrecto}
                  error={esError}
                  onClick={() => tocarTarjeta(op)}
                  ancho={numOpciones === 3 ? "30%" : "45%"}
                />
              );
            })}
          </div>
        </>
      )}

      {/* ── FASE 3: NOMBRAR ──────────────────────────────────────────────── */}
      {fase === 3 && (
        <>
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 24, width: "100%",
          }}>
            {/* Imagen si existe */}
            {palabra.imagen_url && estadoNombrar !== "presentando" && (
              <div style={{
                width: "clamp(120px,28vw,180px)", height: "clamp(120px,28vw,180px)",
                borderRadius: 24, overflow: "hidden",
                boxShadow: "0 6px 18px rgba(0,0,0,.15)",
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={palabra.imagen_url} alt={palabra.texto}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}

            {/* Palabra escrita grande */}
            <div style={{
              fontSize: "clamp(56px,14vw,90px)",
              fontWeight: 900, color: "#01579B",
              letterSpacing: 4,
              textShadow: "0 4px 0 rgba(255,255,255,.7)",
              background: "rgba(255,255,255,.7)",
              borderRadius: 28, padding: "16px 48px",
              animation: estadoNombrar === "grabando" ? "latir .7s ease-in-out infinite" : "none",
            }}>
              {palabra.texto}
            </div>

            {estadoNombrar === "resultado" && (
              <div style={{
                background: "rgba(255,255,255,.75)", borderRadius: 20,
                padding: "10px 24px", fontSize: "clamp(18px,4vw,24px)",
                fontWeight: 800, color: "#2A4D69",
                animation: "popIn .4s cubic-bezier(.34,1.56,.64,1)",
              }}>
                ¡Bien dicho! ⭐
              </div>
            )}

            {!hayAPI && (
              <div style={{
                background: "rgba(255,180,0,.25)", borderRadius: 16,
                padding: "12px 24px", fontSize: 16, fontWeight: 700,
                color: "#664400", textAlign: "center",
              }}>
                Reconocimiento de voz no disponible.<br />Prueba con Safari en iPad.
              </div>
            )}
          </div>

          {/* Botones de acción fase 3 */}
          <div style={{
            display: "flex", gap: 16, width: "100%", maxWidth: 460, flexShrink: 0,
          }}>
            {hayAPI && estadoNombrar === "presentando" && (
              <button
                onPointerDown={iniciarGrabacion}
                style={botonGrande("#2ECC71", "#1A9E55")}
              >
                🎙️ ¡Di la palabra!
              </button>
            )}
            {hayAPI && estadoNombrar === "grabando" && (
              <button
                onPointerDown={() => { limpiarTimer(); reconRef.current?.stop(); }}
                style={{ ...botonGrande("#E74C3C", "#A93226"), animation: "parpadeo 1s ease-in-out infinite" }}
              >
                ⏹ Parar
              </button>
            )}
            {estadoNombrar === "evaluando" && (
              <div style={{ ...botonGrande("rgba(255,255,255,.6)", "rgba(0,0,0,.1)"),
                color: "#2A4D69", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, fontWeight: 800 }}>
                Analizando...
              </div>
            )}
            {/* Saltar siempre disponible en fase 3 */}
            <button
              onClick={siguienteRonda}
              style={botonGrande("rgba(255,255,255,.55)", "rgba(0,0,0,.1)")}
            >
              <span style={{ color: "#2A4D69", fontSize: 22, fontWeight: 800 }}>Siguiente ➡️</span>
            </button>
          </div>
        </>
      )}

      <style>{`
        @keyframes latir  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
        @keyframes popIn  { 0%{transform:scale(.5);opacity:0} 100%{transform:scale(1);opacity:1} }
        @keyframes parpadeo { 0%,100%{opacity:1} 50%{opacity:.6} }
      `}</style>
    </div>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function TarjetaPalabra({ texto, correcto, error, onClick, ancho }: {
  texto: string; correcto: boolean; error: boolean;
  onClick: () => void; ancho: string;
}) {
  return (
    <button
      onPointerDown={onClick}
      style={{
        width: ancho, minWidth: 120,
        minHeight: "clamp(72px,15vw,100px)",
        border: "none", borderRadius: 24,
        fontSize: "clamp(22px,5vw,34px)",
        fontWeight: 900, letterSpacing: 1,
        cursor: "pointer", touchAction: "none",
        transition: "transform .15s, background .15s, box-shadow .15s",
        background: correcto ? "#5BCB77" : error ? "#FF5555" : "rgba(255,255,255,.88)",
        color: correcto || error ? "white" : "#01579B",
        boxShadow: correcto ? "0 6px 0 #3BA055"
                 : error    ? "0 6px 0 #CC2222"
                 : "0 6px 0 rgba(0,0,0,.15)",
        transform: correcto ? "scale(1.08) translateY(-4px)"
                 : error    ? "scale(.93) translateY(4px)"
                 : "scale(1)",
      }}
    >
      {texto}
    </button>
  );
}

function botonGrande(bg: string, sombra: string): React.CSSProperties {
  return {
    flex: 1, height: "clamp(76px,15vw,100px)",
    border: "none", borderRadius: 28,
    background: bg, boxShadow: `0 6px 0 ${sombra}`,
    fontSize: "clamp(18px,4vw,26px)", fontWeight: 900, color: "white",
    cursor: "pointer", touchAction: "none",
    display: "flex", alignItems: "center", justifyContent: "center",
  };
}
