import express, { Request, Response } from 'express';
import crypto from 'crypto';
import { pool } from '../services/db';
import { decrypt } from '../services/crypto';

export const paymentRouter = express.Router();

type PaymentMethod = {
  id: string;
  type: 'hosted';
  name: string;
  checkout_url: string;
};

paymentRouter.get('/methods', async (_req: Request, res: Response) => {
  const appUrl = process.env.APP_URL || '';
  const method: PaymentMethod = {
    id: 'teya_borgun_hosted',
    type: 'hosted',
    name: 'Card (Hosted)',
    checkout_url: `${appUrl}/payment/checkout`,
  };
  res.json({ methods: [method] });
});

async function createOrderSession(orderId: string, siteName: string, sessionId: string): Promise<void> {
  await pool.query(
    'insert into order_sessions(orderid, site_name, session_id) values ($1,$2,$3)',
    [orderId, siteName, sessionId]
  );
}

async function getPspCredentials(siteName: string): Promise<{
  merchant_id: string;
  payment_gateway_id: string;
  secret_key: string;
  test_mode: boolean;
} | null> {
  const { rows } = await pool.query(
    'select merchant_id, payment_gateway_id, secret_key, test_mode from psp_credentials where site_name=$1',
    [siteName]
  );
  if (rows.length === 0) return null;
  const row = rows[0];
  return {
    merchant_id: row.merchant_id,
    payment_gateway_id: row.payment_gateway_id,
    secret_key: decrypt(row.secret_key),
    test_mode: row.test_mode,
  };
}

function buildCheckHash(fields: Record<string, string>, secret: string): string {
  const ordered = Object.keys(fields)
    .sort()
    .map((k) => `${k}=${fields[k]}`)
    .join('&');
  return crypto.createHmac('sha256', secret).update(ordered, 'utf8').digest('hex').toUpperCase();
}

paymentRouter.get('/checkout', async (req: Request, res: Response) => {
  const appUrl = process.env.APP_URL || '';
  const securePayUrl = process.env.SECUREPAY_POST_URL || '';

  const siteName = String(req.query.site_name || '');
  const sessionId = String(req.query.session_id || '');
  const amount = String(req.query.amount || '0');
  const currency = String(req.query.currency || 'EUR');

  if (!siteName || !sessionId) {
    return res.status(400).send('Missing site_name or session_id');
  }

  const creds = await getPspCredentials(siteName);
  if (!creds) {
    return res.status(400).send('PSP credentials not found for site');
  }

  const orderId = crypto.randomUUID();
  await createOrderSession(orderId, siteName, sessionId);

  const payload: Record<string, string> = {
    merchantid: creds.merchant_id,
    paymentgatewayid: creds.payment_gateway_id,
    orderid: orderId,
    amount: amount,
    currency: currency,
    returnurl: `${appUrl}/payment/return/success`,
    callbackurl: `${appUrl}/payment/return/success-server`,
    cancelurl: `${appUrl}/payment/return/cancel`,
    errorurl: `${appUrl}/payment/return/error`,
  };

  const checkHash = buildCheckHash(payload, creds.secret_key);

  res.status(200).send(`<!doctype html>
<html>
  <head><meta charset="utf-8"><title>Redirecting…</title></head>
  <body onload="document.forms[0].submit()">
    <p>Redirecting to payment…</p>
    <form method="post" action="${securePayUrl}">
      ${Object.entries(payload)
        .map(([k, v]) => `<input type=\"hidden\" name=\"${k}\" value=\"${String(v).replace(/\"/g, '&quot;')}\"/>`)
        .join('')}
      <input type="hidden" name="checkhash" value="${checkHash}"/>
      <noscript><button type="submit">Continue</button></noscript>
    </form>
  </body>
</html>`);
});

async function getSessionByOrderId(orderId: string): Promise<{ site_name: string; session_id: string } | null> {
  const { rows } = await pool.query(
    'select site_name, session_id from order_sessions where orderid=$1',
    [orderId]
  );
  return rows[0] || null;
}

async function confirmDudaSession(_siteName: string, _sessionId: string): Promise<void> {
  return;
}

paymentRouter.post('/return/success-server', express.urlencoded({ extended: true }), async (req: Request, res: Response) => {
  try {
    const orderId = String(req.body.orderid || '');
    if (!orderId) return res.status(400).send('missing orderid');
    const mapping = await getSessionByOrderId(orderId);
    if (!mapping) return res.status(404).send('unknown order');

    const sessionCreds = await getPspCredentials(mapping.site_name);
    if (!sessionCreds) return res.status(400).send('creds missing');

    const incoming: Record<string, string> = {};
    Object.keys(req.body).forEach((k) => {
      if (k.toLowerCase() !== 'checkhash') incoming[k.toLowerCase()] = String(req.body[k]);
    });
    const expected = buildCheckHash(incoming, sessionCreds.secret_key);
    const provided = String(req.body.checkhash || '');
    if (expected !== provided) return res.status(400).send('invalid signature');

    await confirmDudaSession(mapping.site_name, mapping.session_id);
    return res.status(200).send('OK');
  } catch (_err) {
    return res.status(500).send('error');
  }
});

paymentRouter.get('/return/success', async (req: Request, res: Response) => {
  const orderId = String(req.query.orderid || '');
  if (orderId) {
    const mapping = await getSessionByOrderId(orderId);
    if (mapping) {
      await confirmDudaSession(mapping.site_name, mapping.session_id);
    }
  }
  res.status(200).send('Payment success. You may close this page.');
});

paymentRouter.get('/return/cancel', (_req: Request, res: Response) => {
  res.status(200).send('Payment cancelled.');
});

paymentRouter.get('/return/error', (_req: Request, res: Response) => {
  res.status(200).send('Payment error.');
});


