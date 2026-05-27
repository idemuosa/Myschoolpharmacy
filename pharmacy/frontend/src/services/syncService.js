import { db } from './db';
import api from './api';
import toast from 'react-hot-toast';

const syncService = {
  // Sync pending local changes to the cloud
  syncToCloud: async () => {
    const queue = await db.syncQueue.toArray();
    if (queue.length === 0) return;

    const toastId = toast.loading(`Syncing ${queue.length} pending changes...`);
    let successCount = 0;

    for (const item of queue) {
      try {
        const { action, table, data, id: queueId } = item;
        let endpoint = table === 'drugs' ? 'drugs/' :
                       table === 'products' ? 'products/' :
                       table === 'sales' ? 'sales/' :
                       table === 'supermarketSales' ? 'supermarket-sales/' :
                       table === 'categories' ? 'categories/' :
                       table === 'customers' ? 'customers/' : `${table}/`;

        if (action === 'CREATE') {
          // Remove local ID if it was auto-generated or use numeric part
          // eslint-disable-next-line no-unused-vars
          const { id, ...payload } = data;
          await api.post(endpoint, payload);
        } else if (action === 'UPDATE') {
          await api.put(`${endpoint}${data.id}/`, data);
        } else if (action === 'DELETE') {
          await api.delete(`${endpoint}${data.id}/`);
        }

        // Remove from queue after success
        await db.syncQueue.delete(queueId);
        successCount++;
      } catch (error) {
        console.error(`Failed to sync item ${item.id}`, error);
      }
    }

    if (successCount > 0) {
      toast.success(`Synced ${successCount} changes to cloud.`, { id: toastId });
    } else {
      toast.dismiss(toastId);
    }
  },

  // Sync latest data from cloud to local DB
  syncFromCloud: async () => {
    const toastId = toast.loading('Refreshing local inventory...');
    try {
      // 1. Sync Drugs
      const drugRes = await api.get('drugs/');
      const drugs = drugRes.data.results || drugRes.data;
      if (Array.isArray(drugs)) {
        await db.drugs.clear();
        await db.drugs.bulkAdd(drugs);
      }

      // 2. Sync Products (Supermarket)
      const productRes = await api.get('products/');
      const products = productRes.data.results || productRes.data;
      if (Array.isArray(products)) {
        await db.products.clear();
        await db.products.bulkAdd(products);
      }

      // 3. Sync Categories
      const catRes = await api.get('categories/');
      const categories = catRes.data.results || catRes.data;
      if (Array.isArray(categories)) {
        await db.categories.clear();
        await db.categories.bulkAdd(categories);
      }

      // 4. Sync Customers
      const custRes = await api.get('customers/');
      const customers = custRes.data.results || custRes.data;
      if (Array.isArray(customers)) {
        await db.customers.clear();
        await db.customers.bulkAdd(customers);
      }

      toast.success('Inventory synced successfully.', { id: toastId });
    } catch (error) {
      console.error("Cloud to Local sync failed", error);
      toast.error('Sync failed. Using offline data.', { id: toastId });
    }
  },

  // Clear all local data (useful on logout)
  clearLocalData: async () => {
    const tables = [
      'drugs', 'products', 'categories', 'staff', 'sales',
      'supermarketSales', 'returns', 'customers',
      'prescriptions', 'prescriptionItems', 'expenses'
    ];
    for (const table of tables) {
      await db[table].clear();
    }
  }
};

export default syncService;
