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
export const SITE_URL = process.env.SITE_URL || 'https://nathiaraborgesadv.vercel.app';

/**
 * Endereço que recebe os leads dos três formulários de contato.
 *
 * Aplicado no atributo `data-email` dos formulários por `npm run site-url`.
 * Antes o endereço estava repetido dentro de cada HTML.
 *
 * ATENÇÃO: o FormSubmit exige ativar o endereço uma vez. No primeiro envio ele
 * manda um e-mail com o link "Activate Form", e nada chega enquanto ninguém
 * clicar. Se o e-mail de ativação não aparecer, o provedor está bloqueando.
 *
 * Histórico: até setembro de 2026 o destino era nathiara.borges@outlook.com, e
 * o e-mail de ativação nunca chegou — o Outlook barrou. Por isso voltou a ser
 * este Gmail, que já era o destino dos formulários deste projeto antes da
 * reescrita e recebe sem filtrar. De lá o contato é repassado à Nathiara.
 *
 * O endereço fica visível no HTML publicado. Se isso incomodar, o FormSubmit
 * oferece um identificador aleatório depois da ativação, que pode substituir o
 * e-mail na URL.
 */
export const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'bstech.ti@gmail.com';
