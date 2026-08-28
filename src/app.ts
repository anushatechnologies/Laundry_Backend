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
import { errorHandler, notFoundHandler } from './middleware/errors';

const app = express();

const configuredOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:3001,https://laundry.anushatechnologies.com')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable('x-powered-by');
app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        configuredOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.includes('anushatechnologies.com') ||
        origin.includes('localhost')
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Allow all legitimate client requests in production
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Token'],
  })
);
app.use((_, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});
app.use(express.json({ limit: '10mb' }));
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

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
