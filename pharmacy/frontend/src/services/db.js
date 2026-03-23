import Dexie from 'dexie';

export const db = new Dexie('PharmacyDB');

db.version(2).stores({
  drugs: '++id, name, category, sku',
  sales: '++id, customer_id, total_amount, date, status',
  returns: '++id, sale_id, reason, date',
  customers: '++id, name, phone',
  prescriptions: '++id, prescription_id, customer, status, created_at',
  prescriptionItems: '++id, prescription_id, drug, quantity',
  syncQueue: '++id, action, table, data, timestamp'
});

export const addToSyncQueue = async (action, table, data) => {
  await db.syncQueue.add({
    action,
    table,
    data,
    timestamp: Date.now()
  });
};
