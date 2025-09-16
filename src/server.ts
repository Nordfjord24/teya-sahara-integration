import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { paymentRouter } from './routes/payment';

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static HTML fallback pages (success/cancel/error) if you want to serve them from this app
const publicRoot = path.join(process.cwd(), '..');
app.use('/public', express.static(publicRoot));

app.get('/health', (_req: Request, res: Response) => res.json({ ok: true }));

app.use('/payment', paymentRouter);

const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on :${port}`);
});


