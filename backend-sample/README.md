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



