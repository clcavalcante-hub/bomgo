import "server-only"

/**
 * Central detection of which real integrations are configured.
 *
 * Everything degrades gracefully: when a set of credentials is missing, the
 * corresponding API route falls back to the curated mock data so the product
 * stays fully functional in preview. The moment the env vars are added in the
 * Vercel project, the real supplier is used automatically — no code change.
 */

export const staysConfig = {
  apiUrl: process.env.STAYS_API_URL ?? "",
  login: process.env.STAYS_API_LOGIN ?? "",
  password: process.env.STAYS_API_PASSWORD ?? "",
}

export const cieloConfig = {
  merchantId: process.env.CIELO_MERCHANT_ID ?? "",
  merchantKey: process.env.CIELO_MERCHANT_KEY ?? "",
  // Defaults to sandbox unless explicitly set to "production".
  env: (process.env.CIELO_ENV ?? "sandbox").toLowerCase(),
}

export const sofiaConfig = {
  apiKey: process.env.AI_GATEWAY_API_KEY ?? "",
  // Overridable so the concierge model can be tuned without a deploy.
  model: process.env.SOFIA_MODEL ?? "openai/gpt-5.5",
}

export function isStaysConfigured(): boolean {
  return Boolean(staysConfig.apiUrl && staysConfig.login && staysConfig.password)
}

export function isCieloConfigured(): boolean {
  return Boolean(cieloConfig.merchantId && cieloConfig.merchantKey)
}

export function isSofiaAIConfigured(): boolean {
  return Boolean(sofiaConfig.apiKey)
}

export function cieloBaseUrls() {
  const production = cieloConfig.env === "production"
  return {
    transaction: production
      ? "https://api.cieloecommerce.cielo.com.br"
      : "https://apisandbox.cieloecommerce.cielo.com.br",
    query: production
      ? "https://apiquery.cieloecommerce.cielo.com.br"
      : "https://apiquerysandbox.cieloecommerce.cielo.com.br",
  }
}
