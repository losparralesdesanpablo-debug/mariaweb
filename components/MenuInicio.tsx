"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type JuegoMenu = "trazos" | "colorear" | "aventura" | "numeros" | "vocales" | "contar" | "escuchar_num" | "escuchar_voc" | "pronunciar" | "ordenar" | "falta" | "masomenos" | "sumar" | "antesdespues" | "lectura" | "colores" | "frutas_color" | "nat_color" | "pintar";

interface MenuInicioProps {
  onJuego: (juego: JuegoMenu) => void;
  contador: number;
  umbral: number;
  onPremio: () => void;
  juegosActivos: Record<string, boolean>;
}

interface JuegoDef {
  id: JuegoMenu;
  emoji: string;
  etiqueta: string;
  color: string;
  sombra: string;
  textColor: string;
}

interface AreaDef {
  id: string;
  emoji: string;
  etiqueta: string;
  color: string;
  sombra: string;
  textColor: string;
  juegos: JuegoDef[];
}

const AREAS: AreaDef[] = [
  {
    id: "trazos", emoji: "✏️", etiqueta: "Trazos", color: "#FFC93D", sombra: "#E6A800", textColor: "#2A4D69",
    juegos: [
      { id: "trazos",   emoji: "✏️", etiqueta: "Trazos",   color: "#FFC93D", sombra: "#E6A800", textColor: "#2A4D69" },
      { id: "aventura", emoji: "⭐", etiqueta: "Aventura", color: "#6BA8FF", sombra: "#3A72CC", textColor: "#ffffff" },
    ],
  },
  {
    id: "colores", emoji: "🌈", etiqueta: "Colores", color: "#EC407A", sombra: "#AD1457", textColor: "#ffffff",
    juegos: [
      { id: "colorear",     emoji: "🎨",  etiqueta: "Colorear",   color: "#5BCB77", sombra: "#3BA055", textColor: "#ffffff" },
      { id: "colores",      emoji: "🌈",  etiqueta: "Colores",    color: "#EC407A", sombra: "#AD1457", textColor: "#ffffff" },
      { id: "frutas_color", emoji: "🍓",  etiqueta: "Frutas",     color: "#E8604F", sombra: "#B23A2C", textColor: "#ffffff" },
      { id: "nat_color",    emoji: "🌿",  etiqueta: "Naturaleza", color: "#5BCB77", sombra: "#3BA055", textColor: "#ffffff" },
      { id: "pintar",       emoji: "🖌️",  etiqueta: "Pintar",     color: "#4A90D9", sombra: "#2A6CB0", textColor: "#ffffff" },
    ],
  },
  {
    id: "letras", emoji: "🔤", etiqueta: "Letras", color: "#C792EA", sombra: "#8A4FBF", textColor: "#ffffff",
    juegos: [
      { id: "vocales",     emoji: "🔤",  etiqueta: "Vocales",       color: "#C792EA", sombra: "#8A4FBF", textColor: "#ffffff" },
      { id: "escuchar_voc",emoji: "👂🔤", etiqueta: "Escucha vocal", color: "#A78BFA", sombra: "#6D4FC4", textColor: "#ffffff" },
      { id: "pronunciar",  emoji: "🎙️",  etiqueta: "Pronunciar",    color: "#2ECC71", sombra: "#1A9E55", textColor: "#ffffff" },
      { id: "lectura",     emoji: "📖",  etiqueta: "Leer",          color: "#4FC3F7", sombra: "#0288D1", textColor: "#ffffff" },
    ],
  },
  {
    id: "numeros", emoji: "🔢", etiqueta: "Números", color: "#FF8C42", sombra: "#CC6010", textColor: "#ffffff",
    juegos: [
      { id: "numeros",     emoji: "🔢",  etiqueta: "Números",        color: "#FF8C42", sombra: "#CC6010", textColor: "#ffffff" },
      { id: "contar",      emoji: "🧮",  etiqueta: "Contar",         color: "#26C6DA", sombra: "#0097A7", textColor: "#ffffff" },
      { id: "escuchar_num",emoji: "👂🔢", etiqueta: "Escucha número", color: "#4ECDC4", sombra: "#2A9D94", textColor: "#ffffff" },
      { id: "ordenar",     emoji: "🔢",  etiqueta: "Ordenar",        color: "#FF6B6B", sombra: "#CC3333", textColor: "#ffffff" },
      { id: "falta",       emoji: "🔍",  etiqueta: "¿Cuál falta?",   color: "#26C6DA", sombra: "#0097A7", textColor: "#ffffff" },
      { id: "masomenos",   emoji: "⚖️",  etiqueta: "Más o menos",    color: "#FFA726", sombra: "#E65100", textColor: "#ffffff" },
      { id: "sumar",       emoji: "➕",  etiqueta: "Sumar",          color: "#EC407A", sombra: "#AD1457", textColor: "#ffffff" },
      { id: "antesdespues",emoji: "↔️",  etiqueta: "Antes y después",color: "#7E57C2", sombra: "#4527A0", textColor: "#ffffff" },
    ],
  },
];

