/**
 * Converte as imagens de origem para WebP no tamanho real de exibição.
 *
 * Origem  : resources/source-images/  (arquivos originais, fora do deploy)
 * Destino : public/**                 (o que vai para o ar)
 *
 * Rodar com:  npm run images
 *
 * `width` é a largura máxima: imagens menores que isso nunca são ampliadas.
 * Escolha a largura pelo tamanho real em que a imagem aparece na tela,
 * multiplicado por 2 (telas retina).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'resources', 'source-images');
const OUT = path.join(ROOT, 'public');

/**
 * `crop` (opcional) recorta a origem antes de redimensionar, em pixels da imagem
 * original: {left, top, width, height}. Serve para tirar um enquadramento
 * paisagem de uma foto vertical, por exemplo.
 *
 * `textoClaro` (opcional) gera a variante da logo para fundo escuro: o texto,
 * que e quase preto, vira branco, e as quatro pecas coloridas ficam intactas.
 * Ver clarearTexto() abaixo.
 *
 * @type {{from: string, to: string, width: number, quality?: number,
 *         textoClaro?: boolean,
 *         crop?: {left: number, top: number, width: number, height: number}}[]}
 */
const MANIFEST = [
  // ---------- Compartilhado ----------
  { from: 'brand/logo-advogada.png', to: 'assets/images/brand/logo-advogada.webp', width: 600 },
  // Mesma logo para os rodapes, que tem fundo escuro: sem isto o texto preto
  // da arte fica ilegivel sobre o cinza-chumbo.
  { from: 'brand/logo-advogada.png', to: 'assets/images/brand/logo-advogada-claro.webp', width: 600, textoClaro: true },
  { from: 'brand/logo-simbolo.png', to: 'assets/images/brand/logo-simbolo.webp', width: 240 },
  { from: 'icons/email.png', to: 'assets/images/icons/email.webp', width: 96 },
  { from: 'icons/facebook.png', to: 'assets/images/icons/facebook.webp', width: 96 },
  { from: 'icons/instagram.png', to: 'assets/images/icons/instagram.webp', width: 96 },
  { from: 'icons/whatsapp.png', to: 'assets/images/icons/whatsapp.webp', width: 96 },
  // O mesmo retrato aparecia duplicado em 4 pastas. Agora e um arquivo de origem
  // com duas saidas: avatar 200x200 no linktree e foto grande em portfolio/escritorio/vendas.
  { from: 'profile/foto-perfil.jpg', to: 'assets/images/profile/foto-perfil.webp', width: 400 },
  { from: 'profile/foto-perfil.jpg', to: 'assets/images/profile/nathiara-sobre.webp', width: 900 },

  // ---------- Escritorio (carrossel do hero) ----------
  { from: 'escritorio/hero-escritorio.png', to: 'escritorio/images/hero-escritorio.webp', width: 1200 },
  { from: 'escritorio/hero-escritorio-vertical.png', to: 'escritorio/images/hero-escritorio-vertical.webp', width: 800 },
  { from: 'escritorio/hero-direito-civil.png', to: 'escritorio/images/hero-direito-civil.webp', width: 1200 },
  { from: 'escritorio/hero-penal-familia.png', to: 'escritorio/images/hero-penal-familia.webp', width: 1200 },
  { from: 'escritorio/hero-localizacao.png', to: 'escritorio/images/hero-localizacao.webp', width: 1200 },

  // ---------- Landing ----------
  { from: 'landing/banner.png', to: 'landing/images/banner.webp', width: 1920, quality: 72 },
  { from: 'landing/banner.png', to: 'landing/images/banner-mobile.webp', width: 900, quality: 72 },

  // ---------- Mentoria (fundo do hero) ----------
  // Dois enquadramentos do mesmo retrato 2000x3000: paisagem no desktop, com ela
  // à direita e área escura à esquerda para o texto; e um corte mais vertical no
  // celular, com o rosto no terço superior e o texto sobre a roupa escura.
  // O <picture> baixa só um dos dois.
  {
    from: 'profile/foto-perfil.jpg',
    to: 'mentoria/images/hero-desktop.webp',
    crop: { left: 0, top: 280, width: 2000, height: 1125 },
    width: 1600,
    quality: 78,
  },
  {
    from: 'profile/foto-perfil.jpg',
    to: 'mentoria/images/hero-mobile.webp',
    crop: { left: 200, top: 250, width: 1600, height: 2250 },
    width: 800,
    quality: 78,
  },

  // ---------- Portfolio ----------
  { from: 'portfolio/nathiara-hero.jpg', to: 'portfolio/images/nathiara-hero.webp', width: 900 },

  // ---------- Vendas ----------
  { from: 'vendas/depoimento-lucas.png', to: 'vendas/images/depoimento-lucas.webp', width: 320 },
  { from: 'vendas/depoimento-mariane.png', to: 'vendas/images/depoimento-mariane.webp', width: 320 },
  { from: 'vendas/depoimento-maria.png', to: 'vendas/images/depoimento-maria.webp', width: 320 },
  { from: 'vendas/avatar-generico.png', to: 'vendas/images/avatar-generico.webp', width: 160 },
];

