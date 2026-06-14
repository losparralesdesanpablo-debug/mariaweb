"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";

interface MenuInicioProps {
  onJuego: (juego: "trazos" | "colorear" | "aventura" | "numeros" | "vocales" | "contar" | "escuchar_num" | "escuchar_voc" | "pronunciar") => void;
}

export default function MenuInicio({ onJuego }: MenuInicioProps) {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        <div style={{ fontSize: "clamp(48px, 10vw, 80px)", lineHeight: 1 }}>⭐</div>
        <h1 style={{
          fontSize: "clamp(32px, 6vw, 60px)",
          fontWeight: 900, color: "#2A4D69",
          letterSpacing: 2,
          textShadow: "0 4px 0 rgba(255,255,255,0.8)",
          marginTop: 8,
        }}>
          Caminitos
        </h1>
      </div>

      {/* Grid 2 columnas */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "clamp(10px, 2vw, 16px)",
        width: "100%",
        maxWidth: 600,
        flexShrink: 0,
      }}>
        <BotonazoMenu emoji="✏️"   etiqueta="Trazos"          color="#FFC93D" sombra="#E6A800" textColor="#2A4D69" onClick={() => onJuego("trazos")} />
        <BotonazoMenu emoji="🎨"   etiqueta="Colorear"        color="#5BCB77" sombra="#3BA055" textColor="#ffffff" onClick={() => onJuego("colorear")} />
        <BotonazoMenu emoji="⭐"   etiqueta="Aventura"        color="#6BA8FF" sombra="#3A72CC" textColor="#ffffff" onClick={() => onJuego("aventura")} />
        <BotonazoMenu emoji="🔢"   etiqueta="Números"         color="#FF8C42" sombra="#CC6010" textColor="#ffffff" onClick={() => onJuego("numeros")} />
        <BotonazoMenu emoji="🔤"   etiqueta="Vocales"         color="#C792EA" sombra="#8A4FBF" textColor="#ffffff" onClick={() => onJuego("vocales")} />
        <BotonazoMenu emoji="🧮"   etiqueta="Contar"          color="#26C6DA" sombra="#0097A7" textColor="#ffffff" onClick={() => onJuego("contar")} />
        <BotonazoMenu emoji="👂🔢" etiqueta="Escucha número"  color="#4ECDC4" sombra="#2A9D94" textColor="#ffffff" onClick={() => onJuego("escuchar_num")} />
        <BotonazoMenu emoji="👂🔤" etiqueta="Escucha vocal"   color="#A78BFA" sombra="#6D4FC4" textColor="#ffffff" onClick={() => onJuego("escuchar_voc")} />
        <BotonazoMenu emoji="🎙️"  etiqueta="Pronunciar"      color="#2ECC71" sombra="#1A9E55" textColor="#ffffff" onClick={() => onJuego("pronunciar")} />
      </div>

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
        minHeight: "clamp(72px, 13vw, 100px)",
        border: "none",
        borderRadius: 24,
        background: color,
        boxShadow: `0 6px 0 ${sombra}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        cursor: "pointer",
        transition: "transform .1s, box-shadow .1s",
        touchAction: "manipulation",
        padding: "10px 8px",
      }}
      onPointerDown={e => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(.96) translateY(4px)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 2px 0 ${sombra}`;
      }}
      onPointerUp={e => {
        (e.currentTarget as HTMLButtonElement).style.transform = "";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 6px 0 ${sombra}`;
      }}
      onPointerLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.transform = "";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 6px 0 ${sombra}`;
      }}
    >
      <span style={{ fontSize: "clamp(28px, 6vw, 40px)", lineHeight: 1 }}>{emoji}</span>
      <span style={{
        fontSize: "clamp(13px, 2.8vw, 20px)",
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
