"use client";

import { useEffect, useState } from "react";
import MenuInicio from "./MenuInicio";
import TrazoCanvas from "./TrazoCanvas";
import ColorearCanvas from "./ColorearCanvas";
import AventuraCanvas from "./AventuraCanvas";
import PantallaPIN from "./PantallaPIN";
import PuntosCanvas from "./PuntosCanvas";
import { setNinoId, iniciarReintentoCola } from "@/lib/trazo-store";
import { NUMEROS, VOCALES } from "@/lib/figuras";
import type { Actividad, ConfiguracionNino } from "@/lib/types";

type Modo = "pin" | "menu" | "trazos" | "colorear" | "aventura" | "numeros" | "vocales";

interface ZonaNinaProps {
  actividades: Actividad[];
  config: ConfiguracionNino;
  ninoId: string | null;
  ninoNombre: string;
  ninoPin: string | null;
}

export default function ZonaNina({ actividades, config, ninoId, ninoNombre, ninoPin }: ZonaNinaProps) {
  const [modo, setModo] = useState<Modo>(ninoPin ? "pin" : "menu");
  const [actividadIdMap] = useState<Map<string, string>>(() => {
    const m = new Map<string, string>();
    for (const a of actividades) m.set(a.codigo, a.id);
    return m;
  });

  useEffect(() => {
    if (ninoId) setNinoId(ninoId);
    iniciarReintentoCola();
  }, [ninoId]);

  function actividadId(codigo: string): string {
    return actividadIdMap.get(codigo) ?? "";
  }

  const actividadesFallback: Actividad[] =
    actividades.length > 0 ? actividades : [
      { id: "demo-1", codigo: "trazo_ondulado", tipo: "trazo", titulo: "Camino ondulado", nivel: 1, activa: true, datos: { forma: "onda" } },
      { id: "demo-2", codigo: "trazo_montanas", tipo: "trazo", titulo: "Las montañas",    nivel: 2, activa: true, datos: { forma: "zigzag" } },
      { id: "demo-3", codigo: "trazo_circulo",  tipo: "trazo", titulo: "El círculo",      nivel: 3, activa: true, datos: { forma: "circulo" } },
    ];

  if (modo === "pin" && ninoPin) {
    return (
      <PantallaPIN
        pin={ninoPin}
        nombre={ninoNombre}
        onAcceso={() => setModo("menu")}
      />
    );
  }
  if (modo === "menu") {
    return <MenuInicio onJuego={setModo} />;
  }
  if (modo === "trazos") {
    return (
      <TrazoCanvas
        actividades={actividadesFallback}
        config={config}
        actividadId={actividadId}
        onCambiarModo={() => setModo("menu")}
      />
    );
  }
  if (modo === "colorear") {
    return (
      <ColorearCanvas
        sonido={config.sonido}
        voz={config.voz}
        onCambiarModo={() => setModo("menu")}
      />
    );
  }
  if (modo === "numeros") {
    return (
      <PuntosCanvas
        figuras={NUMEROS}
        tipo="numeros"
        sonido={config.sonido}
        voz={config.voz}
        onVolver={() => setModo("menu")}
      />
    );
  }
  if (modo === "vocales") {
    return (
      <PuntosCanvas
        figuras={VOCALES}
        tipo="vocales"
        sonido={config.sonido}
        voz={config.voz}
        onVolver={() => setModo("menu")}
      />
    );
  }
  return (
    <AventuraCanvas
      sonido={config.sonido}
      voz={config.voz}
      onVolver={() => setModo("menu")}
    />
  );
}
