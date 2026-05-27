import Dexie from 'dexie';

export const db = new Dexie('PharmacyDB');

db.version(7).stores({
  drugs: '++id, name, category, barcode',
  products: '++id, name, category, barcode',
  categories: '++id, name, type',
  staff: '++id, full_name, role, username',
  sales: '++id, customer, transaction_id, created_at',
  supermarketSales: '++id, staff, transaction_id, created_at',
  returns: '++id, sale, drug, created_at',
  customers: '++id, first_name, last_name, phone_number',
  prescriptions: '++id, prescription_id, customer, status, created_at',
  prescriptionItems: '++id, prescription, drug',
  expenses: '++id, category, amount, description, date',
  syncQueue: '++id, action, table, data, timestamp'
});

db.open().catch((err) => {
  console.error("Failed to open db:", err.stack || err);
});

export const addToSyncQueue = async (action, table, data) => {
  await db.syncQueue.add({
    action,
    table,
    data,
    timestamp: Date.now()
  });
};
