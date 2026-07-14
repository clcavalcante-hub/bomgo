import { describe, it, expect } from 'vitest'
import { resolveDestinationInput, filterByDestinationRegion, normalizeDestinationText } from './destination-taxonomy'

describe('resolveDestinationInput', () => {
  it('Fortaleza resolve para city=Fortaleza, sem region', () => {
    const d = resolveDestinationInput('Fortaleza')
    expect(d).toEqual({
      type: 'city',
      label: 'Fortaleza',
      city: 'Fortaleza',
      state: 'Ceará',
      country: 'Brasil',
    })
  })

  it('Porto das Dunas resolve para city=Aquiraz, region=Porto das Dunas', () => {
    const d = resolveDestinationInput('Porto das Dunas')
    expect(d?.city).toBe('Aquiraz')
    expect(d?.region).toBe('Porto das Dunas')
    expect(d?.type).toBe('neighborhood')
  })

  it('Aquiraz sozinho resolve para city=Aquiraz sem limitar region', () => {
    const d = resolveDestinationInput('Aquiraz')
    expect(d?.city).toBe('Aquiraz')
    expect(d?.region).toBeUndefined()
  })

  it('Meireles resolve para city=Fortaleza, region=Meireles', () => {
    const d = resolveDestinationInput('Meireles')
    expect(d?.city).toBe('Fortaleza')
    expect(d?.region).toBe('Meireles')
  })

  it('Beira-Mar resolve para city=Fortaleza, region=Beira-Mar', () => {
    const d = resolveDestinationInput('Beira-Mar')
    expect(d?.city).toBe('Fortaleza')
    expect(d?.region).toBe('Beira-Mar')
  })

  it('nunca resolve dois municípios diferentes em uma única entrada', () => {
    // Para qualquer destino reconhecido, city e region devem pertencer à
    // MESMA entrada da taxonomia — nunca uma mistura de duas.
    const fortaleza = resolveDestinationInput('Fortaleza')
    const portoDasDunas = resolveDestinationInput('Porto das Dunas')
    expect(fortaleza?.city).not.toBe(portoDasDunas?.city)
    expect(fortaleza?.region).toBeUndefined()
  })

  it('input vazio ou nulo retorna null (limpar destino)', () => {
    expect(resolveDestinationInput('')).toBeNull()
    expect(resolveDestinationInput(null)).toBeNull()
    expect(resolveDestinationInput(undefined)).toBeNull()
  })

  it('destino desconhecido nunca herda city/region de outra entrada', () => {
    const d = resolveDestinationInput('Beach Park')
    expect(d?.city).toBeUndefined()
    expect(d?.region).toBeUndefined()
    expect(d?.label).toBe('Beach Park')
  })

  it('é insensível a acento e maiúsculas/minúsculas', () => {
    const a = resolveDestinationInput('porto das dunas')
    const b = resolveDestinationInput('PORTO DAS DUNAS')
    const c = resolveDestinationInput('Pôrto das Dúnas')
    expect(a?.city).toBe('Aquiraz')
    expect(b?.city).toBe('Aquiraz')
    expect(c?.city).toBe('Aquiraz')
  })

  it('round-trip pelo id estável da taxonomia (URL)', () => {
    const d = resolveDestinationInput('porto-das-dunas')
    expect(d?.city).toBe('Aquiraz')
    expect(d?.region).toBe('Porto das Dunas')
  })
})

describe('filterByDestinationRegion (guard de bairro)', () => {
  const props = [
    { neighborhood: 'Porto das Dunas', location: 'Porto das Dunas, Aquiraz' },
    { neighborhood: 'Meireles', location: 'Meireles, Fortaleza' },
    { neighborhood: 'Porto das Dunas', location: 'Porto das Dunas, Aquiraz' },
  ]

  it('sem region no destino, não filtra nada', () => {
    const result = filterByDestinationRegion(props, resolveDestinationInput('Aquiraz'))
    expect(result).toHaveLength(3)
  })

  it('com region "Porto das Dunas", remove imóveis de outro bairro (ex.: Meireles/Fortaleza)', () => {
    const result = filterByDestinationRegion(props, resolveDestinationInput('Porto das Dunas'))
    expect(result).toHaveLength(2)
    expect(result.every((p) => p.neighborhood === 'Porto das Dunas')).toBe(true)
  })

  it('destino null não filtra nada', () => {
    expect(filterByDestinationRegion(props, null)).toHaveLength(3)
  })
})

describe('normalizeDestinationText', () => {
  it('remove acentos e normaliza caixa', () => {
    expect(normalizeDestinationText('Pôrto das Dúnas')).toBe('porto das dunas')
  })
})
