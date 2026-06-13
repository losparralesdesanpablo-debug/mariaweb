"use client";

// SVG de la Estrellita protagonista (reutilizable en todas las escenas)
export function Estrellita({
  x = 0, y = 0, size = 80, celebrando = false, className = "",
}: {
  x?: number; y?: number; size?: number; celebrando?: boolean; className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        position: "absolute", left: x, top: y,
        width: size, height: size,
        animation: celebrando ? "brincar .5s ease infinite alternate" : "flotar 3s ease-in-out infinite",
        transformOrigin: "center",
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {/* Cuerpo estrella */}
        <polygon
          points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35"
          fill="#FFC93D" stroke="#E6A800" strokeWidth="3"
        />
        {/* Cara */}
        <circle cx="40" cy="44" r="5" fill="#2A4D69"/>
        <circle cx="60" cy="44" r="5" fill="#2A4D69"/>
        <path d="M 38 58 Q 50 66 62 58" fill="none" stroke="#2A4D69" strokeWidth="3.5" strokeLinecap="round"/>
        {/* Brillo */}
        <circle cx="36" cy="40" r="2.5" fill="white" opacity="0.7"/>
      </svg>
    </div>
  );
}

// Bocadillo de instrucción
export function Bocadillo({ texto }: { texto: string }) {
  return (
    <div
      style={{
        position: "absolute", top: 12, left: "50%",
        transform: "translateX(-50%)",
        background: "white",
        borderRadius: 24,
        padding: "14px 28px",
        boxShadow: "0 4px 0 rgba(42,77,105,.15)",
        fontSize: "clamp(18px,4vw,28px)",
        fontWeight: 800,
        color: "#2A4D69",
        fontFamily: "ui-rounded, 'Arial Rounded MT Bold', system-ui, sans-serif",
        textAlign: "center",
        maxWidth: "80vw",
        zIndex: 20,
        whiteSpace: "nowrap",
        pointerEvents: "none",
      }}
    >
      {texto}
    </div>
  );
}

// Overlay de celebración al completar una escena
export function CelebracionEscena({
  titulo, onSiguiente,
}: { titulo: string; onSiguiente: () => void }) {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center gap-6"
      style={{
        background: "rgba(234,246,255,.88)",
        backdropFilter: "blur(4px)",
        zIndex: 50,
        animation: "aparecer .35s ease",
        fontFamily: "ui-rounded, 'Arial Rounded MT Bold', system-ui, sans-serif",
      }}
    >
      <div style={{ fontSize: 100, animation: "brincar .7s ease infinite alternate" }}>⭐</div>
      <h1 style={{ fontSize: 52, fontWeight: 900, color: "#E8604F", textShadow: "0 3px 0 #fff" }}>
        ¡MUY BIEN!
      </h1>
      <p style={{ fontSize: 26, color: "#2A4D69", fontWeight: 700 }}>{titulo}</p>
      <button
        className="botonazo seguir"
        onClick={onSiguiente}
        style={{ minWidth: 240 }}
      >
        ¡Seguir! 🗺️
      </button>
    </div>
  );
}
