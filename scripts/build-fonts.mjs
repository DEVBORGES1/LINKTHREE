/**
 * Copia as fontes para public/assets/fonts e gera public/assets/css/fonts.css.
 *
 * Antes as fontes vinham do Google Fonts, pedidas duas vezes (uma via <link> no
 * HTML e outra via @import no CSS, que bloqueia a renderizacao em cascata) e com
 * ate 18 pesos por familia. Agora sao auto-hospedadas, no subset latino, com
 * Inter e Playfair em versao variavel (um arquivo cobre todos os pesos).
 *
 * Rodar com:  npm run fonts
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODULES = path.join(ROOT, 'node_modules');
const FONT_DIR = path.join(ROOT, 'public', 'assets', 'fonts');
const CSS_OUT = path.join(ROOT, 'public', 'assets', 'css', 'fonts.css');

/**
 * `range` preenche font-weight de uma fonte variavel (um arquivo, todos os pesos).
 * Sem `range`, e um peso fixo.
 */
const FONTS = [
  {
    family: 'Inter',
    src: '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2',
    out: 'inter-latin-variable.woff2',
    range: '100 900',
    style: 'normal',
  },
  {
    family: 'Playfair Display',
    src: '@fontsource-variable/playfair-display/files/playfair-display-latin-wght-normal.woff2',
    out: 'playfair-display-latin-variable.woff2',
    range: '400 900',
    style: 'normal',
  },
  {
    family: 'Playfair Display',
    src: '@fontsource-variable/playfair-display/files/playfair-display-latin-wght-italic.woff2',
    out: 'playfair-display-latin-variable-italic.woff2',
    range: '400 900',
    style: 'italic',
  },
  { family: 'Poppins', src: '@fontsource/poppins/files/poppins-latin-400-normal.woff2', out: 'poppins-latin-400.woff2', weight: 400, style: 'normal' },
  { family: 'Poppins', src: '@fontsource/poppins/files/poppins-latin-600-normal.woff2', out: 'poppins-latin-600.woff2', weight: 600, style: 'normal' },
  { family: 'Poppins', src: '@fontsource/poppins/files/poppins-latin-700-normal.woff2', out: 'poppins-latin-700.woff2', weight: 700, style: 'normal' },
];

// U+0000-00FF cobre todo o portugues (a, c, o, e acentuadas inclusive).
const UNICODE_RANGE = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';

fs.mkdirSync(FONT_DIR, { recursive: true });
fs.mkdirSync(path.dirname(CSS_OUT), { recursive: true });

let total = 0;
const faces = [];
for (const font of FONTS) {
  const src = path.join(MODULES, font.src);
  if (!fs.existsSync(src)) {
    console.error(`FALTA  ${font.src}`);
    process.exit(1);
  }
  fs.copyFileSync(src, path.join(FONT_DIR, font.out));
  const size = fs.statSync(src).size;
  total += size;
  console.log(`${String(Math.round(size / 1024)).padStart(4)} KB  ${font.out}`);

  faces.push(`@font-face {
  font-family: '${font.family}';
  font-style: ${font.style};
  font-weight: ${font.range ?? font.weight};
  font-display: swap;
  src: url('../fonts/${font.out}') format('woff2');
  unicode-range: ${UNICODE_RANGE};
}`);
}

const css = `/* Fontes auto-hospedadas - gerado por scripts/build-fonts.mjs. NAO EDITAR A MAO.
   Inter: SIL OFL 1.1 / Playfair Display: SIL OFL 1.1 / Poppins: SIL OFL 1.1
   Subset latino. Inter e Playfair sao variaveis: um arquivo cobre todos os pesos.
   Para mudar a lista, edite scripts/build-fonts.mjs e rode: npm run fonts */

${faces.join('\n\n')}
`;

fs.writeFileSync(CSS_OUT, css, 'utf8');
console.log(`\nTotal: ${Math.round(total / 1024)} KB em ${FONTS.length} arquivos`);
