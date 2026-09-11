/**
 * Minifica HTML, CSS e JS de public/ para uma pasta de saida (padrao: dist/).
 *
 * A pasta public/ continua legivel para edicao; quem vai para o ar e o dist/.
 * O workflow do GitHub Pages roda isto antes de publicar.
 *
 * Tambem e aqui que se decide o que NAO vai ao ar: veja UNPUBLISHED.
 *
 * Rodar com:  npm run minify
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { minify as minifyHtml } from 'html-minifier-terser';
import { transform } from 'lightningcss';
import { minify as minifyJs } from 'terser';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'public');
const OUT = path.join(ROOT, process.argv[2] || 'dist');

/**
 * Pastas de public/ que NAO vao para o ar.
 *
 * Elas continuam no repositorio e funcionam normalmente em `npm run dev`;
 * so ficam de fora do que e publicado. Para colocar uma no ar, apague a linha
 * correspondente e faca o deploy.
 *
 * - vendas:  ainda em desenvolvimento, a cliente nao decidiu.
 * - landing: existe so como funil para /vendas/ (o botao principal aponta para
 *            la), entao no ar sozinha o CTA seria um link quebrado.
 */
const UNPUBLISHED = [
  'vendas',
  'landing',
];

const SEP = new RegExp('\\\\', 'g');
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(d, e.name);
  return e.isDirectory() ? walk(p) : [p];
});

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

let before = 0;
let after = 0;
const rows = [];
const skipped = new Set();

for (const file of walk(SRC)) {
  const rel = path.relative(SRC, file).replace(SEP, '/');

  const unpublished = UNPUBLISHED.find((dir) => rel === dir || rel.startsWith(`${dir}/`));
  if (unpublished) {
    skipped.add(unpublished);
    continue;
  }

  const dest = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });

  const ext = path.extname(file).toLowerCase();
  const raw = fs.readFileSync(file);
  before += raw.length;

  if (ext === '.html') {
    const out = await minifyHtml(raw.toString('utf8'), {
      collapseWhitespace: true,
      conservativeCollapse: false,
      removeComments: true,
      removeRedundantAttributes: true,
      minifyCSS: true,
      minifyJS: true,
      // Não mexer em atributos entre aspas: quebra srcset e valores com espaço.
      removeAttributeQuotes: false,
    });
    fs.writeFileSync(dest, out, 'utf8');
    after += Buffer.byteLength(out);
    rows.push([rel, raw.length, Buffer.byteLength(out)]);
  } else if (ext === '.css') {
    const { code } = transform({
      filename: rel,
      code: raw,
      minify: true,
      // Alvo conservador: navegadores dos ultimos ~3 anos.
      targets: { chrome: 108 << 16, firefox: 108 << 16, safari: (16 << 16) | (1 << 8) },
    });
    fs.writeFileSync(dest, code);
    after += code.length;
    rows.push([rel, raw.length, code.length]);
  } else if (ext === '.js') {
    const result = await minifyJs(raw.toString('utf8'), {
      compress: true,
      mangle: true,
      format: { comments: false },
    });
    const code = result.code ?? raw.toString('utf8');
    fs.writeFileSync(dest, code, 'utf8');
    after += Buffer.byteLength(code);
    rows.push([rel, raw.length, Buffer.byteLength(code)]);
  } else {
    // Imagens, fontes, .nojekyll: copia sem tocar.
    fs.copyFileSync(file, dest);
    after += raw.length;
  }
}

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
rows.sort((a, b) => (b[1] - b[2]) - (a[1] - a[2]));
for (const [rel, a, b] of rows.slice(0, 12)) {
  console.log(`${kb(a).padStart(9)} -> ${kb(b).padStart(9)}  ${rel}`);
}
console.log('');
console.log(`Total public/ -> ${path.relative(ROOT, OUT).replace(SEP, '/')}/: ${kb(before)} -> ${kb(after)} (-${Math.round((1 - after / before) * 100)}%)`);

if (skipped.size) {
  console.log('');
  console.log(`NAO publicado (fica no repositorio, fora do ar): ${[...skipped].sort().join(', ')}`);
  console.log('Para publicar, remova da lista UNPUBLISHED em scripts/minify.mjs.');
}

