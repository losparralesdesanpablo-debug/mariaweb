"use client";

import { useState } from "react";
import type { Nino, ResumenProgreso } from "@/lib/types";

interface Props {
  ninos: Nino[];
  progreso: ResumenProgreso[];
}

const NOMBRES_ACTIVIDAD: Record<string, string> = {
  trazo_ondulado: "Camino ondulado",
  trazo_montanas: "Las montañas",
  trazo_circulo:  "El círculo",
};
const EMOJIS: Record<string, string> = {
  trazo_ondulado: "🌊",
  trazo_montanas: "⛰️",
  trazo_circulo:  "⭕",
};

export default function PanelRendimiento({ ninos, progreso }: Props) {
  const [ninoId, setNinoId] = useState<string>(ninos[0]?.id ?? "");
  const nino = ninos.find(n => n.id === ninoId) ?? null;
  const datos = progreso.filter(p => p.nino_id === ninoId);

  if (ninos.length === 0) {
    return (
      <div className="text-center py-20 rounded-3xl" style={{ background: "rgba(255,255,255,0.6)" }}>
        <p className="text-4xl mb-3">📊</p>
        <p className="text-xl font-semibold">No hay usuarias registradas</p>
        <p className="mt-2 text-sm" style={{ color: "#8AA7BC" }}>Crea una usuaria primero en la pestaña Usuarias</p>
      </div>
    );
  }

  // Agrupar por actividad
  const porActividad = datos.reduce<Record<string, ResumenProgreso[]>>((acc, r) => {
    if (!acc[r.actividad]) acc[r.actividad] = [];
    acc[r.actividad].push(r);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold">📊 Rendimiento</h2>
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
                  border: "none",
                  cursor: "pointer",
                }}>
                {n.nombre}
              </button>
            ))}
          </div>
        )}
      </div>

      {datos.length === 0 ? (
        <div className="text-center py-16 rounded-3xl" style={{ background: "rgba(255,255,255,0.6)" }}>
          <p className="text-4xl mb-3">🌱</p>
          <p className="text-xl font-semibold">Sin datos todavía</p>
          <p className="mt-2 text-sm" style={{ color: "#8AA7BC" }}>
            Los datos aparecerán cuando {nino?.nombre ?? "la usuaria"} empiece a practicar
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {Object.entries(porActividad).map(([actividad, semanas]) => {
            const mejor        = Math.max(...semanas.map(s => s.mejor_porcentaje ?? 0));
            const totalIntentos = semanas.reduce((s, r) => s + Number(r.intentos), 0);
            const pctMedio     = semanas.reduce((s, r) => s + Number(r.porcentaje_medio ?? 0), 0) / semanas.length;

            return (
              <div key={actividad} className="rounded-3xl p-6"
                style={{ background: "rgba(255,255,255,0.8)", boxShadow: "0 4px 0 rgba(42,77,105,.08)" }}>
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-4xl">{EMOJIS[actividad] ?? "✏️"}</span>
                  <div>
                    <h3 className="text-xl font-bold">{NOMBRES_ACTIVIDAD[actividad] ?? actividad}</h3>
                    <p className="text-sm" style={{ color: "#8AA7BC" }}>{totalIntentos} intentos · {nino?.nombre}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <Stat emoji="🏆" label="Mejor marca"   value={`${mejor.toFixed(1)}%`} />
                  <Stat emoji="📈" label="% medio"        value={`${pctMedio.toFixed(1)}%`} />
                  <Stat emoji="🔄" label="Total intentos" value={String(totalIntentos)} />
                </div>

                {/* Barra de progreso visual */}
                <div className="mb-5">
                  <div className="flex justify-between text-xs mb-1" style={{ color: "#8AA7BC" }}>
                    <span>Progreso acumulado</span>
                    <span>{mejor.toFixed(1)}%</span>
                  </div>
                  <div className="rounded-full overflow-hidden h-3" style={{ background: "#EAF6FF" }}>
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${Math.min(mejor, 100)}%`, background: mejor >= 85 ? "#5BCB77" : mejor >= 50 ? "#FFC93D" : "#FF7A6B" }} />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm" style={{ borderCollapse: "separate", borderSpacing: "0 4px" }}>
                    <thead>
                      <tr style={{ color: "#8AA7BC" }}>
                        <th className="text-left pb-2 px-3">Semana</th>
                        <th className="text-right pb-2 px-3">Intentos</th>
                        <th className="text-right pb-2 px-3">% medio</th>
                        <th className="text-right pb-2 px-3">Mejor</th>
                        <th className="text-right pb-2 px-3">Tiempo</th>
                        <th className="text-right pb-2 px-3">Pausas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...semanas].sort((a, b) => new Date(b.semana).getTime() - new Date(a.semana).getTime())
                        .map(s => (
                          <tr key={String(s.semana)} style={{ background: "rgba(255,255,255,0.5)" }}>
                            <td className="px-3 py-2 rounded-l-xl">{formatSemana(s.semana)}</td>
                            <td className="px-3 py-2 text-right">{s.intentos}</td>
                            <td className="px-3 py-2 text-right font-semibold">{Number(s.porcentaje_medio).toFixed(1)}%</td>
                            <td className="px-3 py-2 text-right" style={{ color: "#5BCB77" }}>{Number(s.mejor_porcentaje).toFixed(1)}%</td>
                            <td className="px-3 py-2 text-right">{Number(s.segundos_medios).toFixed(0)} s</td>
                            <td className="px-3 py-2 text-right rounded-r-xl">{Number(s.levantamientos_medios).toFixed(1)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="rounded-2xl p-4 text-center" style={{ background: "rgba(234,246,255,0.8)" }}>
      <div className="text-2xl mb-1">{emoji}</div>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs mt-1" style={{ color: "#8AA7BC" }}>{label}</div>
    </div>
  );
}

function formatSemana(semana: string) {
  const d = new Date(semana);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}
