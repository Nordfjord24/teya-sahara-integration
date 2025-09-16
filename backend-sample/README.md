Hosted payment backend (sample)

Endpoints
- GET /payment/methods → returns hosted method with checkout_url = {APP_URL}/payment/checkout
- GET /payment/checkout → auto-posts to SECUREPAY_POST_URL
- POST /payment/return/success-server → verifies signature, confirms Duda session
- GET /payment/return/{success,cancel,error}

Setup
1) Deploy via DO App Platform. If using repo root, set Source dir to backend-sample or keep .do/app.yaml.
2) Create Managed Postgres and attach. DB env will be injected as DATABASE_URL.
3) Set env vars per .env.example. Keep secrets in DO env.
4) Initialize DB: psql "$DATABASE_URL" -f backend-sample/schema.sql
5) Set Duda gateway methods URL(s) to {APP_URL}/payment/methods.

Notes
- Implement exact Teya/Borgun CheckHash field order in buildCheckHash.
- Replace confirmDudaSession with real Duda API call.
- Store PSP secret encrypted; use ENCRYPTION_KEY (32-byte base64).


