"use client";

import { useEffect, useRef, useCallback, useState } from "react";

// ─── Audio helpers ────────────────────────────────────────────────────────────

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
    const osc = a.createOscillator();
    const gan = a.createGain();
    osc.type = tipo; osc.frequency.value = frec;
    gan.gain.setValueAtTime(0, a.currentTime);
    gan.gain.linearRampToValueAtTime(gananciaMax, a.currentTime + 0.015);
    gan.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
    osc.connect(gan).connect(a.destination);
    osc.start(); osc.stop(a.currentTime + dur + 0.05);
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
  u.lang = "es-ES"; u.rate = 0.85; u.pitch = 1.15;
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
  const colores = ["#FF7A6B","#FFC93D","#5BCB77","#C792EA","#A78BFA"];
  const ps: Particula[] = Array.from({length:120}, () => ({
    x: innerWidth/2+(Math.random()-.5)*240, y: innerHeight*0.4,
    vx:(Math.random()-.5)*14, vy:-Math.random()*16-5,
    r:Math.random()*8+5, color:colores[Math.floor(Math.random()*colores.length)],
    rot:Math.random()*Math.PI, vrot:(Math.random()-.5)*0.3, vida:1,
  }));
  function animar() {
    cctx.clearRect(0,0,innerWidth,innerHeight);
    let vivas=false;
    for(const p of ps) {
      p.vy+=0.45; p.x+=p.vx; p.y+=p.vy; p.rot+=p.vrot; p.vida-=0.007;
      if(p.vida>0&&p.y<innerHeight+30) {
        vivas=true; cctx.save();
        cctx.translate(p.x,p.y); cctx.rotate(p.rot);
        cctx.globalAlpha=Math.max(p.vida,0); cctx.fillStyle=p.color;
        cctx.fillRect(-p.r/2,-p.r/2,p.r,p.r*1.6); cctx.restore();
      }
    }
    if(vivas) requestAnimationFrame(animar); else cctx.clearRect(0,0,innerWidth,innerHeight);
  }
  animar();
}

// ─── Construcción de caminos para vocales ─────────────────────────────────────

interface Punto { x: number; y: number }

const N = 200;

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

function segmento(x0:number,y0:number,x1:number,y1:number,n=N): Punto[] {
  return Array.from({length:n+1},(_,i)=>({x:lerp(x0,x1,i/n),y:lerp(y0,y1,i/n)}));
}

function arco(cx:number,cy:number,rx:number,ry:number,a0:number,a1:number,n=N): Punto[] {
  return Array.from({length:n+1},(_,i)=>{
    const a=lerp(a0,a1,i/n);
    return {x:cx+Math.cos(a)*rx,y:cy+Math.sin(a)*ry};
  });
}

function concat(...arrays: Punto[][]): Punto[] {
  const r: Punto[] = [];
  for(let ai=0;ai<arrays.length;ai++) {
    const a = arrays[ai];
    const start = ai===0?0:1;
    for(let i=start;i<a.length;i++) r.push(a[i]);
  }
  return r;
}

