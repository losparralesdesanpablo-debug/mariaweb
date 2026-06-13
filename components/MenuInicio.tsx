"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";

interface MenuInicioProps {
  onJuego: (juego: "trazos" | "colorear" | "aventura") => void;
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
      className="fixed inset-0 flex flex-col items-center justify-center gap-8 px-8"
      style={{
        background: "radial-gradient(circle at 15% 10%, #FFF7DE 0%, transparent 28%), radial-gradient(circle at 88% 85%, #DFF3E4 0%, transparent 30%), #EAF6FF",
        fontFamily: "ui-rounded, 'Arial Rounded MT Bold', 'Trebuchet MS', system-ui, sans-serif",
      }}
    >
      {/* Título */}
      <div className="text-center" style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 80, lineHeight: 1 }}>⭐</div>
        <h1
          style={{
            fontSize: "clamp(42px, 8vw, 72px)",
            fontWeight: 900,
            color: "#2A4D69",
            letterSpacing: 2,
            textShadow: "0 4px 0 rgba(255,255,255,0.8)",
            marginTop: 12,
          }}
        >
          Caminitos
        </h1>
      </div>

      {/* Botones de juego */}
      <div className="flex flex-col gap-5 w-full" style={{ maxWidth: 520 }}>
        <BotonazoMenu
          emoji="✏️"
          etiqueta="Trazos"
          color="#FFC93D"
          sombra="#E6A800"
          textColor="#2A4D69"
          onClick={() => onJuego("trazos")}
        />
        <BotonazoMenu
          emoji="🎨"
          etiqueta="Colorear"
          color="#5BCB77"
          sombra="#3BA055"
          textColor="#ffffff"
          onClick={() => onJuego("colorear")}
        />
        <BotonazoMenu
          emoji="⭐"
          etiqueta="Aventura"
          color="#6BA8FF"
          sombra="#3A72CC"
          textColor="#ffffff"
          onClick={() => onJuego("aventura")}
        />
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
        minHeight: 110,
        border: "none",
        borderRadius: 32,
        background: color,
        boxShadow: `0 8px 0 ${sombra}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        cursor: "pointer",
        transition: "transform .1s, box-shadow .1s",
        touchAction: "manipulation",
      }}
      onPointerDown={e => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(.96) translateY(5px)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 3px 0 ${sombra}`;
      }}
      onPointerUp={e => {
        (e.currentTarget as HTMLButtonElement).style.transform = "";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 0 ${sombra}`;
      }}
    >
      <span style={{ fontSize: 52 }}>{emoji}</span>
      <span style={{
        fontSize: "clamp(28px, 5vw, 40px)",
        fontWeight: 900,
        color: textColor,
        letterSpacing: 1,
      }}>
        {etiqueta}
      </span>
    </button>
  );
}
