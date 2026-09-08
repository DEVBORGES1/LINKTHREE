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
| `npm run minify` | Gera `dist/` minificado (o workflow usa isso para publicar) |

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

| URL | Página |
|-----|--------|
| `/` | Linktree principal |
| `/portfolio/` | Portfólio advocacia |
| `/mentoria/` | Salário maternidade |
| `/escritorio/` | Escritório |
| `/landing/` | Links marketing |
| `/vendas/` | Página de vendas |

## Analytics

O Google Analytics e o Pixel do Facebook foram removidos do `escritorio/index.html`:
estavam com os IDs de exemplo (`GA_MEASUREMENT_ID`, `YOUR_PIXEL_ID`), não mediam nada e
baixavam 406 KB de `fbevents.js` por visita. Para ativar, cole o snippet oficial com o ID
real no final do `<body>` — o `js/integration.js` já dispara os eventos quando `gtag` ou
`fbq` existem.

## Tecnologias

HTML5, CSS3, JavaScript vanilla. Sem framework e sem CDN de terceiros: fontes e ícones
são auto-hospedados.
