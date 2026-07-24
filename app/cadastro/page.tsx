import { Suspense } from 'react'
import type { Metadata } from 'next'
import { AuthForm } from '@/components/auth/auth-form'

export const metadata: Metadata = {
  title: 'Criar conta',
  robots: { index: false, follow: false },
  description: 'Crie sua conta Bomgo e desbloqueie o Clube Bomgo, favoritos e reservas em um só lugar.',
}

export default function CadastroPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm mode="signup" />
    </Suspense>
  )
}
