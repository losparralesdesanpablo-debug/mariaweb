"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { Nino } from "@/lib/types";

interface NinoFormProps {
  nino: Nino | null;
  userId: string;
}

export default function NinoForm({ nino, userId }: NinoFormProps) {
  const [nombre, setNombre] = useState(nino?.nombre ?? "");
  const [fechaNac, setFechaNac] = useState(nino?.fecha_nacimiento ?? "");
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setMsg("");
    const supabase = createClient();

    if (nino) {
      const { error } = await supabase
        .from("ninos")
        .update({ nombre, fecha_nacimiento: fechaNac || null })
        .eq("id", nino.id);
      setMsg(error ? "Error al guardar" : "¡Guardado!");
    } else {
      const { error } = await supabase.from("ninos").insert({
        adulto_id: userId,
        nombre,
        fecha_nacimiento: fechaNac || null,
      });
      if (!error) {
        setMsg("¡Perfil creado! Recarga la página.");
      } else {
        setMsg("Error al crear perfil");
      }
    }
    setGuardando(false);
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        {nino ? "Perfil de la niña" : "Crear perfil"}
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "#8AA7BC" }}>
            NOMBRE
          </label>
          <input
            className="campo"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre de la niña"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "#8AA7BC" }}>
            FECHA DE NACIMIENTO
          </label>
          <input
            className="campo"
            type="date"
            value={fechaNac}
            onChange={(e) => setFechaNac(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="btn-padres primario"
          disabled={guardando}
        >
          {guardando ? "Guardando…" : nino ? "Guardar cambios" : "Crear perfil"}
        </button>
        {msg && (
          <p
            className="text-center font-semibold"
            style={{ color: msg.startsWith("Error") ? "#E8604F" : "#5BCB77" }}
          >
            {msg}
          </p>
        )}
      </form>
    </div>
  );
}
