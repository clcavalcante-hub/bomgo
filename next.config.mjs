// Stays' documented multi-tenant domain is `*.stays.net` (see
// https://stays.net/external-api/), but real accounts can be hosted on a
// different white-labeled domain — Bomgo's own primary account serves
// listing photos from `bomgo.stays.com.br`, not `*.stays.net`. Rather than
// hardcode one account's domain (which silently breaks every image the
// moment a different/new Stays account is connected — exactly what
// happened here), derive the actual allowed hostname straight from each
// connection's own configured API URL (see stays-connection-registry.ts),
// so every currently-configured account's images just work.
function staysImageRemotePatterns() {
  const apiUrlEnvVars = ["STAYS_API_URL", "STAYS_BEACHLIVING_API_URL", "STAYS_VERDEFAN_API_URL"]
  const hostnames = new Set(["*.stays.net"])
  for (const key of apiUrlEnvVars) {
    const value = process.env[key]
    if (!value) continue
    try {
      hostnames.add(new URL(value).hostname)
    } catch {
      // Malformed env value — skip it, keep the documented fallback above.
    }
  }
  return Array.from(hostnames).map((hostname) => ({
    protocol: "https",
    hostname,
    pathname: "/image/**",
  }))
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: staysImageRemotePatterns(),
  },
}

export default nextConfig
