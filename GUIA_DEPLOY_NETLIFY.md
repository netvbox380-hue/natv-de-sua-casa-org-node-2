# Guia de Deploy no Netlify - NaTV de Sua Casa

Este guia explica passo a passo como fazer o deploy do seu site no Netlify com o backend de comentários e likes.

---

## Estrutura do Projeto

```
natv-site/
├── netlify/
│   └── functions/
│       ├── comments.js    # API de comentários
│       └── votes.js       # API de likes/dislikes
├── public/
│   ├── index.html         # Seu site
│   ├── robots.txt         # SEO
│   └── sitemap.xml        # SEO
├── netlify.toml           # Configuração do Netlify
└── package.json           # Dependências
```

---

## Passo a Passo para Deploy

### Opção 1: Deploy via GitHub (Recomendado)

**1. Criar repositório no GitHub:**
- Acesse [github.com](https://github.com) e faça login
- Clique em "New repository"
- Nome: `natv-site` (ou outro nome)
- Deixe público ou privado
- Clique em "Create repository"

**2. Fazer upload dos arquivos:**
- Na página do repositório, clique em "uploading an existing file"
- Arraste todos os arquivos da pasta `natv-site`
- Clique em "Commit changes"

**3. Conectar ao Netlify:**
- Acesse [app.netlify.com](https://app.netlify.com)
- Faça login (pode usar conta do GitHub)
- Clique em "Add new site" → "Import an existing project"
- Selecione "GitHub"
- Autorize o acesso e selecione o repositório `natv-site`
- Configurações de build:
  - **Build command:** (deixe vazio)
  - **Publish directory:** `public`
- Clique em "Deploy site"

**4. Ativar Netlify Blobs:**
- No painel do Netlify, vá em "Site settings"
- Vá em "Functions" → "Blob stores"
- Clique em "Enable Blob stores"

---

### Opção 2: Deploy via Arrastar e Soltar

**1. Acessar Netlify:**
- Acesse [app.netlify.com/drop](https://app.netlify.com/drop)
- Faça login ou crie uma conta

**2. Fazer upload:**
- Arraste a pasta `public` para a área de upload
- Aguarde o deploy

**3. Configurar Functions:**
- Após o deploy, vá em "Site settings"
- Vá em "Functions"
- Você precisará conectar a um repositório Git para usar Functions
- Siga a Opção 1 para funcionalidade completa

---

### Opção 3: Deploy via CLI (Avançado)

**1. Instalar Netlify CLI:**
```bash
npm install -g netlify-cli
```

**2. Fazer login:**
```bash
netlify login
```

**3. Inicializar projeto:**
```bash
cd natv-site
netlify init
```

**4. Deploy:**
```bash
netlify deploy --prod
```

---

## Configuração do Domínio Personalizado

Após o deploy, você pode configurar seu domínio:

1. No painel do Netlify, vá em "Domain settings"
2. Clique em "Add custom domain"
3. Digite seu domínio: `natvdesuacasa.com.br` (ou `.casa`)
4. Siga as instruções para configurar o DNS

**Configuração DNS (no seu provedor de domínio):**
- Tipo: CNAME
- Nome: www
- Valor: `seu-site.netlify.app`

Ou para domínio raiz:
- Tipo: A
- Nome: @
- Valor: `75.2.60.5` (IP do Netlify)

---

## Atualizar o sitemap.xml

Após configurar seu domínio, atualize o arquivo `public/sitemap.xml`:

```xml
<loc>https://SEU-DOMINIO.com.br/</loc>
```

Substitua `SEU-DOMINIO.com.br` pelo seu domínio real.

---

## Atualizar o robots.txt

Atualize também o `public/robots.txt`:

```
Sitemap: https://SEU-DOMINIO.com.br/sitemap.xml
```

---

## Registrar no Google Search Console

Para o Google indexar seu site:

1. Acesse [search.google.com/search-console](https://search.google.com/search-console)
2. Clique em "Adicionar propriedade"
3. Digite seu domínio
4. Verifique a propriedade (DNS ou arquivo HTML)
5. Envie o sitemap: `https://seu-dominio.com.br/sitemap.xml`

---

## Como Funciona o Sistema de Feedback

### Backend (Netlify Functions + Blobs)

O sistema usa **Netlify Functions** para criar APIs serverless e **Netlify Blobs** para armazenar os dados:

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/votes` | GET | Buscar contagem de likes/dislikes |
| `/api/votes` | POST | Registrar voto |
| `/api/comments` | GET | Buscar todos os comentários |
| `/api/comments` | POST | Adicionar comentário ou curtir |

### Privacidade

- **Nenhum dado pessoal é coletado**
- Visitantes são identificados por um ID anônimo gerado no navegador
- Não há coleta de email, nome, IP ou qualquer informação identificável
- Os dados são armazenados de forma segura no Netlify

### Fallback Local

Se o backend não estiver disponível, o sistema automaticamente usa localStorage como fallback, garantindo que o site continue funcionando.

---

## Solução de Problemas

### "Functions não funcionam"
- Verifique se o Netlify Blobs está ativado
- Verifique se o deploy foi feito via Git (não arrastar e soltar)

### "Comentários não aparecem"
- Abra o console do navegador (F12) e verifique erros
- Verifique se as Functions estão ativas no painel do Netlify

### "Site não indexa no Google"
- Aguarde alguns dias após enviar o sitemap
- Verifique se o robots.txt está correto
- Use a ferramenta de inspeção de URL no Search Console

---

## Arquivos Incluídos

| Arquivo | Descrição |
|---------|-----------|
| `public/index.html` | Site completo com frontend |
| `public/sitemap.xml` | Mapa do site para SEO |
| `public/robots.txt` | Instruções para bots de busca |
| `netlify/functions/votes.js` | API de likes/dislikes |
| `netlify/functions/comments.js` | API de comentários |
| `netlify.toml` | Configuração do Netlify |
| `package.json` | Dependências do projeto |

---

## Suporte

Se tiver dúvidas sobre o Netlify:
- [Documentação Netlify](https://docs.netlify.com)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Netlify Blobs](https://docs.netlify.com/blobs/overview/)

---

**Boa sorte com o deploy!** 🚀
