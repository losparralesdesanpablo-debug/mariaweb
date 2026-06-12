"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import TrazoCanvas from "./TrazoCanvas";
import { setNinoId, iniciarReintentoCola } from "@/lib/trazo-store";
import type { Actividad, ConfiguracionNino } from "@/lib/types";

interface ZonaNinaProps {
  actividades: Actividad[];
  config: ConfiguracionNino;
  ninoId: string | null;
}

export default function ZonaNina({ actividades, config, ninoId }: ZonaNinaProps) {
  const router = useRouter();
  const timerPadresRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [actividadIdMap] = useState<Map<string, string>>(() => {
    const m = new Map<string, string>();
    for (const a of actividades) m.set(a.codigo, a.id);
    return m;
  });

  useEffect(() => {
    if (ninoId) setNinoId(ninoId);
    iniciarReintentoCola();
  }, [ninoId]);

  // Botón oculto de 3 segundos para ir a la zona de padres
  function iniciarLargoPadres() {
    timerPadresRef.current = setTimeout(() => {
      router.push("/padres");
    }, 3000);
  }

  function cancelarLargoPadres() {
    if (timerPadresRef.current) {
      clearTimeout(timerPadresRef.current);
      timerPadresRef.current = null;
    }
  }

  function actividadId(codigo: string): string {
    return actividadIdMap.get(codigo) ?? "";
  }

  // Fallback si no hay actividades (Supabase no configurado aún)
  const actividadesFallback: Actividad[] =
    actividades.length > 0
      ? actividades
      : [
          { id: "demo-1", codigo: "trazo_ondulado", tipo: "trazo", titulo: "Camino ondulado", nivel: 1, activa: true, datos: { forma: "onda" } },
          { id: "demo-2", codigo: "trazo_montanas", tipo: "trazo", titulo: "Las montañas", nivel: 2, activa: true, datos: { forma: "zigzag" } },
          { id: "demo-3", codigo: "trazo_circulo", tipo: "trazo", titulo: "El círculo", nivel: 3, activa: true, datos: { forma: "circulo" } },
        ];

  return (
    <>
      <TrazoCanvas
        actividades={actividadesFallback}
        config={config}
        actividadId={actividadId}
      />

      {/* Botón discreto esquina inferior izquierda: mantener 3s para ir a /padres */}
      <button
        className="fixed bottom-0 left-0 z-50 opacity-0"
        style={{ width: 78, height: 78, touchAction: "none" }}
        aria-label="Zona de padres"
        onPointerDown={iniciarLargoPadres}
        onPointerUp={cancelarLargoPadres}
        onPointerLeave={cancelarLargoPadres}
        onPointerCancel={cancelarLargoPadres}
      />
    </>
  );
}
