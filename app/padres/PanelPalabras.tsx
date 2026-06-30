"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { Nino, Palabra, PalabraProgreso } from "@/lib/types";

interface Props {
  ninos: Nino[];
  userId: string;
  palabrasProgreso: PalabraProgreso[];
}

const PALABRAS_INICIO = ["María", "mamá", "papá", "hola"];

const FASE_ETIQUETA: Record<number, string> = { 1: "Emparejar", 2: "Seleccionar", 3: "Nombrar" };
const FASE_COLOR: Record<number, string>    = { 1: "#AAB7C4",   2: "#FFC93D",      3: "#5BCB77" };

export default function PanelPalabras({ ninos, userId, palabrasProgreso: progresoInicial }: Props) {
  const [ninoId, setNinoId]       = useState<string>(ninos[0]?.id ?? "");
  const [palabras, setPalabras]   = useState<Palabra[]>([]);
  const [cargado, setCargado]     = useState<string | null>(null);
  const [texto, setTexto]         = useState("");
  const [orden, setOrden]         = useState(1);
  const [imagen, setImagen]       = useState<File | null>(null);
  const [msg, setMsg]             = useState("");
  const [guardando, setGuardando] = useState(false);
  const [confirmBorrar, setConfirmBorrar] = useState<string | null>(null);
  const [cargandoInicio, setCargandoInicio] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Cargar palabras al cambiar de niña
  async function cargarPalabras(id: string) {
    const sb = createClient();
    const { data } = await sb.from("palabras").select("*").eq("nino_id", id).order("orden");
    setPalabras((data ?? []) as Palabra[]);
    setCargado(id);
  }

  if (cargado !== ninoId) {
    cargarPalabras(ninoId);
  }

  async function subirImagen(palabraId: string, file: File): Promise<string | null> {
    const sb = createClient();
    const path = `${userId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error } = await sb.storage.from("palabras-imagenes").upload(path, file, { upsert: true });
    if (error) return null;
    return sb.storage.from("palabras-imagenes").getPublicUrl(path).data.publicUrl;
  }

  async function añadir() {
    if (!texto.trim()) { setMsg("Escribe la palabra"); return; }
    setGuardando(true); setMsg("");
    const sb = createClient();
    const { data, error } = await sb
      .from("palabras")
      .insert({ nino_id: ninoId, texto: texto.trim(), orden, activa: true })
      .select().single();
    if (error || !data) { setMsg("Error al guardar"); setGuardando(false); return; }

    let imagenUrl: string | null = null;
    if (imagen) {
      imagenUrl = await subirImagen(data.id, imagen);
      if (imagenUrl) {
        await sb.from("palabras").update({ imagen_url: imagenUrl }).eq("id", data.id);
        data.imagen_url = imagenUrl;
      }
    }

    setPalabras(ps => [...ps, data as Palabra]);
    setTexto(""); setOrden(palabras.length + 2); setImagen(null);
    if (fileRef.current) fileRef.current.value = "";
    setMsg("¡Palabra añadida!");
    setTimeout(() => setMsg(""), 2000);
    setGuardando(false);
  }

  async function toggleActiva(p: Palabra) {
    const sb = createClient();
    await sb.from("palabras").update({ activa: !p.activa }).eq("id", p.id);
    setPalabras(ps => ps.map(x => x.id === p.id ? { ...x, activa: !p.activa } : x));
  }

  async function borrar(id: string) {
    const sb = createClient();
    await sb.from("palabras").delete().eq("id", id);
    setPalabras(ps => ps.filter(p => p.id !== id));
    setConfirmBorrar(null);
  }

  async function añadirPalabrasInicio() {
    setCargandoInicio(true);
    const sb = createClient();
    const nuevas: Palabra[] = [];
    for (let i = 0; i < PALABRAS_INICIO.length; i++) {
      const { data } = await sb
        .from("palabras")
        .insert({ nino_id: ninoId, texto: PALABRAS_INICIO[i], orden: i + 1, activa: true })
        .select().single();
      if (data) nuevas.push(data as Palabra);
    }
    setPalabras(ps => [...ps, ...nuevas]);
    setOrden(nuevas.length + 1);
    setCargandoInicio(false);
    setMsg("Palabras de inicio añadidas");
    setTimeout(() => setMsg(""), 2500);
  }

  const nino = ninos.find(n => n.id === ninoId);

  if (ninos.length === 0) {
    return (
      <div className="text-center py-20 rounded-3xl" style={{ background: "rgba(255,255,255,0.6)" }}>
        <p className="text-4xl mb-3">📖</p>
        <p className="text-xl font-semibold">No hay usuarias registradas</p>
        <p className="mt-2 text-sm" style={{ color: "#8AA7BC" }}>Crea una usuaria primero en la pestaña Usuarias</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold">📖 Lectura global</h2>
      <p className="text-sm" style={{ color: "#8AA7BC" }}>
        Método "emparejar → seleccionar → nombrar". Añade las palabras con una foto real de cada cosa.
        La niña avanza de fase automáticamente al acertar.
      </p>

      {/* Selector de niña */}
      {ninos.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {ninos.map(n => (
            <button key={n.id}
              onClick={() => setNinoId(n.id)}
              className="rounded-2xl px-4 py-2 text-sm font-semibold transition-all"
              style={{
                background: n.id === ninoId ? "#2A4D69" : "rgba(255,255,255,0.8)",
                color: n.id === ninoId ? "#fff" : "#2A4D69",
                boxShadow: "0 2px 0 rgba(42,77,105,.1)",
                border: "none", cursor: "pointer",
              }}>
              {n.nombre}
            </button>
          ))}
        </div>
      )}

      {/* Palabras de inicio (solo si no tiene ninguna) */}
      {palabras.length === 0 && cargado === ninoId && (
        <div className="rounded-3xl p-5 flex flex-col gap-3"
          style={{ background: "rgba(224,247,250,0.9)", border: "1.5px solid #B2EBF2" }}>
          <p className="font-bold" style={{ color: "#006064" }}>
            {nino?.nombre} no tiene palabras todavía
          </p>
          <p className="text-sm" style={{ color: "#00838F" }}>
            Puedes añadir las 4 palabras de inicio (María, mamá, papá, hola) o crear las tuyas.
          </p>
          <button
            className="btn-padres primario self-start"
            onClick={añadirPalabrasInicio}
            disabled={cargandoInicio}
          >
            {cargandoInicio ? "Añadiendo…" : "✨ Añadir palabras de inicio"}
          </button>
        </div>
      )}

      {/* Formulario añadir */}
      <div className="rounded-3xl p-6 flex flex-col gap-4"
        style={{ background: "rgba(255,255,255,0.9)", boxShadow: "0 4px 0 rgba(42,77,105,.1)" }}>
        <h3 className="font-bold text-lg">Añadir palabra</h3>

        <div className="flex gap-4 flex-wrap">
          <div style={{ flex: 2, minWidth: 140 }}>
            <label className="campo-label">PALABRA</label>
            <input className="campo" type="text"
              placeholder="Ej: mesa"
              value={texto}
              onChange={e => setTexto(e.target.value)}
              onKeyDown={e => e.key === "Enter" && añadir()}
            />
          </div>
          <div style={{ flex: 0, minWidth: 80 }}>
            <label className="campo-label">ORDEN</label>
            <input className="campo" type="number" min={1}
              value={orden}
              onChange={e => setOrden(Number(e.target.value))}
              style={{ width: 80 }}
            />
          </div>
        </div>

        <div>
          <label className="campo-label">FOTO (opcional, recomendada)</label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={e => setImagen(e.target.files?.[0] ?? null)}
            style={{ fontSize: 14, color: "#2A4D69" }}
          />
          {imagen && (
            <p className="text-xs mt-1" style={{ color: "#5BCB77" }}>
              ✓ {imagen.name} ({(imagen.size / 1024).toFixed(0)} KB)
            </p>
          )}
        </div>

        {msg && (
          <p className="text-sm font-semibold"
            style={{ color: msg.startsWith("Error") ? "#E8604F" : "#5BCB77" }}>
            {msg}
          </p>
        )}

        <button
          className="btn-padres primario self-start"
          onClick={añadir}
          disabled={guardando || !texto.trim()}
        >
          {guardando ? "Guardando…" : "Añadir palabra"}
        </button>
      </div>

      {/* Lista de palabras */}
      {palabras.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="font-bold text-lg">
            Palabras de {nino?.nombre} ({palabras.length})
          </h3>
          {[...palabras].sort((a, b) => a.orden - b.orden).map(p => {
            const prog = progresoInicial.find(x => x.palabra_id === p.id && x.nino_id === ninoId);
            return (
              <div key={p.id}
                className="rounded-2xl p-4 flex items-center gap-4"
                style={{
                  background: "rgba(255,255,255,0.85)",
                  boxShadow: "0 2px 0 rgba(42,77,105,.07)",
                  opacity: p.activa ? 1 : 0.5,
                }}>

                {/* Miniatura imagen */}
                <div style={{
                  width: 60, height: 60, borderRadius: 12, flexShrink: 0, overflow: "hidden",
                  background: "rgba(0,0,0,.06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {p.imagen_url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={p.imagen_url} alt={p.texto}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <span style={{ fontSize: 28 }}>🖼️</span>
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg" style={{ color: "#2A4D69" }}>{p.texto}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span style={{
                      background: FASE_COLOR[prog?.fase ?? 1],
                      borderRadius: 8, padding: "2px 10px",
                      fontSize: 12, fontWeight: 700, color: "white",
                    }}>
                      {FASE_ETIQUETA[prog?.fase ?? 1]}
                    </span>
                    {prog && (
                      <span className="text-xs" style={{ color: "#8AA7BC" }}>
                        {prog.aciertos} aciertos
                        {prog.dominada && " · ✓ Dominada"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleActiva(p)}
                    title={p.activa ? "Desactivar" : "Activar"}
                    style={{
                      width: 40, height: 40, borderRadius: 12, border: "none",
                      cursor: "pointer", fontSize: 18,
                      background: p.activa ? "rgba(91,203,119,.2)" : "rgba(0,0,0,.06)",
                    }}>
                    {p.activa ? "✅" : "⭕"}
                  </button>
                  {confirmBorrar === p.id ? (
                    <>
                      <button className="btn-padres peligro" style={{ padding: "6px 12px", fontSize: 13 }}
                        onClick={() => borrar(p.id)}>Borrar</button>
                      <button className="btn-padres secundario" style={{ padding: "6px 12px", fontSize: 13 }}
                        onClick={() => setConfirmBorrar(null)}>No</button>
                    </>
                  ) : (
                    <button className="btn-padres peligro" style={{ padding: "6px 12px", fontSize: 13 }}
                      onClick={() => setConfirmBorrar(p.id)}>🗑️</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
