"use client";

import { useState, useEffect, useRef } from "react";
import { pip, fanfarria, hablar } from "./aventura/utils";

const COLORES = [
  { id: "rojo",     nombre: "rojo",     hex: "#E8604F" },
  { id: "azul",     nombre: "azul",     hex: "#4A90D9" },
  { id: "amarillo", nombre: "amarillo", hex: "#F4C430" },
  { id: "verde",    nombre: "verde",    hex: "#5BCB77" },
  { id: "naranja",  nombre: "naranja",  hex: "#FF8C42" },
  { id: "morado",   nombre: "morado",   hex: "#9B59B6" },
] as const;

type Color = (typeof COLORES)[number];

const PINCELES = [
  { id: "fino",   nombre: "fino",   grosor: 10, muestra: 8 },
  { id: "medio",  nombre: "medio",  grosor: 18, muestra: 14 },
  { id: "grueso", nombre: "grueso", grosor: 30, muestra: 22 },
] as const;

type Pincel = (typeof PINCELES)[number];

interface PintarColorCanvasProps {
  sonido: boolean;
  voz: boolean;
  onVolver: (completado: boolean) => void;
}

function otroColor(actualId: string): Color {
  const otros = COLORES.filter(c => c.id !== actualId);
  return otros[Math.floor(Math.random() * otros.length)];
}

