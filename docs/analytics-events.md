# Eventos de conversão — portal Bomgo

Fonte da verdade: `lib/analytics/events.ts`. Este documento explica o **porquê** de
cada evento; o código manda no **nome**.

## Antes de tudo: o que existia

O site tinha apenas o Analytics da Vercel — conta visita, não conta conversão.
Não havia GA4, GTM, `dataLayer` nem Pixel. Toda a medição descrita aqui é nova.

## Como ligar

1. Criar o contêiner no Google Tag Manager e a propriedade no GA4.
2. Definir `NEXT_PUBLIC_GTM_ID` na Vercel (Production e Preview).
3. No GTM, criar um *trigger* de **Custom Event** para cada nome abaixo e
   encaminhar ao GA4 com os parâmetros correspondentes.

Sem `NEXT_PUBLIC_GTM_ID` o carregamento não acontece — de propósito, para não
misturar tráfego de desenvolvimento com o relatório de produção.

## Os eventos

| Evento | Quando dispara | Por que existe |
|---|---|---|
| `search_started` | Viajante abre/usa a busca no hero | Mede intenção de viagem, mesmo sem conclusão |
| `search_completed` | Busca retorna resultado | Diferença para o anterior = fricção na busca |
| `destination_viewed` | Abre página de destino | Qual território puxa tráfego |
| `guide_viewed` | Abre um guia | Conteúdo que atrai |
| `guide_read_50` / `guide_read_90` | Rolagem atinge 50% / 90% | Distingue visita de leitura — só a leitura converte |
| `comparison_opened` | Abre um comparativo | Sinal forte de decisão de compra |
| `accommodation_clicked` | Clica em imóvel próprio | Funil da **reserva direta** |
| `affiliate_click` | Clica em link de parceiro | Funil da **comissão**. O evento mais importante do portal |
| `booking_cta_clicked` | CTA explícito "Ver preços na Booking.com" | Separa clique no CTA de clique no card |
| `sofia_started` | Conversa com a Sofia começa | Uso do diferencial |
| `sofia_cta_clicked` | Clica em "Falar com a Sofia" | Intenção — cruzar com o anterior mede abandono |
| `whatsapp_clicked` | Abre o WhatsApp | Canal de atendimento |
| `lead_submitted` | Envia formulário de recomendação | Lead qualificado |
| `offers_subscribed` | Assina alertas de oferta | Base própria, independente de plataforma |

## Parâmetros

`destination` · `affiliate_key` · `placement` · `source_path` · `content_slug` ·
`content_category` · `offer_type` (`direta` \| `parceiro`) · `value`

**`offer_type` é o parâmetro comercial mais importante**: é ele que permite
responder "quanto do meu tráfego vira reserva direta e quanto vira comissão".

## O que nunca vai para o Analytics

Nome, e-mail, telefone, CPF, código de reserva, nome de hóspede — nada disso
entra em evento. Viola a política do Google e a LGPD, e polui o relatório com
cardinalidade inútil. Medimos **comportamento**, não pessoas. Para cruzar com
pessoa, use o seu banco e o `content_slug`/`destination` como chave.

## UTMs

Padronizadas em `UTM_SOURCES` / `UTM_MEDIUMS` e montadas por `campaignUrl()`.
Motivo: sem padrão, "instagram", "Instagram" e "ig" viram três canais distintos
no relatório e o dado fica inútil em três meses.

```ts
campaignUrl("/destinos/beach-park", {
  source: UTM_SOURCES.instagram,
  medium: UTM_MEDIUMS.reels,
  campaign: "beach-park-julho",
})
```
