import express from 'express';
import cors from 'cors';
import ordersRouter from './modules/orders/routes';
import servicesRouter from './modules/services/routes';
import pincodesRouter from './modules/pincodes/routes';
import couponsRouter from './modules/coupons/routes';
import staffRouter from './modules/staff/routes';
import bulkPricingRouter from './modules/bulk-pricing/routes';
import slotsRouter from './modules/slots/routes';
import subscriptionsRouter from './modules/subscriptions/routes';
import paymentsRouter from './modules/payments/routes';
import { inventoryRouter } from './modules/inventory/routes';
import customersRouter from './modules/customers/routes';
import notificationsRouter from './modules/notifications/routes';
import { auditRouter } from './modules/audit/routes';
import { hubsRouter } from './modules/hubs/routes';
import devicesRouter from './modules/devices/routes';
import bannersRouter from './modules/banners/routes';
import chatRouter from './modules/chat/routes';
import { errorHandler, notFoundHandler } from './middleware/errors';

const app = express();

const configuredOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:3001,https://laundry.anushatechnologies.com')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable('x-powered-by');

// Explicit Cross-Origin Resource Sharing (CORS) for laundryfresh.anushatechnologies.com & all clients
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Admin-Token, Range');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range, X-Content-Range, Content-Disposition, Content-Length');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Token', 'X-Requested-With', 'Accept', 'Origin'],
    optionsSuccessStatus: 200,
  })
);
app.options('*', cors());
app.use((_, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
app.use(express.json({ limit: '10mb', verify: (req, _res, buffer) => {
  (req as typeof req & { rawBody?: Buffer }).rawBody = Buffer.from(buffer);
} }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static('public/uploads'));

// API health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'LaundryFresh Backend API' });
});

// REST API Module Mounts
app.use('/api/orders', ordersRouter);
app.use('/api/services', servicesRouter);
app.use('/api/pincodes', pincodesRouter);
app.use('/api/coupons', couponsRouter);
app.use('/api/staff', staffRouter);
app.use('/api/bulk-pricing', bulkPricingRouter);
app.use('/api/slots', slotsRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/customers', customersRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/audit', auditRouter);
app.use('/api/hubs', hubsRouter);
app.use('/api/devices', devicesRouter);
app.use('/api/banners', bannersRouter);
app.use('/api/chat', chatRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
