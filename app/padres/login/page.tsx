"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modo, setModo] = useState<"login" | "registro">("login");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError("");
    setExito("");
    const supabase = createClient();

    if (modo === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError("Email o contraseña incorrectos");
      } else {
        window.location.href = "/padres";
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setExito("¡Cuenta creada! Revisa tu email para confirmarla.");
      }
    }
    setCargando(false);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background:
          "radial-gradient(circle at 15% 10%, #FFF7DE 0%, transparent 28%), radial-gradient(circle at 88% 85%, #DFF3E4 0%, transparent 30%), #EAF6FF",
        fontFamily:
          "ui-rounded, 'Arial Rounded MT Bold', 'Trebuchet MS', system-ui, sans-serif",
      }}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-8"
        style={{
          background: "rgba(255,255,255,0.9)",
          boxShadow: "0 8px 0 rgba(42,77,105,.1)",
        }}
      >
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🌈</div>
          <h1 className="text-2xl font-bold" style={{ color: "#2A4D69" }}>
            Zona de padres
          </h1>
          <p className="text-sm mt-1" style={{ color: "#8AA7BC" }}>
            Caminitos · Grafomotricidad
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            className="campo"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoCapitalize="none"
          />
          <input
            className="campo"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          <button
            type="submit"
            className="btn-padres primario"
            disabled={cargando}
          >
            {cargando
              ? "Cargando…"
              : modo === "login"
              ? "Entrar"
              : "Crear cuenta"}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-center text-sm font-semibold" style={{ color: "#E8604F" }}>
            {error}
          </p>
        )}
        {exito && (
          <p className="mt-4 text-center text-sm font-semibold" style={{ color: "#5BCB77" }}>
            {exito}
          </p>
        )}

        <button
          className="w-full mt-5 text-sm text-center"
          style={{ color: "#8AA7BC", background: "none", border: "none", cursor: "pointer" }}
          onClick={() => {
            setModo(modo === "login" ? "registro" : "login");
            setError("");
            setExito("");
          }}
        >
          {modo === "login"
            ? "¿No tienes cuenta? Regístrate"
            : "¿Ya tienes cuenta? Entra aquí"}
        </button>
      </div>
    </div>
  );
}