export default function MenuInicio({ onJuego, contador, umbral, onPremio, juegosActivos }: MenuInicioProps) {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [areaSel, setAreaSel] = useState<AreaDef | null>(null);

  // Helper: devuelve true si el juego está activo (default: true si no está en el mapa)
  function activo(id: string) { return juegosActivos[id] !== false; }

  // Un área se muestra solo si tiene al menos un juego activo
  function areaTieneJuegos(area: AreaDef) { return area.juegos.some(j => activo(j.id)); }

  function iniciarLargo() {
    timerRef.current = setTimeout(() => router.push("/padres"), 3000);
  }
  function cancelarLargo() {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center px-5"
      style={{
        background: "radial-gradient(circle at 15% 10%, #FFF7DE 0%, transparent 28%), radial-gradient(circle at 88% 85%, #DFF3E4 0%, transparent 30%), #EAF6FF",
        fontFamily: "ui-rounded, 'Arial Rounded MT Bold', 'Trebuchet MS', system-ui, sans-serif",
        gap: "clamp(12px, 2.5vh, 24px)",
        overflowY: "auto",
        paddingTop: 16,
        paddingBottom: 20,
        height: "100dvh",
      }}
    >
      {/* Título */}
      <div className="text-center" style={{ flexShrink: 0 }}>
        <div style={{ fontSize: "clamp(48px, 10vw, 80px)", lineHeight: 1 }}>
          {areaSel ? areaSel.emoji : "⭐"}
        </div>
        <h1 style={{
          fontSize: "clamp(32px, 6vw, 60px)",
          fontWeight: 900, color: "#2A4D69",
          letterSpacing: 2,
          textShadow: "0 4px 0 rgba(255,255,255,0.8)",
          marginTop: 8,
        }}>
          {areaSel ? areaSel.etiqueta : "Caminitos"}
        </h1>
      </div>

      {/* Botón premio (solo en el menú de áreas) */}
      {!areaSel && (
        <div style={{ flexShrink: 0, width: "100%", maxWidth: 700 }}>
          <BotonazoMrPremio contador={contador} umbral={umbral} onPremio={onPremio} />
        </div>
      )}

      {areaSel ? (
        <>
          {/* Grid de juegos del área */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "clamp(8px, 1.5vw, 12px)",
            width: "100%",
            maxWidth: 700,
            flexShrink: 0,
          }}>
            {areaSel.juegos.filter(j => activo(j.id)).map(j => (
              <BotonazoMenu
                key={j.id}
                emoji={j.emoji}
                etiqueta={j.etiqueta}
                color={j.color}
                sombra={j.sombra}
                textColor={j.textColor}
                onClick={() => onJuego(j.id)}
              />
            ))}
          </div>

          {/* Botón volver a las áreas */}
          <button
            onClick={() => setAreaSel(null)}
            style={{
              flexShrink: 0,
              minHeight: "clamp(56px, 10vw, 72px)",
              padding: "0 28px",
              border: "none",
              borderRadius: 20,
              background: "#ffffff",
              boxShadow: "0 4px 0 rgba(0,0,0,.12)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
              touchAction: "manipulation",
            }}
          >
            <span style={{ fontSize: "clamp(24px, 5vw, 34px)", lineHeight: 1 }}>🏠</span>
            <span style={{ fontSize: "clamp(16px, 3vw, 22px)", fontWeight: 900, color: "#2A4D69" }}>
              Volver
            </span>
          </button>
        </>
      ) : (
        /* Grid de áreas (2 columnas) */
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "clamp(12px, 2vw, 18px)",
          width: "100%",
          maxWidth: 700,
          flexShrink: 0,
        }}>
          {AREAS.filter(areaTieneJuegos).map(area => (
            <BotonazoArea
              key={area.id}
              emoji={area.emoji}
              etiqueta={area.etiqueta}
              color={area.color}
              sombra={area.sombra}
              textColor={area.textColor}
              onClick={() => setAreaSel(area)}
            />
          ))}
        </div>
      )}

      {/* Botón invisible 3s → /padres */}
      <button
        className="fixed bottom-0 left-0 opacity-0"
        style={{ width: 78, height: 78, touchAction: "none", zIndex: 50 }}
        aria-label="Zona de padres"
        onPointerDown={iniciarLargo}
        onPointerUp={cancelarLargo}
        onPointerLeave={cancelarLargo}
        onPointerCancel={cancelarLargo}
      />
    </div>
  );
}

