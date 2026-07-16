'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2, Lock, Sparkles } from 'lucide-react'
import { useApp } from '@/components/providers/app-providers'
import { signIn, signUp } from '@/lib/services/auth-service'
import { Logo } from '@/components/brand/logo'

type Mode = 'login' | 'signup'

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter()
  const params = useSearchParams()
  const { login } = useApp()
  const redirectTo = params.get('next') || '/conta'

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isLogin = mode === 'login'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Informe um e-mail válido.')
      return
    }
    if (password.length < 6) {
      setError('A senha deve ter ao menos 6 caracteres.')
      return
    }
    if (!isLogin && (!firstName.trim() || !lastName.trim())) {
      setError('Informe seu nome e sobrenome.')
      return
    }

    setLoading(true)
    try {
      const session = isLogin
        ? await signIn(email, password)
        : await signUp({ firstName, lastName, email, password })
      login(session)
      router.push(redirectTo)
    } catch {
      setError('Não foi possível continuar. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto grid min-h-dvh w-full max-w-6xl items-stretch gap-0 px-0 md:grid-cols-2">
      {/* Visual side */}
      <aside className="relative hidden overflow-hidden md:block">
        <Image
          src="/images/partner-2.png"
          alt="Suíte à beira-mar reservada pela Bomgo"
          fill
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-primary/45" />
        <div className="absolute inset-0 flex flex-col justify-between p-10">
          <Logo variant="light" />
          <div className="max-w-sm text-primary-foreground">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1.5 text-xs font-medium backdrop-blur">
              <Sparkles className="size-3.5 text-cta" /> Reserva inteligente
            </p>
            <h2 className="mt-4 text-pretty font-serif text-3xl font-medium leading-tight">
              Sua próxima estadia, conduzida pela Sofia do começo ao fim.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-primary-foreground/85">
              Guarde favoritos, acompanhe reservas e desbloqueie preços do Clube
              Bomgo em todos os seus dispositivos.
            </p>
          </div>
        </div>
      </aside>

      {/* Form side */}
      <div className="flex items-center justify-center px-4 py-28 md:px-10">
        <div className="w-full max-w-sm">
          <div className="md:hidden">
            <Logo />
          </div>
          <h1 className="mt-6 text-balance font-serif text-3xl font-medium text-foreground md:mt-0">
            {isLogin ? 'Entrar na Bomgo' : 'Criar sua conta'}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isLogin
              ? 'Acesse sua conta para ver reservas e favoritos.'
              : 'Leva menos de um minuto e já libera o Clube Bomgo.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            {!isLogin && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nome" value={firstName} onChange={setFirstName} autoComplete="given-name" />
                <Field label="Sobrenome" value={lastName} onChange={setLastName} autoComplete="family-name" />
              </div>
            )}
            <Field
              label="E-mail"
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              placeholder="voce@email.com"
            />
            <Field
              label="Senha"
              type="password"
              value={password}
              onChange={setPassword}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              placeholder="Mínimo de 6 caracteres"
            />

            {error && (
              <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Processando...
                </>
              ) : isLogin ? (
                'Entrar'
              ) : (
                'Criar conta'
              )}
            </button>
          </form>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="size-3.5" /> Seus dados são tratados conforme a LGPD.
          </p>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? (
              <>
                Ainda não tem conta?{' '}
                <Link href="/cadastro" className="font-medium text-primary hover:underline">
                  Cadastre-se
                </Link>
              </>
            ) : (
              <>
                Já tem conta?{' '}
                <Link href="/login" className="font-medium text-primary hover:underline">
                  Entrar
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  autoComplete,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  autoComplete?: string
}) {
  return (
    <label>
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none transition focus:border-primary"
      />
    </label>
  )
}
