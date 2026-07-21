'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, Loader2, Lock, Sparkles } from 'lucide-react'
import { useApp } from '@/components/providers/app-providers'
import { signIn, signUp, signInWithGoogle, signInWithFacebook, signInWithReservation } from '@/lib/services/auth-service'
import { Logo } from '@/components/brand/logo'

type Mode = 'login' | 'signup'
type SignupStep = 1 | 2 | 3

function maskCPF(v: string) {
  return v
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

function maskCEP(v: string) {
  return v.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2')
}

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter()
  const params = useSearchParams()
  const { login } = useApp()
  const redirectTo = params.get('next') || '/conta'
  const nextParam = params.get('next') ? `?next=${encodeURIComponent(params.get('next')!)}` : ''

  const [step, setStep] = useState<SignupStep>(1)
  const [loginTab, setLoginTab] = useState<'email' | 'reserva'>('email')
  const [resNome, setResNome] = useState('')
  const [resCodigo, setResCodigo] = useState('')
  const [resCheckin, setResCheckin] = useState('')

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cpf, setCpf] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [profession, setProfession] = useState('')
  const [phone, setPhone] = useState('')
  const [cep, setCep] = useState('')
  const [street, setStreet] = useState('')
  const [streetNumber, setStreetNumber] = useState('')
  const [complement, setComplement] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError] = useState<string | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [facebookLoading, setFacebookLoading] = useState(false)

  const isLogin = mode === 'login'

  async function lookupCEP(value: string) {
    const digits = value.replace(/\D/g, '')
    if (digits.length !== 8) return
    setCepLoading(true)
    setCepError(null)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data = await res.json()
      if (data?.erro) {
        setCepError('CEP não encontrado.')
        return
      }
      setStreet(data.logradouro ?? '')
      setNeighborhood(data.bairro ?? '')
      setCity(data.localidade ?? '')
      setState(data.uf ?? '')
    } catch {
      setCepError('Não foi possível buscar o CEP agora.')
    } finally {
      setCepLoading(false)
    }
  }

  function validateStep1(): string | null {
    if (!firstName.trim() || !lastName.trim()) return 'Informe seu nome e sobrenome.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Informe um e-mail válido.'
    if (password.length < 6) return 'A senha deve ter ao menos 6 caracteres.'
    return null
  }

  function goNext() {
    setError(null)
    if (step === 1) {
      const err = validateStep1()
      if (err) {
        setError(err)
        return
      }
    }
    setStep((s) => (s < 3 ? ((s + 1) as SignupStep) : s))
  }

  function goBack() {
    setError(null)
    setStep((s) => (s > 1 ? ((s - 1) as SignupStep) : s))
  }

  async function handleLoginSubmit(e: React.FormEvent) {
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
    setLoading(true)
    try {
      const session = await signIn(email, password)
      login(session)
      router.push(redirectTo)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível continuar. Tente novamente.')
      setLoading(false)
    }
  }

  async function handleReservaSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!resNome.trim() || (!resCodigo.trim() && !resCheckin.trim())) {
      setError('Informe o nome completo e o código da reserva (ou a data de check-in).')
      return
    }
    setLoading(true)
    try {
      const session = await signInWithReservation({ nome: resNome, codigo: resCodigo, checkin: resCheckin })
      login(session)
      router.push('/minha-reserva')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível continuar. Tente novamente.')
      setLoading(false)
    }
  }

  async function handleSignupSubmit() {
    setError(null)
    setLoading(true)
    try {
      const session = await signUp({
        firstName,
        lastName,
        email,
        password,
        cpf: cpf || undefined,
        birthDate: birthDate || undefined,
        profession: profession || undefined,
        phone: phone || undefined,
        cep: cep || undefined,
        street: street || undefined,
        streetNumber: streetNumber || undefined,
        complement: complement || undefined,
        neighborhood: neighborhood || undefined,
        city: city || undefined,
        state: state || undefined,
      })
      login(session)
      router.push(redirectTo)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível continuar. Tente novamente.')
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    try {
      await signInWithGoogle(redirectTo)
    } catch {
      setGoogleLoading(false)
    }
  }

  async function handleFacebook() {
    setFacebookLoading(true)
    try {
      await signInWithFacebook(redirectTo)
    } catch {
      setFacebookLoading(false)
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
      <div className="flex items-center justify-center px-4 py-10 md:px-10">
        <div className="flex max-h-[90vh] w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 pt-7 shadow-sm md:border-0 md:bg-transparent md:p-0 md:pt-2 md:shadow-none">
          <div className="md:hidden">
            <Logo />
          </div>

          {isLogin ? (
            <>
              <h1 className="mt-4 text-balance font-serif text-2xl font-medium text-foreground md:mt-0">
                Entrar na Bomgo
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Acesse sua conta para ver reservas e favoritos.
              </p>

              <button
                type="button"
                onClick={handleGoogle}
                disabled={googleLoading}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground transition hover:border-primary disabled:opacity-60"
              >
                {googleLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                Continuar com Google
              </button>

              <button
                type="button"
                onClick={handleFacebook}
                disabled={facebookLoading}
                className="mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1877F2] px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {facebookLoading ? <Loader2 className="size-4 animate-spin" /> : <FacebookIcon />}
                Continuar com Facebook
              </button>

              <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" /> ou entre com e-mail
                <span className="h-px flex-1 bg-border" />
              </div>

              <div className="mb-3 flex rounded-full bg-secondary p-1 text-sm">
                <button
                  type="button"
                  onClick={() => setLoginTab('email')}
                  className={`flex-1 rounded-full py-1.5 font-medium transition ${loginTab === 'email' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
                >
                  E-mail e senha
                </button>
                <button
                  type="button"
                  onClick={() => setLoginTab('reserva')}
                  className={`flex-1 rounded-full py-1.5 font-medium transition ${loginTab === 'reserva' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
                >
                  Código da reserva
                </button>
              </div>

              {loginTab === 'email' ? (
                <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3">
                  <Field label="E-mail" type="email" value={email} onChange={setEmail} autoComplete="email" placeholder="voce@email.com" />
                  <Field
                    label="Senha"
                    type="password"
                    value={password}
                    onChange={setPassword}
                    autoComplete="current-password"
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
                    className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> Processando...
                      </>
                    ) : (
                      'Entrar'
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleReservaSubmit} className="flex flex-col gap-3">
                  <p className="text-xs text-muted-foreground">
                    Reservou pela Booking, Airbnb ou outro parceiro? Seu e-mail cadastrado não bate com o nosso
                    sistema — entre com o nome e o código da reserva.
                  </p>
                  <Field label="Nome completo do titular" type="text" value={resNome} onChange={setResNome} placeholder="Como está na reserva" />
                  <Field label="Código da reserva" type="text" value={resCodigo} onChange={setResCodigo} placeholder="Opcional se informar a data" />
                  <Field label="Data de check-in" type="date" value={resCheckin} onChange={setResCheckin} placeholder="" />
                  {error && (
                    <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      {error}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> Processando...
                      </>
                    ) : (
                      'Entrar'
                    )}
                  </button>
                </form>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={goBack}
                    aria-label="Voltar"
                    className="rounded-full p-1 text-muted-foreground transition hover:text-foreground"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                )}
                <h1 className="mt-4 text-balance font-serif text-2xl font-medium text-foreground md:mt-0">
                  Criar sua conta
                </h1>
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">Etapa {step} de 3</p>
              <div className="mt-2 flex gap-1.5">
                {[1, 2, 3].map((s) => (
                  <span
                    key={s}
                    className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-primary' : 'bg-border'}`}
                  />
                ))}
              </div>

              <div className="mt-4 flex-1 overflow-y-auto pr-1">
                {step === 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handleGoogle}
                      disabled={googleLoading}
                      className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground transition hover:border-primary disabled:opacity-60"
                    >
                      {googleLoading ? <Loader2 className="size-4 animate-spin" /> : <GoogleIcon />}
                      Continuar com Google
                    </button>
                    <button
                      type="button"
                      onClick={handleFacebook}
                      disabled={facebookLoading}
                      className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1877F2] px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
                    >
                      {facebookLoading ? <Loader2 className="size-4 animate-spin" /> : <FacebookIcon />}
                      Continuar com Facebook
                    </button>
                    <div className="mb-4 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="h-px flex-1 bg-border" /> ou com e-mail
                      <span className="h-px flex-1 bg-border" />
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Nome" value={firstName} onChange={setFirstName} autoComplete="given-name" />
                        <Field label="Sobrenome" value={lastName} onChange={setLastName} autoComplete="family-name" />
                      </div>
                      <Field label="E-mail" type="email" value={email} onChange={setEmail} autoComplete="email" placeholder="voce@email.com" />
                      <Field
                        label="Senha"
                        type="password"
                        value={password}
                        onChange={setPassword}
                        autoComplete="new-password"
                        placeholder="Mínimo de 6 caracteres"
                      />
                    </div>
                  </>
                )}

                {step === 2 && (
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="CPF" value={cpf} onChange={(v) => setCpf(maskCPF(v))} placeholder="000.000.000-00" />
                      <Field label="Nascimento" type="date" value={birthDate} onChange={setBirthDate} />
                    </div>
                    <Field label="Profissão" value={profession} onChange={setProfession} />
                    <Field label="Telefone" value={phone} onChange={setPhone} placeholder="(00) 00000-0000" />
                    <p className="text-xs text-muted-foreground">Esses campos são opcionais — pode pular pra próxima etapa.</p>
                  </div>
                )}

                {step === 3 && (
                  <div className="flex flex-col gap-3">
                    <div>
                      <Field
                        label="CEP"
                        value={cep}
                        onChange={(v) => {
                          const masked = maskCEP(v)
                          setCep(masked)
                          if (masked.replace(/\D/g, '').length === 8) lookupCEP(masked)
                        }}
                        placeholder="00000-000"
                      />
                      {cepLoading && (
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Loader2 className="size-3 animate-spin" /> Buscando endereço…
                        </p>
                      )}
                      {cepError && <p className="mt-1 text-xs text-destructive">{cepError}</p>}
                    </div>
                    <div className="grid grid-cols-[1fr_90px] gap-3">
                      <Field label="Rua" value={street} onChange={setStreet} />
                      <Field label="Número" value={streetNumber} onChange={setStreetNumber} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Complemento" value={complement} onChange={setComplement} />
                      <Field label="Bairro" value={neighborhood} onChange={setNeighborhood} />
                    </div>
                    <div className="grid grid-cols-[1fr_80px] gap-3">
                      <Field label="Cidade" value={city} onChange={setCity} />
                      <Field label="UF" value={state} onChange={(v) => setState(v.toUpperCase().slice(0, 2))} />
                    </div>
                    <p className="text-xs text-muted-foreground">Endereço é opcional — pode concluir sem preencher.</p>
                  </div>
                )}

                {error && (
                  <p role="alert" className="mt-3 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </p>
                )}
              </div>

              <div className="mt-4">
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition hover:bg-primary/90"
                  >
                    Continuar
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSignupSubmit}
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> Processando...
                      </>
                    ) : (
                      'Criar conta'
                    )}
                  </button>
                )}
              </div>
            </>
          )}

          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="size-3.5" /> Seus dados são tratados conforme a LGPD.
          </p>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {isLogin ? (
              <>
                Ainda não tem conta?{' '}
                <Link href={`/cadastro${nextParam}`} className="font-medium text-primary hover:underline">
                  Cadastre-se
                </Link>
              </>
            ) : (
              <>
                Já tem conta?{' '}
                <Link href={`/login${nextParam}`} className="font-medium text-primary hover:underline">
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

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-white">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4">
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.82Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.28v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28v-3.1H1.28A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.38l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.59 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.28 6.62l4 3.1C6.22 6.87 8.87 4.75 12 4.75Z" />
    </svg>
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
      <span className="mb-1 block text-xs font-medium text-foreground">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary"
      />
    </label>
  )
}
