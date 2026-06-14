"use client";

import { useState, useEffect, useCallback } from "react";

interface PantallaProps {
  pin: string;          // PIN correcto guardado en Supabase
  nombre: string;
  onAcceso: () => void;
}

export default function PantallaPIN({ pin, nombre, onAcceso }: PantallaProps) {
  const [entrada, setEntrada] = useState("");
  const [sacudir, setSacudir] = useState(false);

  const verificar = useCallback((codigo: string) => {
    if (codigo === pin) {
      onAcceso();
    } else {
      setSacudir(true);
      setTimeout(() => { setSacudir(false); setEntrada(""); }, 600);
    }
  }, [pin, onAcceso]);

  function pulsar(n: string) {
    const nueva = entrada + n;
    setEntrada(nueva);
    if (nueva.length === pin.length) {
      setTimeout(() => verificar(nueva), 120);
    }
  }

  function borrar() {
    setEntrada(e => e.slice(0, -1));
  }

  const teclas = ["1","2","3","4","5","6","7","8","9","","0","⌫"];

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center gap-8"
      style={{
        background: "radial-gradient(circle at 50% 30%, #FFF7DE 0%, transparent 50%), radial-gradient(circle at 80% 80%, #DFF3E4 0%, transparent 40%), #EAF6FF",
        fontFamily: "ui-rounded, 'Arial Rounded MT Bold', system-ui, sans-serif",
        touchAction: "none",
      }}
    >
      {/* Emoji + nombre */}
      <div className="flex flex-col items-center gap-2">
        <div style={{ fontSize: 72 }}>🌈</div>
        <p style={{ fontSize: 26, fontWeight: 900, color: "#2A4D69" }}>
          ¡Hola, {nombre}!
        </p>
        <p style={{ fontSize: 16, color: "#8AA7BC", fontWeight: 600 }}>
          Introduce tu código
        </p>
      </div>

      {/* Indicadores de dígitos */}
      <div
        style={{
          display: "flex",
          gap: 16,
          animation: sacudir ? "sacudir 0.5s ease" : "none",
        }}
      >
        {Array.from({ length: pin.length }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 22, height: 22,
              borderRadius: "50%",
              background: i < entrada.length ? "#2A4D69" : "white",
              border: "3px solid #BFE0F2",
              transition: "background .15s",
              boxShadow: "0 2px 0 rgba(42,77,105,.12)",
            }}
          />
        ))}
      </div>

      {/* Teclado */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {teclas.map((t, i) => {
          if (t === "") return <div key={i} />;
          const esBorrar = t === "⌫";
          return (
            <button
              key={i}
              onPointerDown={e => { e.preventDefault(); esBorrar ? borrar() : pulsar(t); }}
              disabled={!esBorrar && entrada.length >= pin.length}
              style={{
                width: 88, height: 88,
                borderRadius: 24,
                border: "none",
                background: esBorrar ? "rgba(232,96,79,.12)" : "white",
                boxShadow: esBorrar ? "0 4px 0 rgba(232,96,79,.2)" : "0 4px 0 rgba(42,77,105,.14)",
                fontSize: esBorrar ? 28 : 36,
                fontWeight: 900,
                color: esBorrar ? "#E8604F" : "#2A4D69",
                cursor: "pointer",
                touchAction: "none",
                transition: "transform .08s",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {t}
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes sacudir {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-12px); }
          40%      { transform: translateX(12px); }
          60%      { transform: translateX(-8px); }
          80%      { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
}
