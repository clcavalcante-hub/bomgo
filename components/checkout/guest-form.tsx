"use client"

import { useState } from "react"

export interface GuestFormValue {
  firstName: string
  lastName: string
  email: string
  phone: string
  document: string
}

const EMPTY: GuestFormValue = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  document: "",
}

function maskCPF(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
}

function maskPhone(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
}

export function GuestForm({
  initialValue,
  onSubmit,
}: {
  initialValue: GuestFormValue | null
  onSubmit: (value: GuestFormValue) => void
}) {
  const [value, setValue] = useState<GuestFormValue>(initialValue ?? EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof GuestFormValue, string>>>({})

  function validate(): boolean {
    const next: Partial<Record<keyof GuestFormValue, string>> = {}
    if (!value.firstName.trim()) next.firstName = "Informe o nome"
    if (!value.lastName.trim()) next.lastName = "Informe o sobrenome"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) next.email = "E-mail inválido"
    if (value.phone.replace(/\D/g, "").length < 10) next.phone = "Telefone inválido"
    if (value.document.replace(/\D/g, "").length !== 11) next.document = "CPF inválido"
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (validate()) onSubmit(value)
  }

  return (
    <form onSubmit={submit} className="rounded-md border border-border bg-card p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Nome"
          value={value.firstName}
          error={errors.firstName}
          onChange={(v) => setValue((s) => ({ ...s, firstName: v }))}
          autoComplete="given-name"
        />
        <Field
          label="Sobrenome"
          value={value.lastName}
          error={errors.lastName}
          onChange={(v) => setValue((s) => ({ ...s, lastName: v }))}
          autoComplete="family-name"
        />
        <Field
          label="E-mail"
          type="email"
          value={value.email}
          error={errors.email}
          onChange={(v) => setValue((s) => ({ ...s, email: v }))}
          autoComplete="email"
          className="sm:col-span-2"
        />
        <Field
          label="Telefone"
          value={value.phone}
          error={errors.phone}
          onChange={(v) => setValue((s) => ({ ...s, phone: maskPhone(v) }))}
          placeholder="(85) 99999-9999"
          autoComplete="tel"
        />
        <Field
          label="CPF"
          value={value.document}
          error={errors.document}
          onChange={(v) => setValue((s) => ({ ...s, document: maskCPF(v) }))}
          placeholder="000.000.000-00"
        />
      </div>

      <button
        type="submit"
        className="mt-6 w-full rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground transition hover:bg-primary/90"
      >
        Ir para o pagamento
      </button>
    </form>
  )
}

function Field({
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  autoComplete,
  className,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  type?: string
  placeholder?: string
  autoComplete?: string
  className?: string
}) {
  return (
    <label className={className}>
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary ${
          error ? "border-destructive" : "border-border"
        }`}
      />
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  )
}
