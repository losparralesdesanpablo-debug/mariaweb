"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { Actividad, ConfiguracionNino } from "@/lib/types";
import { guardarIntento } from "@/lib/trazo-store";
import { FRASES_NIVEL } from "@/lib/types";

// ─── Tipos internos ───────────────────────────────────────────────────────────

interface Punto {
  x: number;
  y: number;
}

interface Metricas {
  inicio: number;
  levantamientos: number;
  usoPencil: boolean;
}

// ─── Audio helpers (sin ficheros, puro WebAudio) ──────────────────────────────

let audioCtx: AudioContext | null = null;

function getAudio(): AudioContext {
  if (!audioCtx)
    audioCtx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function pip(
  frec: number,
  dur = 0.09,
  gananciaMax = 0.18,
  tipo: OscillatorType = "sine"
) {
  try {
    const a = getAudio();
    const osc = a.createOscillator();
    const gan = a.createGain();
    osc.type = tipo;
    osc.frequency.value = frec;
    gan.gain.setValueAtTime(0, a.currentTime);
    gan.gain.linearRampToValueAtTime(gananciaMax, a.currentTime + 0.015);
    gan.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
    osc.connect(gan).connect(a.destination);
    osc.start();
    osc.stop(a.currentTime + dur + 0.05);
  } catch {}
}

function fanfarria() {
  [523, 659, 784, 1047].forEach((f, i) =>
    setTimeout(() => pip(f, 0.35, 0.22, "triangle"), i * 130)
  );
}

// ─── Voz ──────────────────────────────────────────────────────────────────────

function hablar(texto: string) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(texto);
  u.lang = "es-ES";
  u.rate = 0.85;
  u.pitch = 1.15;
  speechSynthesis.speak(u);
}

// ─── Construcción de caminos (idéntica al prototipo) ──────────────────────────

const GROSOR_CAMINO = 64;
const N_PUNTOS = 220;

function construirCamino(
  forma: "onda" | "zigzag" | "circulo",
  w: number,
  h: number
): Punto[] {
  const pts: Punto[] = [];
  const margenX = Math.max(90, w * 0.1);
  const cy = h * 0.55;

  if (forma === "onda") {
    const amp = Math.min(h * 0.14, 130);
    for (let i = 0; i <= N_PUNTOS; i++) {
      const t = i / N_PUNTOS;
      pts.push({
        x: margenX + t * (w - 2 * margenX),
        y: cy + Math.sin(t * Math.PI * 3) * amp,
      });
    }
  } else if (forma === "zigzag") {
    const amp = Math.min(h * 0.16, 150);
    const picos = 4;
    for (let i = 0; i <= N_PUNTOS; i++) {
      const t = i / N_PUNTOS;
      const fase = t * picos;
      const tri = 1 - Math.abs((fase % 1) * 2 - 1);
      const suave =
        tri * 0.85 + Math.sin(fase * Math.PI) * 0.15 * (tri > 0 ? 1 : 1);
      pts.push({
        x: margenX + t * (w - 2 * margenX),
        y: cy + amp - suave * amp * 2,
      });
    }
  } else {
    // circulo
    const r = Math.min(w, h) * 0.3;
    const cx = w / 2;
    const cyc = h * 0.55;
    for (let i = 0; i <= N_PUNTOS; i++) {
      const ang = -Math.PI / 2 + (i / N_PUNTOS) * Math.PI * 2;
      pts.push({ x: cx + Math.cos(ang) * r, y: cyc + Math.sin(ang) * r });
    }
  }
  return pts;
}

// ─── Confeti ──────────────────────────────────────────────────────────────────

interface Particula {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  rot: number;
  vrot: number;
  vida: number;
}

function lanzarConfeti(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  canvas.style.width = innerWidth + "px";
  canvas.style.height = innerHeight + "px";
  const cctx = canvas.getContext("2d")!;
  cctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const colores = ["#FF7A6B", "#FFC93D", "#5BCB77", "#6BA8FF", "#C792EA"];
  const particulas: Particula[] = Array.from({ length: 130 }, () => ({
    x: innerWidth / 2 + (Math.random() - 0.5) * 240,
    y: innerHeight * 0.4,
    vx: (Math.random() - 0.5) * 14,
    vy: -Math.random() * 16 - 5,
    r: Math.random() * 8 + 5,
    color: colores[Math.floor(Math.random() * colores.length)],
    rot: Math.random() * Math.PI,
    vrot: (Math.random() - 0.5) * 0.3,
    vida: 1,
  }));

  function animar() {
    cctx.clearRect(0, 0, innerWidth, innerHeight);
    let vivas = false;
    for (const p of particulas) {
      p.vy += 0.45;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vrot;
      p.vida -= 0.007;
      if (p.vida > 0 && p.y < innerHeight + 30) {
        vivas = true;
        cctx.save();
        cctx.translate(p.x, p.y);
        cctx.rotate(p.rot);
        cctx.globalAlpha = Math.max(p.vida, 0);
        cctx.fillStyle = p.color;
        cctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6);
        cctx.restore();
      }
    }
    if (vivas) requestAnimationFrame(animar);
    else cctx.clearRect(0, 0, innerWidth, innerHeight);
  }
  animar();
}

