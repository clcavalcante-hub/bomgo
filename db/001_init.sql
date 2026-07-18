-- Bomgo web app schema (separate database from Sofia's sofia_rag).
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- for gen_random_uuid()

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT, -- null for social-login-only accounts
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  cpf TEXT,
  birth_date DATE,
  profession TEXT,
  phone TEXT,
  cep TEXT,
  street TEXT,
  street_number TEXT,
  complement TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT,
  google_id TEXT UNIQUE,
  is_club_member BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reservations (
  reservation_id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  idempotency_key TEXT,
  status TEXT NOT NULL,
  internal_property_id TEXT NOT NULL,
  external_listing_id TEXT NOT NULL,
  stays_connection_id TEXT NOT NULL,
  partner_id TEXT,
  source_account TEXT,
  stays_reservation_id TEXT,
  reservation_code TEXT,
  stays_client_id TEXT,
  customer_first_name TEXT NOT NULL,
  customer_last_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_document TEXT,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  guests INT NOT NULL,
  adults INT NOT NULL,
  children INT NOT NULL,
  amount_total NUMERIC(10,2) NOT NULL,
  amount_currency TEXT NOT NULL DEFAULT 'BRL',
  simulated BOOLEAN NOT NULL DEFAULT false,
  hold_expires_at TIMESTAMPTZ,
  request_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS reservations_idempotency_key_idx
  ON reservations(idempotency_key) WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS reservations_overlap_idx
  ON reservations(external_listing_id, stays_connection_id, check_in_date, check_out_date);

CREATE INDEX IF NOT EXISTS reservations_user_idx ON reservations(user_id);