// Construye el camino de la vocal `v` dentro del rectángulo (ox,oy,w,h)
function vocalCamino(v: "a"|"e"|"i"|"o"|"u", ox:number, oy:number, w:number, h:number): Punto[] {
  const PI = Math.PI;
  const cx = ox+w/2;
  const T=oy, B=oy+h;

  switch(v) {
    case "a": {
      // Bucle circular grande + palo recto a la derecha (separado del círculo)
      const xTop = T + h * 0.30;
      const xBot = B - h * 0.05;
      const cyC  = (xTop + xBot) / 2;
      const rx   = w * 0.28;
      const ry   = (xBot - xTop) / 2;
      const cCirc = cx - w * 0.05;        // círculo desplazado a la izquierda
      const palX  = cCirc + rx + w * 0.04; // palo separado del círculo
      return concat(
        arco(cCirc, cyC, rx, ry, -PI/2, PI*1.5, N*4),
        segmento(palX, xTop, palX, xBot)
      );
    }
    case "e": {
      // Travesaño horizontal + arco (abre por la derecha-abajo)
      const xTop = T + h * 0.30;
      const xBot = B - h * 0.05;
      const cyC  = (xTop + xBot) / 2;
      const rx   = w * 0.32;
      const ry   = (xBot - xTop) / 2;
      return concat(
        segmento(cx - rx*0.9, cyC, cx + rx*0.85, cyC),
        arco(cx, cyC, rx, ry, 0, PI*1.35, N*3)
      );
    }
    case "i": {
      // Punto bien arriba y separado + palo vertical
      const puntoY = T + h * 0.15;
      const xTop   = T + h * 0.32;
      const xBot   = B - h * 0.05;
      return concat(
        arco(cx, puntoY, w*0.09, h*0.06, 0, PI*2, N),
        segmento(cx, xTop, cx, xBot)
      );
    }
    case "o": {
      // Círculo grande en la zona de la x-height
      const xTop = T + h * 0.30;
      const xBot = B - h * 0.05;
      const cyC  = (xTop + xBot) / 2;
      const rx   = w * 0.36;
      const ry   = (xBot - xTop) / 2;
      return arco(cx, cyC, rx, ry, -PI/2, PI*1.5, N*4);
    }
    case "u": {
      // Palo izquierdo + curva inferior + palo derecho
      const xTop = T + h * 0.30;
      const xBot = B - h * 0.05;
      const rx   = w * 0.26;
      const ry   = h * 0.14;
      return concat(
        segmento(cx - rx, xTop, cx - rx, xBot - ry),
        arco(cx, xBot - ry, rx, ry, PI, 0),
        segmento(cx + rx, xBot - ry, cx + rx, xBot)
      );
    }
    default:
      return [];
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface VocalTrazoProps {
  sonido: boolean;
  voz: boolean;
  tolerancia_px: number;
  porcentaje_para_completar: number;
  onVolver: (completado: boolean) => void;
}

// ─── Componente ───────────────────────────────────────────────────────────────

const VOCALES: ("a"|"e"|"i"|"o"|"u")[] = ["a","e","i","o","u"];
const FRASES  = ["a","e","i","o","u"];

const GROSOR = 40;

export default function VocalTrazoCanvas({ sonido, voz, tolerancia_px, porcentaje_para_completar, onVolver }: VocalTrazoProps) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const confetiRef = useRef<HTMLCanvasElement>(null);
  const rafRef     = useRef<number>(0);

  const puntosRef    = useRef<Punto[]>([]);
  const visitadosRef = useRef<boolean[]>([]);
  const trazoLibreRef= useRef<Punto[][]>([]);
  const dibujandoRef = useRef(false);
  const completadoRef= useRef(false);
  const inicioRef    = useRef(0);
  const dprRef       = useRef(1);
  const algunaVezRef = useRef(false);

  const [vocalIdx, setVocalIdx] = useState(0);
  const vocalIdxRef = useRef(0);
  const [fiestaVisible, setFiestaVisible] = useState(false);
  const ultimoTickRef = useRef(0);

  function calcCuadro() {
    // Cuadro de trazo en la mitad derecha del viewport
    const w = Math.min(innerWidth * 0.40, 320);
    const h = w * 1.35;
    const ox = innerWidth * 0.55 + (innerWidth * 0.45 - w) / 2;
    const oy = (innerHeight - h) / 2 + innerHeight * 0.04;
    return { ox, oy, w, h };
  }

  function calcCuadroRef() {
    // Cuadro de la letra de referencia (panel izquierdo, mismas proporciones)
    const w = Math.min(innerWidth * 0.40, 360);
    const h = w * 1.35;
    const ox = (innerWidth * 0.55 - w) / 2;
    const oy = (innerHeight - h) / 2 + innerHeight * 0.04;
    return { ox, oy, w, h };
  }

  const calcPorcentaje = useCallback(() => {
    const v = visitadosRef.current.filter(Boolean).length;
    return (v / visitadosRef.current.length) * 100;
  }, []);

  const cargarVocal = useCallback((idx: number, conVoz = true) => {
    const i = ((idx % VOCALES.length) + VOCALES.length) % VOCALES.length;
    const { ox, oy, w, h } = calcCuadro();
    puntosRef.current     = vocalCamino(VOCALES[i], ox, oy, w, h);
    visitadosRef.current  = new Array(puntosRef.current.length).fill(false);
    trazoLibreRef.current = [];
    completadoRef.current = false;
    inicioRef.current     = 0;
    ultimoTickRef.current = 0;
    vocalIdxRef.current   = i;
    setVocalIdx(i);
    setFiestaVisible(false);
    if (conVoz && voz) hablar(`la vocal ${FRASES[i]}`);
  }, [voz]);

  const celebrar = useCallback(() => {
    completadoRef.current = true;
    if (sonido) fanfarria();
    if (voz) setTimeout(() => hablar("¡Muy bien!"), 400);
    if (confetiRef.current) lanzarConfeti(confetiRef.current);
    setTimeout(() => setFiestaVisible(true), 450);
  }, [sonido, voz]);

  const marcarCerca = useCallback((x: number, y: number) => {
    const tol2 = tolerancia_px * tolerancia_px;
    let nuevos = 0;
    for (let i = 0; i < puntosRef.current.length; i++) {
      if (visitadosRef.current[i]) continue;
      const dx = puntosRef.current[i].x - x;
      const dy = puntosRef.current[i].y - y;
      if (dx * dx + dy * dy <= tol2) { visitadosRef.current[i] = true; nuevos++; }
    }
    if (nuevos > 0) {
      const pct = calcPorcentaje();
      if (pct >= 50) algunaVezRef.current = true;
      if (pct - ultimoTickRef.current >= 6) {
        ultimoTickRef.current = pct;
        if (sonido) pip(420 + pct * 6, 0.07, 0.1);
      }
      if (!completadoRef.current && pct >= porcentaje_para_completar) celebrar();
    }
  }, [calcPorcentaje, celebrar, sonido, tolerancia_px, porcentaje_para_completar]);

  const dibujar = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const puntos   = puntosRef.current;
    const visitados= visitadosRef.current;

    ctx.clearRect(0, 0, innerWidth, innerHeight);
    if (!puntos.length) return;

    ctx.lineJoin = "round"; ctx.lineCap = "round";

    const trazar = (pts: Punto[], grosor: number, color: string) => {
      if (pts.length < 2) return;
      ctx.strokeStyle = color; ctx.lineWidth = grosor;
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();
    };

    // Letra de referencia (panel izquierdo): mismos paths, en blanco macizo
    const refCuadro = calcCuadroRef();
    const ptsRef = vocalCamino(VOCALES[vocalIdxRef.current], refCuadro.ox, refCuadro.oy, refCuadro.w, refCuadro.h);
    ctx.save();
    trazar(ptsRef, GROSOR + 14, "rgba(120,60,180,.25)"); // sombra
    trazar(ptsRef, GROSOR + 4, "#FFFFFF");                // letra blanca gruesa
    ctx.restore();

    trazar(puntos, GROSOR + 10, "#D8B4FE");
    trazar(puntos, GROSOR, "#FFFFFF");

    ctx.save(); ctx.setLineDash([2,20]);
    trazar(puntos, 6, "#E9D5FF"); ctx.restore();

    for (let i = 1; i < puntos.length; i++) {
      if (visitados[i] && visitados[i-1]) {
        const hue = 260 + (i / puntos.length) * 80;
        ctx.strokeStyle = `hsl(${hue},80%,65%)`; ctx.lineWidth = GROSOR - 14;
        ctx.beginPath(); ctx.moveTo(puntos[i-1].x,puntos[i-1].y);
        ctx.lineTo(puntos[i].x,puntos[i].y); ctx.stroke();
      }
    }

    ctx.save(); ctx.globalAlpha = 0.35;
    for (const t of trazoLibreRef.current) trazar(t, 9, "#FF7A6B");
    ctx.restore();

    // Dedo animado que recorre el path en bucle (solo si no se está dibujando)
    if (!completadoRef.current && !dibujandoRef.current) {
      const DURACION_MS = 3500;
      const t = (Date.now() % DURACION_MS) / DURACION_MS;
      const idx = Math.min(puntos.length - 1, Math.floor(t * puntos.length));
      const dedo = puntos[idx];
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.beginPath(); ctx.arc(dedo.x, dedo.y, 26, 0, Math.PI*2); ctx.fill();
      ctx.font = "38px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("👆", dedo.x, dedo.y + 4);
      ctx.restore();
    }

    const ini = puntos[0];
    const lat = 1 + Math.sin(Date.now()/280)*0.12;
    ctx.fillStyle="#A855F7"; ctx.beginPath();
    ctx.arc(ini.x,ini.y,22*lat,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="#fff"; ctx.beginPath();
    ctx.arc(ini.x,ini.y,9,0,Math.PI*2); ctx.fill();

    const fin = puntos[puntos.length-1];
    ctx.font="48px system-ui"; ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText("⭐",fin.x,fin.y);
  }, []);

  const redimensionar = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    dprRef.current = window.devicePixelRatio || 1;
    const dpr = dprRef.current;
    canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + "px"; canvas.style.height = innerHeight + "px";
    canvas.getContext("2d")!.setTransform(dpr,0,0,dpr,0,0);
    cargarVocal(vocalIdxRef.current, false);
  }, [cargarVocal]);

  const onPointerDown = useCallback((e: PointerEvent) => {
    e.preventDefault(); getAudio();
    if (completadoRef.current) return;
    dibujandoRef.current = true;
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    if (!inicioRef.current) inicioRef.current = Date.now();
    trazoLibreRef.current.push([{x:e.clientX,y:e.clientY}]);
    marcarCerca(e.clientX,e.clientY);
  }, [marcarCerca]);

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!dibujandoRef.current || completadoRef.current) return;
    e.preventDefault();
    const eventos = e.getCoalescedEvents?.() ?? [e];
    const t = trazoLibreRef.current[trazoLibreRef.current.length-1];
    for (const ev of eventos) {
      t.push({x:ev.clientX,y:ev.clientY});
      marcarCerca(ev.clientX,ev.clientY);
    }
  }, [marcarCerca]);

  const onPointerUp = useCallback((e: PointerEvent) => {
    e.preventDefault(); dibujandoRef.current = false;
  }, []);

  useEffect(() => {
    redimensionar();
    const bucle = () => { dibujar(); rafRef.current = requestAnimationFrame(bucle); };
    rafRef.current = requestAnimationFrame(bucle);
    const cv = canvasRef.current!;
    cv.addEventListener("pointerdown", onPointerDown, {passive:false});
    cv.addEventListener("pointermove", onPointerMove, {passive:false});
    cv.addEventListener("pointerup",   onPointerUp);
    cv.addEventListener("pointercancel",onPointerUp);
    window.addEventListener("resize", redimensionar);
    const noGesture = (e: Event) => e.preventDefault();
    document.addEventListener("gesturestart", noGesture);
    document.addEventListener("dblclick", noGesture);
    return () => {
      cancelAnimationFrame(rafRef.current);
      cv.removeEventListener("pointerdown", onPointerDown);
      cv.removeEventListener("pointermove", onPointerMove);
      cv.removeEventListener("pointerup",   onPointerUp);
      cv.removeEventListener("pointercancel",onPointerUp);
      window.removeEventListener("resize", redimensionar);
      document.removeEventListener("gesturestart", noGesture);
      document.removeEventListener("dblclick", noGesture);
    };
  }, [dibujar, onPointerDown, onPointerMove, onPointerUp, redimensionar]);

  return (
    <>
      {/* Fondo */}
      <div className="fixed inset-0" style={{
        background: "radial-gradient(ellipse at 30% 15%, #EEE0FF 0%, #C8A0F0 60%, #9B59D0 100%)",
        height: "100dvh",
      }} />

      {/* Barra superior */}
      <div className="fixed left-0 right-0 flex items-center justify-between px-5 z-10 pointer-events-none"
        style={{top:"env(safe-area-inset-top,0px)",height:90}}>
        <button className="boton pointer-events-auto" aria-label="Volver al menú" onClick={() => onVolver(algunaVezRef.current)}>🏠</button>

        {/* Indicadores */}
        <div className="pointer-events-none flex gap-[12px]">
          {VOCALES.map((v,i) => (
            <div key={v} style={{
              width:18, height:18, borderRadius:"50%",
              background: i < vocalIdx ? "#A855F7" : i === vocalIdx ? "#C792EA" : "rgba(0,0,0,.18)",
              border: i === vocalIdx ? "2px solid #C792EA" : "2px solid transparent",
              transition:"all .3s",
            }} />
          ))}
        </div>

        <div className="flex gap-3 pointer-events-auto">
          {voz && (
            <button className="boton" aria-label="Escuchar" onClick={() => hablar(`la vocal ${FRASES[vocalIdx]}`)}>🔊</button>
          )}
          <button className="boton" aria-label="Borrar" onClick={() => cargarVocal(vocalIdx, false)}>🧽</button>
        </div>
      </div>

      {/* Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0" style={{touchAction:"none", zIndex:5}} />

      {/* Pantalla celebración */}
      {fiestaVisible && (
        <div className="fiesta visible" style={{zIndex:40}}>
          <div className="estrellota">⭐</div>
          <h1>¡MUY BIEN!</h1>
          <div className="acciones">
            <button className="botonazo repetir" onClick={() => cargarVocal(vocalIdx, false)}>Otra vez</button>
            <button className="botonazo seguir"  onClick={() => cargarVocal(vocalIdx + 1)}>Siguiente</button>
          </div>
        </div>
      )}

      {/* Confeti */}
      <canvas ref={confetiRef} className="fixed inset-0 pointer-events-none" style={{zIndex:50}} />
    </>
  );
}
