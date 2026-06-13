"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { DIBUJOS } from "@/lib/dibujos";

// ─── Audio ────────────────────────────────────────────────────────────────────

let audioCtx: AudioContext | null = null;
function getAudio(): AudioContext {
  if (!audioCtx)
    audioCtx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}
function pip(frec: number, dur = 0.09, gananciaMax = 0.18, tipo: OscillatorType = "sine") {
  try {
    const a = getAudio();
    const osc = a.createOscillator(); const gan = a.createGain();
    osc.type = tipo; osc.frequency.value = frec;
    gan.gain.setValueAtTime(0, a.currentTime);
    gan.gain.linearRampToValueAtTime(gananciaMax, a.currentTime + 0.015);
    gan.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
    osc.connect(gan).connect(a.destination); osc.start(); osc.stop(a.currentTime + dur + 0.05);
  } catch {}
}
function fanfarria() {
  [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => pip(f, 0.35, 0.22, "triangle"), i * 130));
}
function hablar(texto: string) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(texto);
  u.lang = "es-ES"; u.rate = 0.85; u.pitch = 1.15;
  speechSynthesis.speak(u);
}

// ─── Confeti ──────────────────────────────────────────────────────────────────

interface Particula { x:number;y:number;vx:number;vy:number;r:number;color:string;rot:number;vrot:number;vida:number }
function lanzarConfeti(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = innerWidth*dpr; canvas.height = innerHeight*dpr;
  canvas.style.width = innerWidth+"px"; canvas.style.height = innerHeight+"px";
  const cctx = canvas.getContext("2d")!;
  cctx.setTransform(dpr,0,0,dpr,0,0);
  const cols = ["#FF7A6B","#FFC93D","#5BCB77","#6BA8FF","#C792EA"];
  const ps: Particula[] = Array.from({length:130},()=>({
    x:innerWidth/2+(Math.random()-.5)*240, y:innerHeight*.4,
    vx:(Math.random()-.5)*14, vy:-Math.random()*16-5,
    r:Math.random()*8+5, color:cols[Math.floor(Math.random()*cols.length)],
    rot:Math.random()*Math.PI, vrot:(Math.random()-.5)*.3, vida:1
  }));
  function anim() {
    cctx.clearRect(0,0,innerWidth,innerHeight); let vivas=false;
    for(const p of ps){p.vy+=.45;p.x+=p.vx;p.y+=p.vy;p.rot+=p.vrot;p.vida-=.007;
      if(p.vida>0&&p.y<innerHeight+30){vivas=true;cctx.save();cctx.translate(p.x,p.y);cctx.rotate(p.rot);cctx.globalAlpha=Math.max(p.vida,0);cctx.fillStyle=p.color;cctx.fillRect(-p.r/2,-p.r/2,p.r,p.r*1.6);cctx.restore();}}
    if(vivas) requestAnimationFrame(anim); else cctx.clearRect(0,0,innerWidth,innerHeight);
  }
  anim();
}

// ─── Flood fill BFS ───────────────────────────────────────────────────────────

function hexToComponents(hex: string): [number,number,number] {
  const n = parseInt(hex.replace("#",""), 16);
  return [(n>>16)&255, (n>>8)&255, n&255];
}

function colorMatch(data: Uint8ClampedArray, i: number, r: number, g: number, b: number, tol=30): boolean {
  return Math.abs(data[i]-r)<=tol && Math.abs(data[i+1]-g)<=tol && Math.abs(data[i+2]-b)<=tol;
}