// Caminho absoluto ("/assets/...") quebra o site inteiro.
// O GitHub Pages publica este repositorio em /LINKTHREE/ (project site, sem
// CNAME), entao "/" e a raiz do dominio, nao a do projeto: o CSS e as imagens
// dao 404 e a pagina aparece sem estilo nenhum. Tambem quebra ao abrir o
// arquivo direto pelo explorador. Todo caminho interno tem de ser relativo.
const absolutePaths = [];
for (const file of walk(OUT)) {
  if (!/\.(html|js)$/i.test(file)) continue;
  const rel = path.relative(OUT, file).replace(SEP, '/');
  const txt = fs.readFileSync(file, 'utf8');
  for (const m of txt.matchAll(/\b(?:href|src|srcset)\s*=\s*["']\/(?!\/)[^"']*/g)) {
    absolutePaths.push(`${rel}: ${m[0].slice(0, 60)}`);
  }
  for (const m of txt.matchAll(/(['"])\/(?:assets|escritorio|portfolio|mentoria|landing|vendas)\//g)) {
    absolutePaths.push(`${rel}: ${m[0]}...`);
  }
}
if (absolutePaths.length) {
  console.error('');
  console.error('ERRO: caminho absoluto encontrado (precisa ser relativo):');
  absolutePaths.slice(0, 20).forEach((l) => console.error(`  ${l}`));
  if (absolutePaths.length > 20) console.error(`  ... e mais ${absolutePaths.length - 20}`);
  process.exit(1);
}

// Nenhum link do que foi publicado pode apontar para o que ficou de fora.
const brokenLinks = [];
for (const file of walk(OUT)) {
  if (!/\.(html|css|js)$/i.test(file)) continue;
  const rel = path.relative(OUT, file).replace(SEP, '/');
  const txt = fs.readFileSync(file, 'utf8');
  for (const dir of UNPUBLISHED) {
    // Casa href="vendas/", href="../vendas/" e href="/vendas/", mas nao
    // href="vendas-antigo/". O caminho opcional antes tem de terminar em "/".
    const re = new RegExp(`(?:href|src)\\s*=\\s*["'](?:[^"']*/)?${dir}/`, 'i');
    if (re.test(txt)) brokenLinks.push(`${rel} -> /${dir}/`);
  }
}
if (brokenLinks.length) {
  console.error('');
  console.error('ERRO: pagina publicada aponta para pasta nao publicada:');
  brokenLinks.forEach((l) => console.error(`  ${l}`));
  process.exit(1);
}

// Palavra colada em tag inline.
//
// O collapseWhitespace do minificador remove o espaco entre texto e tag inline
// quando nao reconhece a tag como inline -- e ele so reconhece os nomes em
// minusculas. Um <SPAN> maiusculo no HTML passava batido no fonte e chegava ao
// ar como "PERGUNTASFREQUENTES.", palavra unica que nao tem onde quebrar e que
// estourava a largura da tela no celular.
//
// O defeito nao aparece em public/, so no que vai ao ar, entao precisa ser
// pego aqui.
const palavrasColadas = [];
for (const file of walk(OUT)) {
  if (!/\.html$/i.test(file)) continue;
  const rel = path.relative(OUT, file).replace(SEP, '/');
  const txt = fs.readFileSync(file, 'utf8');
  const inline = 'span|b|strong|i|em|small|mark|u|sub|sup|abbr|cite|code|a';
  // Letra ou digito colado na abertura, ou colado logo depois do fechamento.
  // A faixa À-ɏ cobre os acentuados; \p{L} nao serve aqui porque a
  // barra invertida sumiria dentro da template string.
  const letra = '[A-Za-z0-9\\u00C0-\\u024F]';
  const re = new RegExp(
    letra + '<(?:' + inline + ')[ >]'
    + '|</(?:' + inline + ')>' + letra,
    'gi',
  );
  for (const m of txt.matchAll(re)) {
    const ini = Math.max(0, m.index - 25);
    palavrasColadas.push(`${rel}: ...${txt.slice(ini, m.index + 30).replace(/\s+/g, ' ')}...`);
  }
}
if (palavrasColadas.length) {
  console.error('');
  console.error('ERRO: palavra colada em tag inline no HTML gerado:');
  palavrasColadas.slice(0, 10).forEach((l) => console.error(`  ${l}`));
  if (palavrasColadas.length > 10) console.error(`  ... e mais ${palavrasColadas.length - 10}`);
  console.error('');
  console.error('Quase sempre e uma tag escrita em MAIUSCULAS no fonte (<SPAN>).');
  console.error('Passe a tag para minusculas e rode de novo.');
  process.exit(1);
}
