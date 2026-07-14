import "server-only"

import type { CommissionRule } from "@/lib/types"

/**
 * Multi-account Stays connection registry.
 *
 * A "connection" is one Stays account whose inventory Bomgo consolidates.
 * The registry is the single source of truth for which accounts exist, their
 * credentials, their partner ownership and their commission rule.
 *
 * Storage today is an in-memory, env-seeded repository so the platform runs
 * with zero real credentials in preview. It is intentionally hidden behind the
 * async `StaysConnectionRepository` interface so it can be swapped for a
 * Postgres/Supabase-backed implementation later WITHOUT touching the adapter,
 * the multi-account service or any route.
 *
 * Secrets live only here (server-only). They are never exported to the client
 * and never attached to a Property.
 */

// -------------------------------------------------------------------------
// Types
// -------------------------------------------------------------------------

export interface StaysConnection {
  connectionId: string
  connectionName: string
  apiUrl: string
  // Stays uses HTTP Basic Authentication with an API login + password
  // (Authorization: Basic base64(login:password)). No OAuth / client_id.
  login: string
  password: string
  partnerId: string | null
  isPrimary: boolean
  active: boolean
  commissionRule: CommissionRule
  lastSyncAt: string | null
}

export interface StaysConnectionRepository {
  /** All connections (active and inactive). */
  list(): Promise<StaysConnection[]>
  /** Only connections that are active AND have full credentials. */
  listActive(): Promise<StaysConnection[]>
  getById(connectionId: string): Promise<StaysConnection | null>
  getPrimary(): Promise<StaysConnection | null>
}

// -------------------------------------------------------------------------
// Seed definition (declarative — adding a 4th account is a one-liner)
// -------------------------------------------------------------------------

interface ConnectionSeed {
  connectionId: string
  connectionName: string
  /** Env var prefix, e.g. "STAYS" → STAYS_API_URL / STAYS_API_LOGIN / STAYS_API_PASSWORD */
  envPrefix: string
  partnerId: string | null
  isPrimary: boolean
  commissionRule: CommissionRule
}

/**
 * The three initial inventories. To onboard a new partner account, add one
 * entry here and set its three env vars (see `readCredentials`). No other code
 * needs to change — the multi-account service picks it up automatically.
 */
const CONNECTION_SEEDS: ConnectionSeed[] = [
  {
    connectionId: "bomgo-principal",
    connectionName: "Bomgo (conta principal)",
    envPrefix: "STAYS",
    partnerId: null,
    isPrimary: true,
    commissionRule: { type: "none", value: 0, label: "Inventário próprio" },
  },
  {
    connectionId: "beach-living",
    connectionName: "Beach Living",
    envPrefix: "STAYS_BEACHLIVING",
    partnerId: "partner-beach-living",
    isPrimary: false,
    commissionRule: { type: "percentage", value: 12, label: "Comissão parceiro Beach Living" },
  },
  {
    connectionId: "verdefan",
    connectionName: "Verdefan",
    envPrefix: "STAYS_VERDEFAN",
    partnerId: "partner-verdefan",
    isPrimary: false,
    commissionRule: { type: "percentage", value: 15, label: "Comissão parceiro Verdefan" },
  },
]

function readCredentials(envPrefix: string) {
  return {
    apiUrl: (process.env[`${envPrefix}_API_URL`] ?? "").replace(/\/$/, ""),
    login: process.env[`${envPrefix}_API_LOGIN`] ?? "",
    password: process.env[`${envPrefix}_API_PASSWORD`] ?? "",
  }
}

function seedToConnection(seed: ConnectionSeed): StaysConnection {
  const creds = readCredentials(seed.envPrefix)
  // A connection is only usable when all three vars are present.
  const hasCredentials = Boolean(creds.apiUrl && creds.login && creds.password)
  return {
    connectionId: seed.connectionId,
    connectionName: seed.connectionName,
    apiUrl: creds.apiUrl,
    login: creds.login,
    password: creds.password,
    partnerId: seed.partnerId,
    isPrimary: seed.isPrimary,
    // A connection is only active if fully configured. Unconfigured accounts
    // are simply skipped, and search falls back to curated data.
    active: hasCredentials,
    commissionRule: seed.commissionRule,
    lastSyncAt: null,
  }
}

// -------------------------------------------------------------------------
// In-memory repository (env-seeded, migration-ready)
// -------------------------------------------------------------------------

class InMemoryStaysConnectionRepository implements StaysConnectionRepository {
  private build(): StaysConnection[] {
    return CONNECTION_SEEDS.map(seedToConnection)
  }

  async list(): Promise<StaysConnection[]> {
    return this.build()
  }

  async listActive(): Promise<StaysConnection[]> {
    return this.build().filter((c) => c.active)
  }

  async getById(connectionId: string): Promise<StaysConnection | null> {
    return this.build().find((c) => c.connectionId === connectionId) ?? null
  }

  async getPrimary(): Promise<StaysConnection | null> {
    const all = this.build()
    return all.find((c) => c.isPrimary) ?? all[0] ?? null
  }
}

// Singleton accessor. Swap the implementation here to migrate to a database:
//   return new PostgresStaysConnectionRepository(sql)
let repository: StaysConnectionRepository | null = null

export function getStaysConnectionRegistry(): StaysConnectionRepository {
  if (!repository) {
    repository = new InMemoryStaysConnectionRepository()
  }
  return repository
}
