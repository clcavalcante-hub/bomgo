import { describe, it, expect, beforeAll } from 'vitest'
import { parseLocalDate, formatLocalDate, startOfLocalDay, formatLocalDateLabel } from './dates'

describe('regressão: calendário nunca deve voltar um dia (America/Fortaleza, UTC-3)', () => {
  beforeAll(() => {
    process.env.TZ = 'America/Fortaleza'
  })

  it('new Date("yyyy-MM-dd") É o bug (documentado, não usar em produção)', () => {
    // Prova que o bug existe quando alguém usa o padrão errado — se este
    // teste um dia "quebrar" (passar a retornar 15), é sinal de que o
    // ambiente de teste mudou de fuso, não que o bug foi corrigido de fato.
    expect(new Date('2026-07-15').getDate()).toBe(14)
  })

  it('parseLocalDate nunca sofre o rollback de fuso', () => {
    const d = parseLocalDate('2026-07-15')
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(6) // julho = índice 6
    expect(d.getDate()).toBe(15)
  })

  it('clicar no dia 15 mantém exatamente 15 no round-trip', () => {
    const clicked = parseLocalDate('2026-07-15')
    expect(formatLocalDate(clicked)).toBe('2026-07-15')
  })

  it('intervalo 15 → 16 gera checkin=2026-07-15 e checkout=2026-07-16', () => {
    const checkin = parseLocalDate('2026-07-15')
    const checkout = new Date(checkin.getFullYear(), checkin.getMonth(), checkin.getDate() + 1)
    expect(formatLocalDate(checkin)).toBe('2026-07-15')
    expect(formatLocalDate(checkout)).toBe('2026-07-16')
  })

  it('troca de mês: 31 de julho + 1 dia vira 1 de agosto', () => {
    const day31 = parseLocalDate('2026-07-31')
    const next = new Date(day31.getFullYear(), day31.getMonth() + 1, 1)
    expect(formatLocalDate(next)).toBe('2026-08-01')
  })

  it('startOfLocalDay descarta horário sem trocar de dia', () => {
    const withTime = new Date(2026, 6, 15, 23, 59, 59)
    expect(formatLocalDate(startOfLocalDay(withTime))).toBe('2026-07-15')
  })

  it('formatLocalDateLabel nunca recua um dia', () => {
    const label = formatLocalDateLabel('2026-07-15')
    expect(label).toContain('15')
  })

  it('formatLocalDateLabel de null retorna null', () => {
    expect(formatLocalDateLabel(null)).toBeNull()
  })
})
