import api from './api';
import { db } from './db';

const reportService = {
  getInventoryTurnover: async (config = {}) => {
    try {
      return await api.get('reports/inventory-turnover/', config);
    } catch (error) {
      console.error("Inventory turnover report offline");
      return { data: [] };
    }
  },

  getSalesReport: async (config = {}) => {
    try {
      return await api.get('reports/sales/', config);
    } catch (error) {
      console.error("Sales report offline, using local data");
      const localSales = await db.sales.toArray();
      const supermarketSales = await db.supermarketSales.toArray();
      // Combine or return local sales
      return { data: [...localSales, ...supermarketSales] };
    }
  },

  getDashboardStats: async (config = {}) => {
    try {
      return await api.get('reports/dashboard-stats/', config);
    } catch (error) {
      console.error("Failed to fetch online dashboard stats", error);

      // Fallback: calculate basic stats from local DB
      const sales = await db.sales.toArray();
      const drugs = await db.drugs.toArray();
      const scripts = await db.prescriptions.toArray();
      const customers = await db.customers.toArray();

      const totalRevenue = sales.reduce((acc, s) => acc + parseFloat(s.total_amount || 0), 0);
      const lowStockCount = drugs.filter(d => (d.stock || 0) <= (d.reorder_level || 0)).length;

      return {
        data: {
          total_revenue: totalRevenue,
          total_transactions: sales.length,
          low_stock_count: lowStockCount,
          pending_prescriptions: scripts.filter(p => p.status === 'Pending').length,
          customer_count: customers.length
        }
      };
    }
  },
};

export default reportService;
