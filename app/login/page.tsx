import { Suspense } from 'react'
import type { Metadata } from 'next'
import { AuthForm } from '@/components/auth/auth-form'

export const metadata: Metadata = {
  title: 'Entrar',
  robots: { index: false, follow: false },
  description: 'Acesse sua conta Bomgo para ver reservas, favoritos e preços do Clube Bomgo.',
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm mode="login" />
    </Suspense>
  )
}
