import app from './app';
import { initDb } from './lib/mysql';
import {
  db,
  INITIAL_CATEGORIES,
  INITIAL_CLOTH_TYPES,
  INITIAL_SERVICE_MASTERS,
  INITIAL_SERVICE_PRICE_MATRIX,
  INITIAL_PRICING_SETTINGS,
  INITIAL_SERVICES,
  INITIAL_ORDERS,
  INITIAL_COUPONS,
  INITIAL_PINCODES,
  INITIAL_STAFF,
} from './lib/db';

const PORT = process.env.PORT || 5000;

async function startServer() {
  console.log('🔄 Initializing MySQL Database Connection...');
  await initDb({
    categories: INITIAL_CATEGORIES,
    clothTypes: INITIAL_CLOTH_TYPES,
    serviceMasters: INITIAL_SERVICE_MASTERS,
    priceMatrix: INITIAL_SERVICE_PRICE_MATRIX,
    pricingSettings: INITIAL_PRICING_SETTINGS,
    services: INITIAL_SERVICES,
    orders: INITIAL_ORDERS,
    coupons: INITIAL_COUPONS,
    pincodes: INITIAL_PINCODES,
    staff: INITIAL_STAFF,
  });

  await db.syncFromMysql();

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🧺 LaundryFresh Backend API running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
