"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { DIBUJOS } from "@/lib/dibujos";

// ─── Helpers de audio (copiados del prototipo) ────────────────────────────────

let audioCtx: AudioContext | null = null;
function getAudio(): AudioContext {
  if (!audioCtx)
    audioCtx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}
function pip(frec: number, dur = 0.09, gananciaMax = 0.18, tipo: OscillatorType = "sine") {
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
function hablar(texto: string) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(texto);
  u.lang = "es-ES";
  u.rate = 0.85;
  u.pitch = 1.15;
  speechSynthesis.speak(u);
}

// ─── Confeti ──────────────────────────────────────────────────────────────────

interface Particula { x:number;y:number;vx:number;vy:number;r:number;color:string;rot:number;vrot:number;vida:number }
function lanzarConfeti(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
  canvas.style.width = innerWidth + "px"; canvas.style.height = innerHeight + "px";
  const cctx = canvas.getContext("2d")!;
  cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const colores = ["#FF7A6B","#FFC93D","#5BCB77","#6BA8FF","#C792EA"];
  const ps: Particula[] = Array.from({length:130},()=>({
    x: innerWidth/2+(Math.random()-.5)*240, y: innerHeight*.4,
    vx:(Math.random()-.5)*14, vy:-Math.random()*16-5,
    r:Math.random()*8+5, color:colores[Math.floor(Math.random()*colores.length)],
    rot:Math.random()*Math.PI, vrot:(Math.random()-.5)*.3, vida:1
  }));
  function animar() {
    cctx.clearRect(0,0,innerWidth,innerHeight);
    let vivas=false;
    for(const p of ps){
      p.vy+=.45;p.x+=p.vx;p.y+=p.vy;p.rot+=p.vrot;p.vida-=.007;
      if(p.vida>0&&p.y<innerHeight+30){vivas=true;cctx.save();cctx.translate(p.x,p.y);cctx.rotate(p.rot);cctx.globalAlpha=Math.max(p.vida,0);cctx.fillStyle=p.color;cctx.fillRect(-p.r/2,-p.r/2,p.r,p.r*1.6);cctx.restore();}
    }
    if(vivas) requestAnimationFrame(animar); else cctx.clearRect(0,0,innerWidth,innerHeight);
  }
  animar();
}

// ─── Flood fill BFS con Uint32Array ──────────────────────────────────────────

function hexToRgba(hex: string): [number, number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
}

function floodFill(
  ctx: CanvasRenderingContext2D,
  px: number, py: number,
  colorHex: string,
  w: number, h: number
) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  const buf32 = new Uint32Array(data.buffer);

  const [nr, ng, nb, na] = hexToRgba(colorHex);
  // little-endian: ABGR en el buffer
  const newColor = (na << 24) | (nb << 16) | (ng << 8) | nr;

  const idx = (py * w + px);
  const targetColor = buf32[idx];

  // No hacer nada si ya tiene ese color o es negro (línea del dibujo)
  const tr = data[idx * 4], tg = data[idx * 4 + 1], tb = data[idx * 4 + 2];
  if (targetColor === newColor) return;
  if (tr < 60 && tg < 60 && tb < 60) return; // píxel negro = línea, no rellenar

  const stack: number[] = [idx];
  while (stack.length) {
    const i = stack.pop()!;
    if (buf32[i] !== targetColor) continue;
    buf32[i] = newColor;
    const x = i % w, y = Math.floor(i / w);
    if (x > 0)     stack.push(i - 1);
    if (x < w - 1) stack.push(i + 1);
    if (y > 0)     stack.push(i - w);
    if (y < h - 1) stack.push(i + w);
  }
  ctx.putImageData(imageData, 0, 0);
}

// ─── Paleta ───────────────────────────────────────────────────────────────────