export default function PintarColorCanvas({ sonido, voz, onVolver }: PintarColorCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const pintandoRef = useRef(false);
  const ultimoRef = useRef<{ x: number; y: number } | null>(null);

  const [pedido, setPedido] = useState<Color>(() => COLORES[Math.floor(Math.random() * COLORES.length)]);
  const [seleccionado, setSeleccionado] = useState<Color | null>(null);
  const [pincel, setPincel] = useState<Pincel>(PINCELES[0]);
  const [celebrando, setCelebrando] = useState(false);
  const [completadas, setCompletadas] = useState(0);
  const yaCelebroRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Inicializa el canvas al tamaño real de la ventana
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctxRef.current = ctx;
  }, []);

  useEffect(() => {
    if (voz) hablar(`Elige el color ${pedido.nombre} y pinta`);
    yaCelebroRef.current = false;
  }, [pedido, voz]);

  function limpiarTimer() {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }
  useEffect(() => () => limpiarTimer(), []);

  function coord(e: React.PointerEvent) {
    return { x: e.clientX, y: e.clientY };
  }

  function empezar(e: React.PointerEvent) {
    if (!seleccionado || seleccionado.id !== pedido.id) {
      // Recuerda amablemente qué color toca, no bloquea
      if (voz) hablar(`Elige primero el color ${pedido.nombre}`);
      if (sonido) pip(200, 0.2, 0.14, "sine");
      return;
    }
    pintandoRef.current = true;
    ultimoRef.current = coord(e);
    // Marca un punto por si solo toca sin arrastrar
    const ctx = ctxRef.current;
    if (ctx) {
      const { x, y } = ultimoRef.current;
      ctx.fillStyle = seleccionado.hex;
      ctx.beginPath();
      ctx.arc(x, y, pincel.grosor / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    celebrarSiToca();
  }

  function mover(e: React.PointerEvent) {
    if (!pintandoRef.current) return;
    const ctx = ctxRef.current;
    const ultimo = ultimoRef.current;
    if (!ctx || !ultimo || !seleccionado) return;

    const eventos = typeof e.nativeEvent.getCoalescedEvents === "function"
      ? e.nativeEvent.getCoalescedEvents()
      : [e.nativeEvent];

    ctx.strokeStyle = seleccionado.hex;
    ctx.lineWidth = pincel.grosor;
    let prev = ultimo;
    for (const ev of eventos) {
      const x = (ev as PointerEvent).clientX;
      const y = (ev as PointerEvent).clientY;
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      prev = { x, y };
    }
    ultimoRef.current = prev;
  }

  function terminar() {
    pintandoRef.current = false;
    ultimoRef.current = null;
  }

  function celebrarSiToca() {
    if (yaCelebroRef.current) return;
    yaCelebroRef.current = true;
    setCelebrando(true);
    if (sonido) fanfarria();
    if (voz) setTimeout(() => hablar(`¡Muy bien! Estás pintando de ${pedido.nombre}`), 400);
    setCompletadas(n => n + 1);
    limpiarTimer();
    timerRef.current = setTimeout(() => setCelebrando(false), 1600);
  }

  function seleccionarColor(c: Color) {
    setSeleccionado(c);
    if (sonido) pip(500, 0.15, 0.16);
    if (voz) hablar(c.nombre);
  }

  function limpiarLienzo() {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function nuevoColor() {
    limpiarLienzo();
    const sig = otroColor(pedido.id);
    setPedido(sig);
    setSeleccionado(null);
  }

  return (
    <div
      className="fixed inset-0"
      style={{
        background: "#FFFDF7",
        height: "100dvh",
        touchAction: "none",
        fontFamily: "ui-rounded, 'Arial Rounded MT Bold', system-ui, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Lienzo */}
      <canvas
        ref={canvasRef}
        style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 1, touchAction: "none" }}
        onPointerDown={empezar}
        onPointerMove={mover}
        onPointerUp={terminar}
        onPointerLeave={terminar}
        onPointerCancel={terminar}
      />

      {/* Botón volver */}
      <button
        onClick={() => onVolver(completadas > 0)}
        style={{
          position: "fixed", top: 16, left: 16, zIndex: 50,
          background: "rgba(0,0,0,.10)", border: "none",
          fontSize: 30, borderRadius: 18, width: 56, height: 56, cursor: "pointer",
        }}
        aria-label="Volver al menú"
      >
        🏠
      </button>

      {/* Instrucción arriba */}
      <div style={{
        position: "fixed", top: 18, left: "50%", transform: "translateX(-50%)",
        background: "rgba(255,255,255,.9)", borderRadius: 26,
        padding: "10px 24px", fontSize: "clamp(16px,3.5vw,26px)", fontWeight: 800,
        color: "#1a3a5c", boxShadow: "0 4px 16px rgba(0,0,0,.12)", zIndex: 40,
        whiteSpace: "nowrap",
      }}>
        {celebrando
          ? "¡Muy bien! 🎉"
          : <>Pinta de <span style={{ color: pedido.hex }}>{pedido.nombre}</span></>}
      </div>

      {/* Botones: limpiar y cambiar color */}
      <div style={{ position: "fixed", top: 16, right: 16, zIndex: 50, display: "flex", gap: 10 }}>
        <button
          onClick={limpiarLienzo}
          style={{
            background: "rgba(255,255,255,.8)", border: "none",
            fontSize: 24, borderRadius: 16, width: 56, height: 56, cursor: "pointer",
          }}
          aria-label="Borrar dibujo"
        >
          🧽
        </button>
        <button
          onClick={nuevoColor}
          style={{
            background: "rgba(255,255,255,.8)", border: "none",
            fontSize: 24, borderRadius: 16, width: 56, height: 56, cursor: "pointer",
          }}
          aria-label="Otro color"
        >
          🔄
        </button>
      </div>

      {/* Selector de pinceles (derecha, centrado vertical) */}
      <div style={{
        position: "fixed", right: 14, top: "50%", transform: "translateY(-50%)",
        zIndex: 45, display: "flex", flexDirection: "column", alignItems: "center",
        gap: "clamp(12px, 2vh, 20px)",
        background: "rgba(255,255,255,.7)", borderRadius: 28,
        padding: "16px 12px", boxShadow: "0 4px 20px rgba(0,0,0,.1)",
      }}>
        {PINCELES.map(p => {
          const activo = pincel.id === p.id;
          return (
            <button
              key={p.id}
              onPointerDown={() => { setPincel(p); if (sonido) pip(600, 0.12, 0.14); }}
              aria-label={`Pincel ${p.nombre}`}
              style={{
                width: "clamp(56px, 9vw, 74px)",
                height: "clamp(56px, 9vw, 74px)",
                borderRadius: "50%",
                border: activo ? "4px solid #2A4D69" : "4px solid transparent",
                background: activo ? "#EAF4FF" : "rgba(255,255,255,.9)",
                cursor: "pointer", touchAction: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "transform .12s",
                transform: activo ? "scale(1.08)" : "scale(1)",
                boxShadow: "0 4px 0 rgba(0,0,0,.12)",
              }}
            >
              {/* Muestra: círculo del grosor del pincel */}
              <span style={{
                display: "block",
                width: p.muestra, height: p.muestra,
                borderRadius: "50%",
                background: (seleccionado ?? pedido).hex,
              }} />
            </button>
          );
        })}
      </div>

      {/* Paleta de colores abajo */}
      <div style={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 40,
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: "clamp(10px, 2.5vw, 22px)",
        padding: "14px 16px calc(14px + env(safe-area-inset-bottom))",
        background: "rgba(255,255,255,.7)",
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        boxShadow: "0 -4px 20px rgba(0,0,0,.08)",
      }}>
        {COLORES.map(c => {
          const activo = seleccionado?.id === c.id;
          const esPedido = pedido.id === c.id;
          return (
            <button
              key={c.id}
              onPointerDown={() => seleccionarColor(c)}
              aria-label={c.nombre}
              style={{
                width: "clamp(52px, 12vw, 84px)",
                height: "clamp(52px, 12vw, 84px)",
                borderRadius: "50%",
                border: activo ? "5px solid #2A4D69" : "5px solid transparent",
                background: c.hex,
                cursor: "pointer",
                touchAction: "none",
                transition: "transform .12s",
                transform: activo ? "scale(1.15) translateY(-6px)" : "scale(1)",
                boxShadow: esPedido && !activo
                  ? `0 0 0 4px #fff, 0 0 14px ${c.hex}`
                  : "0 6px 0 rgba(0,0,0,.15)",
                // pista sutil del color pedido cuando aún no está seleccionado
                animation: esPedido && !activo ? "latir 1s ease-in-out infinite" : "none",
              }}
            />
          );
        })}
      </div>

      <style>{`
        @keyframes latir {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.12); }
        }
      `}</style>
    </div>
  );
}
