export interface Zona {
  id: string;
  nombre: string;
  // Color marcador único en el SVG para identificar esta zona (relleno inicial)
  marcador: string;
}

export interface Dibujo {
  id: string;
  titulo: string;
  frase: string;
  zonas: Zona[];
  svg: string; // SVG con rellenos de color marcador en cada zona
}

// Marcadores: grises puros (R=G=B), todos visualmente neutros, ninguno parece pintado.
// Separados de 10 en 10 — tolerancia de detección 8 los distingue sin ambigüedad.
// Rango 130-220 (ni demasiado oscuro ni blanco puro, para evitar confusión con fondo/borde).
const M = {
  A1: "#E6E6E6", // 230
  A2: "#DCDCDC", // 220  — ojo: mismo que antes era G1, renombrado
  A3: "#D2D2D2", // 210
  V1: "#C8C8C8", // 200
  V2: "#BEBEBE", // 190
  V3: "#B4B4B4", // 180
  B1: "#AAAAAA", // 170  — gris medio, perfectamente visible como "sin pintar"
  B2: "#A0A0A0", // 160
  B3: "#969696", // 150
  R1: "#E0E0E0", // 224  — entre A1 y A2
  R2: "#D6D6D6", // 214
  O1: "#CCCCCC", // 204
  O2: "#C2C2C2", // 194
  L1: "#B8B8B8", // 184
  L2: "#AEAEAE", // 174
  C1: "#A4A4A4", // 164
  G1: "#F0F0F0", // 240  — gris muy claro (para zonas grandes de fondo)
  G2: "#E8E8E8", // 232
};

