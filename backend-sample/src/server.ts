import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
// Use CommonJS-style require to avoid ESM path resolution issues in runtime
// eslint-disable-next-line @typescript-eslint/no-var-requires
const paymentRouter = require('./routes/payment.js').paymentRouter as import('./routes/payment').paymentRouter;

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => res.json({ ok: true }));

app.use('/payment', paymentRouter);

const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on :${port}`);
});


