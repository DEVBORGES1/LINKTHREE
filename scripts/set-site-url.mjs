/**
 * Aplica os valores do site-config.mjs no HTML de public/:
 *
 *   - SITE_URL      em og:url, og:image e canonical
 *   - CONTACT_EMAIL no data-email dos formulários de contato
 *
 * As tags de compartilhamento não podem ser relativas — o WhatsApp e o Facebook
 * buscam a imagem de fora do site, então precisam do endereço completo.
 *
 * Rodar com:  npm run site-url
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_URL, CONTACT_EMAIL } from './site-config.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const SEP = new RegExp('\\\\', 'g');

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(d, e.name);
  return e.isDirectory() ? walk(p) : [p];
});

/** Caminho da página dentro do site, a partir do arquivo. */
function caminhoDaPagina(rel) {
  if (rel === 'index.html') return '/';
  return `/${rel.replace(/(^|\/)index\.html$/, '$1')}`;
}

const base = SITE_URL.replace(/\/+$/, '');
let alterados = 0;
const detalhes = [];

for (const abs of walk(PUBLIC)) {
  if (!abs.endsWith('.html')) continue;
  const rel = path.relative(PUBLIC, abs).replace(SEP, '/');
  if (path.basename(rel).startsWith('_')) continue;

  let s = fs.readFileSync(abs, 'utf8');
  const antes = s;

  // og:url e canonical apontam para a própria página
  const url = base + caminhoDaPagina(rel);
  s = s.replace(
    /(<meta property="og:url" content=")[^"]*(")/,
    `$1${url}$2`,
  );
  s = s.replace(
    /(<link rel="canonical" href=")[^"]*(")/,
    `$1${url}$2`,
  );

  // og:image é sempre a mesma peça, na raiz
  s = s.replace(
    /(<meta property="og:image" content=")[^"]*(")/,
    `$1${base}/assets/images/og-image.jpg$2`,
  );

  // Destino dos formulários de contato. A troca é feita dentro da própria tag
  // <form>, e não com um salto livre pelo documento: assim não há como o padrão
  // atravessar um formulário e pegar o data-email do seguinte.
  s = s.replace(
    /<form[^>]*data-form-contato[^>]*>/g,
    (tag) => tag.replace(/(data-email=")[^"]*(")/, `$1${CONTACT_EMAIL}$2`),
  );

  if (s !== antes) {
    fs.writeFileSync(abs, s, 'utf8');
    alterados += 1;
    detalhes.push(`  ${rel}  ->  ${url}`);
  }
}

console.log(`SITE_URL: ${base}`);
console.log(`${alterados} página(s) atualizada(s)`);
detalhes.forEach((d) => console.log(d));
if (!alterados) console.log('  (nada a mudar — as tags já estavam com esse endereço)');
