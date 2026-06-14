export interface Figura {
  label: string;
  frase: string;
  puntos: { x: number; y: number }[];
}

// Puntos en % de viewport (iPad vertical 768×1024 como referencia).
// Orden = orden natural de escritura en imprenta mayúscula.
// Área usada: x 25–75%, y 22–72% (centro de pantalla).

export const NUMEROS: Figura[] = [
  {
    label: "0",
    frase: "el número cero",
    puntos: [
      { x: 50, y: 24 }, // arriba centro
      { x: 70, y: 33 }, // der arriba
      { x: 70, y: 58 }, // der abajo
      { x: 50, y: 68 }, // abajo centro
      { x: 30, y: 58 }, // izq abajo
      { x: 30, y: 33 }, // izq arriba
    ],
  },
  {
    label: "1",
    frase: "el número uno",
    puntos: [
      { x: 44, y: 24 }, // diagonal inicio
      { x: 50, y: 22 }, // punta arriba
      { x: 50, y: 68 }, // abajo
    ],
  },
  {
    label: "2",
    frase: "el número dos",
    puntos: [
      { x: 33, y: 30 }, // izq arriba
      { x: 50, y: 24 }, // arriba centro
      { x: 67, y: 30 }, // der arriba
      { x: 67, y: 44 }, // der centro
      { x: 33, y: 60 }, // izq abajo
      { x: 67, y: 68 }, // der abajo
    ],
  },
  {
    label: "3",
    frase: "el número tres",
    puntos: [
      { x: 33, y: 24 }, // izq arriba
      { x: 67, y: 24 }, // der arriba
      { x: 50, y: 46 }, // centro medio
      { x: 67, y: 68 }, // der abajo
      { x: 33, y: 68 }, // izq abajo
    ],
  },
  {
    label: "4",
    frase: "el número cuatro",
    puntos: [
      { x: 33, y: 24 }, // izq arriba
      { x: 33, y: 50 }, // izq centro
      { x: 67, y: 50 }, // der centro
      { x: 67, y: 24 }, // der arriba
      { x: 67, y: 68 }, // der abajo
    ],
  },
  {
    label: "5",
    frase: "el número cinco",
    puntos: [
      { x: 67, y: 24 }, // der arriba
      { x: 33, y: 24 }, // izq arriba
      { x: 33, y: 44 }, // izq centro
      { x: 60, y: 44 }, // der centro
      { x: 67, y: 56 }, // der abajo
      { x: 33, y: 68 }, // izq abajo
    ],
  },
  {
    label: "6",
    frase: "el número seis",
    puntos: [
      { x: 65, y: 24 }, // der arriba
      { x: 33, y: 36 }, // izq arriba
      { x: 33, y: 60 }, // izq abajo
      { x: 50, y: 68 }, // abajo centro
      { x: 67, y: 60 }, // der abajo
      { x: 50, y: 46 }, // centro medio
    ],
  },
  {
    label: "7",
    frase: "el número siete",
    puntos: [
      { x: 33, y: 24 }, // izq arriba
      { x: 67, y: 24 }, // der arriba
      { x: 42, y: 68 }, // abajo izq
    ],
  },
  {
    label: "8",
    frase: "el número ocho",
    puntos: [
      { x: 50, y: 24 }, // arriba centro
      { x: 67, y: 32 }, // der arriba
      { x: 50, y: 46 }, // centro
      { x: 33, y: 58 }, // izq abajo
      { x: 50, y: 68 }, // abajo centro
      { x: 67, y: 58 }, // der abajo
      { x: 50, y: 46 }, // vuelve centro
    ],
  },
  {
    label: "9",
    frase: "el número nueve",
    puntos: [
      { x: 50, y: 24 }, // arriba centro
      { x: 67, y: 32 }, // der arriba
      { x: 67, y: 46 }, // der abajo-bucle
      { x: 50, y: 54 }, // centro bucle
      { x: 33, y: 46 }, // izq bucle
      { x: 33, y: 32 }, // izq arriba
      { x: 65, y: 68 }, // cola abajo-der
    ],
  },
];

export const VOCALES: Figura[] = [
  {
    label: "A",
    frase: "la vocal A",
    puntos: [
      { x: 50, y: 22 }, // punta arriba
      { x: 68, y: 68 }, // der abajo
      { x: 50, y: 50 }, // travesaño der
      { x: 32, y: 50 }, // travesaño izq
      { x: 32, y: 68 }, // izq abajo
    ],
  },
  {
    label: "E",
    frase: "la vocal E",
    puntos: [
      { x: 65, y: 24 }, // der arriba
      { x: 35, y: 24 }, // izq arriba
      { x: 35, y: 46 }, // izq centro
      { x: 60, y: 46 }, // der centro
      { x: 35, y: 68 }, // izq abajo
      { x: 65, y: 68 }, // der abajo
    ],
  },
  {
    label: "I",
    frase: "la vocal I",
    puntos: [
      { x: 38, y: 24 }, // izq arriba
      { x: 62, y: 24 }, // der arriba
      { x: 50, y: 24 }, // centro arriba
      { x: 50, y: 68 }, // centro abajo
      { x: 38, y: 68 }, // izq abajo
      { x: 62, y: 68 }, // der abajo
    ],
  },
  {
    label: "O",
    frase: "la vocal O",
    puntos: [
      { x: 50, y: 22 }, // arriba
      { x: 68, y: 34 }, // der arriba
      { x: 68, y: 58 }, // der abajo
      { x: 50, y: 68 }, // abajo
      { x: 32, y: 58 }, // izq abajo
      { x: 32, y: 34 }, // izq arriba
    ],
  },
  {
    label: "U",
    frase: "la vocal U",
    puntos: [
      { x: 33, y: 24 }, // izq arriba
      { x: 33, y: 56 }, // izq abajo
      { x: 50, y: 68 }, // fondo centro
      { x: 67, y: 56 }, // der abajo
      { x: 67, y: 24 }, // der arriba
    ],
  },
];
