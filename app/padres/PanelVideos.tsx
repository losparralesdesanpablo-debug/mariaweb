"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { VideoPremio } from "@/lib/types";

interface Props {
  videos: VideoPremio[];
  userId: string;
}

function extraerYoutubeId(url: string): string | null {
  // Soporta: youtu.be/ID, youtube.com/watch?v=ID, youtube.com/embed/ID
  const patterns = [
    /youtu\.be\/([^?&\s]+)/,
    /youtube\.com\/watch\?.*v=([^&\s]+)/,
    /youtube\.com\/embed\/([^?&\s]+)/,
    /youtube\.com\/shorts\/([^?&\s]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  // Si parece ya un ID directo (11 chars alfanuméricos)
  if (/^[\w-]{11}$/.test(url.trim())) return url.trim();
  return null;
}

export default function PanelVideos({ videos: inicial, userId }: Props) {
  const [videos, setVideos]   = useState<VideoPremio[]>(inicial);
  const [url, setUrl]         = useState("");
  const [titulo, setTitulo]   = useState("");
  const [msg, setMsg]         = useState("");
  const [guardando, setGuardando] = useState(false);
  const [confirmBorrar, setConfirmBorrar] = useState<string | null>(null);

  async function añadir() {
    const ytId = extraerYoutubeId(url.trim());
    if (!ytId) { setMsg("URL de YouTube no válida"); return; }
    if (!titulo.trim()) { setMsg("Escribe un título para el vídeo"); return; }
    setGuardando(true); setMsg("");
    const supabase = createClient();
    const orden = videos.length > 0 ? Math.max(...videos.map(v => v.orden)) + 1 : 1;
    const { data, error } = await supabase
      .from("videos_premio")
      .insert({ adulto_id: userId, youtube_id: ytId, titulo: titulo.trim(), orden, activo: true })
      .select().single();
    if (error) { setMsg("Error al guardar"); }
    else {
      setVideos(vs => [...vs, data as VideoPremio]);
      setUrl(""); setTitulo(""); setMsg("¡Vídeo añadido!");
      setTimeout(() => setMsg(""), 2000);
    }
    setGuardando(false);
  }

  async function toggleActivo(v: VideoPremio) {
    const supabase = createClient();
    await supabase.from("videos_premio").update({ activo: !v.activo }).eq("id", v.id);
    setVideos(vs => vs.map(x => x.id === v.id ? { ...x, activo: !x.activo } : x));
  }

  async function borrar(id: string) {
    const supabase = createClient();
    await supabase.from("videos_premio").delete().eq("id", id);
    setVideos(vs => vs.filter(v => v.id !== id));
    setConfirmBorrar(null);
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold">🎬 Vídeos premio</h2>
      <p className="text-sm" style={{ color: "#8AA7BC" }}>
        Estos vídeos se muestran a María como premio cuando completa el número de juegos configurado.
        Se eligen en orden aleatorio entre los vídeos activos.
      </p>

      {/* Formulario añadir */}
      <div className="rounded-3xl p-6 flex flex-col gap-4"
        style={{ background: "rgba(255,255,255,0.9)", boxShadow: "0 4px 0 rgba(42,77,105,.1)" }}>
        <h3 className="font-bold text-lg">Añadir vídeo</h3>
        <div>
          <label className="campo-label">URL DE YOUTUBE</label>
          <input className="campo" type="text"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url} onChange={e => setUrl(e.target.value)} />
        </div>
        <div>
          <label className="campo-label">TÍTULO (para identificarlo aquí)</label>
          <input className="campo" type="text"
            placeholder="Ej: Canciones infantiles de colores"
            value={titulo} onChange={e => setTitulo(e.target.value)} />
        </div>
        {msg && (
          <p className="text-sm font-semibold"
            style={{ color: msg.startsWith("Error") || msg.includes("válida") || msg.includes("título") ? "#E8604F" : "#5BCB77" }}>
            {msg}
          </p>
        )}
        <button className="btn-padres primario self-start"
          onClick={añadir} disabled={guardando || !url.trim() || !titulo.trim()}>
          {guardando ? "Guardando…" : "Añadir vídeo"}
        </button>
      </div>

      {/* Lista */}
      {videos.length === 0 ? (
        <div className="text-center py-12 rounded-3xl" style={{ background: "rgba(255,255,255,0.6)" }}>
          <p className="text-4xl mb-3">🎬</p>
          <p className="font-semibold">No hay vídeos todavía</p>
          <p className="text-sm mt-1" style={{ color: "#8AA7BC" }}>Añade el primero con el formulario de arriba</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {[...videos].sort((a, b) => a.orden - b.orden).map(v => (
            <div key={v.id} className="rounded-2xl p-4 flex items-center gap-4"
              style={{ background: "rgba(255,255,255,0.85)", boxShadow: "0 2px 0 rgba(42,77,105,.07)", opacity: v.activo ? 1 : 0.5 }}>

              {/* Miniatura */}
              <img
                src={`https://img.youtube.com/vi/${v.youtube_id}/mqdefault.jpg`}
                alt={v.titulo}
                style={{ width: 90, height: 60, borderRadius: 10, objectFit: "cover", flexShrink: 0 }}
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{v.titulo}</p>
                <p className="text-xs mt-0.5" style={{ color: "#8AA7BC", fontFamily: "monospace" }}>{v.youtube_id}</p>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleActivo(v)}
                  title={v.activo ? "Desactivar" : "Activar"}
                  style={{
                    width: 40, height: 40, borderRadius: 12, border: "none", cursor: "pointer", fontSize: 18,
                    background: v.activo ? "rgba(91,203,119,.2)" : "rgba(0,0,0,.06)",
                  }}>
                  {v.activo ? "✅" : "⭕"}
                </button>
                {confirmBorrar === v.id ? (
                  <>
                    <button className="btn-padres peligro" style={{ padding: "6px 12px", fontSize: 13 }}
                      onClick={() => borrar(v.id)}>Borrar</button>
                    <button className="btn-padres secundario" style={{ padding: "6px 12px", fontSize: 13 }}
                      onClick={() => setConfirmBorrar(null)}>No</button>
                  </>
                ) : (
                  <button className="btn-padres peligro" style={{ padding: "6px 12px", fontSize: 13 }}
                    onClick={() => setConfirmBorrar(v.id)}>🗑️</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
