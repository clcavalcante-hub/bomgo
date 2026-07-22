import type { Metadata } from "next"
import { SITE_DOMAIN } from "@/lib/site-url"

export const metadata: Metadata = {
  title: "Termos de Uso | Bomgo",
  description: "Termos de uso da plataforma Bomgo Brasil.",
}

export default function TermosDeUsoPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-28 md:px-6">
      <h1 className="font-serif text-3xl font-extrabold text-foreground md:text-4xl">Termos de Uso</h1>
      <p className="mt-2 text-sm text-muted-foreground">Última atualização: julho de 2026</p>

      <div className="prose prose-neutral mt-8 max-w-none space-y-6 text-muted-foreground [&_h2]:mt-8 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_p]:leading-relaxed">
        <p>
          Estes Termos de Uso regem o acesso e a utilização do site e da plataforma de reservas da Bomgo Brasil
          Ltda. ("Bomgo"), disponível em {SITE_DOMAIN}. Ao usar o site, você concorda com estes termos.
        </p>

        <h2>1. Quem somos</h2>
        <p>
          A Bomgo é uma empresa de gestão e locação de imóveis por temporada, sediada em Aquiraz/Fortaleza, Ceará.
          Atuamos com imóveis de administração própria (Reserva Direta Bomgo) e, em alguns casos, com ofertas de
          parceiros e canais externos, sempre identificados como tal na própria oferta.
        </p>

        <h2>2. Reservas</h2>
        <p>
          Ao concluir uma reserva pelo site, você declara que as informações fornecidas (nome, e-mail, telefone,
          documento, dados de hóspedes) são verdadeiras. A confirmação da reserva depende da disponibilidade real do
          imóvel e da aprovação do pagamento.
        </p>

        <h2>3. Pagamento</h2>
        <p>
          Aceitamos pagamento via Pix ou cartão de crédito, processado por gateway de pagamento parceiro. O
          parcelamento no cartão pode envolver acréscimo de juros conforme a quantidade de parcelas escolhida,
          exibido antes da confirmação do pagamento.
        </p>

        <h2>4. Cancelamento e reembolso</h2>
        <p>
          As condições de cancelamento e reembolso de cada reserva estão descritas na política específica,
          disponível em{" "}
          <a href="/cancelamento" className="text-primary underline underline-offset-2">
            Política de Cancelamento
          </a>
          . Recomendamos a leitura antes de confirmar sua reserva.
        </p>

        <h2>5. Uso do site</h2>
        <p>
          Você concorda em não utilizar o site para fins ilícitos, não tentar acessar áreas restritas sem
          autorização e não reproduzir conteúdo do site sem permissão prévia.
        </p>

        <h2>6. Sofia (assistente de IA)</h2>
        <p>
          A Sofia é uma assistente virtual que auxilia na busca, comparação e acompanhamento de reservas. As
          informações fornecidas pela Sofia têm caráter informativo; em caso de divergência, prevalecem os dados
          confirmados na reserva e nos documentos oficiais.
        </p>

        <h2>7. Alterações destes termos</h2>
        <p>
          Podemos atualizar estes termos periodicamente. A versão vigente é sempre a publicada nesta página.
        </p>

        <h2>8. Contato</h2>
        <p>
          Dúvidas sobre estes termos podem ser enviadas pelos canais de atendimento disponíveis no site ou
          diretamente à Sofia.
        </p>
      </div>
    </div>
  )
}