function floodFill(
  ctx: CanvasRenderingContext2D,
  px: number, py: number,
  colorHex: string,
  w: number, h: number
): string | null {
  // Devuelve el color marcador del píxel tocado (para identificar zona)
  const imageData = ctx.getImageData(0,0,w,h);
  const data = imageData.data;

  const startIdx = (py*w+px)*4;
  const tr=data[startIdx], tg=data[startIdx+1], tb=data[startIdx+2];

  // No rellenar líneas negras ni píxeles ya muy oscuros
  if (tr<60 && tg<60 && tb<60) return null;

  // Guardar el color marcador del punto de inicio para identificar la zona
  const marcadorTocado = `rgb(${tr},${tg},${tb})`;

  const [nr,ng,nb] = hexToComponents(colorHex);

  // Si el píxel ya tiene exactamente el color elegido, no hacer nada
  if (tr===nr && tg===ng && tb===nb) return null;

  const buf32 = new Uint32Array(data.buffer);
  // little-endian ABGR
  const newColor = (255<<24) | (nb<<16) | (ng<<8) | nr;

  const stack: number[] = [(py*w+px)];
  const visited = new Uint8Array(w*h);

  while (stack.length) {
    const idx = stack.pop()!;
    if (visited[idx]) continue;
    visited[idx] = 1;
    const di = idx*4;
    if (!colorMatch(data, di, tr, tg, tb)) continue;
    buf32[idx] = newColor;
    const x=idx%w, y=Math.floor(idx/w);
    if (x>0)     stack.push(idx-1);
    if (x<w-1)   stack.push(idx+1);
    if (y>0)     stack.push(idx-w);
    if (y<h-1)   stack.push(idx+w);
  }
  ctx.putImageData(imageData,0,0);
  return marcadorTocado;
}

// Detectar qué zona fue tocada comparando color del píxel con los marcadores del dibujo.
// Muestra una cuadrícula de 5×5 alrededor del punto tocado y vota por mayoría
// para combatir el antialiasing en los bordes del SVG rasterizado.
function detectarZona(
  ctx: CanvasRenderingContext2D,
  px: number, py: number,
  zonas: { id:string; marcador:string }[]
): string | null {
  const votos: Record<string, number> = {};
  const step = 2;
  for (let dx = -2; dx <= 2; dx++) {
    for (let dy = -2; dy <= 2; dy++) {
      const p = ctx.getImageData(px + dx * step, py + dy * step, 1, 1).data;
      const r = p[0], g = p[1], b = p[2];
      if (r < 60 && g < 60 && b < 60) continue; // línea negra
      if (r > 250 && g > 250 && b > 250) continue; // fondo blanco
      for (const z of zonas) {
        const [zr, zg, zb] = hexToComponents(z.marcador);
        if (Math.abs(r-zr) <= 8 && Math.abs(g-zg) <= 8 && Math.abs(b-zb) <= 8) {
          votos[z.id] = (votos[z.id] ?? 0) + 1;
        }
      }
    }
  }
  const ganador = Object.entries(votos).sort((a, b) => b[1] - a[1])[0];
  return ganador ? ganador[0] : null;
}

// ─── Paleta ───────────────────────────────────────────────────────────────────

