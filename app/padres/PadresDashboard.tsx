"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { Nino, ResumenProgreso } from "@/lib/types";
import type { User } from "@supabase/supabase-js";
import PanelUsuarias from "./PanelUsuarias";
import PanelAdmins from "./PanelAdmins";
import PanelRendimiento from "./PanelRendimiento";

interface Admin {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
}

interface PadresDashboardProps {
  user: User;
  ninos: Nino[];
  progreso: ResumenProgreso[];
  admins: Admin[];
}

type Tab = "usuarias" | "admins" | "rendimiento";

const TABS: { id: Tab; emoji: string; label: string }[] = [
  { id: "usuarias",    emoji: "👧", label: "Usuarias" },
  { id: "admins",      emoji: "👑", label: "Administradores" },
  { id: "rendimiento", emoji: "📊", label: "Rendimiento" },
];

export default function PadresDashboard({ user, ninos, progreso, admins }: PadresDashboardProps) {
  const [tab, setTab] = useState<Tab>("usuarias");

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: "radial-gradient(circle at 15% 10%, #FFF7DE 0%, transparent 28%), radial-gradient(circle at 88% 85%, #DFF3E4 0%, transparent 30%), #EAF6FF",
        fontFamily: "ui-rounded, 'Arial Rounded MT Bold', 'Trebuchet MS', system-ui, sans-serif",
        color: "#2A4D69",
      }}
    >
      {/* Cabecera */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 gap-4"
        style={{ background: "rgba(234,246,255,0.95)", borderBottom: "1.5px solid #BFE0F2", backdropFilter: "blur(8px)" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">🌈</span>
          <div>
            <h1 className="text-xl font-bold leading-tight">Zona de padres</h1>
            <p className="text-xs" style={{ color: "#8AA7BC" }}>{user.email}</p>
          </div>
        </div>
        <button
          className="btn-padres peligro"
          style={{ fontSize: 14, padding: "8px 18px" }}
          onClick={handleLogout}
        >
          Salir
        </button>
      </header>

      {/* Pestañas */}
      <div className="sticky z-10 px-4 py-3 flex gap-2 overflow-x-auto"
        style={{ top: 73, background: "rgba(234,246,255,0.92)", borderBottom: "1.5px solid #BFE0F2", backdropFilter: "blur(8px)" }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex items-center gap-2 rounded-2xl px-5 py-2 text-sm font-bold whitespace-nowrap transition-all"
            style={{
              background: tab === t.id ? "#2A4D69" : "rgba(255,255,255,0.7)",
              color: tab === t.id ? "#fff" : "#2A4D69",
              boxShadow: tab === t.id ? "0 3px 0 rgba(42,77,105,.25)" : "0 2px 0 rgba(42,77,105,.08)",
              border: "none",
              cursor: "pointer",
            }}
          >
            <span>{t.emoji}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Contenido */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {tab === "usuarias" && (
          <PanelUsuarias ninos={ninos} userId={user.id} />
        )}
        {tab === "admins" && (
          <PanelAdmins admins={admins} currentUserId={user.id} />
        )}
        {tab === "rendimiento" && (
          <PanelRendimiento ninos={ninos} progreso={progreso} />
        )}
      </main>
    </div>
  );
}
