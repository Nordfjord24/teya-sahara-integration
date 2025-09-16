create table if not exists psp_credentials (
  site_name text primary key,
  merchant_id text not null,
  payment_gateway_id text not null,
  secret_key text not null,
  test_mode boolean default false
);

create table if not exists order_sessions (
  orderid text primary key,
  site_name text not null,
  session_id text not null,
  created_at timestamptz default now()
);

create index if not exists idx_order_sessions_site_session on order_sessions(site_name, session_id);

-- Minimal mapping table for returning from PSP
CREATE TABLE IF NOT EXISTS order_sessions (
  orderid TEXT PRIMARY KEY,
  site_name TEXT NOT NULL,
  session_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Per-site PSP merchant credentials (store secrets encrypted in production)
CREATE TABLE IF NOT EXISTS psp_credentials (
  site_name TEXT PRIMARY KEY,
  merchant_id TEXT NOT NULL,
  payment_gateway_id TEXT NOT NULL,
  secret_key TEXT NOT NULL,
  test_mode BOOLEAN DEFAULT FALSE
);



