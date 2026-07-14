// Test-only stand-in for the `server-only` package (see vitest.config.ts).
// Next.js aliases the real package to a no-op during build via its
// `react-server` condition; under plain Node/Vitest we do the same here.
export {}
