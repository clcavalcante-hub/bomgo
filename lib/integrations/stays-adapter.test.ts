import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { StaysAdapter } from "./stays-adapter"
import type { StaysConnection } from "./stays-connection-registry"

/**
 * Contract tests against the Stays HTTP API shape — never the real network.
 * Payload shapes follow the official docs (https://stays.net/external-api/)
 * so a real account is expected to satisfy the same mapping this exercises.
 */

const connection: StaysConnection = {
  connectionId: "bomgo-principal",
  connectionName: "Bomgo (conta principal)",
  apiUrl: "https://play.stays.net",
  login: "test-login",
  password: "test-password",
  partnerId: null,
  isPrimary: true,
  active: true,
  commissionRule: { type: "none", value: 0, label: "Inventário próprio" },
  lastSyncAt: null,
}

function rawListing(overrides: Record<string, unknown> = {}) {
  return {
    _id: "5c9d44da8dca990010557182",
    id: "AP101",
    status: "active",
    internalName: "AP101 - Studio Standard",
    _mstitle: { pt_BR: "Studio Standard Frente Mar", en_US: "Standard Studio" },
    _msdesc: { pt_BR: "<p>Studio completo, a poucos passos da praia.</p>" },
    _t_typeMeta: { _mstitle: { pt_BR: "Apartamento" } },
    address: { city: "Fortaleza", district: "Porto das Dunas", state: "CE", countryCode: "BR" },
    _t_mainImageMeta: { url: "https://play.stays.net/image/d235/5c9d44da8dca990010557182" },
    _t_imagesMeta: [{ url: "https://play.stays.net/image/d235/other-1" }],
    amenities: [{ _id: "amenity-wifi" }, { _id: "amenity-pool" }],
    _i_maxGuests: 4,
    _i_rooms: 2,
    _f_bathrooms: 1,
    _f_square: 60,
    rating: 0,
    reviewsCount: 0,
    instantBooking: true,
    featured: false,
    bookingPrice: {
      from: "2026-08-10",
      to: "2026-08-12",
      _mctotal: { BRL: 1200 },
      fees: [{ _mcval: { BRL: 150 } }],
    },
    ...overrides,
  }
}

const searchFilterPayload = {
  amenities: [
    { _id: "amenity-wifi", _mstitle: { pt_BR: "Wi-Fi" } },
    { _id: "amenity-pool", _mstitle: { pt_BR: "Piscina" } },
  ],
  cities: [{ val: "Fortaleza" }],
  regions: [{ val: "Porto das Dunas" }],
  states: [{ val: "CE" }],
  properties: [{ _id: "5c9d44da8dca990010557182", internalName: "AP101", address: { city: "Fortaleza", region: "Porto das Dunas" } }],
  minprice: { BRL: 400 },
  maxprice: { BRL: 3200 },
}

function mockFetchSequence(responses: Array<{ ok: boolean; json?: unknown; status?: number }>) {
  const fn = vi.fn()
  responses.forEach((r) => {
    fn.mockResolvedValueOnce({
      ok: r.ok,
      status: r.status ?? (r.ok ? 200 : 500),
      json: async () => r.json,
    })
  })
  vi.stubGlobal("fetch", fn)
  return fn
}

describe("StaysAdapter — contrato real da API Stays (mockado na camada HTTP)", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("mapeia um listing real corretamente (nome, slug, imagens, preço, comodidades)", async () => {
    mockFetchSequence([
      { ok: true, json: [rawListing()] }, // search-listings
      { ok: true, json: searchFilterPayload }, // searchfilter (amenity labels)
    ])
    const adapter = new StaysAdapter(connection)
    const result = await adapter.searchListings({
      destination: null,
      checkIn: null,
      checkOut: null,
      adults: 2,
      children: 0,
      childrenAges: [],
      rooms: 1,
    })

    expect(result).not.toBeNull()
    expect(result).toHaveLength(1)
    const property = result![0]
    expect(property.id).toBe("5c9d44da8dca990010557182")
    expect(property.slug).toBe("ap101")
    expect(property.name).toBe("Studio Standard Frente Mar")
    expect(property.images[0].src).toBe("https://play.stays.net/image/d235/5c9d44da8dca990010557182")
    expect(property.nightlyPrice).toBe(600) // 1200 total / 2 nights
    expect(property.cleaningFee).toBe(150)
    expect(property.amenities.map((a) => a.label)).toEqual(["Wi-Fi", "Piscina"])
    expect(property.maxGuests).toBe(4)
    expect(property.origin?.staysConnectionId).toBe("bomgo-principal")
  })

  it("nunca inventa uma nota (rating) — usa 0 quando a Stays não envia uma real", async () => {
    mockFetchSequence([
      { ok: true, json: [rawListing({ rating: undefined })] },
      { ok: true, json: searchFilterPayload },
    ])
    const adapter = new StaysAdapter(connection)
    const result = await adapter.searchListings({
      destination: null,
      checkIn: null,
      checkOut: null,
      adults: 1,
      children: 0,
      childrenAges: [],
      rooms: 1,
    })
    expect(result![0].rating).toBe(0)
  })

  it("retorna null (nunca [] disfarçado) quando a chamada real falha", async () => {
    mockFetchSequence([{ ok: false, status: 500 }])
    const adapter = new StaysAdapter(connection)
    const result = await adapter.searchListings({
      destination: null,
      checkIn: null,
      checkOut: null,
      adults: 1,
      children: 0,
      childrenAges: [],
      rooms: 1,
    })
    expect(result).toBeNull()
  })

  it("findListingBySlug resolve via Content API direta (slug.toUpperCase() == id real)", async () => {
    mockFetchSequence([
      { ok: true, json: rawListing() }, // GET /content/listings/AP101 (id.toUpperCase() do slug "ap101")
      { ok: true, json: searchFilterPayload }, // amenity labels (dentro de getListing)
    ])
    const adapter = new StaysAdapter(connection)
    const found = await adapter.findListingBySlug("ap101")
    expect(found).not.toBeNull()
    expect(found!.id).toBe("5c9d44da8dca990010557182")
  })

  it("findListingBySlug cai para navegação paginada quando a Content API direta não resolve o slug", async () => {
    mockFetchSequence([
      { ok: false, status: 404 }, // GET /content/listings/SLUG-QUE-NAO-EXISTE — não é um id real
      { ok: true, json: [rawListing()] }, // fallback: browse (search-listings com datas padrão)
      { ok: true, json: searchFilterPayload }, // amenity labels
    ])
    const adapter = new StaysAdapter(connection)
    const found = await adapter.findListingBySlug("slug-que-nao-existe")
    expect(found).toBeNull()
  })

  it("getSearchFilter mapeia comodidades e faixa de preço reais da conta", async () => {
    mockFetchSequence([{ ok: true, json: searchFilterPayload }])
    const adapter = new StaysAdapter(connection)
    const filter = await adapter.getSearchFilter()
    expect(filter).not.toBeNull()
    expect(filter!.cities).toEqual(["Fortaleza"])
    expect(filter!.amenities).toEqual([
      { id: "amenity-wifi", label: "Wi-Fi" },
      { id: "amenity-pool", label: "Piscina" },
    ])
    expect(filter!.minPrice).toBe(400)
    expect(filter!.maxPrice).toBe(3200)
  })
})