// Estes dois nao podem ser WebP:
// - favicon: nem todo agregador de link le WebP como icone;
// - og:image: WhatsApp e alguns leitores de preview so aceitam JPEG/PNG.
const FAVICON = { from: 'brand/logo-simbolo.png', to: 'assets/favicon.png', width: 64 };
const OG_IMAGE = { from: 'profile/foto-perfil.jpg', to: 'assets/images/og-image.jpg', width: 1200 };

const kb = (n) => `${String(Math.round(n / 1024)).padStart(5)} KB`;

/**
 * Troca por branco o texto quase preto da logo, deixando as pecas coloridas.
 *
 * A separacao e por saturacao, nao por posicao: o texto e cinza-escuro (os tres
 * canais quase iguais) e as pecas sao cores saturadas (canais bem diferentes
 * entre si). Assim a variante sai do mesmo arquivo de origem e nao vira uma
 * segunda arte para manter em paralelo -- mexeu na logo, as duas acompanham.
 *
 * Os limites: diferenca entre o canal mais alto e o mais baixo abaixo de 40
 * (pouca cor) e canal mais alto abaixo de 120 (escuro). O amarelo, o verde, o
 * azul e o vermelho da marca passam longe dos dois.
 */
async function clarearTexto(from) {
  const { data, info } = await sharp(from).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue; // transparente: nao mexe
    const max = Math.max(data[i], data[i + 1], data[i + 2]);
    const min = Math.min(data[i], data[i + 1], data[i + 2]);
    if (max - min < 40 && max < 120) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
    }
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } });
}

async function run() {
  if (!fs.existsSync(SRC)) {
    console.error(`Pasta de origem nao encontrada: ${SRC}`);
    process.exit(1);
  }

  let before = 0;
  let after = 0;
  let failed = 0;

  for (const item of MANIFEST) {
    const from = path.join(SRC, item.from);
    const to = path.join(OUT, item.to);
    if (!fs.existsSync(from)) {
      console.error(`FALTA  ${item.from}`);
      failed += 1;
      continue;
    }
    fs.mkdirSync(path.dirname(to), { recursive: true });
    let pipeline = item.textoClaro ? await clarearTexto(from) : sharp(from);
    if (item.crop) pipeline = pipeline.extract(item.crop);
    await pipeline
      .resize({ width: item.width, withoutEnlargement: true })
      .webp({ quality: item.quality ?? 80 })
      .toFile(to);

    const inSize = fs.statSync(from).size;
    const outSize = fs.statSync(to).size;
    before += inSize;
    after += outSize;
    const meta = await sharp(to).metadata();
    console.log(`${kb(inSize)} -> ${kb(outSize)}  ${String(meta.width).padStart(4)}px  ${item.to}`);
  }

  const favTo = path.join(OUT, FAVICON.to);
  fs.mkdirSync(path.dirname(favTo), { recursive: true });
  await sharp(path.join(SRC, FAVICON.from)).resize({ width: FAVICON.width }).png({ compressionLevel: 9 }).toFile(favTo);
  after += fs.statSync(favTo).size;
  console.log(`${' '.repeat(8)}   ${kb(fs.statSync(favTo).size)}  ${FAVICON.width}px  ${FAVICON.to}`);

  const ogTo = path.join(OUT, OG_IMAGE.to);
  fs.mkdirSync(path.dirname(ogTo), { recursive: true });
  await sharp(path.join(SRC, OG_IMAGE.from))
    .resize({ width: OG_IMAGE.width, withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(ogTo);
  after += fs.statSync(ogTo).size;
  console.log(`${' '.repeat(8)}   ${kb(fs.statSync(ogTo).size)}  ${OG_IMAGE.width}px  ${OG_IMAGE.to}`);

  const pct = Math.round((1 - after / before) * 100);
  console.log('');
  console.log(`Total: ${(before / 1024 / 1024).toFixed(1)} MB -> ${(after / 1024).toFixed(0)} KB  (-${pct}%)`);
  if (failed) {
    console.error(`${failed} arquivo(s) de origem faltando.`);
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
