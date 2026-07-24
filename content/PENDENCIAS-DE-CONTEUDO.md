# Pendências de conteúdo

Nenhuma página vai ao ar com informação inventada. Quando falta um dado
verificável, o bloco fica marcado e o documento permanece em
`status: "pending-validation"` — fora do site e fora do sitemap.

**Regra:** sobre hotel de terceiro, só publicamos o que pode ser conferido em
fonte oficial ou o que a Bomgo sabe por operação própria na região. Estrutura,
tarifa, horário, política de cancelamento e serviço incluso **não se deduzem**.

| # | Página | Seção | O que preciso do Christiano | Prioridade | Status |
|---|---|---|---|---|---|
| 1 | Todas | Rodapé / páginas legais | CNPJ, razão social e endereço da Bomgo Brasil | Alta | Aberto |
| 2 | `/destinos/beach-park` | Prova de confiança | Desde quando a Bomgo opera em Porto das Dunas (ano) | Alta | Aberto |
| 3 | Cards de hotel | Selo Preferred Partner | Quais imóveis têm o status **ativo** hoje no painel da Booking | Alta | Aberto |
| 4 | `/comparativos/wellness-ou-acqua` | Tabela comparativa | Diferenças reais entre os resorts, por experiência sua ou fonte oficial: perfil de público, distância do parque, estrutura, o que está incluso | Alta | Aberto |
| 5 | `/guias/como-chegar-beach-park` | Transporte | Tempo e custo aproximados do aeroporto e de Fortaleza, e as opções que você recomenda | Média | Aberto |
| 6 | `/guias/quanto-custa-beach-park` | Custos | Faixas de gasto por perfil de viagem. **Não usar preço de hotel** — isso vive na Booking | Média | Aberto |
| 7 | `/guias/beach-park-com-criancas` | Recomendações | O que você orienta a famílias, por experiência de hospedar | Média | Aberto |
| 8 | `/guias/melhor-epoca-beach-park` | Sazonalidade | Alta, média e baixa temporada na sua operação; quando lota | Média | Aberto |
| 9 | Guias | Autoria | Quem assina os guias e quem revisa (nome, cargo, credencial) | Alta | Aberto |
| 10 | Todas | Imagens | Fotos com direito de uso. Há material em `~/Downloads/TERRAMARIS`; falta definir o que pode ser publicado | Alta | Aberto |
| 11 | `/sobre` | Institucional | História da Bomgo, quem é a equipe, o que ela opera hoje | Baixa | Aberto |

## Já disponível (não precisa pedir)

Conteúdo local **real e curado** já existe no repositório, hoje visível só para
quem já reservou, dentro do guia de boas-vindas:

`lib/data/welcome-guide-restaurants.ts` · `-bars.ts` · `-activities.ts` ·
`-transport.ts` · `-shopping.ts` · `-parking.ts` · `-info.ts`

É a matéria-prima dos guias de destino — restaurantes, bares, passeios,
transporte e estacionamento na região. Melhor retorno por hora de trabalho do
projeto: o texto está escrito, falta a rota pública.

## Como marcar uma pendência no conteúdo

No bloco, escreva o texto que falta como `[PENDENTE: o que precisa]` e mantenha o
documento em `status: "pending-validation"`. O compilador não bloqueia, mas o
documento não é publicado nem indexado enquanto o status não virar `published`.
