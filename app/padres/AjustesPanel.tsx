"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { Nino, ConfiguracionNino } from "@/lib/types";
import { CONFIG_DEFAULT } from "@/lib/types";

interface AjustesPanelProps {
  nino: Nino;
}

export default function AjustesPanel({ nino }: AjustesPanelProps) {
  const cfg: ConfiguracionNino = { ...CONFIG_DEFAULT, ...nino.configuracion };

  const [tolerancia, setTolerancia] = useState(cfg.tolerancia_px);
  const [pctCompletar, setPctCompletar] = useState(cfg.porcentaje_para_completar);
  const [sonido, setSonido] = useState(cfg.sonido);
  const [voz, setVoz] = useState(cfg.voz);
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleGuardar() {
    setGuardando(true);
    setMsg("");
    const supabase = createClient();
    const nuevaCfg: ConfiguracionNino = {
      ...cfg,
      tolerancia_px: tolerancia,
      porcentaje_para_completar: pctCompletar,
      sonido,
      voz,
    };
    const { error } = await supabase
      .from("ninos")
      .update({ configuracion: nuevaCfg })
      .eq("id", nino.id);
    setMsg(error ? "Error al guardar" : "¡Ajustes guardados!");
    setGuardando(false);
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Ajustes de {nino.nombre}</h2>

      <div className="flex flex-col gap-6">
        {/* Tolerancia */}
        <div
          className="rounded-3xl p-5"
          style={{ background: "rgba(255,255,255,0.8)" }}
        >
          <label className="block font-bold mb-1">
            Tolerancia del trazo
          </label>
          <p className="text-sm mb-3" style={{ color: "#8AA7BC" }}>
            Radio en píxeles que se acepta como "válido" al trazar. Más grande = más fácil.
          </p>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={20}
              max={100}
              value={tolerancia}
              onChange={(e) => setTolerancia(Number(e.target.value))}
              className="flex-1"
            />
            <span className="font-bold text-xl w-12 text-right">{tolerancia}px</span>
          </div>
        </div>

        {/* % para completar */}
        <div
          className="rounded-3xl p-5"
          style={{ background: "rgba(255,255,255,0.8)" }}
        >
          <label className="block font-bold mb-1">
            % del camino para completar
          </label>
          <p className="text-sm mb-3" style={{ color: "#8AA7BC" }}>
            Porcentaje mínimo del camino que debe cubrir para ganar la estrella.
          </p>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={50}
              max={100}
              value={pctCompletar}
              onChange={(e) => setPctCompletar(Number(e.target.value))}
              className="flex-1"
            />
            <span className="font-bold text-xl w-12 text-right">{pctCompletar}%</span>
          </div>
        </div>

        {/* Sonido y voz */}
        <div
          className="rounded-3xl p-5 flex flex-col gap-4"
          style={{ background: "rgba(255,255,255,0.8)" }}
        >
          <ToggleRow
            label="🔊 Sonido"
            desc="Efectos de audio durante el trazo"
            value={sonido}
            onChange={setSonido}
          />
          <hr style={{ borderColor: "#BFE0F2" }} />
          <ToggleRow
            label="🗣️ Voz"
            desc="Instrucciones en español al cambiar de nivel"
            value={voz}
            onChange={setVoz}
          />
        </div>

        <button
          className="btn-padres primario"
          onClick={handleGuardar}
          disabled={guardando}
        >
          {guardando ? "Guardando…" : "Guardar ajustes"}
        </button>

        {msg && (
          <p
            className="text-center font-semibold"
            style={{ color: msg.startsWith("Error") ? "#E8604F" : "#5BCB77" }}
          >
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  value,
  onChange,
}: {
  label: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="font-bold">{label}</p>
        <p className="text-sm" style={{ color: "#8AA7BC" }}>{desc}</p>
      </div>
      <button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        style={{
          width: 64,
          height: 36,
          borderRadius: 18,
          border: "none",
          cursor: "pointer",
          background: value ? "#5BCB77" : "#BFE0F2",
          transition: "background .2s",
          position: "relative",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 4,
            left: value ? 32 : 4,
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 2px 4px rgba(0,0,0,.15)",
            transition: "left .2s",
          }}
        />
      </button>
    </div>
  );
}
