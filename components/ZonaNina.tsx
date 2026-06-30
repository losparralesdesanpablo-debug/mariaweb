"use client";

import { useEffect, useRef, useState } from "react";
import MenuInicio from "./MenuInicio";
import TrazoCanvas from "./TrazoCanvas";
import ColorearCanvas from "./ColorearCanvas";
import AventuraCanvas from "./AventuraCanvas";
import PantallaPIN from "./PantallaPIN";
import PantallaVideo from "./PantallaVideo";
import NumeroTrazoCanvas from "./NumeroTrazoCanvas";
import VocalTrazoCanvas from "./VocalTrazoCanvas";
import ContarCanvas from "./ContarCanvas";
import ReconocerCanvas from "./ReconocerCanvas";
import PronunciarCanvas from "./PronunciarCanvas";
import OrdenarCanvas from "./OrdenarCanvas";
import FaltaCanvas from "./FaltaCanvas";
import MasMenosCanvas from "./MasMenosCanvas";
import SumarCanvas from "./SumarCanvas";
import AntesDepuesCanvas from "./AntesDepuesCanvas";
import LecturaCanvas from "./LecturaCanvas";
import { setNinoId, iniciarReintentoCola } from "@/lib/trazo-store";
import type { Actividad, ConfiguracionNino, VideoPremio, Palabra, PalabraProgreso } from "@/lib/types";
import { CONFIG_DEFAULT } from "@/lib/types";

type Modo = "pin" | "menu" | "video" | "trazos" | "colorear" | "aventura" | "numeros" | "vocales" | "contar" | "escuchar_num" | "escuchar_voc" | "pronunciar" | "ordenar" | "falta" | "masomenos" | "sumar" | "antesdespues" | "lectura";

interface ZonaNinaProps {
  actividades: Actividad[];
  config: ConfiguracionNino;
  ninoId: string | null;
  ninoNombre: string;
  ninoPin: string | null;
  videos: VideoPremio[];
  palabras: Palabra[];
  palabrasProgreso: PalabraProgreso[];
}

const VIDEO_FALLBACK: VideoPremio = {
  id: "fallback",
  adulto_id: "",
  youtube_id: "GjeTkWJ3arc",
  titulo: "¡Premio!",
  orden: 1,
  activo: true,
};

function videosAleatorio(videos: VideoPremio[]): VideoPremio {
  const lista = videos.length > 0 ? videos : [VIDEO_FALLBACK];
  return lista[Math.floor(Math.random() * lista.length)];
}

