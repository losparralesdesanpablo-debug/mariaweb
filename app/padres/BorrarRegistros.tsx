"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { Nino } from "@/lib/types";

interface Props {
  ninos: Nino[];
}

type Rango = "hoy" | "semana" | "todo";

const RANGOS: { id: Rango; label: string }[] = [
  { id: "hoy",    label: "Solo hoy" },
  { id: "semana", label: "Última semana" },
  { id: "todo",   label: "Todo el historial" },
];

function rangoDesde(rango: Rango): string | null {
  const ahora = new Date();
  if (rango === "hoy") {
    const d = new Date(ahora); d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }
  if (rango === "semana") {
    const d = new Date(ahora); d.setDate(d.getDate() - 7);
    return d.toISOString();
  }
  return null; // todo
}

export default function BorrarRegistros({ ninos }: Props) {
  const [ninoId,    setNinoId]    = useState<string>(ninos[0]?.id ?? "");
  const [rango,     setRango]     = useState<Rango>("hoy");
  const [paso,      setPaso]      = useState<"inicial" | "confirmar" | "borrado">("inicial");
  const [conteo,    setConteo]    = useState<number | null>(null);
  const [cargando,  setCargando]  = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const nino = ninos.find(n => n.id === ninoId);

  async function contar() {
    setError(null);
    setCargando(true);
    try {
      const supabase = createClient();

      // Obtener sesiones del niño
      const { data: sesiones, error: eSes } = await supabase
        .from("sesiones")
        .select("id")
        .eq("nino_id", ninoId);
      if (eSes) throw eSes;
      const ids = (sesiones ?? []).map(s => s.id as string);
      if (ids.length === 0) { setConteo(0); setPaso("confirmar"); setCargando(false); return; }

      let q = supabase.from("intentos").select("id", { count: "exact", head: true }).in("sesion_id", ids);
      const desde = rangoDesde(rango);
      if (desde) q = q.gte("creado_en", desde);

      const { count, error: eInt } = await q;
      if (eInt) throw eInt;
      setConteo(count ?? 0);
      setPaso("confirmar");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setCargando(false);
    }
  }

  async function borrar() {
    setError(null);
    setCargando(true);
    try {
      const supabase = createClient();

      // Sesiones del niño
      const { data: sesiones, error: eSes } = await supabase
        .from("sesiones")
        .select("id")
        .eq("nino_id", ninoId);
      if (eSes) throw eSes;
      const ids = (sesiones ?? []).map(s => s.id as string);

      if (ids.length > 0) {
        let q = supabase.from("intentos").delete().in("sesion_id", ids);
        const desde = rangoDesde(rango);
        if (desde) q = q.gte("creado_en", desde);
        const { error: eInt } = await q;
        if (eInt) throw eInt;

        // Si se borró todo el historial, limpiar también sesiones vacías
        if (rango === "todo") {
          await supabase.from("sesiones").delete().in("id", ids);
        }
      }

      setPaso("borrado");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setCargando(false);
    }
  }

  function reiniciar() {
    setPaso("inicial");
    setConteo(null);
    setError(null);
  }

  if (ninos.length === 0) {
    return (
      <div className="text-center py-20 rounded-3xl" style={{ background: "rgba(255,255,255,0.6)" }}>
        <p className="text-4xl mb-3">🗑️</p>
        <p className="text-xl font-semibold">No hay usuarias registradas</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold">🗑️ Borrar registros</h2>

      <div className="rounded-3xl p-6 flex flex-col gap-5"
        style={{ background: "rgba(255,255,255,0.8)", boxShadow: "0 4px 0 rgba(42,77,105,.08)" }}>

        {/* Selección de niña */}
        {ninos.length > 1 && (
          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: "#8AA7BC" }}>Usuaria</p>
            <div className="flex gap-2 flex-wrap">
              {ninos.map(n => (
                <button key={n.id}
                  onClick={() => { setNinoId(n.id); reiniciar(); }}
                  className="rounded-2xl px-4 py-2 text-sm font-semibold transition-all"
                  style={{
                    background: n.id === ninoId ? "#2A4D69" : "rgba(234,246,255,0.9)",
                    color: n.id === ninoId ? "#fff" : "#2A4D69",
                    border: "none", cursor: "pointer",
                    boxShadow: "0 2px 0 rgba(42,77,105,.1)",
                  }}>
                  {n.nombre}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selección de rango */}
        <div>
          <p className="text-sm font-semibold mb-2" style={{ color: "#8AA7BC" }}>¿Qué registros borrar?</p>
          <div className="flex gap-2 flex-wrap">
            {RANGOS.map(r => (
              <button key={r.id}
                onClick={() => { setRango(r.id); reiniciar(); }}
                className="rounded-2xl px-4 py-2 text-sm font-semibold transition-all"
                style={{
                  background: r.id === rango ? "#FF6B6B" : "rgba(234,246,255,0.9)",
                  color: r.id === rango ? "#fff" : "#2A4D69",
                  border: "none", cursor: "pointer",
                  boxShadow: r.id === rango ? "0 2px 0 #CC3333" : "0 2px 0 rgba(42,77,105,.1)",
                }}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-2xl px-4 py-3 text-sm font-semibold"
            style={{ background: "#FFE5E5", color: "#CC3333" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Paso inicial */}
        {paso === "inicial" && (
          <button
            onClick={contar}
            disabled={cargando}
            className="rounded-2xl px-6 py-3 font-bold text-sm transition-all self-start"
            style={{
              background: "#FF6B6B", color: "#fff",
              border: "none", cursor: cargando ? "not-allowed" : "pointer",
              boxShadow: "0 4px 0 #CC3333", opacity: cargando ? 0.6 : 1,
            }}>
            {cargando ? "Comprobando…" : "Revisar qué se borrará →"}
          </button>
        )}

        {/* Paso confirmar */}
        {paso === "confirmar" && (
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl p-4 text-center"
              style={{ background: conteo === 0 ? "rgba(234,246,255,0.8)" : "#FFF3CD" }}>
              {conteo === 0 ? (
                <p className="font-semibold" style={{ color: "#8AA7BC" }}>
                  No hay registros en ese rango para {nino?.nombre}.
                </p>
              ) : (
                <>
                  <p className="text-3xl font-black" style={{ color: "#CC3333" }}>{conteo}</p>
                  <p className="text-sm font-semibold mt-1" style={{ color: "#2A4D69" }}>
                    intentos de <strong>{nino?.nombre}</strong> se borrarán
                    {rango === "hoy" ? " de hoy" : rango === "semana" ? " de los últimos 7 días" : " de todo el historial"}
                  </p>
                </>
              )}
            </div>

            {conteo !== null && conteo > 0 && (
              <div className="flex gap-3">
                <button onClick={reiniciar}
                  className="rounded-2xl px-5 py-3 font-bold text-sm flex-1"
                  style={{ background: "rgba(234,246,255,0.9)", color: "#2A4D69", border: "none", cursor: "pointer", boxShadow: "0 2px 0 rgba(42,77,105,.1)" }}>
                  Cancelar
                </button>
                <button onClick={borrar} disabled={cargando}
                  className="rounded-2xl px-5 py-3 font-bold text-sm flex-1"
                  style={{
                    background: "#FF6B6B", color: "#fff",
                    border: "none", cursor: cargando ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 0 #CC3333", opacity: cargando ? 0.6 : 1,
                  }}>
                  {cargando ? "Borrando…" : `Sí, borrar ${conteo} intentos`}
                </button>
              </div>
            )}

            {conteo === 0 && (
              <button onClick={reiniciar}
                className="rounded-2xl px-5 py-3 font-bold text-sm self-start"
                style={{ background: "rgba(234,246,255,0.9)", color: "#2A4D69", border: "none", cursor: "pointer", boxShadow: "0 2px 0 rgba(42,77,105,.1)" }}>
                ← Volver
              </button>
            )}
          </div>
        )}

        {/* Paso borrado */}
        {paso === "borrado" && (
          <div className="flex flex-col gap-4 items-center text-center">
            <div className="text-5xl">✅</div>
            <p className="font-bold text-lg" style={{ color: "#2A4D69" }}>
              Registros eliminados correctamente
            </p>
            <button onClick={reiniciar}
              className="rounded-2xl px-6 py-3 font-bold text-sm"
              style={{ background: "#5BCB77", color: "#fff", border: "none", cursor: "pointer", boxShadow: "0 4px 0 #3BA055" }}>
              Borrar más registros
            </button>
          </div>
        )}
      </div>

      {/* Aviso */}
      <p className="text-xs text-center" style={{ color: "#8AA7BC" }}>
        Esta acción no se puede deshacer. Los registros borrados no aparecerán en el panel de rendimiento.
      </p>
    </div>
  );
}
