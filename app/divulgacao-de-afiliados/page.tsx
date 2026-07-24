import type { Metadata } from "next"
import { COMPANY } from "@/lib/config/company"
import { AFFILIATE_DISCLOSURE, BOOKING_PARTNER_LABEL } from "@/lib/affiliates"

export const metadata: Metadata = {
  title: "Divulgação de afiliados",
  description:
    "Como a Bomgo Brasil trabalha com links de parceiros: o que é reserva direta, o que é reserva na Booking.com e como recebemos comissão.",
  alternates: { canonical: "/divulgacao-de-afiliados" },
}

/**
 * Página de transparência sobre a relação de afiliado.
 *
 * Existe por três motivos, nessa ordem de importância: é exigência do programa
 * de afiliados, é o que o leitor merece antes de clicar, e é o que sustenta a
 * recomendação. Um portal que indica hospedagem e ganha comissão só tem
 * autoridade se disser isso na cara — esconder no rodapé corrói exatamente a
 * confiança que o conteúdo constrói.
 *
 * A distinção que mais importa para o viajante não é jurídica, é prática: com
 * quem ele fala se algo der errado. Por isso ela vem numa tabela, não num
 * parágrafo de termos.
 */
export default function AffiliateDisclosurePage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-14 md:px-6 md:py-20">
      <h1 className="text-balance font-serif text-3xl font-bold md:text-4xl">
        Divulgação de afiliados
      </h1>
      <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">
        Transparência sobre como a Bomgo Brasil ganha dinheiro quando recomenda uma hospedagem.
      </p>

      <section className="mt-10 space-y-4">
        <h2 className="font-serif text-2xl font-bold">A parceria com a Booking.com</h2>
        <p className="text-[17px] leading-relaxed">
          A Bomgo Brasil é <strong>{BOOKING_PARTNER_LABEL}</strong>: participamos do Programa de
          Parceiros Afiliados da Booking.com e estamos autorizados a promover a plataforma usando os
          links e materiais disponibilizados pelo programa.
        </p>
        <p className="text-[17px] leading-relaxed">{AFFILIATE_DISCLOSURE}</p>
        <p className="text-[17px] leading-relaxed">
          A Bomgo Brasil <strong>não é</strong> propriedade, filial ou representante legal da
          Booking.com, e não é proprietária nem operadora dos hotéis e resorts de terceiros que
          apresenta.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="font-serif text-2xl font-bold">Duas formas de reservar — e quem te atende</h2>
        <p className="text-[17px] leading-relaxed">
          Esta é a diferença que importa na prática: com quem você fala se precisar de algo.
        </p>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full border-collapse text-[15px]">
            <thead>
              <tr className="bg-muted/50">
                <th scope="col" className="p-3 text-left font-semibold" />
                <th scope="col" className="p-3 text-left font-semibold">Reserva direta Bomgo</th>
                <th scope="col" className="p-3 text-left font-semibold">Reserva na Booking.com</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <th scope="row" className="p-3 text-left font-medium text-muted-foreground">
                  Onde você conclui
                </th>
                <td className="p-3">Aqui, no site da Bomgo</td>
                <td className="p-3">No ambiente da Booking.com</td>
              </tr>
              <tr className="border-t border-border">
                <th scope="row" className="p-3 text-left font-medium text-muted-foreground">
                  Quem define preço e condições
                </th>
                <td className="p-3">A Bomgo</td>
                <td className="p-3">A Booking.com e o fornecedor da hospedagem</td>
              </tr>
              <tr className="border-t border-border">
                <th scope="row" className="p-3 text-left font-medium text-muted-foreground">
                  Cancelamento e pagamento
                </th>
                <td className="p-3">Regras da Bomgo</td>
                <td className="p-3">Regras da plataforma e do fornecedor</td>
              </tr>
              <tr className="border-t border-border">
                <th scope="row" className="p-3 text-left font-medium text-muted-foreground">
                  Suporte durante a estadia
                </th>
                <td className="p-3">Com a nossa equipe</td>
                <td className="p-3">Com a plataforma e a hospedagem</td>
              </tr>
              <tr className="border-t border-border">
                <th scope="row" className="p-3 text-left font-medium text-muted-foreground">
                  A Bomgo recebe comissão?
                </th>
                <td className="p-3">Não — é venda própria</td>
                <td className="p-3">Sim, pela indicação</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[17px] leading-relaxed">
          Em todo o site, os cards indicam qual é o caso: <em>Reserva direta Bomgo</em> ou{" "}
          <em>Parceiro Booking.com</em>.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="font-serif text-2xl font-bold">O que a comissão não muda</h2>
        <p className="text-[17px] leading-relaxed">
          Você não paga nada a mais por reservar através dos nossos links — o preço é o mesmo da
          plataforma.
        </p>
        <p className="text-[17px] leading-relaxed">
          E a comissão não decide o que recomendamos. Nossos guias apontam o ponto fraco de cada
          opção e dizem quando um apartamento faz mais sentido que um resort — inclusive quando isso
          significa deixar de ganhar comissão. Uma recomendação que só serve a quem paga não vale
          nada para quem lê, e é a leitura que sustenta este site.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="font-serif text-2xl font-bold">Preços e disponibilidade</h2>
        <p className="text-[17px] leading-relaxed">
          Não publicamos preço nem disponibilidade de hospedagem de terceiros. Esses dados mudam o
          tempo todo e pertencem à plataforma: por isso os botões levam você até lá para consultar.
          Qualquer valor, horário, regra ou serviço deve ser confirmado no canal de reserva antes de
          fechar.
        </p>
      </section>

      <section className="mt-10 space-y-2 border-t border-border pt-8 text-[15px] text-muted-foreground">
        <h2 className="font-serif text-xl font-bold text-foreground">Quem somos</h2>
        <p>{COMPANY.legalName}</p>
        <p>CNPJ {COMPANY.cnpj}</p>
        <p>Ceará, Brasil</p>
      </section>
    </article>
  )
}
