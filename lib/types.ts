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
};

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