// ─── Miniatura del trazo ──────────────────────────────────────────────────────

function generarMiniatura(
  trazos: Punto[][],
  w: number,
  h: number
): string {
  const minW = 200;
  const escala = minW / w;
  const minH = Math.round(h * escala);
  const offscreen = document.createElement("canvas");
  offscreen.width = minW;
  offscreen.height = minH;
  const octx = offscreen.getContext("2d")!;
  octx.scale(escala, escala);
  octx.strokeStyle = "#FF7A6B";
  octx.lineWidth = 3;
  octx.lineCap = "round";
  octx.lineJoin = "round";
  for (const trazo of trazos) {
    if (trazo.length < 2) continue;
    octx.beginPath();
    octx.moveTo(trazo[0].x, trazo[0].y);
    for (let i = 1; i < trazo.length; i++) octx.lineTo(trazo[i].x, trazo[i].y);
    octx.stroke();
  }
  return offscreen.toDataURL("image/png");
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface TrazoCanvasProps {
  actividades: Actividad[];
  config: ConfiguracionNino;
  actividadId: (codigo: string) => string;
  onCambiarModo?: () => void;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function TrazoCanvas({
  actividades,
  config,
  actividadId,
  onCambiarModo,
}: TrazoCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confetiRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  // Estado mutable en refs para evitar re-renders dentro del bucle de dibujo
  const puntosRef = useRef<Punto[]>([]);
  const visitadosRef = useRef<boolean[]>([]);
  const trazoLibreRef = useRef<Punto[][]>([]);
  const dibujandoRef = useRef(false);
  const completadoRef = useRef(false);
  const metricasRef = useRef<Metricas | null>(null);
  const ultimoTickPctRef = useRef(0);
  const nivelActualRef = useRef(0);
  const dprRef = useRef(1);

  // Estado React sólo para lo que necesita re-render de UI declarativa
  const [nivelActual, setNivelActual] = useState(0);
  const [fiestaVisible, setFiestaVisible] = useState(false);
  const [datosAdulto, setDatosAdulto] = useState("");

  const nivelesCount = actividades.length;

  // ── Funciones de dibujo ───────────────────────────────────────────────────

  const trazarPolilinea = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      pts: Punto[],
      grosor: number,
      color: string
    ) => {
      if (pts.length < 2) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = grosor;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();
    },
    []
  );

  const dibujar = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const puntos = puntosRef.current;
    const visitados = visitadosRef.current;
    const trazoLibre = trazoLibreRef.current;

    ctx.clearRect(0, 0, innerWidth, innerHeight);
    if (!puntos.length) return;

    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    // 1) Camino guía con borde y relleno blanco
    trazarPolilinea(ctx, puntos, GROSOR_CAMINO + 10, "#BFE0F2");
    trazarPolilinea(ctx, puntos, GROSOR_CAMINO, "#FFFFFF");

    // 2) Línea central punteada
    ctx.save();
    ctx.setLineDash([2, 26]);
    trazarPolilinea(ctx, puntos, 7, "#CFE6F5");
    ctx.restore();

    // 3) Tramos visitados: arcoíris
    for (let i = 1; i < puntos.length; i++) {
      if (visitados[i] && visitados[i - 1]) {
        const hue = (i / puntos.length) * 300;
        ctx.strokeStyle = `hsl(${hue}, 85%, 60%)`;
        ctx.lineWidth = GROSOR_CAMINO - 16;
        ctx.beginPath();
        ctx.moveTo(puntos[i - 1].x, puntos[i - 1].y);
        ctx.lineTo(puntos[i].x, puntos[i].y);
        ctx.stroke();
      }
    }

    // 4) Trazo libre del lápiz (efecto cera suave)
    ctx.save();
    ctx.globalAlpha = 0.35;
    for (const trazo of trazoLibre) trazarPolilinea(ctx, trazo, 9, "#FF7A6B");
    ctx.restore();

    // 5) Origen (punto verde que late) y meta (estrella)
    const ini = puntos[0];
    const fin = puntos[puntos.length - 1];
    const latido = 1 + Math.sin(Date.now() / 280) * 0.12;
    ctx.fillStyle = "#5BCB77";
    ctx.beginPath();
    ctx.arc(ini.x, ini.y, 26 * latido, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(ini.x, ini.y, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = "54px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("⭐", fin.x, fin.y);
  }, [trazarPolilinea]);

  // ── Porcentaje de camino cubierto ─────────────────────────────────────────

  const calcPorcentaje = useCallback(() => {
    const v = visitadosRef.current.filter(Boolean).length;
    return (v / visitadosRef.current.length) * 100;
  }, []);

  // ── Celebración ───────────────────────────────────────────────────────────

  const celebrar = useCallback(
    (nivel: number) => {
      completadoRef.current = true;
      const m = metricasRef.current ?? {
        inicio: Date.now(),
        levantamientos: 0,
        usoPencil: false,
      };
      const pct = Math.round(calcPorcentaje() * 10) / 10;
      const duracion = Date.now() - m.inicio;

      const miniatura = generarMiniatura(
        trazoLibreRef.current,
        innerWidth,
        innerHeight
      );

      const payload = {
        actividad_id: actividadId(actividades[nivel].codigo),
        completado: true,
        porcentaje_camino: pct,
        duracion_ms: duracion,
        levantamientos: m.levantamientos,
        uso_pencil: m.usoPencil,
        trazo_miniatura: miniatura,
      };

      void guardarIntento(payload);

      if (config.sonido) fanfarria();
      if (config.voz) hablar("¡Muy bien! ¡Lo has conseguido!");

      setDatosAdulto(
        `${pct}% del camino · ${(duracion / 1000).toFixed(0)} s · ` +
          `${m.levantamientos} pausas · ${m.usoPencil ? "Pencil" : "dedo"}`
      );

      if (confetiRef.current) lanzarConfeti(confetiRef.current);

      setTimeout(() => setFiestaVisible(true), 450);
    },
    [actividades, actividadId, calcPorcentaje, config]
  );

  // ── Marcar puntos cercanos ────────────────────────────────────────────────

  const marcarCerca = useCallback(
    (x: number, y: number, nivel: number) => {
      const tol = config.tolerancia_px;
      const tol2 = tol * tol;
      let nuevos = 0;
      const puntos = puntosRef.current;
      for (let i = 0; i < puntos.length; i++) {
        if (visitadosRef.current[i]) continue;
        const dx = puntos[i].x - x;
        const dy = puntos[i].y - y;
        if (dx * dx + dy * dy <= tol2) {
          visitadosRef.current[i] = true;
          nuevos++;
        }
      }
      if (nuevos > 0) {
        const pct = calcPorcentaje();
        if (pct - ultimoTickPctRef.current >= 6) {
          ultimoTickPctRef.current = pct;
          if (config.sonido) pip(420 + pct * 6, 0.07, 0.1);
        }
        if (!completadoRef.current && pct >= config.porcentaje_para_completar) {
          celebrar(nivel);
        }
      }
    },
    [calcPorcentaje, celebrar, config]
  );

  // ── Cargar nivel ──────────────────────────────────────────────────────────

  const cargarNivel = useCallback(
    (idx: number, conVoz = true) => {
      const i = ((idx % nivelesCount) + nivelesCount) % nivelesCount;
      nivelActualRef.current = i;
      puntosRef.current = construirCamino(
        actividades[i].datos.forma,
        innerWidth,
        innerHeight
      );
      visitadosRef.current = new Array(puntosRef.current.length).fill(false);
      trazoLibreRef.current = [];
      completadoRef.current = false;
      metricasRef.current = null;
      ultimoTickPctRef.current = 0;
      setNivelActual(i);
      setFiestaVisible(false);
      if (conVoz && config.voz)
        hablar(FRASES_NIVEL[actividades[i].codigo] ?? actividades[i].titulo);
    },
    [actividades, nivelesCount, config.voz]
  );

  // ── Resize ────────────────────────────────────────────────────────────────

  const redimensionar = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    dprRef.current = window.devicePixelRatio || 1;
    const dpr = dprRef.current;
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cargarNivel(nivelActualRef.current, false);
  }, [cargarNivel]);

  // ── Eventos Pointer ───────────────────────────────────────────────────────

  const onPointerDown = useCallback(
    (e: PointerEvent) => {
      e.preventDefault();
      getAudio(); // desbloquea WebAudio en iOS en el primer gesto
      if (completadoRef.current) return;
      dibujandoRef.current = true;
      (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);

      if (!metricasRef.current) {
        metricasRef.current = {
          inicio: Date.now(),
          levantamientos: 0,
          usoPencil: e.pointerType === "pen",
        };
      } else {
        metricasRef.current.levantamientos++;
      }
      if (e.pointerType === "pen") metricasRef.current.usoPencil = true;

      trazoLibreRef.current.push([{ x: e.clientX, y: e.clientY }]);
      marcarCerca(e.clientX, e.clientY, nivelActualRef.current);
    },
    [marcarCerca]
  );

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dibujandoRef.current || completadoRef.current) return;
      e.preventDefault();
      const eventos = e.getCoalescedEvents?.() ?? [e];
      const trazo = trazoLibreRef.current[trazoLibreRef.current.length - 1];
      for (const ev of eventos) {
        trazo.push({ x: ev.clientX, y: ev.clientY });
        marcarCerca(ev.clientX, ev.clientY, nivelActualRef.current);
      }
    },
    [marcarCerca]
  );

  const onPointerUp = useCallback((e: PointerEvent) => {
    e.preventDefault();
    dibujandoRef.current = false;
  }, []);

  // ── Montaje y bucle de animación ──────────────────────────────────────────

  useEffect(() => {
    if (!actividades.length) return;

    redimensionar();

    const bucle = () => {
      dibujar();
      rafRef.current = requestAnimationFrame(bucle);
    };
    rafRef.current = requestAnimationFrame(bucle);

    const canvas = canvasRef.current!;
    canvas.addEventListener("pointerdown", onPointerDown, { passive: false });
    canvas.addEventListener("pointermove", onPointerMove, { passive: false });
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("resize", redimensionar);

    const noGesture = (e: Event) => e.preventDefault();
    document.addEventListener("gesturestart", noGesture);
    document.addEventListener("dblclick", noGesture);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("resize", redimensionar);
      document.removeEventListener("gesturestart", noGesture);
      document.removeEventListener("dblclick", noGesture);
    };
  }, [actividades, redimensionar, dibujar, onPointerDown, onPointerMove, onPointerUp]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Barra superior */}
      <div
        className="fixed left-0 right-0 flex items-center justify-between px-5 z-10 pointer-events-none"
        style={{ top: "env(safe-area-inset-top, 0px)", height: 96 }}
      >
        <button
          className="boton pointer-events-auto"
          aria-label="Escuchar instrucción"
          onClick={() => {
            const nivel = nivelActualRef.current;
            if (config.voz)
              hablar(
                FRASES_NIVEL[actividades[nivel]?.codigo] ??
                  actividades[nivel]?.titulo
              );
          }}
        >
          🔊
        </button>

        {/* Indicadores de nivel */}
        <div className="pointer-events-none flex gap-[14px]">
          {actividades.map((_, i) => (
            <div
              key={i}
              className={`punto ${
                i < nivelActual
                  ? "hecho"
                  : i === nivelActual
                  ? "actual"
                  : ""
              }`}
            />
          ))}
        </div>

        <div className="flex gap-3 pointer-events-auto">
          {onCambiarModo && (
            <button
              className="boton"
              aria-label="Ir a colorear"
              onClick={onCambiarModo}
            >
              🎨
            </button>
          )}
          <button
            className="boton"
            aria-label="Borrar y repetir"
            onClick={() => {
              if (config.sonido) pip(300, 0.12, 0.12, "triangle");
              cargarNivel(nivelActualRef.current, false);
            }}
          >
            🧽
          </button>
        </div>
      </div>

      {/* Canvas de dibujo */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0"
        style={{ touchAction: "none" }}
      />

      {/* Pantalla de celebración */}
      {fiestaVisible && (
        <div className="fiesta visible">
          <div className="estrellota">⭐</div>
          <h1>¡MUY BIEN!</h1>
          <div className="acciones">
            <button
              className="botonazo repetir"
              onClick={() => cargarNivel(nivelActualRef.current, false)}
            >
              Otra vez
            </button>
            <button
              className="botonazo seguir"
              onClick={() => cargarNivel(nivelActualRef.current + 1)}
            >
              Siguiente
            </button>
          </div>
          <div className="datos-adulto">{datosAdulto}</div>
        </div>
      )}

      {/* Canvas de confeti */}
      <canvas
        ref={confetiRef}
        className="fixed inset-0 pointer-events-none z-30"
      />
    </>
  );
}
