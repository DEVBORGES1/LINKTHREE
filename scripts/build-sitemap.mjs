/**
 * Gera public/sitemap.xml e public/robots.txt.
 *
 * Lê as páginas de public/ e ignora automaticamente o que não vai ao ar (a
 * lista UNPUBLISHED do minify.mjs) e o que não deve ser indexado.
 *
 * Rodar com:  npm run sitemap
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const SEP = new RegExp('\\\\', 'g');

/**
 * ATENÇÃO: confira este endereço antes de publicar.
 *
 * É o domínio que aparece nas tags og:url do projeto. Se o site estiver no ar
 * pelo endereço padrão do GitHub Pages, o valor certo é
 * 'https://devborges1.github.io/LINKTHREE' — um sitemap com o domínio errado é
 * simplesmente ignorado pelo Google.
 */
const SITE = 'https://www.nathiaraborges.adv.br';

/** Mesma lista do minify.mjs: o que não vai ao ar não entra no sitemap. */
const NAO_PUBLICADAS = ['vendas', 'landing'];

/** Páginas que existem no ar mas não devem ser indexadas. */
const NAO_INDEXAR = [
  'escritorio/chat-widget.html', // fragmento do widget, não é página de conteúdo
];

/** Prioridade e frequência por página. Quem não está aqui usa o padrão. */
const PESOS = {
  '/': { priority: '1.0', changefreq: 'monthly' },
  '/escritorio/': { priority: '0.9', changefreq: 'monthly' },
  '/mentoria/': { priority: '0.9', changefreq: 'monthly' },
  '/portfolio/': { priority: '0.8', changefreq: 'monthly' },
};

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(d, e.name);
  return e.isDirectory() ? walk(p) : [p];
});

const paginas = [];
for (const abs of walk(PUBLIC)) {
  if (!abs.endsWith('.html')) continue;
  const rel = path.relative(PUBLIC, abs).replace(SEP, '/');

  if (NAO_PUBLICADAS.some((d) => rel === d || rel.startsWith(`${d}/`))) continue;
  if (NAO_INDEXAR.includes(rel)) continue;
  if (path.basename(rel).startsWith('_')) continue;

  // Diretórios servem index.html na URL sem o arquivo.
  const url = rel === 'index.html' ? '/' : `/${rel.replace(/(^|\/)index\.html$/, '$1')}`;
  const mtime = fs.statSync(abs).mtime.toISOString().slice(0, 10);
  paginas.push({ url, mtime });
}

paginas.sort((a, b) => a.url.localeCompare(b.url));

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Gerado por scripts/build-sitemap.mjs. Não editar à mão: rode npm run sitemap. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paginas.map(({ url, mtime }) => {
    const peso = PESOS[url] || { priority: '0.6', changefreq: 'yearly' };
    return `  <url>
    <loc>${SITE}${url}</loc>
    <lastmod>${mtime}</lastmod>
    <changefreq>${peso.changefreq}</changefreq>
    <priority>${peso.priority}</priority>
  </url>`;
  }).join('\n')}
</urlset>
`;

const robots = `# Gerado por scripts/build-sitemap.mjs. Não editar à mão.

User-agent: *
Allow: /
${NAO_INDEXAR.map((p) => `Disallow: /${p}`).join('\n')}
${NAO_PUBLICADAS.map((d) => `Disallow: /${d}/`).join('\n')}

Sitemap: ${SITE}/sitemap.xml
`;

fs.writeFileSync(path.join(PUBLIC, 'sitemap.xml'), xml, 'utf8');
fs.writeFileSync(path.join(PUBLIC, 'robots.txt'), robots, 'utf8');

console.log(`sitemap.xml: ${paginas.length} página(s)`);
paginas.forEach((p) => console.log(`  ${SITE}${p.url}`));
console.log('\nrobots.txt gerado.');
console.log(`\nDomínio usado: ${SITE}`);
console.log('Se o site não estiver nesse endereço, ajuste a constante SITE neste arquivo.');
