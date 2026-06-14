"use client";

import { useState } from "react";
import MapaMundo from "./aventura/MapaMundo";
import Juego01Estrellas from "./aventura/Juego01Estrellas";
import Juego02Nubes from "./aventura/Juego02Nubes";
import Juego03Jardin from "./aventura/Juego03Jardin";
import Juego04Peces from "./aventura/Juego04Peces";
import Juego05Granja from "./aventura/Juego05Granja";
import Juego06Cocina from "./aventura/Juego06Cocina";
import Juego07Bosque from "./aventura/Juego07Bosque";
import Juego08Mar from "./aventura/Juego08Mar";
import Juego09Ciudad from "./aventura/Juego09Ciudad";
import Juego10Casa from "./aventura/Juego10Casa";
import { CelebracionEscena } from "./aventura/Piezas";

type Escena = "mapa" | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

const TITULOS: Record<number, string> = {
  1: "¡Despertaste la luna!",
  2: "¡Nubes de colores!",
  3: "¡El jardín floreció!",
  4: "¡Los peces nadan!",
  5: "¡Los animales hablan!",
  6: "¡La poción está lista!",
  7: "¡El bosque brilla!",
  8: "¡Encontraste el tesoro!",
  9: "¡La ciudad se iluminó!",
  10: "¡Casa de la Estrellita!",
};

export default function AventuraCanvas({
  sonido, voz, onVolver,
}: { sonido: boolean; voz: boolean; onVolver: () => void }) {
  const [escena, setEscena] = useState<Escena>("mapa");
  const [completadas, setCompletadas] = useState<Set<number>>(new Set());
  const [celebrando, setCelebrando] = useState<number | null>(null);

  function entrarEscena(n: number) {
    setEscena(n as Escena);
  }

  function completarEscena() {
    const n = escena as number;
    setCelebrando(n);
  }

  function siguienteEscena() {
    const n = celebrando!;
    setCompletadas(prev => new Set(prev).add(n));
    setCelebrando(null);
    setEscena("mapa");
  }

  const juegoProps = { sonido, voz, onCompletado: completarEscena };

  return (
    <div className="fixed inset-0" style={{ background: "#0A1628", touchAction: "none" }}>
      {/* Botón 🏠 */}
      <button
        className="boton"
        onClick={onVolver}
        style={{
          position: "fixed", top: 16, left: 16, zIndex: 40,
          background: "rgba(255,255,255,.15)", border: "none",
          fontSize: 32, borderRadius: 20, width: 60, height: 60,
          cursor: "pointer", color: "white",
        }}
        aria-label="Volver al menú"
      >
        🏠
      </button>

      {/* Botón saltar (solo en juegos, no en mapa) */}
      {escena !== "mapa" && celebrando === null && (
        <button
          onClick={completarEscena}
          style={{
            position: "fixed", top: 16, right: 16, zIndex: 40,
            background: "rgba(255,255,255,.15)", border: "2px solid rgba(255,255,255,.3)",
            fontSize: 13, fontWeight: 700, borderRadius: 16,
            padding: "8px 14px", cursor: "pointer", color: "white",
            fontFamily: "ui-rounded, system-ui, sans-serif",
          }}
          aria-label="Saltar escena"
        >
          ⏭ Saltar
        </button>
      )}

      {escena === "mapa" && (
        <MapaMundo
          completadas={completadas}
          onEntrar={entrarEscena}
        />
      )}
      {escena === 1  && <Juego01Estrellas {...juegoProps} />}
      {escena === 2  && <Juego02Nubes     {...juegoProps} />}
      {escena === 3  && <Juego03Jardin    {...juegoProps} />}
      {escena === 4  && <Juego04Peces     {...juegoProps} />}
      {escena === 5  && <Juego05Granja    {...juegoProps} />}
      {escena === 6  && <Juego06Cocina    {...juegoProps} />}
      {escena === 7  && <Juego07Bosque    {...juegoProps} />}
      {escena === 8  && <Juego08Mar       {...juegoProps} />}
      {escena === 9  && <Juego09Ciudad    {...juegoProps} />}
      {escena === 10 && <Juego10Casa      {...juegoProps} />}

      {celebrando !== null && (
        <CelebracionEscena
          titulo={TITULOS[celebrando]}
          onSiguiente={siguienteEscena}
        />
      )}
    </div>
  );
}
