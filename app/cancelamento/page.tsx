import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de Cancelamento | Bomgo",
  description: "Condições de cancelamento, alteração e reembolso das reservas diretas Bomgo.",
}

export default function CancelamentoPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-28 md:px-6">
      <h1 className="font-serif text-3xl font-extrabold text-foreground md:text-4xl">
        Política de Cancelamento, Alteração e Reembolso
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">Última atualização: julho de 2026</p>

      <div className="prose prose-neutral mt-8 max-w-none space-y-6 text-muted-foreground [&_h2]:mt-8 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_li]:leading-relaxed [&_strong]:text-foreground">
        <p>
          Esta Política estabelece as condições aplicáveis ao cancelamento, à alteração e ao reembolso das reservas
          realizadas diretamente com a <strong>Bomgo</strong>, inclusive pelo site, WhatsApp, telefone ou demais
          canais próprios.
        </p>
        <p>
          Ao concluir uma reserva, o hóspede declara ter recebido previamente informações claras sobre o imóvel, as
          datas da estadia, os valores, a quantidade de hóspedes e as condições previstas nesta Política.
        </p>

        <h2>1. Identificação da responsável</h2>
        <p>As reservas diretas são intermediadas e/ou administradas por:</p>
        <p>
          <strong>Razão social:</strong> Bomgo Brasil Ltda
          <br />
          <strong>Nome comercial:</strong> Bomgo
          <br />
          <strong>CNPJ:</strong> 50.808.411/0001-86
          <br />
          <strong>Endereço:</strong> Aquiraz, Ceará
          <br />
          <strong>E-mail:</strong>{" "}
          <a href="mailto:contato@bomgobrasil.com" className="text-primary hover:underline">
            contato@bomgobrasil.com
          </a>
          <br />
          <strong>WhatsApp:</strong>{" "}
          <a href="https://wa.me/558581412023" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            (85) 8141-2023
          </a>
        </p>

        <h2>2. Confirmação da reserva</h2>
        <p>A reserva somente será considerada confirmada após:</p>
        <ul>
          <li>a aprovação ou compensação do pagamento;</li>
          <li>o envio da confirmação pela Bomgo; e</li>
          <li>quando solicitado, o fornecimento dos dados necessários à identificação dos hóspedes.</li>
        </ul>
        <p>
          Antes de realizar o pagamento, o hóspede deverá conferir as datas, a localização, o imóvel escolhido, o
          número de hóspedes, os valores e as demais condições da estadia.
        </p>
        <p>
          A confirmação da reserva implica o bloqueio do imóvel para o período contratado e poderá impedir sua
          disponibilização a outros interessados.
        </p>

        <h2>3. Tarifa não reembolsável</h2>
        <p>
          Salvo quando a oferta indicar expressamente condições diferentes, as Reservas Diretas Bomgo são
          comercializadas sob a modalidade de <strong>tarifa não reembolsável</strong>.
        </p>
        <p>
          Após a confirmação do pagamento e decorrido eventual prazo legal de arrependimento, a desistência por
          iniciativa exclusiva do hóspede não gera, automaticamente, direito ao reembolso dos valores pagos.
        </p>
        <p>Essa condição não afasta:</p>
        <ul>
          <li>o direito de arrependimento, quando legalmente aplicável;</li>
          <li>os direitos do consumidor em caso de descumprimento da oferta ou falha atribuível à Bomgo;</li>
          <li>a análise de situações comprovadamente excepcionais;</li>
          <li>a possibilidade de alteração das datas, conforme esta Política; e</li>
          <li>
            a revisão de eventual retenção que, diante das circunstâncias concretas, seja considerada manifestamente
            excessiva.
          </li>
        </ul>

        <h2>4. Direito de arrependimento nas contratações on-line</h2>
        <p>
          Nas contratações realizadas fora do estabelecimento comercial, inclusive pelo site, WhatsApp ou telefone,
          será assegurado ao consumidor o direito de arrependimento previsto no artigo 49 do Código de Defesa do
          Consumidor, quando aplicável.
        </p>
        <p>
          O pedido deverá ser apresentado no prazo de <strong>7 (sete) dias corridos</strong>, contado da celebração
          da contratação, pelos canais oficiais da Bomgo.
        </p>
        <p>
          Quando exercido regularmente, o direito de arrependimento resultará no cancelamento da reserva e na
          devolução dos valores pagos, sem cobrança de multa, observados os limites legais e as particularidades do
          serviço contratado.
        </p>
        <p>
          Caso a estadia esteja prevista para começar dentro do prazo de 7 (sete) dias, recomenda-se que o pedido
          seja apresentado imediatamente. As situações em que o serviço já tenha começado ou sido integralmente
          utilizado serão analisadas conforme a legislação aplicável e as circunstâncias do caso.
        </p>

        <h2>5. Cancelamento por iniciativa do hóspede</h2>
        <p>
          Fora das hipóteses de direito de arrependimento ou de descumprimento atribuível à Bomgo, a tarifa não
          reembolsável poderá resultar na retenção dos valores pagos, considerando o bloqueio do imóvel, a
          proximidade da entrada, os custos administrativos e a possibilidade de nova comercialização do período.
        </p>
        <p>
          Entretanto, quando o imóvel for novamente reservado para as mesmas datas, total ou parcialmente, a Bomgo
          poderá devolver ao hóspede os valores recuperados com a nova reserva, descontados:
        </p>
        <ul>
          <li>os custos administrativos e financeiros comprovadamente incorridos;</li>
          <li>as tarifas cobradas pelos meios de pagamento;</li>
          <li>eventuais diferenças de preço da nova contratação; e</li>
          <li>outros prejuízos diretamente relacionados ao cancelamento.</li>
        </ul>
        <p>
          A retenção não poderá ultrapassar o valor total da reserva nem contrariar as normas obrigatórias de
          proteção ao consumidor.
        </p>

        <h2>6. Alteração das datas</h2>
        <p>O hóspede poderá solicitar a alteração das datas da reserva, desde que:</p>
        <ul>
          <li>o pedido seja realizado antes do início da estadia;</li>
          <li>exista disponibilidade real do mesmo imóvel para o novo período;</li>
          <li>sejam respeitadas as regras tarifárias, a quantidade de noites e a capacidade do imóvel; e</li>
          <li>seja paga eventual diferença de valor.</li>
        </ul>
        <p>
          A alteração não é automática e somente será considerada concluída após confirmação expressa da Bomgo.
        </p>
        <p>
          Se o novo período possuir valor superior, o hóspede deverá pagar a diferença antes da confirmação. Se
          possuir valor inferior, não haverá devolução automática da diferença nas reservas originalmente
          contratadas com tarifa não reembolsável, salvo acordo expresso ou obrigação legal em sentido contrário.
        </p>
        <p>
          A Bomgo poderá limitar a quantidade de alterações e estabelecer prazo para utilização do crédito, desde
          que essas condições sejam informadas ao hóspede durante a negociação.
        </p>
        <p>
          A ausência de disponibilidade para as novas datas solicitadas não transforma a reserva original em reserva
          reembolsável.
        </p>

        <h2>7. Não comparecimento e saída antecipada</h2>
        <p>
          Será considerado <strong>não comparecimento (no-show)</strong> quando o hóspede não se apresentar para a
          entrada na data contratada e não tiver comunicado previamente uma alteração aceita pela Bomgo.
        </p>
        <p>
          O não comparecimento poderá resultar no cancelamento da estadia e na retenção dos valores pagos,
          observadas as limitações legais.
        </p>
        <p>
          A chegada após a data inicial, a saída antecipada, a redução da quantidade de hóspedes ou a utilização
          parcial da estadia, quando decorrentes de decisão do hóspede, não geram reembolso automático das noites
          não utilizadas.
        </p>

        <h2>8. Cancelamento ou indisponibilidade atribuível à Bomgo</h2>
        <p>
          Caso a Bomgo não possa disponibilizar o imóvel contratado por falha operacional, indisponibilidade
          superveniente, duplicidade de reserva ou outra circunstância sob sua responsabilidade, o hóspede será
          comunicado assim que possível.
        </p>
        <p>Nessa situação, o hóspede poderá escolher, conforme aplicável:</p>
        <ul>
          <li>remanejamento para imóvel de padrão equivalente ou superior, sem custo adicional;</li>
          <li>crédito para utilização em outra data, mediante concordância do hóspede; ou</li>
          <li>cancelamento com restituição integral dos valores pagos à Bomgo.</li>
        </ul>
        <p>
          A substituição por outro imóvel ou a concessão de crédito não será imposta quando a legislação assegurar
          ao hóspede o direito de escolher o reembolso.
        </p>

        <h2>9. Caso fortuito, força maior e situações excepcionais</h2>
        <p>
          Eventos inevitáveis e alheios à vontade das partes, como desastres naturais, interdições oficiais,
          calamidades públicas ou outras circunstâncias que efetivamente impeçam a utilização do imóvel, serão
          analisados individualmente.
        </p>
        <p>A existência do evento deverá ser comprovada pelo interessado, sempre que possível.</p>
        <p>
          Dependendo da responsabilidade das partes, da possibilidade de cumprimento da reserva e da legislação
          aplicável, a Bomgo poderá oferecer:
        </p>
        <ul>
          <li>alteração das datas;</li>
          <li>crédito para utilização futura;</li>
          <li>remanejamento para outro imóvel;</li>
          <li>restituição total ou parcial; ou</li>
          <li>outra solução equilibrada e aceita pelas partes.</li>
        </ul>
        <p>
          Problemas pessoais, alterações de agenda, perda de transporte, condições climáticas comuns, enfermidades
          sem comprovação ou outros acontecimentos que não tornem objetivamente impossível a estadia não geram
          direito automático ao reembolso, sem prejuízo da análise individual do caso.
        </p>
        <p>Esta cláusula não exclui direitos obrigatórios previstos em lei.</p>

        <h2>10. Reservas realizadas por plataformas parceiras</h2>
        <p>
          As reservas feitas por plataformas como Airbnb, Booking.com, Decolar e similares seguem, prioritariamente,
          as regras de cancelamento, alteração, pagamento e reembolso informadas pela respectiva plataforma no
          momento da contratação.
        </p>
        <p>O hóspede deverá apresentar o pedido diretamente no canal em que efetuou a reserva.</p>
        <p>
          As regras da plataforma não afastam direitos legalmente assegurados ao consumidor nem eventual
          responsabilidade da Bomgo por atos ou serviços diretamente atribuíveis a ela.
        </p>
        <p>
          Em caso de divergência entre esta Política e as condições apresentadas pela plataforma, prevalecerão as
          condições específicas da reserva e as normas legais obrigatórias aplicáveis.
        </p>

        <h2>11. Forma e prazo do reembolso</h2>
        <p>
          Quando houver reembolso devido, a Bomgo solicitará seu processamento após a confirmação do cancelamento e
          a apuração do valor correspondente.
        </p>
        <p>
          O prazo para que o valor fique disponível dependerá do meio de pagamento e das instituições financeiras
          envolvidas, especialmente nos pagamentos efetuados por cartão de crédito.
        </p>
        <p>
          O reembolso será realizado, preferencialmente, pelo mesmo meio utilizado no pagamento. Caso isso não seja
          possível, poderão ser solicitados dados bancários de titularidade do responsável pela reserva.
        </p>
        <p>
          Eventuais prazos operacionais das instituições financeiras serão informados ao hóspede e não poderão ser
          confundidos com recusa de reembolso pela Bomgo.
        </p>

        <h2>12. Solicitação de cancelamento ou alteração</h2>
        <p>O pedido deverá ser apresentado por um dos canais oficiais da Bomgo e deverá conter:</p>
        <ul>
          <li>nome completo do responsável;</li>
          <li>código da reserva;</li>
          <li>imóvel e datas contratadas;</li>
          <li>descrição da solicitação; e</li>
          <li>quando necessário, documentos comprobatórios.</li>
        </ul>
        <p>
          O simples envio do pedido não significa que a alteração tenha sido aprovada. A Bomgo encaminhará
          confirmação de recebimento e resposta pelo canal utilizado ou por outro meio informado pelo hóspede.
        </p>

        <h2>13. Proteção do consumidor e interpretação</h2>
        <p>
          Esta Política deverá ser interpretada de acordo com a boa-fé, o equilíbrio contratual, a transparência e a
          legislação brasileira.
        </p>
        <p>
          Nenhuma disposição deverá ser interpretada como renúncia antecipada a direitos indisponíveis do consumidor
          ou como exclusão da responsabilidade legal da Bomgo.
        </p>
        <p>
          Caso alguma disposição seja considerada inválida ou inaplicável, as demais continuarão válidas na medida
          permitida pela legislação.
        </p>

        <h2>14. Legislação aplicável</h2>
        <p>Esta Política observa, conforme a natureza da contratação:</p>
        <ul>
          <li>
            a <strong>Lei nº 8.078/1990 — Código de Defesa do Consumidor</strong>, especialmente os artigos 6º, 30,
            31, 35, 49 e 51;
          </li>
          <li>
            a <strong>Lei nº 10.406/2002 — Código Civil</strong>, especialmente os princípios da função social, da
            boa-fé e do equilíbrio contratual e as normas sobre caso fortuito, força maior e cláusula penal;
          </li>
          <li>
            o <strong>Decreto nº 7.962/2013</strong>, relativo às contratações realizadas no comércio eletrônico; e
          </li>
          <li>
            a <strong>Lei nº 8.245/1991 — Lei do Inquilinato</strong>, especialmente os artigos 48 a 50, quando a
            contratação possuir natureza jurídica de locação para temporada.
          </li>
        </ul>
        <p>
          A Lei do Inquilinato poderá não ser aplicável quando a operação estiver juridicamente caracterizada como
          hospedagem, apart-hotel ou serviço equivalente, hipótese em que serão observadas as normas específicas
          correspondentes.
        </p>

        <h2>15. Solução de dúvidas e conflitos</h2>
        <p>
          Em caso de dúvida, solicitação ou reclamação, o hóspede poderá entrar em contato com a Bomgo pelos canais
          informados nesta Política ou falar com a Sofia, informando o código da reserva.
        </p>
        <p>
          As partes buscarão solucionar eventuais divergências de maneira amigável, sem prejuízo do direito do
          consumidor de procurar os órgãos de defesa do consumidor ou o Poder Judiciário.
        </p>
        <p>Fica preservado o direito do consumidor de propor ação no foro de seu domicílio, nos casos previstos pela legislação.</p>
      </div>
    </div>
  )
}

