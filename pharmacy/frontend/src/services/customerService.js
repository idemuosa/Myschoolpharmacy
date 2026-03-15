import api from './api';

const customerService = {
  getCustomers: () => api.get('customers/'),
  getCustomer: (id) => api.get(`customers/${id}/`),
  createCustomer: (customerData) => api.post('customers/', customerData),
  updateCustomer: (id, customerData) => api.patch(`customers/${id}/`, customerData),
  deleteCustomer: (id) => api.delete(`customers/${id}/`),
};

export default customerService;
