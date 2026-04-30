import api from './api';
import { db, addToSyncQueue } from './db';

const posService = {
  getSales: async (config = {}) => {
    try {
      if (navigator.onLine) {
        const response = await api.get('sales/', config);
        // Update local cache: Use bulkPut to merge instead of clear() + bulkAdd()
        const sales = response.data.results || response.data;
        if (Array.isArray(sales)) {
          await db.sales.bulkPut(sales);
        }
        return response;
      }
    } catch (error) {
      console.error("Network failed, fetching from local DB", error);
    }
    const localSales = await db.sales.toArray();
    return { data: localSales };
  },

  createSale: async (saleData) => {
    if (navigator.onLine) {
      const response = await api.post('sales/', saleData);
      await db.sales.add(response.data);
      return response;
    } else {
      // Offline mode: generate temporary ID or use local DB auto-increment
      const id = await db.sales.add({ ...saleData, date: new Date().toISOString() });
      const offlineSale = { ...saleData, id };
      await addToSyncQueue('CREATE', 'sales', offlineSale);
      return { data: offlineSale, status: 201 };
    }
  },

  createReturn: async (returnData) => {
    if (navigator.onLine) {
      const response = await api.post('returns/', returnData);
      await db.returns.add(response.data);
      return response;
    } else {
      const id = await db.returns.add({ ...returnData, date: new Date().toISOString() });
      const offlineReturn = { ...returnData, id };
      await addToSyncQueue('CREATE', 'returns', offlineReturn);
      return { data: offlineReturn, status: 201 };
    }
  },
};

export default posService;
