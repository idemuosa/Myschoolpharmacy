import api from './api';

const reportService = {
  getInventoryTurnover: () => api.get('reports/inventory-turnover/'),
  getSalesReport: () => api.get('reports/sales/'),
  getDashboardStats: () => api.get('reports/dashboard-stats/'),
};

export default reportService;
