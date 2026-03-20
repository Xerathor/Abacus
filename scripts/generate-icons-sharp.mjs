import sharp from "sharp";
import { mkdirSync } from "fs";

mkdirSync("public/icons", { recursive: true });

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
<rect width="512" height="512" rx="64" fill="#1e3a8a"/>
<line x1="64" y1="154" x2="448" y2="154" stroke="rgba(255,255,255,.35)" stroke-width="14" stroke-linecap="round"/>
<line x1="64" y1="230" x2="448" y2="230" stroke="rgba(255,255,255,.35)" stroke-width="14" stroke-linecap="round"/>
<line x1="64" y1="306" x2="448" y2="306" stroke="rgba(255,255,255,.35)" stroke-width="14" stroke-linecap="round"/>
<line x1="64" y1="382" x2="448" y2="382" stroke="rgba(255,255,255,.35)" stroke-width="14" stroke-linecap="round"/>
<circle cx="100" cy="154" r="26" fill="#60a5fa"/>
<circle cx="152" cy="154" r="26" fill="#60a5fa"/>
<circle cx="204" cy="154" r="26" fill="#60a5fa"/>
<circle cx="100" cy="230" r="26" fill="#60a5fa"/>
<circle cx="152" cy="230" r="26" fill="#60a5fa"/>
<circle cx="100" cy="306" r="26" fill="#60a5fa"/>
<circle cx="152" cy="306" r="26" fill="#60a5fa"/>
<circle cx="204" cy="306" r="26" fill="#60a5fa"/>
<circle cx="256" cy="306" r="26" fill="#60a5fa"/>
<circle cx="100" cy="382" r="26" fill="#60a5fa"/>
<circle cx="412" cy="154" r="26" fill="rgba(255,255,255,.15)"/>
<circle cx="412" cy="230" r="26" fill="rgba(255,255,255,.15)"/>
<circle cx="412" cy="306" r="26" fill="rgba(255,255,255,.15)"/>
<circle cx="412" cy="382" r="26" fill="rgba(255,255,255,.15)"/>
<circle cx="360" cy="382" r="26" fill="rgba(255,255,255,.15)"/>
</svg>`;

const buf = Buffer.from(svg);

for (const size of [192, 512]) {
  await sharp(buf).resize(size, size).png().toFile(`public/icons/icon-${size}.png`);
  console.log(`✓ icon-${size}.png`);
}
