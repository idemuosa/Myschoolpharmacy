import api from './api';

const supermarketSaleService = {
    getSales: () => api.get('supermarket-sales/'),
    getDashboardStats: () => api.get('supermarket-sales/dashboard-stats/'),
    processSale: (saleData) => api.post('supermarket-sales/', saleData)
};

export default supermarketSaleService;