const PALETA = [
  "#FF7A6B", "#FFC93D", "#5BCB77", "#6BA8FF",
  "#C792EA", "#FF9E44", "#FF6B9E", "#4ECDC4",
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface ColorearCanvasProps {
  sonido: boolean;
  voz: boolean;
  onCambiarModo: () => void;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ColorearCanvas({ sonido, voz, onCambiarModo }: ColorearCanvasProps) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const confetiRef = useRef<HTMLCanvasElement>(null);
  const imgCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  const [dibActual, setDibActual] = useState(0);
  const [colorSel, setColorSel]   = useState(PALETA[0]);
  const [fiesta, setFiesta]       = useState(false);
  const [cargando, setCargando]   = useState(true);

  const dpr = useRef(window.devicePixelRatio || 1);

  // ── Renderizar SVG en canvas ──────────────────────────────────────────────

  const renderizarDibujo = useCallback((idx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setCargando(true);
    setFiesta(false);

    const dibujo = DIBUJOS[idx];
    const w = canvas.width;
    const h = canvas.height;
    const ctx = canvas.getContext("2d")!;

    // Fondo blanco
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    // Tamaño del dibujo: cuadrado centrado, 75% del lado menor
    const lado = Math.min(w, h) * 0.75;
    const ox = (w - lado) / 2;
    const oy = (h - lado) / 2;

    const cached = imgCacheRef.current.get(dibujo.id);
    function dibujarImg(img: HTMLImageElement) {
      ctx.drawImage(img, ox, oy, lado, lado);
      setCargando(false);
    }

    if (cached) {
      dibujarImg(cached);
      return;
    }

    const blob = new Blob([dibujo.svg], { type: "image/svg+xml" });
    const url  = URL.createObjectURL(blob);
    const img  = new Image();
    img.onload = () => {
      imgCacheRef.current.set(dibujo.id, img);
      dibujarImg(img);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, []);

  // ── Resize ────────────────────────────────────────────────────────────────

  const redimensionar = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    dpr.current = window.devicePixelRatio || 1;
    canvas.width  = innerWidth  * dpr.current;
    canvas.height = innerHeight * dpr.current;
    canvas.style.width  = innerWidth  + "px";
    canvas.style.height = innerHeight + "px";
    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(dpr.current, 0, 0, dpr.current, 0, 0);
    renderizarDibujo(dibActual);
  }, [dibActual, renderizarDibujo]);

  useEffect(() => {
    redimensionar();
    window.addEventListener("resize", redimensionar);
    return () => window.removeEventListener("resize", redimensionar);
  }, [redimensionar]);

  // ── Al cambiar de dibujo ──────────────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(dpr.current, 0, 0, dpr.current, 0, 0);
    renderizarDibujo(dibActual);
    if (voz) hablar(DIBUJOS[dibActual].frase);
  }, [dibActual, renderizarDibujo, voz]);

  // ── Toque en el canvas → flood fill ──────────────────────────────────────

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    getAudio();
    if (fiesta) return;

    const canvas = canvasRef.current!;
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const px = Math.floor((e.clientX - rect.left) * scaleX);
    const py = Math.floor((e.clientY - rect.top)  * scaleY);

    const ctx = canvas.getContext("2d")!;
    floodFill(ctx, px, py, colorSel, canvas.width, canvas.height);

    if (sonido) pip(440 + Math.random() * 200, 0.08, 0.12);

    // Comprobar si queda blanco visible (% píxeles blancos < 15%)
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let blancos = 0;
    for (let i = 0; i < img.data.length; i += 4) {
      if (img.data[i] > 240 && img.data[i+1] > 240 && img.data[i+2] > 240) blancos++;
    }
    const pctBlanco = (blancos / (canvas.width * canvas.height)) * 100;
    if (pctBlanco < 15) {
      if (sonido) fanfarria();
      if (voz) hablar("¡Muy bien! ¡Qué bonito ha quedado!");
      if (confetiRef.current) lanzarConfeti(confetiRef.current);
      setTimeout(() => setFiesta(true), 400);
    }
  }, [colorSel, fiesta, sonido, voz]);

  // ── Siguiente / repetir ───────────────────────────────────────────────────

  function siguiente() {
    setDibActual((d) => (d + 1) % DIBUJOS.length);
  }
  function repetir() {
    renderizarDibujo(dibActual);
    setFiesta(false);
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Barra superior */}
      <div
        className="fixed left-0 right-0 flex items-center justify-between px-5 z-10 pointer-events-none"
        style={{ top: "env(safe-area-inset-top, 0px)", height: 96 }}
      >
        {/* Botón voz */}
        <button
          className="boton pointer-events-auto"
          aria-label="Escuchar instrucción"
          onClick={() => { if (voz) hablar(DIBUJOS[dibActual].frase); }}
        >
          🔊
        </button>

        {/* Indicadores de dibujo: muestra hasta 10, paginado de 10 en 10 */}
        <div className="pointer-events-none flex gap-[10px] flex-wrap justify-center" style={{ maxWidth: "60vw" }}>
          {DIBUJOS.map((_, i) => (
            <div
              key={i}
              className={`punto ${i < dibActual ? "hecho" : i === dibActual ? "actual" : ""}`}
              style={{ width: 14, height: 14 }}
            />
          ))}
        </div>

        {/* Botones derecha: borrar y volver a trazos */}
        <div className="flex gap-3 pointer-events-auto">
          <button className="boton" aria-label="Borrar" onClick={repetir}>🧽</button>
          <button className="boton" aria-label="Volver a trazos" onClick={onCambiarModo}>✏️</button>
        </div>
      </div>

      {/* Canvas principal */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0"
        style={{ touchAction: "none", cursor: "crosshair" }}
        onPointerDown={onPointerDown}
      />

      {/* Spinner de carga */}
      {cargando && (
        <div className="fixed inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="text-6xl animate-bounce">🎨</div>
        </div>
      )}

      {/* Paleta de colores (parte inferior) */}
      <div
        className="fixed left-0 right-0 flex justify-center gap-4 z-10 px-4"
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)" }}
      >
        {PALETA.map((color) => (
          <button
            key={color}
            aria-label={`Color ${color}`}
            onClick={() => {
              setColorSel(color);
              if (sonido) pip(660, 0.06, 0.1);
            }}
            style={{
              width: 62,
              height: 62,
              borderRadius: "50%",
              background: color,
              border: colorSel === color ? "5px solid #2A4D69" : "5px solid white",
              boxShadow: colorSel === color
                ? "0 4px 0 rgba(42,77,105,.3)"
                : "0 4px 0 rgba(42,77,105,.14)",
              cursor: "pointer",
              transition: "transform .1s, border .1s",
              transform: colorSel === color ? "scale(1.2)" : "scale(1)",
              flexShrink: 0,
            }}
          />
        ))}
      </div>

      {/* Pantalla de celebración */}
      {fiesta && (
        <div className="fiesta visible">
          <div className="estrellota">🎨</div>
          <h1>¡QUÉ BONITO!</h1>
          <div className="acciones">
            <button className="botonazo repetir" onClick={repetir}>Otra vez</button>
            <button className="botonazo seguir" onClick={siguiente}>Siguiente</button>
          </div>
          <div className="datos-adulto">{DIBUJOS[dibActual].titulo}</div>
        </div>
      )}

      {/* Confeti */}
      <canvas ref={confetiRef} className="fixed inset-0 pointer-events-none z-30" />
    </>
  );
}
