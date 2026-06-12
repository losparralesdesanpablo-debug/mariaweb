"use client";

import { createClient } from "./supabase-browser";
import type { Intento, Sesion, ConfiguracionNino, CONFIG_DEFAULT } from "./types";

const SESION_DURACION_MS = 30 * 60 * 1000;

let sesionActiva: Sesion | null = null;
let ninoId: string | null = null;
const colaOffline: Intento[] = [];
let flushingCola = false;

export function setNinoId(id: string) {
  ninoId = id;
}

export function getNinoId() {
  return ninoId;
}

// Devuelve la sesión activa, creando una nueva si hace falta
export async function obtenerSesion(): Promise<string | null> {
  if (!ninoId) return null;

  // Reutilizar si existe y no ha expirado
  if (sesionActiva) {
    const hace = Date.now() - new Date(sesionActiva.inicio).getTime();
    if (hace < SESION_DURACION_MS) return sesionActiva.id;
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("sesiones")
      .insert({ nino_id: ninoId })
      .select()
      .single();

    if (error) throw error;
    sesionActiva = data as Sesion;
    return sesionActiva.id;
  } catch {
    return null;
  }
}

export async function guardarIntento(intento: Omit<Intento, "sesion_id">): Promise<void> {
  const sesionId = await obtenerSesion();

  const payload: Intento = {
    ...intento,
    sesion_id: sesionId ?? "__offline__",
  };

  if (!sesionId) {
    // Sin red o sin sesión: encolar para reintentar
    colaOffline.push(payload);
    return;
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.from("intentos").insert(payload);
    if (error) throw error;
    // Vaciar la cola si había intentos previos sin enviar
    void flushCola();
  } catch {
    colaOffline.push(payload);
  }
}

async function flushCola() {
  if (flushingCola || colaOffline.length === 0) return;
  flushingCola = true;

  const sesionId = await obtenerSesion();
  if (!sesionId) {
    flushingCola = false;
    return;
  }

  while (colaOffline.length > 0) {
    const intento = colaOffline[0];
    if (intento.sesion_id === "__offline__") {
      intento.sesion_id = sesionId;
    }
    try {
      const supabase = createClient();
      const { error } = await supabase.from("intentos").insert(intento);
      if (error) throw error;
      colaOffline.shift();
    } catch {
      break; // sin red, lo intentamos más tarde
    }
  }
  flushingCola = false;
}

// Reintento periódico de la cola (se llama desde el componente raíz)
export function iniciarReintentoCola() {
  setInterval(() => {
    if (colaOffline.length > 0) void flushCola();
  }, 15_000);
}