function BotonazoMrPremio({ contador, umbral, onPremio }: { contador: number; umbral: number; onPremio: () => void }) {
  const listo = contador >= umbral;
  const pct   = Math.min(contador / umbral, 1);

  return (
    <button
      onClick={listo ? onPremio : undefined}
      disabled={!listo}
      style={{
        width: "100%",
        minHeight: "clamp(56px, 10vw, 72px)",
        border: "none",
        borderRadius: 20,
        background: listo
          ? "linear-gradient(90deg, #FFB800 0%, #FF6B00 100%)"
          : "rgba(255,255,255,0.45)",
        boxShadow: listo ? "0 5px 0 #CC6000" : "0 3px 0 rgba(0,0,0,.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: listo ? "pointer" : "default",
        transition: "all .2s",
        padding: "0 20px",
        overflow: "hidden",
        position: "relative",
        gap: 12,
      }}
    >
      {/* Barra de progreso de fondo */}
      {!listo && (
        <div style={{
          position: "absolute", inset: 0, left: 0,
          width: `${pct * 100}%`,
          background: "linear-gradient(90deg, rgba(255,184,0,.35) 0%, rgba(255,107,0,.25) 100%)",
          borderRadius: 20,
          transition: "width .4s",
          pointerEvents: "none",
        }} />
      )}

      <span style={{ fontSize: "clamp(22px, 5vw, 30px)", lineHeight: 1, position: "relative" }}>
        {listo ? "🎬" : "🎁"}
      </span>

      <span style={{
        flex: 1,
        fontSize: "clamp(12px, 2.5vw, 17px)",
        fontWeight: 900,
        color: listo ? "#fff" : "#2A4D69",
        textAlign: "left",
        position: "relative",
      }}>
        {listo ? "¡Tu premio te espera! Pulsa aquí 🎉" : "Premio"}
      </span>

      {/* Contador / estrellas */}
      <div style={{
        background: listo ? "rgba(255,255,255,.25)" : "rgba(255,255,255,.7)",
        borderRadius: 14,
        padding: "4px 12px",
        fontSize: "clamp(12px, 2.5vw, 16px)",
        fontWeight: 900,
        color: listo ? "#fff" : "#2A4D69",
        whiteSpace: "nowrap",
        position: "relative",
      }}>
        {listo
          ? "⭐".repeat(Math.min(umbral, 5))
          : `${contador} / ${umbral} ⭐`}
      </div>
    </button>
  );
}

function BotonazoArea({
  emoji, etiqueta, color, sombra, textColor, onClick,
}: {
  emoji: string; etiqueta: string; color: string;
  sombra: string; textColor: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        minHeight: "clamp(110px, 22vw, 170px)",
        border: "none",
        borderRadius: 28,
        background: color,
        boxShadow: `0 7px 0 ${sombra}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        cursor: "pointer",
        transition: "transform .1s, box-shadow .1s",
        touchAction: "manipulation",
        padding: "12px 8px",
      }}
      onPointerDown={e => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(.97) translateY(4px)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 3px 0 ${sombra}`;
      }}
      onPointerUp={e => {
        (e.currentTarget as HTMLButtonElement).style.transform = "";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 7px 0 ${sombra}`;
      }}
      onPointerLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.transform = "";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 7px 0 ${sombra}`;
      }}
    >
      <span style={{ fontSize: "clamp(40px, 9vw, 64px)", lineHeight: 1 }}>{emoji}</span>
      <span style={{
        fontSize: "clamp(16px, 3.5vw, 26px)",
        fontWeight: 900,
        color: textColor,
        letterSpacing: 0.5,
        textAlign: "center",
        lineHeight: 1.2,
      }}>
        {etiqueta}
      </span>
    </button>
  );
}

function BotonazoMenu({
  emoji, etiqueta, color, sombra, textColor, onClick,
}: {
  emoji: string; etiqueta: string; color: string;
  sombra: string; textColor: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        minHeight: "clamp(64px, 12vw, 90px)",
        border: "none",
        borderRadius: 20,
        background: color,
        boxShadow: `0 5px 0 ${sombra}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        cursor: "pointer",
        transition: "transform .1s, box-shadow .1s",
        touchAction: "manipulation",
        padding: "8px 4px",
      }}
      onPointerDown={e => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(.96) translateY(3px)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 2px 0 ${sombra}`;
      }}
      onPointerUp={e => {
        (e.currentTarget as HTMLButtonElement).style.transform = "";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 5px 0 ${sombra}`;
      }}
      onPointerLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.transform = "";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 5px 0 ${sombra}`;
      }}
    >
      <span style={{ fontSize: "clamp(22px, 5vw, 32px)", lineHeight: 1 }}>{emoji}</span>
      <span style={{
        fontSize: "clamp(10px, 2.2vw, 15px)",
        fontWeight: 900,
        color: textColor,
        letterSpacing: 0.3,
        textAlign: "center",
        lineHeight: 1.2,
      }}>
        {etiqueta}
      </span>
    </button>
  );
}
