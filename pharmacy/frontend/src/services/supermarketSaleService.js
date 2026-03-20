import api from './api';

const supermarketSaleService = {
    getSales: (config = {}) => api.get('supermarket-sales/', config),
    getDashboardStats: () => api.get('supermarket-sales/dashboard-stats/'),
    processSale: (saleData) => api.post('supermarket-sales/', saleData)
};

export default supermarketSaleService;
