import "server-only"
import { Pool } from "pg"

/**
 * Shared Postgres pool for the Bomgo web app (users + reservations).
 * Separate database (`bomgo_web`) from Sofia's `sofia_rag` on the same VPS
 * Postgres instance — different schema, different purpose, isolated by DB
 * name so nothing here can collide with Sofia's tables.
 */
declare global {
  // eslint-disable-next-line no-var
  var __bomgoPgPool: Pool | undefined
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL não configurada.")
  }
  return new Pool({
    connectionString,
    // The VPS Postgres is a plain docker container with no SSL configured —
    // default to no SSL. If it's ever put behind a proper cert/tunnel, add
    // `?sslmode=require` to DATABASE_URL to opt back in.
    ssl: connectionString.includes("sslmode=require") ? { rejectUnauthorized: false } : false,
    max: 5,
  })
}

export function getPool(): Pool {
  if (!global.__bomgoPgPool) {
    global.__bomgoPgPool = createPool()
  }
  return global.__bomgoPgPool
}

export async function query<T = any>(text: string, params?: unknown[]): Promise<T[]> {
  const pool = getPool()
  const res = await pool.query(text, params as any[])
  return res.rows as T[]
}
