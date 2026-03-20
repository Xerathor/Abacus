#!/usr/bin/env node
/**
 * Generates /public/icons/icon-192.png and icon-512.png
 * Run once before deploy: node scripts/generate-icons.mjs
 *
 * Requires: npm install -D canvas  (only needed locally)
 * On Vercel — icons should already be committed to the repo.
 */

import { createCanvas } from "canvas";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "../public/icons");
mkdirSync(OUT_DIR, { recursive: true });

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  const r = size * 0.12; // corner radius

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, "#1e3a8a");
  grad.addColorStop(1, "#1e40af");
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Draw 4 abacus rods with beads
  const margin = size * 0.14;
  const rodY = [0.3, 0.45, 0.60, 0.75].map((f) => size * f);
  const rodX1 = size * 0.15;
  const rodX2 = size * 0.85;
  const beadR = size * 0.055;

  rodY.forEach((cy, ri) => {
    // Rod
    ctx.beginPath();
    ctx.moveTo(rodX1, cy);
    ctx.lineTo(rodX2, cy);
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = size * 0.025;
    ctx.lineCap = "round";
    ctx.stroke();

    // Active beads (left side)
    const activeCount = [3, 2, 4, 1][ri];
    const totalBeads = 10;
    for (let i = 0; i < activeCount; i++) {
      const cx = rodX1 + beadR + i * (beadR * 2 + size * 0.01);
      ctx.beginPath();
      ctx.arc(cx, cy, beadR, 0, Math.PI * 2);
      ctx.fillStyle = "#60a5fa";
      ctx.fill();
      ctx.strokeStyle = "#93c5fd";
      ctx.lineWidth = size * 0.008;
      ctx.stroke();
    }

    // Inactive beads (right side)
    for (let i = activeCount; i < totalBeads; i++) {
      const j = totalBeads - 1 - i;
      const cx = rodX2 - beadR - j * (beadR * 2 + size * 0.01);
      ctx.beginPath();
      ctx.arc(cx, cy, beadR, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.fill();
    }
  });

  // "С" letter top-left (subtle branding)
  ctx.font = `${size * 0.12}px sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fillText("С", size * 0.06, size * 0.18);

  return canvas.toBuffer("image/png");
}

for (const size of [192, 512]) {
  const buf = drawIcon(size);
  const out = join(OUT_DIR, `icon-${size}.png`);
  writeFileSync(out, buf);
  console.log(`✓ Generated ${out}`);
}
