export type JuegoId =
  "trazos" | "colorear" | "aventura" | "numeros" | "vocales" |
  "contar" | "escuchar_num" | "escuchar_voc" | "pronunciar" |
  "ordenar" | "falta" | "masomenos" | "sumar" | "antesdespues" | "lectura";

export interface JuegoCatalogo {
  id: JuegoId;
  emoji: string;
  label: string;
  edadMin: number;
  tieneDificultad: boolean;
}

export const JUEGOS_CATALOGO: JuegoCatalogo[] = [
  { id: "trazos",       emoji: "✏️",   label: "Trazos",          edadMin: 3, tieneDificultad: false },
  { id: "colorear",     emoji: "🎨",   label: "Colorear",        edadMin: 3, tieneDificultad: false },
  { id: "aventura",     emoji: "⭐",   label: "Aventura",        edadMin: 3, tieneDificultad: false },
  { id: "numeros",      emoji: "🔢",   label: "Números",         edadMin: 3, tieneDificultad: false },
  { id: "vocales",      emoji: "🔤",   label: "Vocales",         edadMin: 3, tieneDificultad: false },
  { id: "contar",       emoji: "🧮",   label: "Contar",          edadMin: 3, tieneDificultad: true  },
  { id: "escuchar_num", emoji: "👂",   label: "Escucha número",  edadMin: 3, tieneDificultad: false },
  { id: "escuchar_voc", emoji: "👂",   label: "Escucha vocal",   edadMin: 3, tieneDificultad: false },
  { id: "pronunciar",   emoji: "🎙️",  label: "Pronunciar",      edadMin: 4, tieneDificultad: false },
  { id: "ordenar",      emoji: "🔀",   label: "Ordenar",         edadMin: 4, tieneDificultad: true  },
  { id: "falta",        emoji: "🔍",   label: "¿Cuál falta?",   edadMin: 4, tieneDificultad: true  },
  { id: "masomenos",    emoji: "⚖️",   label: "Más o menos",    edadMin: 4, tieneDificultad: true  },
  { id: "sumar",        emoji: "➕",   label: "Sumar",           edadMin: 5, tieneDificultad: true  },
  { id: "antesdespues", emoji: "↔️",   label: "Antes y después",edadMin: 5, tieneDificultad: true  },
  { id: "lectura",      emoji: "📖",   label: "Leer",            edadMin: 4, tieneDificultad: false },
];

const _todosActivos = Object.fromEntries(
  JUEGOS_CATALOGO.map(j => [j.id, true])
) as Record<JuegoId, boolean>;

const _todosNivel1 = Object.fromEntries(
  JUEGOS_CATALOGO.map(j => [j.id, 1 as 1 | 2 | 3])
) as Record<JuegoId, 1 | 2 | 3>;

export interface Actividad {
  id: string;
  codigo: string;
  tipo: string;
  titulo: string;
  nivel: number;
  activa: boolean;
  datos: { forma: "onda" | "zigzag" | "circulo" | "espiral" | "ocho" | "rampa" | "escalera" | "eses" | "bucles" | "diagonal" };
}

export interface Nino {
  id: string;
  adulto_id: string;
  nombre: string;
  fecha_nacimiento: string | null;
  configuracion: ConfiguracionNino;
  pin: string | null;
  notas: string | null;
  creado_en: string;
}

export interface ConfiguracionNino {
  tolerancia_px: number;
  sonido: boolean;
  voz: boolean;
  porcentaje_para_completar: number;
  juegos_para_premio: number;
  juegos_activos: Record<JuegoId, boolean>;
  juegos_nivel: Record<JuegoId, 1 | 2 | 3>;
}

export interface VideoPremio {
  id: string;
  adulto_id: string;
  youtube_id: string;
  titulo: string;
  orden: number;
  activo: boolean;
}

export interface Sesion {
  id: string;
  nino_id: string;
  inicio: string;
  fin: string | null;
}

export interface Intento {
  id?: string;
  sesion_id: string;
  actividad_id: string;
  completado: boolean;
  porcentaje_camino: number;
  duracion_ms: number;
  levantamientos: number;
  uso_pencil: boolean;
  trazo_miniatura?: string;
  creado_en?: string;
}

export interface ResumenProgreso {
  nino_id: string;
  nombre: string;
  actividad: string;
  semana: string;
  intentos: number;
  porcentaje_medio: number;
  mejor_porcentaje: number;
  segundos_medios: number;
  levantamientos_medios: number;
}

export const CONFIG_DEFAULT: ConfiguracionNino = {
  tolerancia_px: 55,
  sonido: true,
  voz: true,
  porcentaje_para_completar: 85,
  juegos_para_premio: 5,
  juegos_activos: _todosActivos,
  juegos_nivel: _todosNivel1,
};

export interface Palabra {
  id: string;
  nino_id: string;
  texto: string;
  imagen_url: string | null;
  audio_url: string | null;
  orden: number;
  activa: boolean;
}

export interface PalabraProgreso {
  id: string;
  nino_id: string;
  palabra_id: string;
  fase: number;
  aciertos: number;
  intentos: number;
  dominada: boolean;
}

export const FRASES_NIVEL: Record<string, string> = {
  trazo_ondulado:  "¡Repasa el camino hasta la estrella!",
  trazo_montanas:  "¡Sube y baja las montañas hasta la estrella!",
  trazo_circulo:   "¡Da la vuelta entera hasta la estrella!",
  trazo_espiral:   "¡Sigue la espiral hasta la estrella!",
  trazo_ocho:      "¡Dibuja el ocho hasta la estrella!",
  trazo_rampa:     "¡Sube por la rampa hasta la estrella!",
  trazo_escalera:  "¡Sube los escalones hasta la estrella!",
  trazo_eses:      "¡Sigue las curvas hasta la estrella!",
  trazo_bucles:    "¡Haz los bucles hasta la estrella!",
  trazo_diagonal:  "¡Cruza en diagonal hasta la estrella!",
};
