# LINKTHREE

Conjunto de páginas estáticas do escritório Nathiara Borges — advocacia, mentoria, portfólio e marketing digital.

## Estrutura

```
LINKTHREE/
├── public/                    # O que vai para o ar
│   ├── index.html             # Linktree / hub principal
│   ├── assets/                # Compartilhado entre os 6 sites
│   │   ├── css/
│   │   │   ├── base.css       # Tokens da marca, reset, foco, animação de entrada
│   │   │   ├── fonts.css      # @font-face (gerado)
│   │   │   ├── icons.css      # Subset do Font Awesome (gerado)
│   │   │   └── linktree.css   # CSS da página inicial
│   │   ├── js/
│   │   │   ├── reveal.js      # Animação de entrada compartilhada
│   │   │   └── linktree.js
│   │   ├── fonts/             # .woff2 auto-hospedados (gerado)
│   │   ├── images/            # Logos, ícones, retratos (gerado, .webp)
│   │   └── favicon.png        # (gerado)
│   ├── portfolio/             # Site do portfólio
│   ├── mentoria/              # Landing de salário maternidade
│   ├── escritorio/            # Site do escritório
│   ├── landing/               # Página de links / marketing
│   └── vendas/                # Página de vendas
├── resources/
│   ├── source-images/         # Originais em alta, entrada do npm run images
│   └── archive/               # Versões antigas (fora do deploy)
├── scripts/                   # Geração de assets
└── dist/                      # Saída minificada (gerada, não versionada)
```

Cada site segue a mesma convenção interna:

```
site/
├── index.html
├── css/
├── js/
└── images/     # .webp gerados
```

## Convenções

- Pastas em **inglês**, **kebab-case** ou nomes descritivos simples
- Arquivos estáticos servidos a partir de `public/`
- Assets compartilhados (logos, ícones, fontes, base.css) em `public/assets/`
- Nomes de arquivo sem espaços, acentos ou parênteses
- Arquivos legados preservados em `resources/archive/`

## Desenvolvimento local

```bash
npm install
```

```bash
npm run dev
```

