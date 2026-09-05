export function subscriptionView(row: any, now = Date.now()) {
  const numeric = (value: unknown) => Number.isFinite(Number(value)) ? Number(value) : 0;
  const paymentStatus = String(row.payment_status || 'PENDING').toUpperCase();
  const storedStatus = String(row.status || 'PENDING').toUpperCase();
  const start = new Date(row.start_date).getTime();
  const end = new Date(row.end_date).getTime();
  const isActive = storedStatus === 'ACTIVE' && paymentStatus === 'PAID' && start <= now && end > now;
  const status = storedStatus !== 'ACTIVE' ? storedStatus
    : paymentStatus !== 'PAID' ? 'PAYMENT_PENDING'
    : !Number.isFinite(start) || !Number.isFinite(end) ? 'PENDING'
    : end <= now ? 'EXPIRED' : start > now ? 'SCHEDULED' : 'ACTIVE';
  let features: unknown = row.features;
  if (typeof features === 'string') {
    try { features = JSON.parse(features); } catch { features = []; }
  }
  return {
    id: row.id, customerId: row.customer_id, subscriptionId: row.subscription_id,
    planName: row.plan_name || 'Laundry Pass', slug: row.slug,
    status, isActive, paymentId: row.payment_id, paymentStatus,
    amount: numeric(row.amount), startDate: row.start_date, endDate: row.end_date,
    autoRenew: row.auto_renew === true || numeric(row.auto_renew) === 1,
    usedKg: numeric(row.used_kg), remainingKg: numeric(row.remaining_kg),
    includedKg: row.included_kg == null ? numeric(row.used_kg) + numeric(row.remaining_kg) : numeric(row.included_kg),
    ordersCount: numeric(row.orders_count),
    features: Array.isArray(features) ? features.filter((feature): feature is string => typeof feature === 'string') : [],
    freePickupDelivery: Boolean(row.free_pickup_delivery), priorityService: Boolean(row.priority_service),
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}
