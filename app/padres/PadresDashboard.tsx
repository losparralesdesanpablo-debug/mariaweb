"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { Nino, ResumenProgreso, ConfiguracionNino } from "@/lib/types";
import { CONFIG_DEFAULT } from "@/lib/types";
import type { User } from "@supabase/supabase-js";
import NinoForm from "./NinoForm";
import ProgressPanel from "./ProgressPanel";
import Galeria from "./Galeria";
import AjustesPanel from "./AjustesPanel";

interface MiniaturaMeta {
  id: string;
  trazo_miniatura: string;
  creado_en: string;
  actividad_id: string;
  completado: boolean;
}

interface PadresDashboardProps {
  user: User;
  ninos: Nino[];
  progreso: ResumenProgreso[];
  miniaturas: MiniaturaMeta[];
}

type Tab = "progreso" | "galeria" | "ajustes" | "nino";

export default function PadresDashboard({
  user,
  ninos,
  progreso,
  miniaturas,
}: PadresDashboardProps) {
  const [tab, setTab] = useState<Tab>(ninos.length === 0 ? "nino" : "progreso");
  const [listaIds] = useState(ninos.map((n) => n.id));
  const ninoActual = ninos[0] ?? null;

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div
      className="min-h-screen overflow-auto"
      style={{
        background:
          "radial-gradient(circle at 15% 10%, #FFF7DE 0%, transparent 28%), radial-gradient(circle at 88% 85%, #DFF3E4 0%, transparent 30%), #EAF6FF",
        fontFamily:
          "ui-rounded, 'Arial Rounded MT Bold', 'Trebuchet MS', system-ui, sans-serif",
        color: "#2A4D69",
      }}
    >
      {/* Cabecera */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 gap-4 border-b"
        style={{ background: "rgba(234,246,255,0.92)", borderColor: "#BFE0F2", backdropFilter: "blur(8px)" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">🌈</span>
          <div>
            <h1 className="text-xl font-bold">Zona de padres</h1>
            {ninoActual && (
              <p className="text-sm" style={{ color: "#8AA7BC" }}>
                {ninoActual.nombre}
              </p>
            )}
          </div>
        </div>

        <nav className="flex gap-2">
          {(["progreso", "galeria", "ajustes", "nino"] as Tab[]).map((t) => {
            const labels: Record<Tab, string> = {
              progreso: "📊",
              galeria: "🖼️",
              ajustes: "⚙️",
              nino: "👤",
            };
            return (
              <button
                key={t}
                className="boton"
                style={{
                  background: tab === t ? "#FFC93D" : "#fff",
                  width: 60,
                  height: 60,
                  fontSize: 26,
                  borderRadius: 18,
                }}
                onClick={() => setTab(t)}
                aria-label={t}
              >
                {labels[t]}
              </button>
            );
          })}
          <button
            className="btn-padres peligro"
            style={{ fontSize: 15, padding: "8px 16px", minHeight: 60 }}
            onClick={handleLogout}
          >
            Salir
          </button>
        </nav>
      </header>

      {/* Contenido */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {tab === "progreso" && ninoActual && (
          <ProgressPanel progreso={progreso} nino={ninoActual} />
        )}
        {tab === "galeria" && <Galeria miniaturas={miniaturas} />}
        {tab === "ajustes" && ninoActual && (
          <AjustesPanel nino={ninoActual} />
        )}
        {tab === "nino" && (
          <NinoForm nino={ninoActual} userId={user.id} />
        )}
        {!ninoActual && tab !== "nino" && (
          <div className="text-center py-20">
            <p className="text-xl mb-4">Primero crea el perfil de la niña 👤</p>
            <button className="btn-padres primario" onClick={() => setTab("nino")}>
              Crear perfil
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