export default function ZonaNina({ actividades, config, ninoId, ninoNombre, ninoPin, videos, palabras, palabrasProgreso }: ZonaNinaProps) {
  const [modo, setModo] = useState<Modo>(ninoPin ? "pin" : "menu");
  const [actividadIdMap] = useState<Map<string, string>>(() => {
    const m = new Map<string, string>();
    for (const a of actividades) m.set(a.codigo, a.id);
    return m;
  });
  const juegosPara = (config.juegos_para_premio ?? CONFIG_DEFAULT.juegos_para_premio) || 5;
  function nivel(id: string): 1 | 2 | 3 {
    return (config.juegos_nivel?.[id as keyof typeof config.juegos_nivel] ?? 1) as 1 | 2 | 3;
  }
  const contadorRef = useRef(0);
  const [contadorVisible, setContadorVisible] = useState(0);
  const [videoPremio, setVideoPremio] = useState<VideoPremio | null>(null);

  useEffect(() => {
    if (ninoId) setNinoId(ninoId);
    iniciarReintentoCola();
  }, [ninoId]);

  function actividadId(codigo: string): string {
    return actividadIdMap.get(codigo) ?? "";
  }

  // Llamar al completar un juego para incrementar el contador
  function juegoCompletado(completado: boolean) {
    if (completado) {
      contadorRef.current += 1;
      setContadorVisible(contadorRef.current);
    }
    if (contadorRef.current >= juegosPara) {
      contadorRef.current = 0;
      setContadorVisible(0);
      setVideoPremio(videosAleatorio(videos));
      setModo("video");
    } else {
      setModo("menu");
    }
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
  if (modo === "video" && videoPremio) {
    return (
      <PantallaVideo
        video={videoPremio}
        onCerrar={() => { setVideoPremio(null); setModo("menu"); }}
      />
    );
  }
  if (modo === "menu") {
    return <MenuInicio
      onJuego={setModo}
      contador={contadorVisible}
      umbral={juegosPara}
      onPremio={() => { contadorRef.current = 0; setContadorVisible(0); setVideoPremio(videosAleatorio(videos)); setModo("video"); }}
      juegosActivos={config.juegos_activos ?? {}}
    />;
  }
  if (modo === "trazos") {
    return (
      <TrazoCanvas
        actividades={actividadesFallback}
        config={config}
        actividadId={actividadId}
        onCambiarModo={juegoCompletado}
      />
    );
  }
  if (modo === "colorear") {
    return (
      <ColorearCanvas
        sonido={config.sonido}
        voz={config.voz}
        onCambiarModo={juegoCompletado}
      />
    );
  }
  if (modo === "numeros") {
    return (
      <NumeroTrazoCanvas
        config={config}
        onVolver={juegoCompletado}
      />
    );
  }
  if (modo === "vocales") {
    return (
      <VocalTrazoCanvas
        sonido={config.sonido}
        voz={config.voz}
        tolerancia_px={config.tolerancia_px}
        porcentaje_para_completar={config.porcentaje_para_completar}
        onVolver={juegoCompletado}
      />
    );
  }
  if (modo === "escuchar_num") {
    return (
      <ReconocerCanvas
        modo="numeros"
        sonido={config.sonido}
        voz={config.voz}
        onVolver={juegoCompletado}
      />
    );
  }
  if (modo === "escuchar_voc") {
    return (
      <ReconocerCanvas
        modo="vocales"
        sonido={config.sonido}
        voz={config.voz}
        onVolver={juegoCompletado}
      />
    );
  }
  if (modo === "ordenar") {
    return <OrdenarCanvas sonido={config.sonido} voz={config.voz} nivel={nivel("ordenar")} onVolver={juegoCompletado} />;
  }
  if (modo === "falta") {
    return <FaltaCanvas sonido={config.sonido} voz={config.voz} nivel={nivel("falta")} onVolver={juegoCompletado} />;
  }
  if (modo === "masomenos") {
    return <MasMenosCanvas sonido={config.sonido} voz={config.voz} nivel={nivel("masomenos")} onVolver={juegoCompletado} />;
  }
  if (modo === "sumar") {
    return <SumarCanvas sonido={config.sonido} voz={config.voz} nivel={nivel("sumar")} onVolver={juegoCompletado} />;
  }
  if (modo === "antesdespues") {
    return <AntesDepuesCanvas sonido={config.sonido} voz={config.voz} nivel={nivel("antesdespues")} onVolver={juegoCompletado} />;
  }
  if (modo === "lectura") {
    return (
      <LecturaCanvas
        palabras={palabras}
        progreso={palabrasProgreso}
        ninoId={ninoId ?? ""}
        sonido={config.sonido}
        voz={config.voz}
        onVolver={juegoCompletado}
      />
    );
  }
  if (modo === "pronunciar") {
    return (
      <PronunciarCanvas
        sonido={config.sonido}
        voz={config.voz}
        onVolver={juegoCompletado}
      />
    );
  }
  if (modo === "contar") {
    return (
      <ContarCanvas
        sonido={config.sonido}
        voz={config.voz}
        nivel={nivel("contar")}
        onVolver={juegoCompletado}
      />
    );
  }
  return (
    <AventuraCanvas
      sonido={config.sonido}
      voz={config.voz}
      onVolver={juegoCompletado}
    />
  );
}

