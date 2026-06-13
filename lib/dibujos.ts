export interface Dibujo {
  id: string;
  titulo: string;
  frase: string;
  svg: string;
}

// Todos los SVGs usan viewBox="0 0 300 300", líneas negras de 10px,
// fondo blanco explícito, zonas completamente cerradas para flood fill.
export const DIBUJOS: Dibujo[] = [
  {
    id: "sol",
    titulo: "El sol",
    frase: "¡Pinta el sol bien brillante!",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="white"/>
  <circle cx="150" cy="150" r="55" fill="white" stroke="black" stroke-width="10"/>
  <line x1="150" y1="60" x2="150" y2="30" stroke="black" stroke-width="10" stroke-linecap="round"/>
  <line x1="150" y1="240" x2="150" y2="270" stroke="black" stroke-width="10" stroke-linecap="round"/>
  <line x1="60" y1="150" x2="30" y2="150" stroke="black" stroke-width="10" stroke-linecap="round"/>
  <line x1="240" y1="150" x2="270" y2="150" stroke="black" stroke-width="10" stroke-linecap="round"/>
  <line x1="88" y1="88" x2="67" y2="67" stroke="black" stroke-width="10" stroke-linecap="round"/>
  <line x1="212" y1="88" x2="233" y2="67" stroke="black" stroke-width="10" stroke-linecap="round"/>
  <line x1="88" y1="212" x2="67" y2="233" stroke="black" stroke-width="10" stroke-linecap="round"/>
  <line x1="212" y1="212" x2="233" y2="233" stroke="black" stroke-width="10" stroke-linecap="round"/>
</svg>`,
  },
  {
    id: "luna",
    titulo: "La luna",
    frase: "¡Pinta la luna de noche!",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="white"/>
  <path d="M 180 60 A 90 90 0 1 0 180 240 A 60 60 0 1 1 180 60 Z" fill="white" stroke="black" stroke-width="10" stroke-linejoin="round"/>
</svg>`,
  },
  {
    id: "estrella",
    titulo: "La estrella",
    frase: "¡Pinta la estrella!",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="white"/>
  <polygon points="150,30 179,111 265,111 197,162 222,243 150,192 78,243 103,162 35,111 121,111" fill="white" stroke="black" stroke-width="10" stroke-linejoin="round"/>
</svg>`,
  },
  {
    id: "nube",
    titulo: "La nube",
    frase: "¡Pinta la nube esponjosa!",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="white"/>
  <path d="M 60 190 Q 60 240 110 240 L 210 240 Q 260 240 260 190 Q 260 160 235 150 Q 240 100 200 95 Q 185 60 150 70 Q 120 60 110 90 Q 75 90 70 120 Q 45 125 60 190 Z" fill="white" stroke="black" stroke-width="10" stroke-linejoin="round"/>
</svg>`,
  },
  {
    id: "arbol",
    titulo: "El árbol",
    frase: "¡Pinta el árbol del bosque!",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="white"/>
  <rect x="130" y="210" width="40" height="70" fill="white" stroke="black" stroke-width="10" stroke-linejoin="round"/>
  <polygon points="150,30 240,210 60,210" fill="white" stroke="black" stroke-width="10" stroke-linejoin="round"/>
</svg>`,
  },
  {
    id: "flor",
    titulo: "La flor",
    frase: "¡Pinta la flor bonita!",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="white"/>
  <line x1="150" y1="175" x2="150" y2="280" stroke="black" stroke-width="10" stroke-linecap="round"/>
  <ellipse cx="150" cy="80" rx="28" ry="45" fill="white" stroke="black" stroke-width="10"/>
  <ellipse cx="150" cy="80" rx="28" ry="45" fill="white" stroke="black" stroke-width="10" transform="rotate(60 150 150)"/>
  <ellipse cx="150" cy="80" rx="28" ry="45" fill="white" stroke="black" stroke-width="10" transform="rotate(120 150 150)"/>
  <ellipse cx="150" cy="80" rx="28" ry="45" fill="white" stroke="black" stroke-width="10" transform="rotate(180 150 150)"/>
  <ellipse cx="150" cy="80" rx="28" ry="45" fill="white" stroke="black" stroke-width="10" transform="rotate(240 150 150)"/>
  <ellipse cx="150" cy="80" rx="28" ry="45" fill="white" stroke="black" stroke-width="10" transform="rotate(300 150 150)"/>
  <circle cx="150" cy="150" r="30" fill="white" stroke="black" stroke-width="10"/>
</svg>`,
  },
  {
    id: "mariposa",
    titulo: "La mariposa",
    frase: "¡Pinta la mariposa que vuela!",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="white"/>
  <ellipse cx="95" cy="120" rx="75" ry="55" fill="white" stroke="black" stroke-width="10"/>
  <ellipse cx="205" cy="120" rx="75" ry="55" fill="white" stroke="black" stroke-width="10"/>
  <ellipse cx="95" cy="200" rx="50" ry="38" fill="white" stroke="black" stroke-width="10"/>
  <ellipse cx="205" cy="200" rx="50" ry="38" fill="white" stroke="black" stroke-width="10"/>
  <ellipse cx="150" cy="155" rx="12" ry="55" fill="white" stroke="black" stroke-width="10"/>
  <line x1="145" y1="85" x2="125" y2="55" stroke="black" stroke-width="7" stroke-linecap="round"/>
  <line x1="155" y1="85" x2="175" y2="55" stroke="black" stroke-width="7" stroke-linecap="round"/>
</svg>`,
  },
  {
    id: "pez",
    titulo: "El pez",
    frase: "¡Pinta el pez del mar!",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="white"/>
  <ellipse cx="140" cy="150" rx="95" ry="65" fill="white" stroke="black" stroke-width="10"/>
  <polygon points="235,150 280,100 280,200" fill="white" stroke="black" stroke-width="10" stroke-linejoin="round"/>
  <circle cx="90" cy="130" r="10" fill="black"/>
</svg>`,
  },
  {
    id: "casa",
    titulo: "La casa",
    frase: "¡Pinta la casita!",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="white"/>
  <rect x="55" y="155" width="190" height="120" fill="white" stroke="black" stroke-width="10" stroke-linejoin="round"/>
  <polygon points="150,35 260,155 40,155" fill="white" stroke="black" stroke-width="10" stroke-linejoin="round"/>
  <rect x="120" y="210" width="60" height="65" fill="white" stroke="black" stroke-width="10" stroke-linejoin="round"/>
  <rect x="70" y="175" width="45" height="45" fill="white" stroke="black" stroke-width="10" stroke-linejoin="round"/>
  <rect x="185" y="175" width="45" height="45" fill="white" stroke="black" stroke-width="10" stroke-linejoin="round"/>
</svg>`,
  },
  {
    id: "corazon",
    titulo: "El corazón",
    frase: "¡Pinta el corazón con amor!",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="white"/>
  <path d="M 150 240 C 80 190 30 150 30 105 C 30 70 55 45 90 45 C 110 45 130 55 150 75 C 170 55 190 45 210 45 C 245 45 270 70 270 105 C 270 150 220 190 150 240 Z" fill="white" stroke="black" stroke-width="10" stroke-linejoin="round"/>
</svg>`,
  },
  {
    id: "pelota",
    titulo: "La pelota",
    frase: "¡Pinta la pelota de colores!",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="white"/>
  <circle cx="150" cy="150" r="115" fill="white" stroke="black" stroke-width="10"/>
  <path d="M 35 150 Q 92 100 150 150 Q 208 200 265 150" fill="none" stroke="black" stroke-width="10"/>
  <path d="M 150 35 Q 100 92 150 150 Q 200 208 150 265" fill="none" stroke="black" stroke-width="10"/>
</svg>`,
  },
  {
    id: "globo",
    titulo: "El globo",
    frase: "¡Pinta el globo que sube!",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="white"/>
  <ellipse cx="150" cy="125" rx="90" ry="105" fill="white" stroke="black" stroke-width="10"/>
  <path d="M 120 228 Q 140 250 150 265 Q 160 250 180 228" fill="none" stroke="black" stroke-width="10" stroke-linecap="round"/>
  <line x1="130" y1="230" x2="170" y2="230" stroke="black" stroke-width="10" stroke-linecap="round"/>
</svg>`,
  },
  {
    id: "seta",
    titulo: "La seta",
    frase: "¡Pinta la seta del bosque!",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="white"/>
  <rect x="120" y="175" width="60" height="95" rx="10" fill="white" stroke="black" stroke-width="10" stroke-linejoin="round"/>
  <path d="M 40 175 Q 40 50 150 50 Q 260 50 260 175 Z" fill="white" stroke="black" stroke-width="10" stroke-linejoin="round"/>
  <circle cx="120" cy="110" r="18" fill="white" stroke="black" stroke-width="8"/>
  <circle cx="170" cy="85" r="14" fill="white" stroke="black" stroke-width="8"/>
  <circle cx="200" cy="125" r="16" fill="white" stroke="black" stroke-width="8"/>
</svg>`,
  },
  {
    id: "manzana",
    titulo: "La manzana",
    frase: "¡Pinta la manzana roja!",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="white"/>
  <path d="M 150 80 C 80 80 40 130 40 180 C 40 240 90 270 150 270 C 210 270 260 240 260 180 C 260 130 220 80 150 80 Z" fill="white" stroke="black" stroke-width="10"/>
  <path d="M 150 80 Q 155 50 175 40" fill="none" stroke="black" stroke-width="8" stroke-linecap="round"/>
  <ellipse cx="185" cy="35" rx="18" ry="25" fill="white" stroke="black" stroke-width="8" transform="rotate(-20 185 35)"/>
</svg>`,
  },
  {
    id: "tren",
    titulo: "El tren",
    frase: "¡Pinta el tren chuchú!",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="white"/>
  <rect x="30" y="130" width="110" height="90" rx="12" fill="white" stroke="black" stroke-width="10" stroke-linejoin="round"/>
  <rect x="150" y="155" width="120" height="65" rx="10" fill="white" stroke="black" stroke-width="10" stroke-linejoin="round"/>
  <rect x="55" y="105" width="60" height="35" rx="8" fill="white" stroke="black" stroke-width="10" stroke-linejoin="round"/>
  <circle cx="65" cy="235" r="22" fill="white" stroke="black" stroke-width="10"/>
  <circle cx="130" cy="235" r="22" fill="white" stroke="black" stroke-width="10"/>
  <circle cx="195" cy="235" r="22" fill="white" stroke="black" stroke-width="10"/>
  <circle cx="255" cy="235" r="22" fill="white" stroke="black" stroke-width="10"/>
  <rect x="55" y="155" width="35" height="30" rx="5" fill="white" stroke="black" stroke-width="8"/>
  <rect x="165" y="168" width="30" height="28" rx="5" fill="white" stroke="black" stroke-width="8"/>
  <rect x="210" y="168" width="30" height="28" rx="5" fill="white" stroke="black" stroke-width="8"/>
  <line x1="30" y1="258" x2="270" y2="258" stroke="black" stroke-width="8" stroke-linecap="round"/>
</svg>`,
  },
  {
    id: "barco",
    titulo: "El barco",
    frase: "¡Pinta el barco velero!",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="white"/>
  <path d="M 40 200 L 80 260 L 220 260 L 260 200 Z" fill="white" stroke="black" stroke-width="10" stroke-linejoin="round"/>
  <line x1="150" y1="200" x2="150" y2="50" stroke="black" stroke-width="10" stroke-linecap="round"/>
  <polygon points="150,55 150,195 60,140" fill="white" stroke="black" stroke-width="10" stroke-linejoin="round"/>
  <polygon points="150,55 150,155 230,110" fill="white" stroke="black" stroke-width="10" stroke-linejoin="round"/>
</svg>`,
  },
  {
    id: "helado",
    titulo: "El helado",
    frase: "¡Pinta el helado rico!",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="white"/>
  <polygon points="150,275 90,155 210,155" fill="white" stroke="black" stroke-width="10" stroke-linejoin="round"/>
  <ellipse cx="150" cy="115" rx="60" ry="50" fill="white" stroke="black" stroke-width="10"/>
  <ellipse cx="110" cy="100" rx="42" ry="42" fill="white" stroke="black" stroke-width="10"/>
  <ellipse cx="190" cy="100" rx="42" ry="42" fill="white" stroke="black" stroke-width="10"/>
</svg>`,
  },
  {
    id: "cohete",
    titulo: "El cohete",
    frase: "¡Pinta el cohete espacial!",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="white"/>
  <path d="M 150 25 C 110 25 85 70 85 120 L 85 220 L 150 220 L 215 220 L 215 120 C 215 70 190 25 150 25 Z" fill="white" stroke="black" stroke-width="10" stroke-linejoin="round"/>
  <polygon points="85,180 45,230 85,220" fill="white" stroke="black" stroke-width="10" stroke-linejoin="round"/>
  <polygon points="215,180 255,230 215,220" fill="white" stroke="black" stroke-width="10" stroke-linejoin="round"/>
  <path d="M 100 240 Q 150 280 200 240" fill="white" stroke="black" stroke-width="10" stroke-linecap="round"/>
  <circle cx="150" cy="130" r="28" fill="white" stroke="black" stroke-width="10"/>
</svg>`,
  },
  {
    id: "gato",
    titulo: "El gato",
    frase: "¡Pinta el gatito!",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="white"/>
  <ellipse cx="150" cy="185" rx="85" ry="75" fill="white" stroke="black" stroke-width="10"/>
  <circle cx="150" cy="105" r="60" fill="white" stroke="black" stroke-width="10"/>
  <polygon points="98,55 78,10 120,48" fill="white" stroke="black" stroke-width="10" stroke-linejoin="round"/>
  <polygon points="202,55 222,10 180,48" fill="white" stroke="black" stroke-width="10" stroke-linejoin="round"/>
  <circle cx="125" cy="100" r="10" fill="black"/>
  <circle cx="175" cy="100" r="10" fill="black"/>
  <path d="M 135 118 Q 150 128 165 118" fill="none" stroke="black" stroke-width="7" stroke-linecap="round"/>
  <line x1="90" y1="108" x2="50" y2="100" stroke="black" stroke-width="6" stroke-linecap="round"/>
  <line x1="90" y1="115" x2="48" y2="115" stroke="black" stroke-width="6" stroke-linecap="round"/>
  <line x1="210" y1="108" x2="250" y2="100" stroke="black" stroke-width="6" stroke-linecap="round"/>
  <line x1="210" y1="115" x2="252" y2="115" stroke="black" stroke-width="6" stroke-linecap="round"/>
  <path d="M 95 245 Q 95 270 115 270 Q 130 270 130 255 L 130 245" fill="white" stroke="black" stroke-width="10" stroke-linecap="round"/>
  <path d="M 205 245 Q 205 270 185 270 Q 170 270 170 255 L 170 245" fill="white" stroke="black" stroke-width="10" stroke-linecap="round"/>
</svg>`,
  },
  {
    id: "perro",
    titulo: "El perro",
    frase: "¡Pinta el perrito!",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="white"/>
  <ellipse cx="150" cy="195" rx="90" ry="70" fill="white" stroke="black" stroke-width="10"/>
  <circle cx="150" cy="110" r="58" fill="white" stroke="black" stroke-width="10"/>
  <ellipse cx="100" cy="75" rx="22" ry="38" fill="white" stroke="black" stroke-width="10" transform="rotate(-15 100 75)"/>
  <ellipse cx="200" cy="75" rx="22" ry="38" fill="white" stroke="black" stroke-width="10" transform="rotate(15 200 75)"/>
  <circle cx="128" cy="105" r="10" fill="black"/>
  <circle cx="172" cy="105" r="10" fill="black"/>
  <ellipse cx="150" cy="128" rx="20" ry="14" fill="white" stroke="black" stroke-width="8"/>
  <path d="M 130 140 Q 150 158 170 140" fill="white" stroke="black" stroke-width="7" stroke-linecap="round"/>
  <rect x="90" y="255" width="28" height="40" rx="8" fill="white" stroke="black" stroke-width="10"/>
  <rect x="130" y="255" width="28" height="40" rx="8" fill="white" stroke="black" stroke-width="10"/>
  <rect x="170" y="255" width="28" height="40" rx="8" fill="white" stroke="black" stroke-width="10"/>
  <path d="M 230 190 Q 265 175 270 200 Q 265 215 230 205" fill="white" stroke="black" stroke-width="8" stroke-linecap="round"/>
</svg>`,
  },
];
