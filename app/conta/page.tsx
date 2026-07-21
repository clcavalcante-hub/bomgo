import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/config'
import { AccountDashboard } from '@/components/account/account-dashboard'

export const metadata: Metadata = {
  title: 'Minha conta | Bomgo',
  description: 'Suas reservas, favoritos e status do Clube Bomgo em um só lugar.',
}

export default async function ContaPage() {
  const session = await auth()
  if ((session?.user as { isOtaGuest?: boolean } | undefined)?.isOtaGuest) {
    redirect('/minha-reserva')
  }
  return <AccountDashboard />
}