export const DIBUJOS: Dibujo[] = [
  // ─── 1. SOL ───────────────────────────────────────────────────────────────
  {
    id: "sol",
    titulo: "El sol",
    frase: "¡Pinta el sol bien brillante!",
    zonas: [
      { id: "circulo", nombre: "Sol",   marcador: M.A1 },
      { id: "rayos",   nombre: "Rayos", marcador: M.A2 },
    ],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="white"/>
  <!-- Rayos (8 elipses rotadas) -->
  <ellipse cx="150" cy="65"  rx="14" ry="28" fill="${M.A2}" stroke="black" stroke-width="9"/>
  <ellipse cx="150" cy="65"  rx="14" ry="28" fill="${M.A2}" stroke="black" stroke-width="9" transform="rotate(45 150 150)"/>
  <ellipse cx="150" cy="65"  rx="14" ry="28" fill="${M.A2}" stroke="black" stroke-width="9" transform="rotate(90 150 150)"/>
  <ellipse cx="150" cy="65"  rx="14" ry="28" fill="${M.A2}" stroke="black" stroke-width="9" transform="rotate(135 150 150)"/>
  <ellipse cx="150" cy="65"  rx="14" ry="28" fill="${M.A2}" stroke="black" stroke-width="9" transform="rotate(180 150 150)"/>
  <ellipse cx="150" cy="65"  rx="14" ry="28" fill="${M.A2}" stroke="black" stroke-width="9" transform="rotate(225 150 150)"/>
  <ellipse cx="150" cy="65"  rx="14" ry="28" fill="${M.A2}" stroke="black" stroke-width="9" transform="rotate(270 150 150)"/>
  <ellipse cx="150" cy="65"  rx="14" ry="28" fill="${M.A2}" stroke="black" stroke-width="9" transform="rotate(315 150 150)"/>
  <!-- Círculo central (dibujado encima de los rayos para taparlos) -->
  <circle cx="150" cy="150" r="62" fill="${M.A1}" stroke="black" stroke-width="10"/>
  <!-- Cara -->
  <circle cx="127" cy="140" r="8" fill="black"/>
  <circle cx="173" cy="140" r="8" fill="black"/>
  <path d="M 125 168 Q 150 185 175 168" fill="none" stroke="black" stroke-width="8" stroke-linecap="round"/>
</svg>`,
  },

  // ─── 2. ARCOÍRIS ──────────────────────────────────────────────────────────
  {
    id: "arcoiris",
    titulo: "El arcoíris",
    frase: "¡Pinta el arcoíris de colores!",
    zonas: [
      { id: "banda1",   nombre: "Rojo",     marcador: M.R1 },
      { id: "banda2",   nombre: "Naranja",  marcador: M.A3 },
      { id: "banda3",   nombre: "Amarillo", marcador: M.A1 },
      { id: "banda4",   nombre: "Verde",    marcador: M.V1 },
      { id: "banda5",   nombre: "Azul",     marcador: M.B1 },
      { id: "nube_izq", nombre: "Nube izquierda", marcador: M.G1 },
      { id: "nube_der", nombre: "Nube derecha",   marcador: M.G2 },
    ],
    // Bandas dibujadas de mayor a menor radio. Cada banda siguiente tapa el interior
    // de la anterior. Entre cada par hay un stroke negro grueso que actúa de frontera
    // para el flood-fill. Las nubes están DEBAJO del arco para no solaparse.
    // Centro del arco: cx=150 cy=215. Radios: 140, 112, 84, 56, 28 (delta=28 cada banda).
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="white"/>
  <!-- Banda roja r140 (más grande) -->
  <path d="M 10,215 A 140,140 0 0,1 290,215 L 290,215 L 10,215 Z" fill="${M.R1}" stroke="black" stroke-width="9"/>
  <!-- Banda naranja r112 encima (tapa interior de roja) -->
  <path d="M 38,215 A 112,112 0 0,1 262,215 L 262,215 L 38,215 Z" fill="${M.A3}" stroke="black" stroke-width="9"/>
  <!-- Banda amarilla r84 -->
  <path d="M 66,215 A 84,84 0 0,1 234,215 L 234,215 L 66,215 Z" fill="${M.A1}" stroke="black" stroke-width="9"/>
  <!-- Banda verde r56 -->
  <path d="M 94,215 A 56,56 0 0,1 206,215 L 206,215 L 94,215 Z" fill="${M.V1}" stroke="black" stroke-width="9"/>
  <!-- Banda azul r28 (más pequeña) -->
  <path d="M 122,215 A 28,28 0 0,1 178,215 L 178,215 L 122,215 Z" fill="${M.B1}" stroke="black" stroke-width="9"/>
  <!-- Línea base negra — cierra todas las bandas por abajo, barrera para flood-fill -->
  <line x1="0" y1="215" x2="300" y2="215" stroke="black" stroke-width="10"/>
  <!-- Tapar parte inferior -->
  <rect x="0" y="220" width="300" height="80" fill="white"/>
  <!-- Reborde exterior -->
  <path d="M 10,215 A 140,140 0 0,1 290,215" fill="none" stroke="black" stroke-width="9"/>
  <!-- Nubes encima del rect blanco -->
  <ellipse cx="35"  cy="258" rx="32" ry="22" fill="${M.G1}" stroke="black" stroke-width="8"/>
  <ellipse cx="60"  cy="245" rx="26" ry="20" fill="${M.G1}" stroke="black" stroke-width="8"/>
  <ellipse cx="82"  cy="258" rx="28" ry="20" fill="${M.G1}" stroke="black" stroke-width="8"/>
  <ellipse cx="265" cy="258" rx="32" ry="22" fill="${M.G2}" stroke="black" stroke-width="8"/>
  <ellipse cx="240" cy="245" rx="26" ry="20" fill="${M.G2}" stroke="black" stroke-width="8"/>
  <ellipse cx="218" cy="258" rx="28" ry="20" fill="${M.G2}" stroke="black" stroke-width="8"/>
</svg>`,
  },

  // ─── 3. CASA ──────────────────────────────────────────────────────────────
  {
    id: "casa",
    titulo: "La casa",
    frase: "¡Pinta la casita con sus colores!",
    zonas: [
      { id: "tejado",   nombre: "Tejado",   marcador: M.R1 },
      { id: "pared",    nombre: "Pared",    marcador: M.A1 },
      { id: "puerta",   nombre: "Puerta",   marcador: M.O1 },
      { id: "ventana1", nombre: "Ventana izquierda", marcador: M.B1 },
      { id: "ventana2", nombre: "Ventana derecha",   marcador: M.B2 },
      { id: "cesped",   nombre: "Césped",   marcador: M.V1 },
    ],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="white"/>
  <rect x="20" y="265" width="260" height="35" fill="${M.V1}" stroke="black" stroke-width="9"/>
  <rect x="50" y="148" width="200" height="120" fill="${M.A1}" stroke="black" stroke-width="9"/>
  <polygon points="150,28 265,148 35,148" fill="${M.R1}" stroke="black" stroke-width="10"/>
  <rect x="118" y="205" width="64" height="63" fill="${M.O1}" stroke="black" stroke-width="9"/>
  <rect x="62"  y="168" width="50" height="46" fill="${M.B1}" stroke="black" stroke-width="9"/>
  <rect x="188" y="168" width="50" height="46" fill="${M.B2}" stroke="black" stroke-width="9"/>
  <line x1="87"  y1="168" x2="87"  y2="214" stroke="black" stroke-width="6"/>
  <line x1="62"  y1="191" x2="112" y2="191" stroke="black" stroke-width="6"/>
  <line x1="213" y1="168" x2="213" y2="214" stroke="black" stroke-width="6"/>
  <line x1="188" y1="191" x2="238" y2="191" stroke="black" stroke-width="6"/>
</svg>`,
  },

  // ─── 4. MARIPOSA ──────────────────────────────────────────────────────────
  {
    id: "mariposa",
    titulo: "La mariposa",
    frase: "¡Pinta la mariposa que vuela!",
    zonas: [
      { id: "ala_sup_izq", nombre: "Ala superior izquierda", marcador: M.R1 },
      { id: "ala_sup_der", nombre: "Ala superior derecha",   marcador: M.A1 },
      { id: "ala_inf_izq", nombre: "Ala inferior izquierda", marcador: M.V1 },
      { id: "ala_inf_der", nombre: "Ala inferior derecha",   marcador: M.B1 },
      { id: "cuerpo",      nombre: "Cuerpo",                 marcador: M.O1 },
    ],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="white"/>
  <ellipse cx="88"  cy="115" rx="78" ry="58" fill="${M.R1}" stroke="black" stroke-width="10"/>
  <ellipse cx="212" cy="115" rx="78" ry="58" fill="${M.A1}" stroke="black" stroke-width="10"/>
  <ellipse cx="88"  cy="200" rx="54" ry="40" fill="${M.V1}" stroke="black" stroke-width="10"/>
  <ellipse cx="212" cy="200" rx="54" ry="40" fill="${M.B1}" stroke="black" stroke-width="10"/>
  <!-- Motivos interiores alas (blanco sólido, no zona) -->
  <circle cx="88"  cy="110" r="22" fill="white" stroke="black" stroke-width="7"/>
  <circle cx="212" cy="110" r="22" fill="white" stroke="black" stroke-width="7"/>
  <circle cx="88"  cy="200" r="15" fill="white" stroke="black" stroke-width="7"/>
  <circle cx="212" cy="200" r="15" fill="white" stroke="black" stroke-width="7"/>
  <!-- Cuerpo encima de todo -->
  <ellipse cx="150" cy="155" rx="13" ry="60" fill="${M.O1}" stroke="black" stroke-width="10"/>
  <!-- Antenas -->
  <path d="M 144 96 Q 128 65 118 50" fill="none" stroke="black" stroke-width="7" stroke-linecap="round"/>
  <path d="M 156 96 Q 172 65 182 50" fill="none" stroke="black" stroke-width="7" stroke-linecap="round"/>
  <circle cx="118" cy="50" r="8" fill="black"/>
  <circle cx="182" cy="50" r="8" fill="black"/>
</svg>`,
  },

  // ─── 5. PÁJARO ────────────────────────────────────────────────────────────
  {
    id: "pajaro",
    titulo: "El pájaro",
    frase: "¡Pinta el pajarito cantarín!",
    zonas: [
      { id: "cuerpo", nombre: "Cuerpo", marcador: M.B1 },
      { id: "ala",    nombre: "Ala",    marcador: M.B2 },
      { id: "pecho",  nombre: "Pecho",  marcador: M.R1 },
      { id: "pico",   nombre: "Pico",   marcador: M.A3 },
      { id: "rama",   nombre: "Rama",   marcador: M.O2 },
    ],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="white"/>
  <rect x="40" y="225" width="220" height="22" rx="11" fill="${M.O2}" stroke="black" stroke-width="9"/>
  <!-- Ala debajo del cuerpo -->
  <ellipse cx="120" cy="155" rx="40" ry="28" fill="${M.B2}" stroke="black" stroke-width="9" transform="rotate(-20 120 155)"/>
  <!-- Cuerpo -->
  <ellipse cx="155" cy="165" rx="72" ry="55" fill="${M.B1}" stroke="black" stroke-width="10"/>
  <!-- Pecho encima -->
  <ellipse cx="175" cy="185" rx="38" ry="30" fill="${M.R1}" stroke="black" stroke-width="9"/>
  <!-- Cabeza -->
  <circle cx="205" cy="130" r="38" fill="${M.B1}" stroke="black" stroke-width="10"/>
  <!-- Pico -->
  <polygon points="238,128 265,120 238,112" fill="${M.A3}" stroke="black" stroke-width="8"/>
  <!-- Ojo -->
  <circle cx="215" cy="122" r="9"  fill="white" stroke="black" stroke-width="6"/>
  <circle cx="217" cy="122" r="4"  fill="black"/>
  <!-- Patas -->
  <line x1="155" y1="218" x2="138" y2="226" stroke="black" stroke-width="8" stroke-linecap="round"/>
  <line x1="175" y1="218" x2="188" y2="226" stroke="black" stroke-width="8" stroke-linecap="round"/>
</svg>`,
  },

  // ─── 6. PEZ ───────────────────────────────────────────────────────────────
  {
    id: "pez",
    titulo: "El pez",
    frase: "¡Pinta el pez del mar!",
    zonas: [
      { id: "cuerpo",  nombre: "Cuerpo",       marcador: M.B1 },
      { id: "aleta_d", nombre: "Aleta dorsal", marcador: M.B2 },
      { id: "cola",    nombre: "Cola",         marcador: M.V1 },
      { id: "barriga", nombre: "Barriga",      marcador: M.A1 },
    ],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="white"/>
  <!-- Cola -->
  <polygon points="240,150 285,105 285,195" fill="${M.V1}" stroke="black" stroke-width="10"/>
  <!-- Aleta dorsal (encima pero tapada por cuerpo en su base) -->
  <path d="M 80 80 Q 120 60 170 78" fill="${M.B2}" stroke="black" stroke-width="9" stroke-linejoin="round"/>
  <path d="M 80 80 L 80 105 Q 120 95 170 105 L 170 78" fill="${M.B2}" stroke="black" stroke-width="9"/>
  <!-- Cuerpo -->
  <ellipse cx="138" cy="150" rx="105" ry="72" fill="${M.B1}" stroke="black" stroke-width="10"/>
  <!-- Barriga -->
  <ellipse cx="138" cy="172" rx="75" ry="38" fill="${M.A1}" stroke="black" stroke-width="8"/>
  <!-- Aleta pectoral (decorativa, no zona) -->
  <ellipse cx="110" cy="165" rx="28" ry="18" fill="${M.B1}" stroke="black" stroke-width="8" transform="rotate(20 110 165)"/>
  <!-- Ojo -->
  <circle cx="68"  cy="138" r="16" fill="white" stroke="black" stroke-width="8"/>
  <circle cx="71"  cy="138" r="7"  fill="black"/>
  <!-- Escamas -->
  <path d="M 120 110 Q 130 100 140 110" fill="none" stroke="black" stroke-width="5"/>
  <path d="M 155 105 Q 165 95  175 105" fill="none" stroke="black" stroke-width="5"/>
  <path d="M 140 130 Q 150 120 160 130" fill="none" stroke="black" stroke-width="5"/>
  <path d="M 170 125 Q 180 115 190 125" fill="none" stroke="black" stroke-width="5"/>
</svg>`,
  },

  // ─── 7. ÁRBOL ─────────────────────────────────────────────────────────────
  {
    id: "arbol",
    titulo: "El árbol",
    frase: "¡Pinta el árbol del bosque!",
    zonas: [
      { id: "copa1",  nombre: "Copa de arriba",  marcador: M.V1 },
      { id: "copa2",  nombre: "Copa del medio",  marcador: M.V2 },
      { id: "copa3",  nombre: "Copa de abajo",   marcador: M.V3 },
      { id: "tronco", nombre: "Tronco",           marcador: M.O2 },
      { id: "cesped", nombre: "Suelo",            marcador: M.A1 },
    ],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="white"/>
  <!-- Suelo (amarillo, distinto a todos los verdes) -->
  <rect x="15" y="258" width="270" height="40" fill="${M.A1}" stroke="black" stroke-width="9"/>
  <rect x="128" y="195" width="44" height="68" fill="${M.O2}" stroke="black" stroke-width="10"/>
  <polygon points="150,190 225,260 75,260" fill="${M.V3}" stroke="black" stroke-width="10"/>
  <polygon points="150,140 215,220 85,220"  fill="${M.V2}" stroke="black" stroke-width="10"/>
  <polygon points="150,78  200,165 100,165" fill="${M.V1}" stroke="black" stroke-width="10"/>
  <!-- Frutos decorativos -->
  <circle cx="138" cy="205" r="9" fill="white" stroke="black" stroke-width="6"/>
  <circle cx="162" cy="215" r="9" fill="white" stroke="black" stroke-width="6"/>
  <circle cx="148" cy="228" r="9" fill="white" stroke="black" stroke-width="6"/>
</svg>`,
  },

  // ─── 8. COHETE ────────────────────────────────────────────────────────────
  {
    id: "cohete",
    titulo: "El cohete",
    frase: "¡Pinta el cohete espacial!",
    zonas: [
      { id: "cuerpo",    nombre: "Cuerpo",    marcador: M.B1 },
      { id: "nariz",     nombre: "Punta",     marcador: M.R1 },
      { id: "ventana",   nombre: "Ventana",   marcador: M.A1 },
      { id: "aleta_izq", nombre: "Aleta izq", marcador: M.V1 },
      { id: "aleta_der", nombre: "Aleta der", marcador: M.V2 },
      { id: "fuego",     nombre: "Fuego",     marcador: M.A3 },
    ],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="white"/>
  <!-- Fuego -->
  <ellipse cx="150" cy="268" rx="28" ry="22" fill="${M.A3}" stroke="black" stroke-width="9"/>
  <ellipse cx="135" cy="255" rx="15" ry="18" fill="${M.A3}" stroke="black" stroke-width="8"/>
  <ellipse cx="165" cy="255" rx="15" ry="18" fill="${M.A3}" stroke="black" stroke-width="8"/>
  <!-- Aletas -->
  <polygon points="88,180 42,235 88,222" fill="${M.V1}" stroke="black" stroke-width="9"/>
  <polygon points="212,180 258,235 212,222" fill="${M.V2}" stroke="black" stroke-width="9"/>
  <!-- Cuerpo -->
  <rect x="88" y="100" width="124" height="148" rx="20" fill="${M.B1}" stroke="black" stroke-width="10"/>
  <!-- Nariz encima del cuerpo -->
  <path d="M 88 105 Q 88 30 150 25 Q 212 30 212 105 Z" fill="${M.R1}" stroke="black" stroke-width="10"/>
  <!-- Ventana -->
  <circle cx="150" cy="165" r="32" fill="${M.A1}" stroke="black" stroke-width="10"/>
  <circle cx="150" cy="165" r="18" fill="white" stroke="black" stroke-width="7"/>
</svg>`,
  },

  // ─── 9. CASTILLO ──────────────────────────────────────────────────────────
  {
    id: "castillo",
    titulo: "El castillo",
    frase: "¡Pinta el castillo de cuento!",
    zonas: [
      { id: "torre_izq",  nombre: "Torre izquierda", marcador: M.L1 },
      { id: "torre_der",  nombre: "Torre derecha",   marcador: M.L2 },
      { id: "pared",      nombre: "Pared central",   marcador: M.G1 },
      { id: "puerta",     nombre: "Puerta",          marcador: M.O1 },
      { id: "bandera_izq",nombre: "Bandera izq",     marcador: M.R1 },
      { id: "bandera_der",nombre: "Bandera der",     marcador: M.B1 },
    ],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="white"/>
  <!-- Torres laterales -->
  <rect x="18"  y="80"  width="72" height="195" fill="${M.L1}" stroke="black" stroke-width="9"/>
  <rect x="210" y="80"  width="72" height="195" fill="${M.L2}" stroke="black" stroke-width="9"/>
  <!-- Almenas torres -->
  <rect x="18"  y="60"  width="16" height="24" fill="${M.L1}" stroke="black" stroke-width="8"/>
  <rect x="42"  y="60"  width="16" height="24" fill="${M.L1}" stroke="black" stroke-width="8"/>
  <rect x="66"  y="60"  width="16" height="24" fill="${M.L1}" stroke="black" stroke-width="8"/>
  <rect x="210" y="60"  width="16" height="24" fill="${M.L2}" stroke="black" stroke-width="8"/>
  <rect x="234" y="60"  width="16" height="24" fill="${M.L2}" stroke="black" stroke-width="8"/>
  <rect x="258" y="60"  width="16" height="24" fill="${M.L2}" stroke="black" stroke-width="8"/>
  <!-- Pared central -->
  <rect x="88"  y="130" width="124" height="145" fill="${M.G1}" stroke="black" stroke-width="9"/>
  <!-- Almenas centrales -->
  <rect x="88"  y="110" width="18" height="24" fill="${M.G1}" stroke="black" stroke-width="8"/>
  <rect x="116" y="110" width="18" height="24" fill="${M.G1}" stroke="black" stroke-width="8"/>
  <rect x="144" y="110" width="18" height="24" fill="${M.G1}" stroke="black" stroke-width="8"/>
  <rect x="172" y="110" width="18" height="24" fill="${M.G1}" stroke="black" stroke-width="8"/>
  <rect x="194" y="110" width="18" height="24" fill="${M.G1}" stroke="black" stroke-width="8"/>
  <!-- Puerta -->
  <path d="M 118 275 L 118 200 Q 118 172 150 172 Q 182 172 182 200 L 182 275 Z" fill="${M.O1}" stroke="black" stroke-width="9"/>
  <!-- Ventanas torres (blanco, no zona) -->
  <rect x="38"  y="130" width="32" height="40" rx="16" fill="white" stroke="black" stroke-width="7"/>
  <rect x="230" y="130" width="32" height="40" rx="16" fill="white" stroke="black" stroke-width="7"/>
  <!-- Banderas -->
  <line x1="54"  y1="60"  x2="54"  y2="22"  stroke="black" stroke-width="7"/>
  <line x1="246" y1="60"  x2="246" y2="22"  stroke="black" stroke-width="7"/>
  <polygon points="54,22 54,42 76,32" fill="${M.R1}" stroke="black" stroke-width="6"/>
  <polygon points="246,22 246,42 268,32" fill="${M.B1}" stroke="black" stroke-width="6"/>
</svg>`,
  },

  // ─── 10. CAMIÓN ───────────────────────────────────────────────────────────
  {
    id: "camion",
    titulo: "El camión",
    frase: "¡Pinta el camión de colores!",
    zonas: [
      { id: "cabina",  nombre: "Cabina",  marcador: M.R1 },
      { id: "caja",    nombre: "Caja",    marcador: M.B1 },
      { id: "ruedas",  nombre: "Ruedas",  marcador: M.G2 },
      { id: "ventana", nombre: "Ventana", marcador: M.A1 },
    ],
    // Las tres ruedas son independientes pero todas con mismo marcador (se cuenta una zona)
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="white"/>
  <!-- Caja de carga -->
  <rect x="15"  y="110" width="170" height="110" rx="8" fill="${M.B1}" stroke="black" stroke-width="10"/>
  <!-- Cabina -->
  <rect x="185" y="140" width="95"  height="80"  rx="10" fill="${M.R1}" stroke="black" stroke-width="10"/>
  <path d="M 185 140 L 185 108 Q 200 95 240 95 L 280 95 L 280 140 Z" fill="${M.R1}" stroke="black" stroke-width="10"/>
  <!-- Ventana cabina -->
  <path d="M 200 100 L 200 135 L 272 135 L 272 100 Q 252 92 220 92 Z" fill="${M.A1}" stroke="black" stroke-width="8"/>
  <!-- Ruedas (zona única, mismo color) -->
  <circle cx="62"  cy="238" r="32" fill="${M.G2}" stroke="black" stroke-width="10"/>
  <circle cx="62"  cy="238" r="14" fill="white" stroke="black" stroke-width="8"/>
  <circle cx="158" cy="238" r="32" fill="${M.G2}" stroke="black" stroke-width="10"/>
  <circle cx="158" cy="238" r="14" fill="white" stroke="black" stroke-width="8"/>
  <circle cx="240" cy="238" r="28" fill="${M.G2}" stroke="black" stroke-width="10"/>
  <circle cx="240" cy="238" r="12" fill="white" stroke="black" stroke-width="8"/>
  <!-- Faro -->
  <rect x="275" y="175" width="20" height="16" rx="4" fill="white" stroke="black" stroke-width="7"/>
</svg>`,
  },

  // ─── 11. DINOSAURIO ───────────────────────────────────────────────────────
  {
    id: "dino",
    titulo: "El dinosaurio",
    frase: "¡Pinta al dinosaurio!",
    zonas: [
      { id: "cuerpo",  nombre: "Cuerpo",  marcador: M.V1 },
      { id: "barriga", nombre: "Barriga", marcador: M.A1 },
      { id: "puas",    nombre: "Púas",    marcador: M.V3 },
      { id: "cola",    nombre: "Cola",    marcador: M.V2 },
    ],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="white"/>
  <!-- Cola (separada del cuerpo por línea negra) -->
  <path d="M 35 195 Q 15 250 40 265 Q 70 270 80 230" fill="${M.V2}" stroke="black" stroke-width="10"/>
  <!-- Púas espalda -->
  <polygon points="80,80  95,45  110,80"  fill="${M.V3}" stroke="black" stroke-width="8"/>
  <polygon points="110,70 128,30 145,70"  fill="${M.V3}" stroke="black" stroke-width="8"/>
  <polygon points="145,75 162,38 178,75"  fill="${M.V3}" stroke="black" stroke-width="8"/>
  <!-- Cuerpo -->
  <ellipse cx="155" cy="175" rx="110" ry="80" fill="${M.V1}" stroke="black" stroke-width="10"/>
  <!-- Cabeza (mismo color cuerpo, conectada) -->
  <ellipse cx="238" cy="105" rx="55"  ry="42" fill="${M.V1}" stroke="black" stroke-width="10"/>
  <!-- Cuello relleno (sin stroke visible, mismo color) -->
  <path d="M 195 135 Q 205 115 220 100" fill="none" stroke="${M.V1}" stroke-width="38"/>
  <path d="M 195 135 Q 205 115 220 100" fill="none" stroke="black" stroke-width="10"/>
  <!-- Barriga -->
  <ellipse cx="145" cy="195" rx="72" ry="48" fill="${M.A1}" stroke="black" stroke-width="8"/>
  <!-- Ojo -->
  <circle cx="252" cy="96"  r="10" fill="white" stroke="black" stroke-width="7"/>
  <circle cx="255" cy="96"  r="5"  fill="black"/>
  <!-- Boca -->
  <path d="M 258 112 Q 270 122 260 130" fill="none" stroke="black" stroke-width="7" stroke-linecap="round"/>
  <!-- Patas -->
  <rect x="90"  y="240" width="38" height="48" rx="10" fill="${M.V1}" stroke="black" stroke-width="9"/>
  <rect x="148" y="240" width="38" height="48" rx="10" fill="${M.V1}" stroke="black" stroke-width="9"/>
  <rect x="195" y="230" width="32" height="42" rx="10" fill="${M.V1}" stroke="black" stroke-width="9"/>
</svg>`,
  },

  // ─── 12. HELADO ───────────────────────────────────────────────────────────
  {
    id: "helado",
    titulo: "El helado",
    frase: "¡Pinta el helado rico!",
    zonas: [
      { id: "barquillo", nombre: "Barquillo",       marcador: M.O1 },
      { id: "bola1",     nombre: "Bola de abajo",   marcador: M.R1 },
      { id: "bola2",     nombre: "Bola del medio",  marcador: M.V1 },
      { id: "bola3",     nombre: "Bola de arriba",  marcador: M.A1 },
    ],
    // Bolas dibujadas de abajo a arriba: cada una cubre la parte inferior de la anterior
    // Se añade borde negro entre ellas para que el flood-fill no se mezcle
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="white"/>
  <!-- Barquillo -->
  <polygon points="150,278 98,160 202,160" fill="${M.O1}" stroke="black" stroke-width="10"/>
  <line x1="150" y1="278" x2="120" y2="210" stroke="black" stroke-width="6"/>
  <line x1="150" y1="278" x2="150" y2="200" stroke="black" stroke-width="6"/>
  <line x1="150" y1="278" x2="180" y2="210" stroke="black" stroke-width="6"/>
  <!-- Bola baja -->
  <circle cx="150" cy="158" r="46" fill="${M.R1}" stroke="black" stroke-width="10"/>
  <!-- Bola media encima, con borde negro que la separa -->
  <circle cx="150" cy="116" r="42" fill="${M.V1}" stroke="black" stroke-width="10"/>
  <!-- Bola alta encima -->
  <circle cx="150" cy="78"  r="36" fill="${M.A1}" stroke="black" stroke-width="10"/>
  <!-- Topping decorativo -->
  <path d="M 124 70 Q 118 55 128 48 Q 138 42 144 52 Q 150 42 160 46 Q 170 52 165 68" fill="none" stroke="black" stroke-width="10" stroke-linecap="round"/>
  <!-- Virutas -->
  <circle cx="142" cy="62"  r="5" fill="white" stroke="black" stroke-width="3"/>
  <circle cx="160" cy="68"  r="5" fill="white" stroke="black" stroke-width="3"/>
  <circle cx="150" cy="52"  r="5" fill="white" stroke="black" stroke-width="3"/>
</svg>`,
  },

  // ─── 13. FLOR ─────────────────────────────────────────────────────────────
  {
    id: "flor",
    titulo: "La flor",
    frase: "¡Pinta la flor bonita!",
    zonas: [
      { id: "petalo1", nombre: "Pétalo 1", marcador: M.R1 },
      { id: "petalo2", nombre: "Pétalo 2", marcador: M.A1 },
      { id: "petalo3", nombre: "Pétalo 3", marcador: M.L1 },
      { id: "petalo4", nombre: "Pétalo 4", marcador: M.B1 },
      { id: "petalo5", nombre: "Pétalo 5", marcador: M.V1 },
      { id: "centro",  nombre: "Centro",   marcador: M.A3 },
      { id: "tallo",   nombre: "Tallo",    marcador: M.V2 },
    ],
    // Pétalos como paths individuales separados por líneas negras, no ellipses superpuestas
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="white"/>
  <!-- Tallo y hojas -->
  <rect x="141" y="200" width="18" height="82" rx="9" fill="${M.V2}" stroke="black" stroke-width="9"/>
  <ellipse cx="118" cy="248" rx="28" ry="14" fill="${M.V2}" stroke="black" stroke-width="8" transform="rotate(-35 118 248)"/>
  <ellipse cx="182" cy="232" rx="28" ry="14" fill="${M.V2}" stroke="black" stroke-width="8" transform="rotate(35 182 232)"/>
  <!-- Pétalos como sectores radiales separados — cada uno un path propio -->
  <!-- pétalo 1 (arriba) -->
  <ellipse cx="150" cy="110" rx="26" ry="48" fill="${M.R1}" stroke="black" stroke-width="9"/>
  <!-- pétalo 2 (arriba-der) -->
  <ellipse cx="150" cy="110" rx="26" ry="48" fill="${M.A1}" stroke="black" stroke-width="9" transform="rotate(72 150 168)"/>
  <!-- pétalo 3 (abajo-der) -->
  <ellipse cx="150" cy="110" rx="26" ry="48" fill="${M.L1}" stroke="black" stroke-width="9" transform="rotate(144 150 168)"/>
  <!-- pétalo 4 (abajo-izq) -->
  <ellipse cx="150" cy="110" rx="26" ry="48" fill="${M.B1}" stroke="black" stroke-width="9" transform="rotate(216 150 168)"/>
  <!-- pétalo 5 (arriba-izq) -->
  <ellipse cx="150" cy="110" rx="26" ry="48" fill="${M.V1}" stroke="black" stroke-width="9" transform="rotate(288 150 168)"/>
  <!-- Centro encima de todo para separar pétalos visualmente -->
  <circle cx="150" cy="168" r="36" fill="${M.A3}" stroke="black" stroke-width="10"/>
  <!-- Cara del centro -->
  <circle cx="140" cy="163" r="5" fill="black"/>
  <circle cx="160" cy="163" r="5" fill="black"/>
  <path d="M 138 176 Q 150 186 162 176" fill="none" stroke="black" stroke-width="6" stroke-linecap="round"/>
</svg>`,
  },

  // ─── 14. CARACOL ──────────────────────────────────────────────────────────
  {
    id: "caracol",
    titulo: "El caracol",
    frase: "¡Pinta al caracol con su casa!",
    zonas: [
      { id: "concha", nombre: "Concha",  marcador: M.A1 },
      { id: "cuerpo", nombre: "Cuerpo",  marcador: M.V1 },
    ],
    // Espiral decorativa sin zonas anidadas (solo 2 zonas sencillas)
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="white"/>
  <!-- Cuerpo -->
  <ellipse cx="105" cy="220" rx="95" ry="38" fill="${M.V1}" stroke="black" stroke-width="10"/>
  <!-- Cabeza -->
  <circle cx="50" cy="195" r="30" fill="${M.V1}" stroke="black" stroke-width="10"/>
  <!-- Antenas -->
  <line x1="40" y1="167" x2="32" y2="140" stroke="black" stroke-width="8" stroke-linecap="round"/>
  <line x1="58" y1="167" x2="66" y2="140" stroke="black" stroke-width="8" stroke-linecap="round"/>
  <circle cx="32" cy="138" r="7" fill="black"/>
  <circle cx="66" cy="138" r="7" fill="black"/>
  <!-- Ojo -->
  <circle cx="40" cy="192" r="7" fill="white" stroke="black" stroke-width="6"/>
  <circle cx="42" cy="192" r="3" fill="black"/>
  <!-- Boca -->
  <path d="M 45 208 Q 55 215 62 208" fill="none" stroke="black" stroke-width="6" stroke-linecap="round"/>
  <!-- Concha (solo exterior, sin capas internas) -->
  <circle cx="178" cy="175" r="88" fill="${M.A1}" stroke="black" stroke-width="10"/>
  <!-- Espiral decorativa (solo líneas negras, no zonas) -->
  <circle cx="178" cy="175" r="62" fill="none" stroke="black" stroke-width="7"/>
  <circle cx="178" cy="175" r="36" fill="none" stroke="black" stroke-width="6"/>
  <circle cx="178" cy="175" r="14" fill="none" stroke="black" stroke-width="5"/>
</svg>`,
  },

  // ─── 15. BALLENA ──────────────────────────────────────────────────────────
  {
    id: "ballena",
    titulo: "La ballena",
    frase: "¡Pinta la ballena del océano!",
    zonas: [
      { id: "cuerpo",  nombre: "Cuerpo",       marcador: M.B1 },
      { id: "barriga", nombre: "Barriga",       marcador: M.G1 },
      { id: "aleta_d", nombre: "Aleta dorsal",  marcador: M.B2 },
      { id: "cola",    nombre: "Cola",          marcador: M.L1 },
      { id: "chorro",  nombre: "Chorro",        marcador: M.C1 },
    ],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="white"/>
  <!-- Chorro de agua -->
  <ellipse cx="248" cy="72"  rx="14" ry="32" fill="${M.C1}" stroke="black" stroke-width="8" transform="rotate(-15 248 72)"/>
  <ellipse cx="262" cy="60"  rx="11" ry="26" fill="${M.C1}" stroke="black" stroke-width="8" transform="rotate(10 262 60)"/>
  <!-- Cola (color distinto a aleta) -->
  <path d="M 28 168 Q 18 128 45 120 Q 55 148 55 168" fill="${M.L1}" stroke="black" stroke-width="10"/>
  <path d="M 28 168 Q 18 205 45 215 Q 55 188 55 168" fill="${M.L1}" stroke="black" stroke-width="10"/>
  <!-- Cuerpo -->
  <ellipse cx="168" cy="178" rx="130" ry="72" fill="${M.B1}" stroke="black" stroke-width="10"/>
  <!-- Barriga -->
  <ellipse cx="178" cy="205" rx="88"  ry="38" fill="${M.G1}" stroke="black" stroke-width="8"/>
  <!-- Aleta dorsal (color distinto a cola) -->
  <path d="M 175 108 Q 192 70 212 105" fill="${M.B2}" stroke="black" stroke-width="9"/>
  <path d="M 175 108 L 212 105" fill="none" stroke="black" stroke-width="9"/>
  <!-- Aleta pectoral (decorativa, mismo color cuerpo) -->
  <ellipse cx="192" cy="198" rx="36" ry="20" fill="${M.B1}" stroke="black" stroke-width="8" transform="rotate(25 192 198)"/>
  <!-- Ojo -->
  <circle cx="258" cy="162" r="14" fill="white" stroke="black" stroke-width="8"/>
  <circle cx="261" cy="162" r="6"  fill="black"/>
  <!-- Boca sonriente -->
  <path d="M 268 178 Q 280 192 268 200" fill="none" stroke="black" stroke-width="8" stroke-linecap="round"/>
</svg>`,
  },

  // ─── 16. TREN ─────────────────────────────────────────────────────────────
  {
    id: "tren",
    titulo: "El tren",
    frase: "¡Pinta el tren chuchú!",
    zonas: [
      { id: "locomotora", nombre: "Locomotora", marcador: M.R1 },
      { id: "vagon1",     nombre: "Vagón 1",    marcador: M.B1 },
      { id: "vagon2",     nombre: "Vagón 2",    marcador: M.V1 },
      { id: "ruedas",     nombre: "Ruedas",     marcador: M.G2 },
      { id: "humo",       nombre: "Humo",       marcador: M.G1 },
    ],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="white"/>
  <!-- Rieles -->
  <line x1="10" y1="248" x2="290" y2="248" stroke="black" stroke-width="8"/>
  <line x1="10" y1="260" x2="290" y2="260" stroke="black" stroke-width="8"/>
  <line x1="30"  y1="248" x2="30"  y2="260" stroke="black" stroke-width="6"/>
  <line x1="75"  y1="248" x2="75"  y2="260" stroke="black" stroke-width="6"/>
  <line x1="120" y1="248" x2="120" y2="260" stroke="black" stroke-width="6"/>
  <line x1="165" y1="248" x2="165" y2="260" stroke="black" stroke-width="6"/>
  <line x1="210" y1="248" x2="210" y2="260" stroke="black" stroke-width="6"/>
  <line x1="255" y1="248" x2="255" y2="260" stroke="black" stroke-width="6"/>
  <!-- Humo -->
  <circle cx="250" cy="88"  r="22" fill="${M.G1}" stroke="black" stroke-width="8"/>
  <circle cx="268" cy="68"  r="18" fill="${M.G1}" stroke="black" stroke-width="8"/>
  <circle cx="280" cy="50"  r="14" fill="${M.G1}" stroke="black" stroke-width="8"/>
  <!-- Chimenea -->
  <rect x="242" y="100" width="16" height="20" fill="${M.R1}" stroke="black" stroke-width="8"/>
  <!-- Locomotora -->
  <rect x="195" y="130" width="95" height="88" rx="10" fill="${M.R1}" stroke="black" stroke-width="10"/>
  <path d="M 195 130 L 195 105 Q 215 92 255 92 L 290 92 L 290 130 Z" fill="${M.R1}" stroke="black" stroke-width="10"/>
  <!-- Ventana locomotora (blanco, no zona) -->
  <rect x="220" y="98"  width="55" height="28" rx="6" fill="white" stroke="black" stroke-width="8"/>
  <!-- Vagón 1 -->
  <rect x="105" y="148" width="85" height="70" rx="8" fill="${M.B1}" stroke="black" stroke-width="9"/>
  <rect x="118" y="158" width="28" height="28" rx="4" fill="white" stroke="black" stroke-width="7"/>
  <rect x="152" y="158" width="28" height="28" rx="4" fill="white" stroke="black" stroke-width="7"/>
  <!-- Vagón 2 -->
  <rect x="15"  y="148" width="85" height="70" rx="8" fill="${M.V1}" stroke="black" stroke-width="9"/>
  <rect x="28"  y="158" width="28" height="28" rx="4" fill="white" stroke="black" stroke-width="7"/>
  <rect x="62"  y="158" width="28" height="28" rx="4" fill="white" stroke="black" stroke-width="7"/>
  <!-- Enganches -->
  <line x1="100" y1="183" x2="105" y2="183" stroke="black" stroke-width="8" stroke-linecap="round"/>
  <line x1="190" y1="183" x2="195" y2="183" stroke="black" stroke-width="8" stroke-linecap="round"/>
  <!-- Ruedas (todas G2) -->
  <circle cx="222" cy="232" r="24" fill="${M.G2}" stroke="black" stroke-width="9"/>
  <circle cx="222" cy="232" r="10" fill="white" stroke="black" stroke-width="7"/>
  <circle cx="268" cy="232" r="24" fill="${M.G2}" stroke="black" stroke-width="9"/>
  <circle cx="268" cy="232" r="10" fill="white" stroke="black" stroke-width="7"/>
  <circle cx="130" cy="232" r="20" fill="${M.G2}" stroke="black" stroke-width="9"/>
  <circle cx="130" cy="232" r="8"  fill="white" stroke="black" stroke-width="7"/>
  <circle cx="168" cy="232" r="20" fill="${M.G2}" stroke="black" stroke-width="9"/>
  <circle cx="168" cy="232" r="8"  fill="white" stroke="black" stroke-width="7"/>
  <circle cx="38"  cy="232" r="20" fill="${M.G2}" stroke="black" stroke-width="9"/>
  <circle cx="38"  cy="232" r="8"  fill="white" stroke="black" stroke-width="7"/>
  <circle cx="78"  cy="232" r="20" fill="${M.G2}" stroke="black" stroke-width="9"/>
  <circle cx="78"  cy="232" r="8"  fill="white" stroke="black" stroke-width="7"/>
</svg>`,
  },

  // ─── 17. CORAZÓN ──────────────────────────────────────────────────────────
  {
    id: "corazon",
    titulo: "El corazón",
    frase: "¡Pinta el corazón con amor!",
    zonas: [
      { id: "corazon_ext", nombre: "Corazón grande",  marcador: M.R1 },
      { id: "corazon_med", nombre: "Corazón mediano", marcador: M.R2 },
      { id: "corazon_int", nombre: "Corazón pequeño", marcador: M.A1 },
    ],
    // Corazones anidados: cada path cubre solo su anillo (el siguiente lo tapa)
    // Se fuerza borde negro grueso entre capas para que el flood-fill se detenga
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="white"/>
  <!-- Corazón exterior -->
  <path d="M 150 255 C 70 200 22 155 22 102 C 22 62 50 35 88 35 C 110 35 132 47 150 68 C 168 47 190 35 212 35 C 250 35 278 62 278 102 C 278 155 230 200 150 255 Z" fill="${M.R1}" stroke="black" stroke-width="10"/>
  <!-- Corazón mediano encima -->
  <path d="M 150 218 C 92 177 58 148 58 112 C 58 88 74 72 96 72 C 112 72 128 81 150 100 C 172 81 188 72 204 72 C 226 72 242 88 242 112 C 242 148 208 177 150 218 Z" fill="${M.R2}" stroke="black" stroke-width="9"/>
  <!-- Corazón interior encima -->
  <path d="M 150 182 C 110 156 90 136 90 118 C 90 104 100 95 114 95 C 126 95 138 103 150 116 C 162 103 174 95 186 95 C 200 95 210 104 210 118 C 210 136 190 156 150 182 Z" fill="${M.A1}" stroke="black" stroke-width="8"/>
  <!-- Destellos decorativos -->
  <polygon points="38,45  43,58  55,58  46,67  50,80  38,72  26,80  30,67  21,58  33,58"  fill="white" stroke="black" stroke-width="5"/>
  <polygon points="262,45 267,58 279,58 270,67 274,80 262,72 250,80 254,67 245,58 257,58" fill="white" stroke="black" stroke-width="5"/>
</svg>`,
  },

  // ─── 18. GATO ─────────────────────────────────────────────────────────────
  {
    id: "gato",
    titulo: "El gato",
    frase: "¡Pinta al gatito!",
    zonas: [
      { id: "cuerpo",  nombre: "Cuerpo y cabeza", marcador: M.O1 },
      { id: "barriga", nombre: "Barriga",         marcador: M.A1 },
      { id: "orejas",  nombre: "Orejas",          marcador: M.R1 },
      { id: "cola",    nombre: "Cola",            marcador: M.O2 },
    ],
    // cuerpo y cabeza son el mismo marcador porque están conectados físicamente
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="white"/>
  <!-- Cola -->
  <path d="M 215 235 Q 270 215 275 170 Q 278 135 255 130 Q 240 128 238 148 Q 245 158 240 170 Q 228 190 215 200" fill="${M.O2}" stroke="black" stroke-width="10" stroke-linecap="round"/>
  <!-- Cuerpo -->
  <ellipse cx="148" cy="205" rx="88" ry="72" fill="${M.O1}" stroke="black" stroke-width="10"/>
  <!-- Barriga -->
  <ellipse cx="148" cy="215" rx="52" ry="46" fill="${M.A1}" stroke="black" stroke-width="8"/>
  <!-- Cabeza (mismo color cuerpo, está conectada) -->
  <circle cx="148" cy="108" r="65" fill="${M.O1}" stroke="black" stroke-width="10"/>
  <!-- Orejas -->
  <polygon points="95,58  78,18  122,52"  fill="${M.R1}" stroke="black" stroke-width="9"/>
  <polygon points="201,58 222,18 178,52"  fill="${M.R1}" stroke="black" stroke-width="9"/>
  <!-- Cara -->
  <circle cx="125" cy="100" r="11" fill="black"/>
  <circle cx="171" cy="100" r="11" fill="black"/>
  <circle cx="128" cy="97"  r="4"  fill="white"/>
  <circle cx="174" cy="97"  r="4"  fill="white"/>
  <ellipse cx="148" cy="122" rx="14" ry="10" fill="${M.R1}" stroke="black" stroke-width="7"/>
  <path d="M 130 130 Q 148 142 166 130" fill="none" stroke="black" stroke-width="7" stroke-linecap="round"/>
  <!-- Bigotes -->
  <line x1="92"  y1="112" x2="130" y2="118" stroke="black" stroke-width="5" stroke-linecap="round"/>
  <line x1="90"  y1="122" x2="130" y2="122" stroke="black" stroke-width="5" stroke-linecap="round"/>
  <line x1="166" y1="118" x2="205" y2="112" stroke="black" stroke-width="5" stroke-linecap="round"/>
  <line x1="166" y1="122" x2="206" y2="122" stroke="black" stroke-width="5" stroke-linecap="round"/>
  <!-- Patas -->
  <rect x="88"  y="262" width="38" height="30" rx="15" fill="${M.O1}" stroke="black" stroke-width="9"/>
  <rect x="172" y="262" width="38" height="30" rx="15" fill="${M.O1}" stroke="black" stroke-width="9"/>
</svg>`,
  },

  // ─── 19. BARCO ────────────────────────────────────────────────────────────
  {
    id: "barco",
    titulo: "El barco",
    frase: "¡Pinta el barco pirata!",
    zonas: [
      { id: "casco",   nombre: "Casco",        marcador: M.O2 },
      { id: "vela1",   nombre: "Vela grande",  marcador: M.G1 },
      { id: "vela2",   nombre: "Vela pequeña", marcador: M.G2 },
      { id: "bandera", nombre: "Bandera",      marcador: M.R1 },
      { id: "mar",     nombre: "Mar",          marcador: M.B1 },
    ],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="white"/>
  <!-- Mar con olas -->
  <path d="M 0 230 Q 38 215 75 230 Q 113 245 150 230 Q 188 215 225 230 Q 263 245 300 230 L 300 300 L 0 300 Z" fill="${M.B1}" stroke="black" stroke-width="9"/>
  <path d="M 0 250 Q 38 238 75 250 Q 113 262 150 250 Q 188 238 225 250 Q 263 262 300 250" fill="none" stroke="black" stroke-width="6"/>
  <!-- Casco -->
  <path d="M 38 195 L 55 248 L 245 248 L 262 195 Z" fill="${M.O2}" stroke="black" stroke-width="10"/>
  <!-- Línea de flotación -->
  <line x1="38" y1="222" x2="262" y2="222" stroke="black" stroke-width="7"/>
  <!-- Mástil -->
  <line x1="150" y1="195" x2="150" y2="42" stroke="black" stroke-width="10" stroke-linecap="round"/>
  <!-- Vela grande -->
  <polygon points="150,48 150,188 62,155" fill="${M.G1}" stroke="black" stroke-width="9"/>
  <!-- Vela pequeña -->
  <polygon points="150,48 150,130 220,98" fill="${M.G2}" stroke="black" stroke-width="9"/>
  <!-- Bandera -->
  <line x1="150" y1="42" x2="150" y2="22" stroke="black" stroke-width="7"/>
  <polygon points="150,22 150,38 178,30" fill="${M.R1}" stroke="black" stroke-width="7"/>
  <!-- Portilla (blanco, no zona) -->
  <circle cx="95"  cy="210" r="12" fill="white" stroke="black" stroke-width="7"/>
  <circle cx="205" cy="210" r="12" fill="white" stroke="black" stroke-width="7"/>
  <!-- Cañón decorativo -->
  <rect x="60" y="228" width="35" height="14" rx="7" fill="black"/>
</svg>`,
  },
];
