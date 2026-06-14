"use client";

import { useEffect, useRef } from "react";
import type { VideoPremio } from "@/lib/types";

interface Props {
  video: VideoPremio;
  onCerrar: () => void;
}

export default function PantallaVideo({ video, onCerrar }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Silenciar el contexto de audio de los juegos para que no compita con YouTube
  useEffect(() => {
    return () => {
      // Al cerrar, nada que limpiar — YouTube para solo con el iframe
    };
  }, []);

  const src = `https://www.youtube-nocookie.com/embed/${video.youtube_id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{
        background: "#000",
        height: "100dvh",
      }}
    >
      {/* Barra superior */}
      <div
        className="flex items-center justify-between px-4 flex-shrink-0"
        style={{ height: 64, background: "rgba(0,0,0,.7)" }}
      >
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 28 }}>🎬</span>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 18,
            fontFamily: "ui-rounded,'Arial Rounded MT Bold',system-ui,sans-serif" }}>
            {video.titulo}
          </span>
        </div>
        <button
          onClick={onCerrar}
          style={{
            background: "rgba(255,255,255,.15)", border: "none", borderRadius: 16,
            color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer",
            padding: "10px 20px",
            fontFamily: "ui-rounded,'Arial Rounded MT Bold',system-ui,sans-serif",
          }}
        >
          ✕ Cerrar
        </button>
      </div>

      {/* iframe YouTube */}
      <div className="flex-1 relative">
        <iframe
          src={src}
          title={video.titulo}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            border: "none",
          }}
        />
      </div>
    </div>
  );
}
