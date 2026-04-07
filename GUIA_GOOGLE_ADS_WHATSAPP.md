# Google Ads + WhatsApp (NaTV de Sua Casa)

Este projeto já está preparado para rastrear clique no WhatsApp sem quebrar o site.

## O que já ficou pronto no código

- Google tag carregando no site
- Evento GA4 `generate_lead` disparado ao clicar no WhatsApp
- Evento GA4 `click` disparado ao clicar no WhatsApp
- Função `trackWhatsAppClick(...)` aplicada aos botões principais
- Fallback seguro: se a conversão do Google Ads ainda estiver com placeholder, o WhatsApp abre normalmente

## O que falta no Google Ads

Depois de criar a ação de conversão manual para clique no WhatsApp, o Google Ads vai mostrar um `send_to` parecido com:

```js
AW-987590909/AbCdEfGhIjKlMnOpQr
```

## Onde trocar

Procure por:

```js
const GOOGLE_ADS_WHATSAPP_SEND_TO = 'AW-987590909/yWZtCNz51ZccEP3h9dYD';
```

Substitua pelo valor real entregue pelo Google Ads.

## Como criar no painel

1. Google Ads > Conversões
2. Nova ação de conversão
3. Site
4. Criar evento manual
5. Tipo: clique
6. Nome sugerido: `Clique WhatsApp`
7. Salvar e continuar
8. Copiar o `send_to` real da ação
9. Colar no projeto no lugar do placeholder
10. Publicar o site

## Resultado esperado

- Clique no WhatsApp continua abrindo normalmente
- GA4 recebe o evento de lead
- Google Ads passa a registrar conversão quando o `send_to` real for inserido
