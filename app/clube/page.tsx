import type { Metadata } from 'next'
import { ClubPage } from '@/components/club/club-page'

export const metadata: Metadata = {
  title: 'Clube Bomgo — Preços exclusivos e benefícios',
  description:
    'O programa de fidelidade da Bomgo: preços exclusivos, condições de reserva transparentes e atendimento prioritário da Sofia, sem mensalidade.',
}

export default function ClubeRoute() {
  return <ClubPage />
}
