Hosted payment backend (sample)

Endpoints
- GET /payment/methods → returns hosted method with checkout_url = {APP_URL}/payment/checkout
- GET /payment/checkout → auto-posts to SECUREPAY_POST_URL
- POST /payment/return/success-server → verifies signature, confirms Duda session
- GET /payment/return/{success,cancel,error}

Setup
1) Copy this folder to your backend repo or deploy it as-is.
2) Create DO App Platform Web Service and Managed PostgreSQL. Attach DB.
3) Set env vars per .env.example. Keep secrets in DO env.
4) Initialize DB: psql "$DATABASE_URL" -f backend-sample/schema.sql
5) Deploy. Set Duda gateway methods URL(s) to {APP_URL}/payment/methods.

Notes
- Implement exact Teya/Borgun CheckHash field order in buildCheckHash.
- Replace confirmDudaSession with real Duda API call.
- Store PSP secret encrypted; use ENCRYPTION_KEY (32-byte base64).

Backend Sample (Express) for Hosted Gateway

Files:
- src/routes/payment.ts — minimal routes for /payment/methods, /payment/checkout, and return URLs
- src/server.ts — Express bootstrap
- schema.sql — minimal tables (order_sessions, psp_credentials)
- env-example.txt — example env vars to set in DigitalOcean

Usage:
1) Copy this folder into your backend repo (not recommended to run from views/).
2) Create tables using schema.sql (or adapt to your DB/ORM).
3) Fill env vars from env-example.txt in DigitalOcean App Platform.
4) Implement DB functions to fetch per-site PSP creds and persist orderid mapping.
5) Wire Duda client (OAuth/Partner API) in dudaService calls.



