Hosted Gateway Starter (Duda + PSP Hosted Page)

Contents:
- checkout.html: Auto-post form to PSP (server renders hidden inputs)
- success.html: Optional landing after PSP success
- cancel.html: Landing after PSP cancel
- error.html: Landing after PSP error

Backend responsibilities:
- Build PSP payload per site using that site’s merchant credentials
- Render checkout.html with hidden fields and auto-submit
- Implement return URLs (success, success-server, cancel, error) and confirm Duda session

Security: Never post to the PSP from client JS. Server should render and auto-submit the form so secrets originate server-side.

Backend sample (copy to a separate repo or integrate into your app):
- backend-sample/src/routes/payment.ts: Minimal routes for methods, checkout, and returns
- backend-sample/src/server.ts: Express bootstrap
- backend-sample/.env.example: Env vars to set in DigitalOcean
- backend-sample/schema.sql: Minimal tables for order-session mapping and per-site PSP creds



