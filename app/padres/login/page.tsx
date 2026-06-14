"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modo, setModo] = useState<"login" | "registro">("login");
  const [cargando, setCargando] = useState(false);
  const [cargandoGoogle, setCargandoGoogle] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  async function handleGoogle() {
    setCargandoGoogle(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    if (error) {
      setError("No se pudo conectar con Google");
      setCargandoGoogle(false);
    }
    // Si no hay error, el browser redirige sólo a Google
  }

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

        {/* Botón Google */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={cargandoGoogle}
          className="w-full flex items-center justify-center gap-3 rounded-2xl font-semibold text-base"
          style={{
            background: "white",
            border: "2px solid #e2e8f0",
            padding: "14px 20px",
            color: "#374151",
            cursor: "pointer",
            boxShadow: "0 2px 0 rgba(0,0,0,.06)",
            marginBottom: 4,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M47.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h13.2c-.6 3-2.3 5.5-4.9 7.2v6h7.9c4.6-4.3 7.3-10.5 7.3-17.2z"/>
            <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.9-6c-2.2 1.5-5 2.3-8 2.3-6.1 0-11.3-4.1-13.2-9.7H2.7v6.2C6.6 42.8 14.7 48 24 48z"/>
            <path fill="#FBBC05" d="M10.8 28.8A14.7 14.7 0 0 1 10.2 24c0-1.7.3-3.3.6-4.8V13H2.7A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.7 10.8l8.1-6z"/>
            <path fill="#EA4335" d="M24 9.5c3.4 0 6.5 1.2 8.9 3.5l6.6-6.6C35.9 2.4 30.4 0 24 0 14.7 0 6.6 5.2 2.7 13l8.1 6.2C12.7 13.6 17.9 9.5 24 9.5z"/>
          </svg>
          {cargandoGoogle ? "Redirigiendo…" : "Entrar con Google"}
        </button>

        {/* Separador */}
        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px" style={{ background: "#e2e8f0" }} />
          <span className="text-xs" style={{ color: "#8AA7BC" }}>o con email</span>
          <div className="flex-1 h-px" style={{ background: "#e2e8f0" }} />
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
