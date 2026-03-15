import api from './api';

const reportService = {
  getInventoryTurnover: (config = {}) => api.get('reports/inventory-turnover/', config),
  getSalesReport: (config = {}) => api.get('reports/sales/', config),
  getDashboardStats: (config = {}) => api.get('reports/dashboard-stats/', config),
};

export default reportService;
