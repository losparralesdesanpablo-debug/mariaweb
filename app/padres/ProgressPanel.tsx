"use client";

import type { ResumenProgreso, Nino } from "@/lib/types";

interface ProgressPanelProps {
  progreso: ResumenProgreso[];
  nino: Nino;
}

const NOMBRES_ACTIVIDAD: Record<string, string> = {
  trazo_ondulado: "Camino ondulado",
  trazo_montanas: "Las montañas",
  trazo_circulo: "El círculo",
};

const EMOJIS: Record<string, string> = {
  trazo_ondulado: "🌊",
  trazo_montanas: "⛰️",
  trazo_circulo: "⭕",
};

export default function ProgressPanel({ progreso, nino }: ProgressPanelProps) {
  if (progreso.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-4xl mb-4">🌱</p>
        <p className="text-xl">Todavía no hay intentos registrados.</p>
        <p className="mt-2" style={{ color: "#8AA7BC" }}>
          Los datos aparecerán aquí cuando {nino.nombre} empiece a practicar.
        </p>
      </div>
    );
  }

  // Agrupar por actividad
  const porActividad = progreso.reduce<Record<string, ResumenProgreso[]>>(
    (acc, r) => {
      if (!acc[r.actividad]) acc[r.actividad] = [];
      acc[r.actividad].push(r);
      return acc;
    },
    {}
  );

  return (
    <div className="flex flex-col gap-10">
      <h2 className="text-2xl font-bold">Progreso de {nino.nombre}</h2>

      {Object.entries(porActividad).map(([actividad, semanas]) => {
        const mejor = Math.max(...semanas.map((s) => s.mejor_porcentaje ?? 0));
        const totalIntentos = semanas.reduce((s, r) => s + Number(r.intentos), 0);
        const pctMedio =
          semanas.reduce((s, r) => s + Number(r.porcentaje_medio ?? 0), 0) /
          semanas.length;

        return (
          <div
            key={actividad}
            className="rounded-3xl p-6"
            style={{ background: "rgba(255,255,255,0.7)", boxShadow: "0 4px 0 rgba(42,77,105,.08)" }}
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="text-4xl">{EMOJIS[actividad] ?? "✏️"}</span>
              <div>
                <h3 className="text-xl font-bold">
                  {NOMBRES_ACTIVIDAD[actividad] ?? actividad}
                </h3>
                <p className="text-sm" style={{ color: "#8AA7BC" }}>
                  {totalIntentos} intentos
                </p>
              </div>
            </div>

            {/* Resumen general */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Stat label="Mejor marca" value={`${mejor.toFixed(1)}%`} emoji="🏆" />
              <Stat label="% medio" value={`${pctMedio.toFixed(1)}%`} emoji="📈" />
              <Stat label="Total intentos" value={String(totalIntentos)} emoji="🔄" />
            </div>

            {/* Tabla por semana */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ borderCollapse: "separate", borderSpacing: "0 6px" }}>
                <thead>
                  <tr style={{ color: "#8AA7BC" }}>
                    <th className="text-left pb-2 px-3">Semana</th>
                    <th className="text-right pb-2 px-3">Intentos</th>
                    <th className="text-right pb-2 px-3">% medio</th>
                    <th className="text-right pb-2 px-3">Mejor</th>
                    <th className="text-right pb-2 px-3">Tiempo med.</th>
                    <th className="text-right pb-2 px-3">Pausas med.</th>
                  </tr>
                </thead>
                <tbody>
                  {[...semanas]
                    .sort(
                      (a, b) =>
                        new Date(b.semana).getTime() - new Date(a.semana).getTime()
                    )
                    .map((s) => (
                      <tr
                        key={String(s.semana)}
                        style={{ background: "rgba(255,255,255,0.5)", borderRadius: 12 }}
                      >
                        <td className="px-3 py-2 rounded-l-xl">
                          {formatSemana(s.semana)}
                        </td>
                        <td className="px-3 py-2 text-right">{s.intentos}</td>
                        <td className="px-3 py-2 text-right font-semibold">
                          {Number(s.porcentaje_medio).toFixed(1)}%
                        </td>
                        <td className="px-3 py-2 text-right" style={{ color: "#5BCB77" }}>
                          {Number(s.mejor_porcentaje).toFixed(1)}%
                        </td>
                        <td className="px-3 py-2 text-right">
                          {Number(s.segundos_medios).toFixed(0)} s
                        </td>
                        <td className="px-3 py-2 text-right rounded-r-xl">
                          {Number(s.levantamientos_medios).toFixed(1)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Stat({ label, value, emoji }: { label: string; value: string; emoji: string }) {
  return (
    <div
      className="rounded-2xl p-4 text-center"
      style={{ background: "rgba(234,246,255,0.8)" }}
    >
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
