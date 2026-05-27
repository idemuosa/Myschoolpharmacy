import api from './api';
import { db, addToSyncQueue } from './db';

const supermarketSaleService = {
    getSales: async (config = {}) => {
        try {
            const response = await api.get('supermarket-sales/', config);
            const sales = response.data.results || response.data;
            if (Array.isArray(sales)) {
                await db.supermarketSales.bulkPut(sales);
            }
            return { data: sales };
        } catch (error) {
            console.error("Network failed, fetching supermarket sales from local DB", error);
            try {
                const localSales = await db.supermarketSales.toArray();
                return { data: localSales };
            } catch (dbError) {
                throw dbError;
            }
        }
    },

    getDashboardStats: async () => {
        try {
            return await api.get('supermarket-sales/dashboard-stats/');
        } catch (error) {
            console.error("Dashboard stats offline, calculating from local data", error);
            try {
                const localSales = await db.supermarketSales.toArray();
                const revenue = localSales.reduce((acc, s) => acc + parseFloat(s.total_amount || 0), 0);
                return {
                    data: {
                        total_revenue: revenue,
                        total_transactions: localSales.length,
                        low_stock_count: 0
                    }
                };
            } catch (dbError) {
                return { data: { total_revenue: 0, total_transactions: 0, low_stock_count: 0 } };
            }
        }
    },

    processSale: async (saleData) => {
        try {
            const response = await api.post('supermarket-sales/', saleData);
            await db.supermarketSales.add(response.data);
            return response;
        } catch (error) {
            console.error("Online supermarket sale failed, switching to offline queue", error);
            const offlineSale = { ...saleData, created_at: new Date().toISOString() };
            const id = await db.supermarketSales.add(offlineSale);
            await addToSyncQueue('CREATE', 'supermarketSales', { ...offlineSale, id });
            return { data: { ...offlineSale, id }, status: 201 };
        }
    }
};

export default supermarketSaleService;
