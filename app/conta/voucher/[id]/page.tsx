import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { auth } from '@/lib/auth/config'
import { getReservationRepository } from '@/lib/reservations/reservation-repository'
import type { PostgresReservationRepository } from '@/lib/reservations/postgres-reservation-repository'
import { getStaysMultiAccountService } from '@/lib/integrations/stays-multi-account'
import { formatBRL } from '@/lib/pricing'
import { formatLocalDateLabel } from '@/lib/dates'
import { PrintButton } from '@/components/account/print-button'

export const metadata: Metadata = {
  title: 'Voucher da reserva | Bomgo',
}

const STATUS_LABEL: Record<string, string> = {
  draft: 'Rascunho',
  awaiting_payment: 'Aguardando pagamento',
  pre_reserved: 'Pré-reservado',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  expired: 'Expirada',
  completed: 'Concluída',
  synchronization_error: 'Erro de sincronização',
}

export default async function VoucherPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) {
    redirect(`/login?redirect=/conta/voucher/${id}`)
  }

  const repo = getReservationRepository() as PostgresReservationRepository
  const reservation = await repo.getById(id)
  if (!reservation) notFound()

  if (typeof repo.getOwnerUserId === 'function') {
    const ownerId = await repo.getOwnerUserId(id)
    if (ownerId !== userId) notFound()
  }

  const { amount } = reservation
  let propertyName = reservation.origin.internalPropertyId
  let propertyLocation = ''
  try {
    const listing = await getStaysMultiAccountService().getListing(reservation.origin.externalListingId)
    if (listing) {
      propertyName = listing.name
      propertyLocation = listing.location
    }
  } catch {
    // Best-effort — voucher still shows every reservation detail we have.
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 print:px-0 print:py-0">
      <div className="flex items-center justify-between print:hidden">
        <Link href="/conta" className="text-sm text-muted-foreground hover:text-foreground">
          ← Voltar
        </Link>
        <PrintButton />
      </div>
      <h1 className="mt-4 font-serif text-xl font-medium text-foreground print:hidden">Voucher da reserva</h1>

      <div className="mt-6 rounded-md border border-border bg-card p-6 print:border-0 print:p-0">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <span className="font-serif text-lg font-semibold text-foreground">Bomgo</span>
          <span className="font-mono text-sm text-primary">Voucher {reservation.reservationCode}</span>
        </div>

        <h2 className="mt-4 font-serif text-lg font-medium text-foreground">{propertyName}</h2>
        <p className="text-sm text-muted-foreground">{propertyLocation}</p>

        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Check-in</dt>
            <dd className="font-medium text-foreground">{formatLocalDateLabel(reservation.checkInDate)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Check-out</dt>
            <dd className="font-medium text-foreground">{formatLocalDateLabel(reservation.checkOutDate)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Hóspedes</dt>
            <dd className="font-medium text-foreground">{reservation.guests}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Status</dt>
            <dd className="font-medium text-foreground">{STATUS_LABEL[reservation.status] ?? reservation.status}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Nº da reserva</dt>
            <dd className="font-medium text-foreground">{reservation.reservationId}</dd>
          </div>
          {reservation.staysReservationId && (
            <div>
              <dt className="text-xs text-muted-foreground">Nº Stays</dt>
              <dd className="font-medium text-foreground">{reservation.staysReservationId}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs text-muted-foreground">Hóspede</dt>
            <dd className="font-medium text-foreground">
              {reservation.customer.firstName} {reservation.customer.lastName}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Contato</dt>
            <dd className="font-medium text-foreground">{reservation.customer.email}</dd>
          </div>
        </dl>

        <div className="mt-6 border-t border-border pt-4 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>
              {formatBRL(amount.nightlyPrice)} × {amount.nights} {amount.nights === 1 ? 'diária' : 'diárias'}
            </span>
            <span>{formatBRL(amount.subtotal)}</span>
          </div>
          {amount.fees > 0 && (
            <div className="mt-1 flex justify-between text-muted-foreground">
              <span>Taxas</span>
              <span>{formatBRL(amount.fees)}</span>
            </div>
          )}
          <div className="mt-2 flex justify-between text-base font-semibold text-foreground">
            <span>Total</span>
            <span>{formatBRL(amount.total)}</span>
          </div>
        </div>

        <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground">
          Documento gerado pela Bomgo Brasil Serviços de Hospedagem. Em caso de dúvidas sobre esta reserva, fale
          com a Sofia pelo site ou WhatsApp.
        </p>
      </div>
    </main>
  )
}