const PALETA = [
  "#FF4444","#FF9900","#FFD700","#44CC44",
  "#3399FF","#9966FF","#FF66AA","#44DDCC",
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
  const imgCacheRef = useRef<Map<string,HTMLImageElement>>(new Map());
  const dprRef = useRef(1);

  const [dibActual, setDibActual] = useState(0);
  const [colorSel, setColorSel]   = useState(PALETA[0]);
  const [fiesta, setFiesta]       = useState(false);
  const [cargando, setCargando]   = useState(true);
  // Set de IDs de zonas ya coloreadas
  const [zonasOk, setZonasOk]     = useState<Set<string>>(new Set());

  const dibujo = DIBUJOS[dibActual];

  // ── Renderizar SVG en canvas ──────────────────────────────────────────────

  const renderizarDibujo = useCallback((idx: number, resetZonas = true) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setCargando(true);
    setFiesta(false);
    if (resetZonas) setZonasOk(new Set());

    const dib = DIBUJOS[idx];
    const dpr = dprRef.current;
    // Dimensiones lógicas (CSS px)
    const lw = innerWidth;
    const lh = innerHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Fondo blanco
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, lw, lh);

    // Área disponible descontando barra (96px) y paleta (110px)
    const areaH = lh - 96 - 110;
    const lado  = Math.min(lw * 0.88, areaH * 0.96);
    const ox = (lw - lado) / 2;
    const oy = 96 + (areaH - lado) / 2;

    const cached = imgCacheRef.current.get(dib.id);
    function dibImg(img: HTMLImageElement) {
      ctx.drawImage(img, ox, oy, lado, lado);
      setCargando(false);
    }
    if (cached) { dibImg(cached); return; }

    const blob = new Blob([dib.svg], { type: "image/svg+xml" });
    const url  = URL.createObjectURL(blob);
    const img  = new Image();
    img.onload = () => { imgCacheRef.current.set(dib.id, img); dibImg(img); URL.revokeObjectURL(url); };
    img.src = url;
  }, []);

  // ── Resize ────────────────────────────────────────────────────────────────

  const redimensionar = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    dprRef.current = window.devicePixelRatio || 1;
    const dpr = dprRef.current;
    canvas.width  = innerWidth  * dpr;
    canvas.height = innerHeight * dpr;
    canvas.style.width  = innerWidth  + "px";
    canvas.style.height = innerHeight + "px";
    renderizarDibujo(dibActual, false);
  }, [dibActual, renderizarDibujo]);

  useEffect(() => {
    redimensionar();
    window.addEventListener("resize", redimensionar);
    return () => window.removeEventListener("resize", redimensionar);
  }, [redimensionar]);

  // ── Al cambiar de dibujo ──────────────────────────────────────────────────

  useEffect(() => {
    renderizarDibujo(dibActual, true);
    if (voz) hablar(DIBUJOS[dibActual].frase);
  }, [dibActual, renderizarDibujo, voz]);

  // ── Toque → flood fill + detección de zona ────────────────────────────────

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    getAudio();
    if (fiesta) return;

    const canvas = canvasRef.current!;
    const rect   = canvas.getBoundingClientRect();
    // Convertir coordenadas CSS → px físicos del canvas
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const px = Math.floor((e.clientX - rect.left) * scaleX);
    const py = Math.floor((e.clientY - rect.top)  * scaleY);

    const ctx = canvas.getContext("2d")!;

    // Detectar zona ANTES de rellenar (el marcador aún es visible)
    const zonaId = detectarZona(ctx, px, py, dibujo.zonas);

    floodFill(ctx, px, py, colorSel, canvas.width, canvas.height);

    if (sonido) pip(440 + Math.random()*200, 0.08, 0.12);

    if (zonaId) {
      setZonasOk(prev => {
        const next = new Set(prev);
        next.add(zonaId);
        // ¿Todas las zonas están pintadas?
        if (next.size >= dibujo.zonas.length) {
          if (sonido) fanfarria();
          if (voz) hablar("¡Muy bien! ¡Qué bonito ha quedado!");
          if (confetiRef.current) lanzarConfeti(confetiRef.current);
          setTimeout(() => setFiesta(true), 400);
        } else {
          // Sonido de progreso ligeramente más agudo a medida que avanza
          if (sonido) pip(500 + (next.size / dibujo.zonas.length) * 300, 0.12, 0.15);
        }
        return next;
      });
    }
  }, [colorSel, dibujo, fiesta, sonido, voz]);

  // ── Siguiente / repetir ───────────────────────────────────────────────────

  function siguiente() { setDibActual(d => (d+1) % DIBUJOS.length); }
  function repetir()   { renderizarDibujo(dibActual, true); }

  // ─── Render ────────────────────────────────────────────────────────────────

  const totalZonas = dibujo.zonas.length;
  const zonasCompletadas = zonasOk.size;

  return (
    <>
      {/* Barra superior — z-index 20 para estar sobre el canvas */}
      <div
        className="fixed left-0 right-0 flex items-center justify-between px-5 pointer-events-none"
        style={{ top: "env(safe-area-inset-top, 0px)", height: 96, zIndex: 20 }}
      >
        <button className="boton pointer-events-auto" aria-label="Escuchar" onClick={() => { if(voz) hablar(dibujo.frase); }}>
          🔊
        </button>

        {/* Progreso: puntos de zona */}
        <div className="pointer-events-none flex flex-col items-center gap-1">
          <div className="flex gap-[8px] flex-wrap justify-center" style={{ maxWidth: "55vw" }}>
            {DIBUJOS.map((_, i) => (
              <div key={i} className={`punto ${i<dibActual?"hecho":i===dibActual?"actual":""}`} style={{width:13,height:13}}/>
            ))}
          </div>
          {/* Zonas del dibujo actual */}
          <div className="flex gap-[6px]">
            {dibujo.zonas.map(z => (
              <div key={z.id} style={{
                width:16, height:16, borderRadius:"50%",
                background: zonasOk.has(z.id) ? "#5BCB77" : "#fff",
                border: `3px solid ${zonasOk.has(z.id) ? "#5BCB77" : "#BFE0F2"}`,
                transition: "all .2s",
              }}/>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pointer-events-auto">
          <button className="boton" aria-label="Borrar" onClick={repetir}>🧽</button>
          <button className="boton" aria-label="Volver a trazos" onClick={onCambiarModo}>✏️</button>
        </div>
      </div>

      {/* Canvas — z-index 1, debajo de la UI */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0"
        style={{ touchAction: "none", cursor: "crosshair", zIndex: 1 }}
        onPointerDown={onPointerDown}
      />

      {/* Spinner */}
      {cargando && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none" style={{zIndex:15}}>
          <div className="text-6xl animate-bounce">🎨</div>
        </div>
      )}

      {/* Paleta — z-index 20 para capturar toques sobre el canvas */}
      <div
        className="fixed left-0 right-0 flex justify-center gap-3 px-4"
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 18px)", zIndex: 20 }}
      >
        {PALETA.map((color) => (
          <button
            key={color}
            aria-label={`Color ${color}`}
            onPointerDown={(e) => {
              e.stopPropagation();
              setColorSel(color);
              if (sonido) pip(660, 0.06, 0.1);
            }}
            style={{
              width: 58, height: 58, borderRadius: "50%",
              background: color,
              border: colorSel===color ? "5px solid #2A4D69" : "5px solid white",
              boxShadow: colorSel===color ? "0 4px 0 rgba(42,77,105,.3)" : "0 4px 0 rgba(42,77,105,.14)",
              cursor: "pointer",
              transition: "transform .1s, border .1s",
              transform: colorSel===color ? "scale(1.22)" : "scale(1)",
              flexShrink: 0,
            }}
          />
        ))}
      </div>

      {/* Indicador de progreso de zonas (texto pequeño para adultos) */}
      {zonasCompletadas > 0 && zonasCompletadas < totalZonas && (
        <div
          className="fixed pointer-events-none"
          style={{ bottom: 100, right: 20, zIndex: 20, color:"#8AA7BC", fontSize:14 }}
        >
          {zonasCompletadas}/{totalZonas} zonas
        </div>
      )}

      {/* Pantalla de celebración */}
      {fiesta && (
        <div className="fiesta visible" style={{zIndex:25}}>
          <div className="estrellota">🎨</div>
          <h1>¡QUÉ BONITO!</h1>
          <div className="acciones">
            <button className="botonazo repetir" onClick={repetir}>Otra vez</button>
            <button className="botonazo seguir"  onClick={siguiente}>Siguiente</button>
          </div>
          <div className="datos-adulto">{dibujo.titulo} · {totalZonas} zonas pintadas</div>
        </div>
      )}

      {/* Confeti */}
      <canvas ref={confetiRef} className="fixed inset-0 pointer-events-none" style={{zIndex:30}}/>
    </>
  );
}
