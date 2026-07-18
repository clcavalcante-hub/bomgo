import "server-only"

/**
 * Multi-account Cielo registry — mirrors the Stays connection registry
 * pattern: each partner account (bomgo-principal, beach-living, verdefan...)
 * can have its OWN Cielo merchant credentials, so a guest paying for a
 * partner's unit is charged on THAT partner's Cielo account, never
 * commingled with Bomgo's own.
 *
 * Env vars per connection (suffix matches the Stays connection's envPrefix
 * suffix, e.g. BEACHLIVING, VERDEFAN):
 *   CIELO_MERCHANT_ID_<SUFFIX>
 *   CIELO_MERCHANT_KEY_<SUFFIX>
 *
 * If a connection has no dedicated Cielo credentials configured, it falls
 * back to the default CIELO_MERCHANT_ID / CIELO_MERCHANT_KEY (Bomgo's own) —
 * so nothing breaks for partners who haven't set up their own account yet.
 */

export interface CieloCredentials {
  merchantId: string
  merchantKey: string
}

// Maps a Stays connectionId to the env-var suffix used for its Cielo
// credentials. Keep in sync with CONNECTION_SEEDS in
// stays-connection-registry.ts — connectionId here must match exactly.
const CONNECTION_ENV_SUFFIX: Record<string, string> = {
  "bomgo-principal": "", // uses the default CIELO_MERCHANT_ID/KEY
  "beach-living": "BEACHLIVING",
  verdefan: "VERDEFAN",
}

function defaultCredentials(): CieloCredentials {
  return {
    merchantId: process.env.CIELO_MERCHANT_ID ?? "",
    merchantKey: process.env.CIELO_MERCHANT_KEY ?? "",
  }
}

/**
 * Resolve which Cielo account should process a charge for a given Stays
 * connection. Falls back to the default account if the partner's own
 * credentials aren't configured yet.
 */
export function cieloCredentialsForConnection(connectionId: string | null | undefined): CieloCredentials {
  const suffix = connectionId ? CONNECTION_ENV_SUFFIX[connectionId] : undefined
  if (!suffix) return defaultCredentials()

  const merchantId = process.env[`CIELO_MERCHANT_ID_${suffix}`] ?? ""
  const merchantKey = process.env[`CIELO_MERCHANT_KEY_${suffix}`] ?? ""
  if (merchantId && merchantKey) return { merchantId, merchantKey }

  // Partner-specific credentials not set up yet — fall back rather than fail.
  return defaultCredentials()
}
