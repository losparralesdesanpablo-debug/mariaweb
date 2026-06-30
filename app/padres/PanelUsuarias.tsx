"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { Nino, ConfiguracionNino, JuegoId } from "@/lib/types";
import { CONFIG_DEFAULT, JUEGOS_CATALOGO } from "@/lib/types";

interface Props {
  ninos: Nino[];
  userId: string;
}

const VACIA: Partial<Nino> = { nombre: "", fecha_nacimiento: "" };

export default function PanelUsuarias({ ninos: inicial, userId }: Props) {
  const [ninos, setNinos]       = useState<Nino[]>(inicial);
  const [editando, setEditando] = useState<Nino | null>(null);
  const [creando, setCreando]   = useState(false);
  const [nombre, setNombre]     = useState("");
  const [fechaNac, setFechaNac] = useState("");
  const [pin, setPin]           = useState("");
  const [notas, setNotas]       = useState("");
  const [cfg, setCfg]           = useState<ConfiguracionNino>(CONFIG_DEFAULT);
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg]           = useState("");
  const [confirmBorrar, setConfirmBorrar] = useState<string | null>(null);

  function abrirCrear() {
    setEditando(null);
    setNombre("");
    setFechaNac("");
    setPin("");
    setNotas("");
    setCfg(CONFIG_DEFAULT);
    setMsg("");
    setCreando(true);
  }

  function abrirEditar(n: Nino) {
    setCreando(false);
    setNombre(n.nombre);
    setFechaNac(n.fecha_nacimiento ?? "");
    setPin(n.pin ?? "");
    setNotas(n.notas ?? "");
    setCfg({ ...CONFIG_DEFAULT, ...n.configuracion });
    setMsg("");
    setEditando(n);
  }

  function cerrar() { setCreando(false); setEditando(null); setMsg(""); }

  async function guardar() {
    if (!nombre.trim()) return;
    setGuardando(true);
    setMsg("");
    const supabase = createClient();

    if (editando) {
      const { error } = await supabase.from("ninos").update({
        nombre: nombre.trim(),
        fecha_nacimiento: fechaNac || null,
        configuracion: cfg,
        pin: pin.trim() || null,
        notas: notas.trim() || null,
      }).eq("id", editando.id);
      if (error) { setMsg("Error al guardar"); }
      else {
        setNinos(ns => ns.map(n => n.id === editando.id
          ? { ...n, nombre: nombre.trim(), fecha_nacimiento: fechaNac || null, configuracion: cfg, pin: pin.trim() || null, notas: notas.trim() || null }
          : n));
        setMsg("¡Guardado!");
        setTimeout(cerrar, 800);
      }
    } else {
      const { data, error } = await supabase.from("ninos").insert({
        adulto_id: userId,
        nombre: nombre.trim(),
        fecha_nacimiento: fechaNac || null,
        configuracion: cfg,
        pin: pin.trim() || null,
        notas: notas.trim() || null,
      }).select().single();
      if (error) { setMsg("Error al crear"); }
      else {
        setNinos(ns => [...ns, data as Nino]);
        setMsg("¡Usuaria creada!");
        setTimeout(cerrar, 800);
      }
    }
    setGuardando(false);
  }

  async function borrar(id: string) {
    const supabase = createClient();
    await supabase.from("ninos").delete().eq("id", id);
    setNinos(ns => ns.filter(n => n.id !== id));
    setConfirmBorrar(null);
  }

  const formularioAbierto = creando || editando !== null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">👧 Usuarias</h2>
        <button className="btn-padres primario" style={{ padding: "10px 20px" }} onClick={abrirCrear}>
          + Nueva usuaria
        </button>
      </div>

      {/* Formulario crear / editar */}
      {formularioAbierto && (
        <div className="rounded-3xl p-6 flex flex-col gap-5"
          style={{ background: "rgba(255,255,255,0.9)", boxShadow: "0 4px 0 rgba(42,77,105,.1)" }}>
          <h3 className="text-xl font-bold">{editando ? `Editar — ${editando.nombre}` : "Nueva usuaria"}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="campo-label">NOMBRE</label>
              <input className="campo" type="text" placeholder="Nombre" value={nombre}
                onChange={e => setNombre(e.target.value)} />
            </div>
            <div>
              <label className="campo-label">FECHA DE NACIMIENTO</label>
              <input className="campo" type="date" value={fechaNac}
                onChange={e => setFechaNac(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="campo-label">PIN DE ACCESO (solo números)</label>
            <div className="flex items-center gap-3">
              <input
                className="campo"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="Ej: 1234  (dejar vacío = sin PIN)"
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, ""))}
                style={{ maxWidth: 280 }}
              />
              {pin && (
                <button type="button" onClick={() => setPin("")}
                  style={{ color: "#E8604F", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>
                  Quitar PIN
                </button>
              )}
            </div>
            <p className="text-xs mt-1" style={{ color: "#8AA7BC" }}>
              Si dejas el PIN vacío, la app abre directamente sin pedir código.
            </p>
          </div>

          <div>
            <label className="campo-label">NOTAS (opcional)</label>
            <textarea
              className="campo"
              rows={3}
              placeholder="Ej: Le cuesta mantener la atención más de 10 minutos. Prefiere los ejercicios con colores vivos…"
              value={notas}
              onChange={e => setNotas(e.target.value)}
              style={{ resize: "vertical", minHeight: 80 }}
            />
          </div>

          {/* Ajustes rápidos */}
          <div className="rounded-2xl p-4 flex flex-col gap-3"
            style={{ background: "rgba(234,246,255,0.6)" }}>
            <p className="font-bold text-sm" style={{ color: "#8AA7BC" }}>CONFIGURACIÓN</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SliderField label="Tolerancia trazo" min={20} max={100} unit="px"
                value={cfg.tolerancia_px} onChange={v => setCfg(c => ({ ...c, tolerancia_px: v }))} />
              <SliderField label="% para completar" min={50} max={100} unit="%"
                value={cfg.porcentaje_para_completar} onChange={v => setCfg(c => ({ ...c, porcentaje_para_completar: v }))} />
              <SliderField label="🎬 Juegos para premio" min={1} max={20} unit=""
                value={cfg.juegos_para_premio ?? 5} onChange={v => setCfg(c => ({ ...c, juegos_para_premio: v }))} />
            </div>
            <div className="flex gap-6 mt-1">
              <Toggle label="🔊 Sonido" value={cfg.sonido} onChange={v => setCfg(c => ({ ...c, sonido: v }))} />
              <Toggle label="🗣️ Voz" value={cfg.voz} onChange={v => setCfg(c => ({ ...c, voz: v }))} />
            </div>
          </div>

          {/* Juegos disponibles */}
          <div className="rounded-2xl p-4 flex flex-col gap-3"
            style={{ background: "rgba(234,246,255,0.6)" }}>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="font-bold text-sm" style={{ color: "#8AA7BC" }}>JUEGOS DISPONIBLES</p>
              <div className="flex gap-2">
                <button type="button"
                  className="btn-padres secundario"
                  style={{ padding: "4px 12px", fontSize: 12 }}
                  onClick={() => setCfg(c => ({
                    ...c,
                    juegos_activos: Object.fromEntries(JUEGOS_CATALOGO.map(j => [j.id, true])) as Record<JuegoId, boolean>,
                  }))}>
                  Activar todos
                </button>
                <button type="button"
                  className="btn-padres secundario"
                  style={{ padding: "4px 12px", fontSize: 12 }}
                  onClick={() => setCfg(c => ({
                    ...c,
                    juegos_activos: Object.fromEntries(JUEGOS_CATALOGO.map(j => [j.id, false])) as Record<JuegoId, boolean>,
                  }))}>
                  Desactivar todos
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {JUEGOS_CATALOGO.map(juego => {
                const activo = cfg.juegos_activos?.[juego.id] !== false;
                const nivel  = cfg.juegos_nivel?.[juego.id] ?? 1;
                return (
                  <div key={juego.id}
                    className="flex items-center gap-3 rounded-xl px-3 py-2"
                    style={{ background: activo ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.35)" }}>

                    {/* Toggle activo */}
                    <div
                      className="cursor-pointer flex-shrink-0"
                      onClick={() => setCfg(c => ({
                        ...c,
                        juegos_activos: {
                          ...(c.juegos_activos ?? {}),
                          [juego.id]: !activo,
                        } as Record<JuegoId, boolean>,
                      }))}
                    >
                      <div style={{
                        width: 40, height: 24, borderRadius: 12,
                        background: activo ? "#5BCB77" : "#BFE0F2",
                        position: "relative", transition: "background .2s", flexShrink: 0,
                      }}>
                        <span style={{
                          position: "absolute", top: 2, left: activo ? 18 : 2,
                          width: 20, height: 20, borderRadius: "50%", background: "#fff",
                          boxShadow: "0 1px 3px rgba(0,0,0,.15)", transition: "left .2s",
                        }} />
                      </div>
                    </div>

                    {/* Emoji + nombre */}
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{juego.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold"
                        style={{ color: activo ? "#2A4D69" : "#8AA7BC" }}>
                        {juego.label}
                      </span>
                      <span className="text-xs ml-2" style={{ color: "#B0C8D8" }}>
                        +{juego.edadMin} años
                      </span>
                    </div>

                    {/* Selector nivel (solo si tiene dificultad) */}
                    {juego.tieneDificultad && (
                      <div className="flex gap-1 flex-shrink-0">
                        {([1, 2, 3] as const).map(n => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setCfg(c => ({
                              ...c,
                              juegos_nivel: {
                                ...(c.juegos_nivel ?? {}),
                                [juego.id]: n,
                              } as Record<JuegoId, 1 | 2 | 3>,
                            }))}
                            style={{
                              width: 30, height: 30, borderRadius: 8, border: "none",
                              fontSize: 13, fontWeight: 800, cursor: "pointer",
                              background: nivel === n ? "#2A4D69" : "rgba(255,255,255,0.7)",
                              color: nivel === n ? "#fff" : "#8AA7BC",
                              boxShadow: nivel === n ? "0 2px 0 rgba(42,77,105,.25)" : "none",
                              opacity: activo ? 1 : 0.4,
                            }}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {msg && <p className="text-sm font-semibold text-center"
            style={{ color: msg.startsWith("Error") ? "#E8604F" : "#5BCB77" }}>{msg}</p>}

          <div className="flex gap-3 justify-end">
            <button className="btn-padres secundario" onClick={cerrar}>Cancelar</button>
            <button className="btn-padres primario" onClick={guardar} disabled={guardando || !nombre.trim()}>
              {guardando ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      {ninos.length === 0 && !formularioAbierto && (
        <div className="text-center py-16 rounded-3xl" style={{ background: "rgba(255,255,255,0.6)" }}>
          <p className="text-4xl mb-3">👧</p>
          <p className="text-lg font-semibold">No hay usuarias todavía</p>
          <p className="text-sm mt-1" style={{ color: "#8AA7BC" }}>Crea la primera con el botón de arriba</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {ninos.map(n => (
          <div key={n.id} className="rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
            style={{ background: "rgba(255,255,255,0.8)", boxShadow: "0 2px 0 rgba(42,77,105,.07)" }}>
            <div className="flex items-center gap-4 min-w-0">
              <div className="text-3xl flex-shrink-0">👧</div>
              <div className="min-w-0">
                <p className="font-bold text-lg truncate">{n.nombre}</p>
                <p className="text-sm" style={{ color: "#8AA7BC" }}>
                  {n.fecha_nacimiento
                    ? new Date(n.fecha_nacimiento).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
                    : "Sin fecha de nacimiento"}
                  {n.pin ? ` · PIN: ${"●".repeat(n.pin.length)}` : " · Sin PIN"}
                </p>
                {n.notas && (
                  <p className="text-sm mt-1 line-clamp-2" style={{ color: "#5A7A96", fontStyle: "italic" }}>
                    {n.notas}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button className="btn-padres secundario" style={{ padding: "8px 16px", fontSize: 14 }}
                onClick={() => abrirEditar(n)}>✏️ Editar</button>
              {confirmBorrar === n.id ? (
                <>
                  <button className="btn-padres peligro" style={{ padding: "8px 16px", fontSize: 14 }}
                    onClick={() => borrar(n.id)}>Confirmar</button>
                  <button className="btn-padres secundario" style={{ padding: "8px 16px", fontSize: 14 }}
                    onClick={() => setConfirmBorrar(null)}>No</button>
                </>
              ) : (
                <button className="btn-padres peligro" style={{ padding: "8px 16px", fontSize: 14 }}
                  onClick={() => setConfirmBorrar(n.id)}>🗑️</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SliderField({ label, min, max, unit, value, onChange }: {
  label: string; min: number; max: number; unit: string; value: number; onChange: (v: number) => void;
}) {
  return (
    <div>
      <p className="text-sm font-semibold mb-1">{label}</p>
      <div className="flex items-center gap-3">
        <input type="range" min={min} max={max} value={value}
          onChange={e => onChange(Number(e.target.value))} className="flex-1" />
        <span className="font-bold w-14 text-right">{value}{unit}</span>
      </div>
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3 cursor-pointer" onClick={() => onChange(!value)}>
      <div style={{
        width: 48, height: 28, borderRadius: 14, border: "none",
        background: value ? "#5BCB77" : "#BFE0F2",
        position: "relative", transition: "background .2s", flexShrink: 0,
      }}>
        <span style={{
          position: "absolute", top: 3, left: value ? 22 : 3,
          width: 22, height: 22, borderRadius: "50%", background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,.15)", transition: "left .2s",
        }} />
      </div>
      <span className="text-sm font-semibold">{label}</span>
    </div>
  );
}