Abre em [http://localhost:3000](http://localhost:3000).

## Assets gerados

Vários arquivos dentro de `public/` são **gerados** e não devem ser editados à mão:
`assets/css/fonts.css`, `assets/css/icons.css`, `assets/fonts/*`, `assets/favicon.png`
e todas as imagens `.webp`.

| Comando | O que faz |
|---------|-----------|
| `npm run images` | Converte `resources/source-images/` para WebP no tamanho real de exibição |
| `npm run icons` | Varre o HTML, descobre os ícones usados e gera um Font Awesome enxuto |
| `npm run fonts` | Copia as fontes do `node_modules` e gera o `fonts.css` |
| `npm run build` | Os três acima |
| `npm run site-url` | Aplica o SITE_URL nas tags og:url, og:image e canonical |
| `npm run sitemap` | Gera sitemap.xml e robots.txt a partir das páginas publicadas |
| `npm run minify` | Gera `dist/` minificado, já sem as páginas fora do ar (o workflow usa isso para publicar) |

### Trocar ou adicionar uma imagem

1. Coloque o original em `resources/source-images/<pasta>/<nome>.png`
2. Adicione uma linha no `MANIFEST` de [`scripts/optimize-images.mjs`](scripts/optimize-images.mjs),
   escolhendo `width` pelo tamanho real na tela × 2 (telas retina)
3. `npm run build`
4. Commite o original **e** o `.webp` gerado

### Adicionar um ícone

Use a classe normalmente no HTML (`<i class="fas fa-heart"></i>`) e rode `npm run icons`.
O script inclui no subset só o que aparece no código.

## Rotas

| URL | Página | No ar |
|-----|--------|-------|
| `/` | Linktree principal | sim |
| `/portfolio/` | Portfólio advocacia | sim |
| `/mentoria/` | Salário maternidade | sim |
| `/escritorio/` | Escritório | sim |
| `/landing/` | Links marketing | **não** |
| `/vendas/` | Página de vendas | **não** |

### Páginas fora do ar

`vendas/` e `landing/` continuam no repositório e funcionam normalmente em
`npm run dev`, mas **não são publicadas**: o `npm run minify` não as copia para
`dist/`, então `https://.../vendas/` responde 404.

- `vendas/` — ainda em desenvolvimento, a cliente não decidiu.
- `landing/` — existe só como funil para `/vendas/` (o botão principal aponta
  para lá), então no ar sozinha o CTA seria um link quebrado.

Para colocar uma delas no ar, apague a linha correspondente da lista
`UNPUBLISHED` em [`scripts/minify.mjs`](scripts/minify.mjs) e faça o deploy.

O build falha de propósito se alguma página publicada passar a apontar para uma
pasta dessa lista, para não ir ao ar um link quebrado.

## Publicação

O site é estático: o build gera `dist/` e é essa pasta que vai ao ar.

### Vercel

Endereço de produção: **https://nathiaraborgesadv.vercel.app**

O projeto já está vinculado e publica sozinho a cada push para `main`.
[`vercel.json`](vercel.json) define o build (`npm run build && npm run minify`),
a pasta de saída (`dist`), `trailingSlash` para casar com os links do site, e os
cabeçalhos de cache e de segurança.

Para publicar manualmente de uma máquina:

```bash
npx vercel --prod
```

Se o endereço do projeto mudar, ajuste `SITE_URL` em
[`scripts/site-config.mjs`](scripts/site-config.mjs) e rode `npm run build`.

### GitHub Pages

Continua ativo em `https://devborges1.github.io/LINKTHREE/`, pelo workflow
[`deploy-pages.yml`](.github/workflows/deploy-pages.yml), que dispara em `main`.
Se a Vercel virar o endereço oficial, vale desativar esse workflow para não
manter duas cópias no ar.

### O endereço do site

Declarado num lugar só: `SITE_URL` em
[`scripts/site-config.mjs`](scripts/site-config.mjs). Dele saem as tags
`og:url`, `og:image` e `canonical` das seis páginas (via `npm run site-url`) e
as URLs do `sitemap.xml` e do `robots.txt`.

Esse valor precisa bater com o endereço em que o site responde de fato. As
prévias de link do WhatsApp e do Facebook buscam a `og:image` pelo endereço
absoluto: se ele não resolver, a prévia sai vazia.

> Até setembro de 2026 isso apontava para `www.nathiaraborges.adv.br`, um
> domínio registrado mas sem registro de endereço — não respondia, e por isso as
> prévias de link estavam quebradas.

## Medição e analytics

Tudo mora em [`public/assets/js/analytics.js`](public/assets/js/analytics.js).

### Ativar o Cloudflare Web Analytics

Grátis, sem cookie, então **não exige banner de consentimento**. Dá visitas,
origem do tráfego, países, navegadores e os Core Web Vitals reais dos visitantes.

1. Em [dash.cloudflare.com](https://dash.cloudflare.com) → *Analytics & Logs* →
   *Web Analytics* → *Add a site*. Não precisa mover o domínio para a Cloudflare.
2. Copie o valor de `token` do snippet que aparecer.
3. Cole na constante `cloudflareToken` no topo do `analytics.js`.

Enquanto o token estiver vazio, nada é carregado — sem requisição quebrada.

### Ver as métricas sem ferramenta nenhuma

Abra qualquer página com `?debug=analytics` na URL. Os Core Web Vitals e os
eventos aparecem no console do navegador, com a avaliação (bom / precisa
melhorar / ruim) ao lado de cada número.

Para deixar ligado entre recarregamentos:
`localStorage.setItem('debug-analytics', '1')`.

### Eventos

O `analytics.js` registra sozinho, por delegação de clique:
`contato_whatsapp`, `clique_telefone`, `clique_email`, `rolagem_25/50/75/100`.
O `form-contato.js` acrescenta `formulario_enviado` e `formulario_falhou`.

**O Cloudflare não recebe eventos personalizados.** Hoje esses eventos só
aparecem no modo debug. Para medir conversão de verdade é preciso uma ferramenta
que aceite eventos (GA4 ou Plausible) — o único ponto a mexer é a função
`enviarEvento` no fim do arquivo, que já encaminha para `gtag` e `plausible`
quando eles existem.

Atenção: o GA4 usa cookie. Sob a LGPD isso exige base legal e, na prática,
banner de consentimento — o Cloudflare foi escolhido justamente para evitar isso.

### Search Console

`sitemap.xml` e `robots.txt` são gerados por
[`scripts/build-sitemap.mjs`](scripts/build-sitemap.mjs) (roda dentro do
`npm run build`). Ele ignora sozinho as páginas fora do ar. O domínio usado vem
de `SITE_URL`, em [`scripts/site-config.mjs`](scripts/site-config.mjs) — um
sitemap com o domínio errado é ignorado pelo Google.

**Verificação.** O site está cadastrado como propriedade **"Prefixo do URL"**
(`https://nathiaraborgesadv.vercel.app/`), verificada pela tag
`google-site-verification` no `<head>` de `public/index.html`. Não remova essa
tag: sem ela o Google deixa de reconhecer o site como verificado.

A opção **"Domínio"**, verificada por registro TXT no DNS, não serve para o
endereço atual: o DNS de `vercel.app` é da Vercel, e ninguém de fora consegue
incluir registros nele. Ela passa a ser possível quando o domínio próprio
(`nathiaraborges.adv.br`) estiver no ar — o TXT vai no painel onde o domínio
está registrado e cobre todos os endereços dele de uma vez. Nesse dia, lembre de
trocar `SITE_URL` e de cadastrar o novo endereço também no Cloudflare Web
Analytics.

Depois de verificado, envie `/sitemap.xml` em **Sitemaps**, no menu do
Search Console.

## Histórico: Google Analytics e Pixel

O Google Analytics e o Pixel do Facebook foram removidos do `escritorio/index.html`:
estavam com os IDs de exemplo (`GA_MEASUREMENT_ID`, `YOUR_PIXEL_ID`), não mediam nada e
baixavam 406 KB de `fbevents.js` por visita. Para ativar, cole o snippet oficial com o ID
real no final do `<body>` — o `js/integration.js` já dispara os eventos quando `gtag` ou
`fbq` existem.

## Tecnologias

HTML5, CSS3, JavaScript vanilla. Sem framework e sem CDN de terceiros: fontes e ícones
são auto-hospedados.
