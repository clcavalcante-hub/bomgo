import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de Cancelamento | Bomgo",
  description: "Condições de cancelamento e reembolso das reservas Bomgo.",
}

export default function CancelamentoPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-28 md:px-6">
      <h1 className="font-serif text-3xl font-extrabold text-foreground md:text-4xl">Política de Cancelamento</h1>
      <p className="mt-2 text-sm text-muted-foreground">Última atualização: julho de 2026</p>

      <div className="prose prose-neutral mt-8 max-w-none space-y-6 text-muted-foreground [&_h2]:mt-8 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_p]:leading-relaxed">
        <p>
          As reservas feitas diretamente com a Bomgo (Reserva Direta Bomgo) são <strong>não reembolsáveis</strong>{" "}
          após a confirmação do pagamento, salvo nas exceções descritas abaixo.
        </p>

        <h2>1. Reserva Direta Bomgo</h2>
        <p>
          Uma vez confirmado o pagamento, a reserva é considerada garantida e não está sujeita a reembolso em caso
          de desistência do hóspede. Recomendamos confirmar todos os detalhes da estadia (datas, número de
          hóspedes, localização) antes de concluir o pagamento.
        </p>

        <h2>2. Alteração de datas</h2>
        <p>
          É possível solicitar alteração das datas da reserva, sujeita à disponibilidade real do imóvel para o novo
          período. Havendo diferença de valor entre a diária original e a nova, ela é calculada e cobrada (ou
          informada) no momento da alteração.
        </p>

        <h2>3. Reservas feitas por parceiros/OTAs</h2>
        <p>
          Reservas realizadas através de plataformas parceiras (Booking.com, Airbnb, Decolar e similares) seguem a
          política de cancelamento definida pela própria plataforma no momento da reserva. Consulte as condições
          apresentadas naquele canal.
        </p>

        <h2>4. Casos excepcionais</h2>
        <p>
          Em situações excepcionais (indisponibilidade do imóvel por motivo de força maior, erro comprovado de
          sistema, entre outros), a Bomgo avalia cada caso individualmente e pode oferecer remanejamento para outro
          imóvel equivalente ou reembolso, a seu critério.
        </p>

        <h2>5. Dúvidas</h2>
        <p>
          Para tratar de uma reserva específica, entre em contato pelos canais de atendimento da Bomgo ou fale com
          a Sofia informando o código da sua reserva.
        </p>
      </div>
    </div>
  )
}
