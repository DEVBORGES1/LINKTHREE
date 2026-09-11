/**
 * Endereço canônico do site — o único lugar onde ele é declarado.
 *
 * É usado por:
 *   - scripts/set-site-url.mjs  (reescreve og:url, og:image e canonical no HTML)
 *   - scripts/build-sitemap.mjs (monta as URLs do sitemap e do robots.txt)
 *
 * Sem barra no fim.
 *
 * ATENÇÃO: este valor precisa bater com o endereço em que o site está
 * realmente no ar. As prévias de link do WhatsApp e do Facebook usam a og:image
 * absoluta; se o domínio não responder, a prévia aparece vazia. E um sitemap
 * com domínio errado o Google simplesmente ignora.
 *
 * Histórico: até setembro de 2026 isto apontava para www.nathiaraborges.adv.br,
 * um domínio que está registrado mas sem registro de endereço — ou seja, não
 * respondia. As prévias de link estavam quebradas por causa disso.
 *
 * Para trocar: edite a constante abaixo e rode `npm run site-url`.
 */
export const SITE_URL = process.env.SITE_URL || 'https://linkthree.vercel.app';
