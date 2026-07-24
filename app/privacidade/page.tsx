import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacidade e LGPD",
  description: "Como a Bomgo coleta, usa e protege seus dados pessoais, em conformidade com a LGPD.",
}

export default function PrivacidadePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-28 md:px-6">
      <h1 className="font-serif text-3xl font-extrabold text-foreground md:text-4xl">Privacidade e LGPD</h1>
      <p className="mt-2 text-sm text-muted-foreground">Última atualização: julho de 2026</p>

      <div className="prose prose-neutral mt-8 max-w-none space-y-6 text-muted-foreground [&_h2]:mt-8 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_p]:leading-relaxed">
        <p>
          Esta página explica como a Bomgo Brasil Ltda. coleta, usa, armazena e protege dados pessoais, em
          conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).
        </p>

        <h2>1. Quais dados coletamos</h2>
        <p>
          Coletamos os dados necessários para viabilizar sua reserva e hospedagem: nome completo, e-mail, telefone,
          CPF, dados de pagamento (processados por gateway parceiro, nunca armazenados diretamente por nós),
          informações de check-in e, quando aplicável, dados de acompanhantes na reserva.
        </p>

        <h2>2. Para que usamos seus dados</h2>
        <p>
          Usamos seus dados para: confirmar e gerir sua reserva; processar pagamentos; emitir comunicações sobre a
          hospedagem (check-in, instruções, lembretes); cumprir obrigações legais e regulatórias exigidas para
          locação por temporada; e, quando autorizado, enviar ofertas e novidades da Bomgo.
        </p>

        <h2>3. Com quem compartilhamos</h2>
        <p>
          Compartilhamos dados estritamente necessários com: o sistema de gestão de reservas (Stays), o gateway de
          pagamento (Cielo), e o condomínio/portaria do imóvel reservado, exclusivamente para liberação de acesso.
          Não vendemos dados pessoais a terceiros.
        </p>

        <h2>4. Seus direitos</h2>
        <p>
          Conforme a LGPD, você pode solicitar a qualquer momento: confirmação da existência de tratamento, acesso
          aos seus dados, correção de dados incompletos ou desatualizados, anonimização ou eliminação de dados
          desnecessários, e revogação do consentimento para comunicações de marketing.
        </p>

        <h2>5. Como exercer seus direitos</h2>
        <p>
          Solicitações sobre seus dados podem ser feitas pelos canais de atendimento da Bomgo disponíveis no site.
          Responderemos dentro do prazo legal aplicável.
        </p>

        <h2>6. Retenção de dados</h2>
        <p>
          Mantemos seus dados pelo tempo necessário para cumprir a finalidade da coleta e obrigações legais
          (fiscais, contábeis e regulatórias do setor de hospedagem), após o que são eliminados ou anonimizados.
        </p>

        <h2>7. Segurança</h2>
        <p>
          Adotamos medidas técnicas e organizacionais razoáveis para proteger seus dados contra acesso não
          autorizado, perda ou alteração indevida.
        </p>

        <h2>8. Alterações desta política</h2>
        <p>Podemos atualizar esta política periodicamente. A versão vigente é sempre a publicada nesta página.</p>
      </div>
    </div>
  )
}
