"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";

interface Admin {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
}

interface Props {
  admins: Admin[];
  currentUserId: string;
}

export default function PanelAdmins({ admins: inicial, currentUserId }: Props) {
  const [admins, setAdmins] = useState<Admin[]>(inicial);
  const [email, setEmail]   = useState("");
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg]       = useState("");

  async function invitar() {
    if (!email.trim()) return;
    setEnviando(true);
    setMsg("");
    const supabase = createClient();
    // Invitación por Magic Link — el usuario recibe email y accede directamente
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}/padres` },
    });
    if (error) {
      setMsg("Error al enviar la invitación: " + error.message);
    } else {
      setMsg(`Invitación enviada a ${email.trim()}`);
      setEmail("");
    }
    setEnviando(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold">👑 Administradores</h2>
      <p className="text-sm" style={{ color: "#8AA7BC" }}>
        Los administradores pueden acceder a la zona de padres y ver el progreso de todas las usuarias.
      </p>

      {/* Invitar */}
      <div className="rounded-3xl p-6 flex flex-col gap-4"
        style={{ background: "rgba(255,255,255,0.9)", boxShadow: "0 4px 0 rgba(42,77,105,.1)" }}>
        <h3 className="text-lg font-bold">Invitar nuevo administrador</h3>
        <p className="text-sm" style={{ color: "#8AA7BC" }}>
          Se enviará un enlace mágico al email indicado. La primera vez que acceda, la cuenta queda creada automáticamente.
        </p>
        <div className="flex gap-3">
          <input
            className="campo flex-1"
            type="email"
            placeholder="email@ejemplo.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && invitar()}
          />
          <button className="btn-padres primario" style={{ padding: "0 24px" }}
            onClick={invitar} disabled={enviando || !email.trim()}>
            {enviando ? "Enviando…" : "Invitar"}
          </button>
        </div>
        {msg && (
          <p className="text-sm font-semibold"
            style={{ color: msg.startsWith("Error") ? "#E8604F" : "#5BCB77" }}>{msg}</p>
        )}
      </div>

      {/* Lista de admins actuales */}
      <div className="flex flex-col gap-3">
        {admins.length === 0 && (
          <div className="text-center py-12 rounded-3xl" style={{ background: "rgba(255,255,255,0.6)" }}>
            <p className="text-4xl mb-2">👑</p>
            <p className="text-lg font-semibold">Solo tú tienes acceso</p>
          </div>
        )}
        {admins.map(a => (
          <div key={a.id} className="rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
            style={{ background: "rgba(255,255,255,0.8)", boxShadow: "0 2px 0 rgba(42,77,105,.07)" }}>
            <div className="flex items-center gap-4 min-w-0">
              <div className="text-3xl flex-shrink-0">
                {a.id === currentUserId ? "👑" : "👤"}
              </div>
              <div className="min-w-0">
                <p className="font-bold truncate">{a.email}</p>
                <p className="text-sm" style={{ color: "#8AA7BC" }}>
                  {a.id === currentUserId && <span className="font-semibold" style={{ color: "#FFC93D" }}>Tú · </span>}
                  Último acceso: {a.last_sign_in_at
                    ? new Date(a.last_sign_in_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
                    : "nunca"}
                </p>
              </div>
            </div>
            {a.id !== currentUserId && (
              <span className="text-xs px-3 py-1 rounded-full font-semibold"
                style={{ background: "#EAF6FF", color: "#8AA7BC" }}>Admin</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
