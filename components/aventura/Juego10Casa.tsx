"use client";

// Arrastra los objetos a su lugar correcto: libro→estante, luna→ventana, estrella→cama
import { useState, useRef, useEffect } from "react";
import { Estrellita, Bocadillo } from "./Piezas";
import { pip, fanfarria, hablar } from "./utils";
import type { JuegoProps } from "./utils";

const OBJETOS = [
  { id: "libro",    emoji: "📚", ix: 15, iy: 28 },
  { id: "luna",     emoji: "🌙", ix: 75, iy: 22 },
  { id: "estrella", emoji: "⭐", ix: 45, iy: 20 },
];
const DESTINOS = [
  { id: "libro",    label: "estante",  dx: 25, dy: 65 },
  { id: "luna",     label: "ventana",  dx: 68, dy: 48 },
  { id: "estrella", label: "cama",     dx: 50, dy: 80 },
];

export default function Juego10Casa({ sonido, voz, onCompletado }: JuegoProps) {
  const [colocados, setColocados] = useState<Set<string>>(new Set());
  const [drag, setDrag] = useState<{ id: string; x: number; y: number } | null>(null);
  const [celebrando, setCelebrando] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (voz) hablar("Ordena la habitación de la Estrellita");
  }, [voz]);

  function iniciarDrag(e: React.PointerEvent, id: string) {
    if (colocados.has(id)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = containerRef.current!.getBoundingClientRect();
    setDrag({ id, x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  }

  function moverDrag(e: React.PointerEvent) {
    if (!drag) return;
    const rect = containerRef.current!.getBoundingClientRect();
    setDrag(d => d ? { ...d, x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 } : null);
  }

  function soltarDrag() {
    if (!drag) return;
    const dest = DESTINOS.find(d => d.id === drag.id)!;
    const dx = drag.x - dest.dx; const dy = drag.y - dest.dy;
    if (Math.sqrt(dx * dx + dy * dy) < 20) {
      if (sonido) pip(440 + OBJETOS.findIndex(o => o.id === drag.id) * 160, 0.35, 0.25);
      const next = new Set(colocados).add(drag.id);
      setColocados(next);
      if (next.size === OBJETOS.length) {
        setCelebrando(true);
        if (sonido) setTimeout(fanfarria, 300);
        if (voz) setTimeout(() => hablar("¡Muy bien! La casa de la Estrellita está ordenada"), 400);
        setTimeout(onCompletado, 1800);
      }
    }
    setDrag(null);
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0"
      style={{
        background: "linear-gradient(180deg, #E8D5FF 0%, #C8A8FF 40%, #A080D0 100%)",
        touchAction: "none",
      }}
      onPointerMove={moverDrag}
      onPointerUp={soltarDrag}
    >
      <Bocadillo texto="¡Ordena la habitación! 🏠" />
      <Estrellita x={10} y={150} size={65} celebrando={celebrando} />

      {/* Habitación SVG */}
      <svg
        style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Pared */}
        <rect x="5" y="10" width="90" height="85" rx="4" fill="#F5E6FF" opacity="0.6" />
        {/* Suelo */}
        <rect x="5" y="72" width="90" height="23" rx="0" fill="#D4A0FF" opacity="0.4" />
        {/* Ventana */}
        <rect x="60" y="15" width="28" height="25" rx="3" fill="#87CEEB" stroke="#A080D0" strokeWidth="1.5" />
        <line x1="74" y1="15" x2="74" y2="40" stroke="#A080D0" strokeWidth="1" />
        <line x1="60" y1="27" x2="88" y2="27" stroke="#A080D0" strokeWidth="1" />
        {/* Estrellas ventana */}
        <text x="72" y="24" textAnchor="middle" fontSize="8" opacity="0.7">✨</text>
        {/* Estante */}
        <rect x="12" y="58" width="35" height="4" rx="2" fill="#8B6914" />
        <rect x="14" y="62" width="3" height="10" fill="#8B6914" />
        <rect x="42" y="62" width="3" height="10" fill="#8B6914" />
        {/* Cama */}
        <rect x="32" y="75" width="36" height="16" rx="4" fill="#FF9FF3" />
        <rect x="32" y="73" width="38" height="6" rx="3" fill="#FF6BCB" />
        {/* Almohada */}
        <ellipse cx="63" cy="77" rx="6" ry="4" fill="white" opacity="0.7" />
        {/* Marcas destino */}
        {DESTINOS.map(d => (
          <circle
            key={d.id}
            cx={d.dx} cy={d.dy} r={8}
            fill={colocados.has(d.id) ? "rgba(255,201,61,.4)" : "rgba(255,255,255,.3)"}
            stroke={colocados.has(d.id) ? "#FFC93D" : "rgba(160,128,208,.5)"}
            strokeWidth="1.5"
            strokeDasharray={colocados.has(d.id) ? "0" : "2 2"}
          />
        ))}
      </svg>

      {/* Objetos arrastrables */}
      {OBJETOS.map(obj => {
        if (colocados.has(obj.id)) {
          const dest = DESTINOS.find(d => d.id === obj.id)!;
          return (
            <div key={obj.id} style={{
              position: "absolute",
              left: `${dest.dx}%`, top: `${dest.dy}%`,
              transform: "translate(-50%,-50%)",
              fontSize: 36,
              filter: "drop-shadow(0 0 8px rgba(255,201,61,.6))",
              pointerEvents: "none",
              zIndex: 8,
            }}>
              {obj.emoji}
            </div>
          );
        }
        const isDragging = drag?.id === obj.id;
        const cx = isDragging ? drag!.x : obj.ix;
        const cy = isDragging ? drag!.y : obj.iy;
        return (
          <div
            key={obj.id}
            onPointerDown={e => iniciarDrag(e, obj.id)}
            style={{
              position: "absolute",
              left: `${cx}%`, top: `${cy}%`,
              transform: "translate(-50%,-50%)",
              cursor: "grab",
              touchAction: "none",
              zIndex: isDragging ? 20 : 8,
              filter: isDragging ? "drop-shadow(0 6px 12px rgba(0,0,0,.3))" : "drop-shadow(0 2px 4px rgba(0,0,0,.2))",
              transition: isDragging ? "none" : "all .15s",
            }}
          >
            <div style={{
              width: 75, height: 75,
              background: "rgba(255,255,255,.55)",
              borderRadius: 20,
              border: "3px solid rgba(160,128,208,.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 40,
              backdropFilter: "blur(4px)",
            }}>
              {obj.emoji}
            </div>
          </div>
        );
      })}
    </div>
  );
}
