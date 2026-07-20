# LINKTHREE

Conjunto de páginas estáticas do escritório Nathiara Borges — advocacia, mentoria, portfólio e marketing digital.

## Estrutura

```
LINKTHREE/
├── public/                 # Document root (servir esta pasta)
│   ├── index.html          # Linktree / hub principal
│   ├── assets/             # Recursos compartilhados entre sites
│   │   ├── css/
│   │   ├── js/
│   │   └── images/
│   │       ├── brand/      # Logos
│   │       ├── icons/      # Ícones sociais
│   │       └── profile/    # Foto de perfil
│   ├── portfolio/          # Site do portfólio
│   ├── mentoria/           # Landing de salário maternidade
│   ├── escritorio/         # Site do escritório
│   ├── landing/            # Página de links / marketing
│   └── vendas/             # Página de vendas
├── resources/
│   └── archive/            # Backups e versões antigas (não publicar)
└── storage/                # Dados de runtime (se necessário)
```

Cada site segue a mesma convenção interna:

```
site/
├── index.html
├── css/
├── js/
└── images/
```

## Convenções

- Pastas em **inglês**, **kebab-case** ou nomes descritivos simples (`portfolio`, `escritorio`, `images`)
- Arquivos estáticos servidos a partir de `public/`
- Assets compartilhados (logos, ícones) em `public/assets/`
- Arquivos legados preservados em `resources/archive/`

## Desenvolvimento local

```bash
npm run dev
```

Abre em [http://localhost:3000](http://localhost:3000).

## Rotas

| URL | Página |
|-----|--------|
| `/` | Linktree principal |
| `/portfolio/` | Portfólio advocacia |
| `/mentoria/` | Salário maternidade |
| `/escritorio/` | Escritório |
| `/landing/` | Links marketing |
| `/vendas/` | Página de vendas |

## Tecnologias

HTML5, CSS3, JavaScript vanilla.
