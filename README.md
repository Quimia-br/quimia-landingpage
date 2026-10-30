# Quimia - Landing pages

Site institucional do **Quimia**, aplicativo que ajuda a evitar misturas perigosas de produtos de limpeza. O projeto reúne duas landing pages (uma para usuários e outra para empresas), a página de atendimento ao cliente, as declarações de privacidade e a página de download do app.

É um site estático em HTML, CSS e JavaScript puros. Não há etapa de build nem dependências para instalar.

## Páginas

| Página | Arquivo | Para quê |
|---|---|---|
| Landing do usuário | `index.html` | Apresenta o app, os recursos e o vídeo de demonstração |
| Landing da empresa | `business.html` | Apresenta os dashboards, os planos e a privacidade dos dados |
| Atendimento ao cliente | `support.html` | Formulário de contato (aceita `?origem=empresa` e `?de=privacidade`) |
| Privacidade do usuário | `privacy.html` | Declaração de Privacidade para quem usa o app |
| Privacidade da empresa | `privacy-business.html` | Declaração de Privacidade para empresas |
| Download do app | `download.html` | Destino do QR code: no celular vai direto para a loja, no computador mostra as lojas |

## Estrutura de pastas

O site publicável fica dentro de `Landing Page/`. Essa pasta é a raiz do site.

```
Landing Page/
├── index.html                 Landing do usuário
├── business.html              Landing da empresa
├── support.html               Atendimento ao cliente
├── privacy.html               Privacidade (usuário)
├── privacy-business.html      Privacidade (empresa)
├── download.html              Página de download
│
├── css/                       Um arquivo de estilos por página
│   ├── user.css               Landing do usuário (também usado por download.html)
│   ├── business.css           Landing da empresa
│   ├── support.css            Atendimento
│   ├── privacy.css            Privacidade, com temas claro e escuro
│   └── download-modal.css     Pop-up de download usado na privacidade do usuário
│
├── js/                        Um arquivo de script por página, mais os compartilhados
│   ├── user.js                Landing do usuário
│   ├── business.js            Landing da empresa
│   ├── support.js             Formulário de atendimento
│   ├── privacy.js             Índice das páginas de privacidade
│   ├── download-modal.js      Pop-up de download (landing e privacidade do usuário)
│   └── store-links.js         Links das lojas e detecção de celular
│
└── assets/                    Mídia, separada por público
    ├── user/                  icons/, images/ e videos/
    ├── business/              icons/ e images/
    └── support/               icons/ e images/

apps-script/
└── Code.gs                    Serviço de atendimento (Google Apps Script); não vai para o site publicado
```

### Convenções

- **Nomes de arquivos:** minúsculas, com hífen e sem espaços ou acentos (`background-tela-inicial.jpg`).
- **Um CSS e um JS por página.** O que é usado por mais de uma página fica em um arquivo próprio e compartilhado (`store-links.js`, `download-modal.js`).
- **Mídia por público.** Cada landing tem a sua pasta em `assets/`, para ficar claro o que pertence a cada uma.
- **Caminhos nos CSS** são relativos à pasta `css/` (por exemplo `../assets/user/images/capa.jpg`). Caminhos nos JS e nos HTML são relativos à raiz do site.
- **Cores, fontes e espaçamentos** ficam como variáveis CSS no início de cada arquivo de estilos.
- **Fontes:** Nunito, PT Sans e Reem Kufi, carregadas do Google Fonts.

## Como rodar localmente

Sirva a pasta `Landing Page/` com qualquer servidor estático. Por exemplo:

```bash
cd "Landing Page"
python -m http.server 8000
```

Depois abra `http://localhost:8000`. Evite abrir os arquivos direto pelo navegador (`file://`), porque alguns recursos, como as legendas do vídeo, só funcionam via servidor.

## Publicação (GitHub Pages)

O site é publicado pelo GitHub Pages por meio do workflow `.github/workflows/pages.yml`, que envia a pasta `Landing Page/` sempre que a `main` recebe um merge. Também dá para rodá-lo à mão pela aba *Actions* (*Run workflow*).

Configuração única, feita por quem administra o repositório:

1. Em *Settings → Pages → Build and deployment → Source*, escolher **GitHub Actions**.
2. Mergear na `main`. O endereço aparece na aba *Actions* e em *Settings → Pages*.

Todos os caminhos do site são relativos, então ele funciona tanto no endereço padrão (`<organização>.github.io/quimia-landingpage/`) quanto em domínio próprio.

Para usar o domínio `quimia.tech`:

1. Em *Settings → Pages → Custom domain*, informar o domínio e, quando o certificado for emitido, marcar *Enforce HTTPS*.
2. No DNS do domínio, criar os registros indicados na documentação do GitHub Pages.
3. Adicionar um arquivo `CNAME` com o domínio dentro de `Landing Page/`, para ele não se perder a cada publicação.

O QR code do app aponta para `https://quimia.tech/download`, então esse endereço precisa abrir o `download.html`.

## Configurações que dependem da equipe

Alguns pontos precisam de decisão ou de conta externa antes da publicação:

| O quê | Onde | Observação |
|---|---|---|
| Links das lojas (App Store e Google Play) | `js/store-links.js` | Hoje apontam para um app de exemplo e precisam ser trocados pelos links do Quimia |
| Página de download do QR code | `js/store-links.js` (`downloadPageUrl`) | O QR aponta para `https://quimia.tech/download`, então o domínio precisa servir o `download.html` nesse endereço |
| Serviço de atendimento (formulário) | `apps-script/Code.gs` e `js/support.js` (`SUPPORT_ENDPOINT`) | Script do Google Apps Script na conta do suporte, que envia o e-mail e registra a mensagem numa planilha. Se for reimplantado com outro endereço, trocar o `SUPPORT_ENDPOINT` |
| Texto da Declaração de Privacidade | `privacy.html` e `privacy-business.html` | O conteúdo veio do design e precisa ser revisado por quem responde pelo jurídico antes de publicar |
| Prazo de resposta do atendimento | `support.html` e `js/support.js` | Hoje diz "até 15 dias" |

Serviços de terceiros usados: Google Fonts, `qrcodejs` (via CDN) e Google Apps Script (atendimento).

## Fluxo de trabalho

- **Branches:** cada mudança em uma branch própria, partindo da `develop`, com prefixo do tipo: `feat/`, `fix/`, `style/`, `refactor/`, `chore/`.
- **Commits:** padrão Conventional Commits (`feat(support): ...`, `fix(user): ...`), em inglês e no imperativo.
- **Pull requests:** abertas para a `develop` e revisadas por alguém da equipe antes do merge.
- **Antes de abrir a PR:** conferir as páginas de 360 a 1440 px (celular, tablet e desktop), inclusive em tablets grandes em pé, que costumam ser o caso mais difícil.
