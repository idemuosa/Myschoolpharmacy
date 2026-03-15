import api from './api';

const posService = {
  getSales: () => api.get('sales/'),
  createSale: (saleData) => api.post('sales/', saleData),
  createReturn: (returnData) => api.post('returns/', returnData),
};

export default posService;
