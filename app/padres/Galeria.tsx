"use client";

interface MiniaturaMeta {
  id: string;
  trazo_miniatura: string;
  creado_en: string;
  actividad_id: string;
  completado: boolean;
}

interface GaleriaProps {
  miniaturas: MiniaturaMeta[];
}

export default function Galeria({ miniaturas }: GaleriaProps) {
  if (miniaturas.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-4xl mb-4">🖼️</p>
        <p className="text-xl">La galería está vacía.</p>
        <p className="mt-2" style={{ color: "#8AA7BC" }}>
          Aquí aparecerán los trazos guardados.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Galería de trazos</h2>
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
        {miniaturas.map((m) => (
          <div
            key={m.id}
            className="rounded-2xl overflow-hidden"
            style={{
              background: "#fff",
              boxShadow: "0 4px 0 rgba(42,77,105,.08)",
              border: m.completado ? "3px solid #5BCB77" : "3px solid #BFE0F2",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={m.trazo_miniatura}
              alt={`Trazo del ${formatFecha(m.creado_en)}`}
              className="w-full aspect-video object-contain"
              style={{ background: "#EAF6FF" }}
            />
            <div className="px-2 py-1 text-center">
              <span className="text-xs" style={{ color: "#8AA7BC" }}>
                {formatFecha(m.creado_en)}
              </span>
              {m.completado && (
                <span className="ml-1 text-xs" style={{ color: "#5BCB77" }}>
                  ✓
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}
