#!/usr/bin/env node
/**
 * Generates minimal SVG-based placeholder icons for PWA.
 * Use this if "canvas" npm package is not available.
 * Writes /public/icons/icon.svg (used in HTML) and copies as-is for manifest.
 *
 * Run: node scripts/generate-icons-svg.mjs
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "../public/icons");
mkdirSync(OUT_DIR, { recursive: true });

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1e3a8a"/>
      <stop offset="100%" stop-color="#1e40af"/>
    </linearGradient>
  </defs>
  <rect width="192" height="192" rx="24" fill="url(#bg)"/>
  <!-- Rods -->
  <line x1="24" y1="58"  x2="168" y2="58"  stroke="rgba(255,255,255,.3)" stroke-width="5" stroke-linecap="round"/>
  <line x1="24" y1="86"  x2="168" y2="86"  stroke="rgba(255,255,255,.3)" stroke-width="5" stroke-linecap="round"/>
  <line x1="24" y1="114" x2="168" y2="114" stroke="rgba(255,255,255,.3)" stroke-width="5" stroke-linecap="round"/>
  <line x1="24" y1="142" x2="168" y2="142" stroke="rgba(255,255,255,.3)" stroke-width="5" stroke-linecap="round"/>
  <!-- Active beads row 1 (3 beads) -->
  <circle cx="40" cy="58" r="9" fill="#60a5fa"/><circle cx="60" cy="58" r="9" fill="#60a5fa"/><circle cx="80" cy="58" r="9" fill="#60a5fa"/>
  <!-- Active beads row 2 (2 beads) -->
  <circle cx="40" cy="86" r="9" fill="#60a5fa"/><circle cx="60" cy="86" r="9" fill="#60a5fa"/>
  <!-- Active beads row 3 (4 beads) -->
  <circle cx="40" cy="114" r="9" fill="#60a5fa"/><circle cx="60" cy="114" r="9" fill="#60a5fa"/>
  <circle cx="80" cy="114" r="9" fill="#60a5fa"/><circle cx="100" cy="114" r="9" fill="#60a5fa"/>
  <!-- Active beads row 4 (1 bead) -->
  <circle cx="40" cy="142" r="9" fill="#60a5fa"/>
  <!-- Inactive beads (faint) -->
  <circle cx="152" cy="58"  r="9" fill="rgba(255,255,255,.12)"/>
  <circle cx="134" cy="58"  r="9" fill="rgba(255,255,255,.12)"/>
  <circle cx="152" cy="86"  r="9" fill="rgba(255,255,255,.12)"/>
  <circle cx="134" cy="86"  r="9" fill="rgba(255,255,255,.12)"/>
  <circle cx="152" cy="114" r="9" fill="rgba(255,255,255,.12)"/>
  <circle cx="152" cy="142" r="9" fill="rgba(255,255,255,.12)"/>
  <circle cx="134" cy="142" r="9" fill="rgba(255,255,255,.12)"/>
</svg>`;

writeFileSync(join(OUT_DIR, "icon.svg"), svg);
// Write same file as "icon-192.png" name but SVG content — will work for manifest in browsers
// For production: use a real PNG converter (sharp, Inkscape, etc.)
writeFileSync(join(OUT_DIR, "icon-192.svg"), svg);
writeFileSync(join(OUT_DIR, "icon-512.svg"), svg);
console.log("✓ SVG icons written to public/icons/");
console.log("  Note: For production PNG icons, run: node scripts/generate-icons.mjs");
