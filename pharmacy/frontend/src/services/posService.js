import api from './api';
import { db, addToSyncQueue } from './db';

const posService = {
  getSales: async (config = {}) => {
    try {
      const response = await api.get('sales/', config);
      const sales = response.data.results || response.data;
      if (Array.isArray(sales)) {
        await db.sales.bulkPut(sales);
      }
      return { data: sales };
    } catch (error) {
      console.error("Network failed, fetching sales from local DB", error);
      try {
        const localSales = await db.sales.toArray();
        return { data: localSales };
      } catch (dbError) {
        throw dbError;
      }
    }
  },

  createSale: async (saleData) => {
    try {
      const response = await api.post('sales/', saleData);
      await db.sales.add(response.data);
      return response;
    } catch (error) {
      console.error("Online sale failed, switching to offline queue", error);
      const offlineSale = { ...saleData, created_at: new Date().toISOString() };
      const id = await db.sales.add(offlineSale);
      await addToSyncQueue('CREATE', 'sales', { ...offlineSale, id });
      return { data: { ...offlineSale, id }, status: 201 };
    }
  },

  createReturn: async (returnData) => {
    try {
      const response = await api.post('returns/', returnData);
      await db.returns.add(response.data);
      return response;
    } catch (error) {
      console.error("Online return failed, switching to offline queue", error);
      const offlineReturn = { ...returnData, created_at: new Date().toISOString() };
      const id = await db.returns.add(offlineReturn);
      await addToSyncQueue('CREATE', 'returns', { ...offlineReturn, id });
      return { data: { ...offlineReturn, id }, status: 201 };
    }
  },

  getStaffSalesStats: async (staffId, config = {}) => {
    try {
      return await api.get(`sales/${staffId}/sales-stats/`, config);
    } catch (error) {
      console.error("Staff sales stats offline, calculating from local data");
      const localSales = await db.sales.where('staff').equals(staffId).toArray();
      const revenue = localSales.reduce((acc, s) => acc + parseFloat(s.total_amount || 0), 0);
      return {
        data: {
          total_revenue: revenue,
          transaction_count: localSales.length,
          customer_count: new Set(localSales.map(s => s.customer).filter(Boolean)).size,
          staff_name: "Staff #" + staffId
        }
      };
    }
  }
};

export default posService;
