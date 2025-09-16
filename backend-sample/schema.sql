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



