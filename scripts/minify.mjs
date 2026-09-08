/**
 * Minifica HTML, CSS e JS de public/ para uma pasta de saida (padrao: dist/).
 *
 * A pasta public/ continua legivel para edicao; quem vai para o ar e o dist/.
 * O workflow do GitHub Pages roda isto antes de publicar.
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

for (const file of walk(SRC)) {
  const rel = path.relative(SRC, file).replace(SEP, '/');
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
