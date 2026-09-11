/**
 * Gera um Font Awesome enxuto e auto-hospedado.
 *
 * O CDN entrega 100 KB de CSS + 250 KB de webfonts com 2000+ icones.
 * As paginas usam ~70. Este script varre o HTML/JS, descobre quais icones
 * aparecem de fato e gera:
 *
 *   public/assets/css/icons.css
 *   public/assets/fonts/fa-solid-900.woff2   (so os glifos usados)
 *   public/assets/fonts/fa-brands-400.woff2  (so os glifos usados)
 *
 * As classes continuam as mesmas (`fas fa-star`, `fab fa-whatsapp`), entao
 * nenhum HTML ou CSS existente precisa mudar.
 *
 * Rodar com:  npm run icons
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const FA = path.join(ROOT, 'node_modules', '@fortawesome', 'fontawesome-free');
const CSS_OUT = path.join(PUBLIC, 'assets', 'css', 'icons.css');
const FONT_DIR = path.join(PUBLIC, 'assets', 'fonts');

const SEP = new RegExp('\\\\', 'g');
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(d, e.name);
  return e.isDirectory() ? walk(p) : [p];
});

// Classes utilitarias do Font Awesome que nao sao nomes de icone.
const NOT_AN_ICON = /^fa-(solid|regular|brands|classic|sharp|duotone|1?[0-9]x|2xs|xs|sm|lg|xl|2xl|fw|ul|li|border|pull-left|pull-right|spin|spin-pulse|spin-reverse|pulse|beat|fade|beat-fade|bounce|shake|flip|flip-horizontal|flip-vertical|flip-both|rotate-(90|180|270|by)|stack|stack-1x|stack-2x|inverse|swap-opacity)$/;

// 1. Quais icones as paginas usam de fato
const used = new Set();
for (const file of walk(PUBLIC)) {
  if (!/\.(html|js|css)$/i.test(file)) continue;
  if (path.resolve(file) === CSS_OUT) continue; // nao varrer o proprio arquivo gerado
  const txt = fs.readFileSync(file, 'utf8');
  for (const m of txt.matchAll(/\bfa-([a-z0-9-]+)/g)) {
    const name = `fa-${m[1]}`;
    if (!NOT_AN_ICON.test(name)) used.add(m[1]);
  }
}

// 2. Nome do icone -> codepoint, lido do proprio CSS do Font Awesome.
//    Os icones classicos ficam em fontawesome.css; as marcas, em brands.css.
const codepoints = new Map();
const brandNames = new Set();
for (const sheet of ['fontawesome.css', 'brands.css']) {
  const txt = fs.readFileSync(path.join(FA, 'css', sheet), 'utf8');
  for (const m of txt.matchAll(/((?:\.fa-[a-z0-9-]+\s*,?\s*)+)\{\s*--fa:\s*"\\([0-9a-f]+)"/g)) {
    const cp = m[2];
    for (const sel of m[1].split(',')) {
      const name = sel.trim().replace(/^\.fa-/, '');
      if (!name) continue;
      codepoints.set(name, cp);
      if (sheet === 'brands.css') brandNames.add(name);
    }
  }
}

const resolved = [];
const missing = [];
for (const name of [...used].sort()) {
  const cp = codepoints.get(name);
  if (cp) resolved.push([name, cp]);
  else missing.push(name);
}

// 3. Subset dos webfonts. Passamos todos os codepoints para os dois arquivos;
//    cada fonte guarda apenas os glifos que realmente possui.
const text = resolved.map(([, cp]) => String.fromCodePoint(parseInt(cp, 16))).join('');
fs.mkdirSync(FONT_DIR, { recursive: true });

const FONTS = [
  { file: 'fa-solid-900.woff2', family: 'Font Awesome 6 Free', weight: 900 },
  { file: 'fa-brands-400.woff2', family: 'Font Awesome 6 Brands', weight: 400 },
];

let originalBytes = 0;
let subsetBytes = 0;
for (const font of FONTS) {
  const src = path.join(FA, 'webfonts', font.file);
  const buf = await subsetFont(fs.readFileSync(src), text, { targetFormat: 'woff2' });
  fs.writeFileSync(path.join(FONT_DIR, font.file), buf);
  originalBytes += fs.statSync(src).size;
  subsetBytes += buf.length;
  console.log(`${font.file}: ${Math.round(fs.statSync(src).size / 1024)} KB -> ${Math.round(buf.length / 1024)} KB`);
}

// 4. CSS minimo: @font-face + regras base + os icones usados
const faceCss = FONTS.map((f) => `@font-face {
  font-family: '${f.family}';
  font-style: normal;
  font-weight: ${f.weight};
  font-display: swap;
  src: url('../fonts/${f.file}') format('woff2');
}`).join('\n\n');

const iconRules = resolved
  .map(([name, cp]) => `.fa-${name} { --fa: "\\${cp}"; }`)
  .join('\n');

const css = `/* Font Awesome Free 6.7.2 - subset gerado por scripts/build-icons.mjs. NAO EDITAR A MAO.
   Icones: CC BY 4.0 / Fontes: SIL OFL 1.1 / Codigo: MIT - https://fontawesome.com/license/free
   ${resolved.length} icones incluidos. Para adicionar um icone novo, use a classe no HTML e rode: npm run icons */

${faceCss}

.fa,
.fas,
.fab,
.fa-solid,
.fa-brands {
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  display: var(--fa-display, inline-block);
  font-style: normal;
  font-variant: normal;
  line-height: 1;
  text-rendering: auto;
}

.fa,
.fas,
.fa-solid {
  font-family: 'Font Awesome 6 Free';
  font-weight: 900;
}

.fab,
.fa-brands {
  font-family: 'Font Awesome 6 Brands';
  font-weight: 400;
}

.fa::before,
.fas::before,
.fab::before,
.fa-solid::before,
.fa-brands::before {
  content: var(--fa);
}

.fa-spin {
  animation: fa-spin 2s linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  .fa-spin {
    animation: none;
  }
}

@keyframes fa-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

${iconRules}
`;

fs.mkdirSync(path.dirname(CSS_OUT), { recursive: true });
fs.writeFileSync(CSS_OUT, css, 'utf8');

console.log('');
console.log(`icons.css: ${Math.round(css.length / 1024)} KB com ${resolved.length} icones`);
console.log(`webfonts:  ${Math.round(originalBytes / 1024)} KB -> ${Math.round(subsetBytes / 1024)} KB`);
if (missing.length) {
  console.log('');
  console.log(`AVISO: ${missing.length} classe(s) fa-* sem icone correspondente (verifique se o nome esta certo):`);
  console.log(`  ${missing.join(', ')}`);
}
console.log(`\nArquivos gerados em ${path.relative(ROOT, PUBLIC).replace(SEP, '/')}/assets/`);
