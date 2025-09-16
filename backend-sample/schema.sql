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


