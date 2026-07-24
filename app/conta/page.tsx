import type { Metadata } from 'next'
import { AccountDashboard } from '@/components/account/account-dashboard'

export const metadata: Metadata = {
  title: 'Minha conta',
  robots: { index: false, follow: false },
  description: 'Suas reservas, favoritos e status do Clube Bomgo em um só lugar.',
}

export default function ContaPage() {
  return <AccountDashboard />
}
