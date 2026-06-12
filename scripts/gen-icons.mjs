#!/usr/bin/env node
// Genera iconos PNG para el PWA usando canvas de Node.js
// Ejecutar: node scripts/gen-icons.mjs

import { createCanvas } from "canvas";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "../public/icons");
mkdirSync(outDir, { recursive: true });

function dibujarIcono(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Fondo degradado cielo
  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, "#EAF6FF");
  grad.addColorStop(1, "#C8E8FA");
  ctx.fillStyle = grad;
  ctx.roundRect?.(0, 0, size, size, size * 0.2);
  ctx.fill?.();

  // Fallback sin roundRect
  if (!ctx.roundRect) {
    ctx.fillRect(0, 0, size, size);
  }

  // Camino ondulado blanco
  const margin = size * 0.12;
  const cy = size * 0.55;
  const amp = size * 0.14;
  const grosor = size * 0.13;

  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = grosor;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    const x = margin + t * (size - 2 * margin);
    const y = cy + Math.sin(t * Math.PI * 3) * amp;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Arcoíris encima del camino
  ctx.lineWidth = grosor * 0.7;
  for (let i = 1; i <= 60; i++) {
    const t0 = (i - 1) / 60;
    const t1 = i / 60;
    const x0 = margin + t0 * (size - 2 * margin);
    const y0 = cy + Math.sin(t0 * Math.PI * 3) * amp;
    const x1 = margin + t1 * (size - 2 * margin);
    const y1 = cy + Math.sin(t1 * Math.PI * 3) * amp;
    const hue = (i / 60) * 300;
    ctx.strokeStyle = `hsl(${hue}, 85%, 60%)`;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }

  // Estrella al final
  const fx = size - margin;
  const fy = cy + Math.sin(Math.PI * 3) * amp;
  ctx.font = `${size * 0.22}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("⭐", fx, fy);

  return canvas.toBuffer("image/png");
}

for (const size of [180, 192, 512]) {
  const buf = dibujarIcono(size);
  writeFileSync(join(outDir, `icon-${size}.png`), buf);
  console.log(`✓ icon-${size}.png`);
}
