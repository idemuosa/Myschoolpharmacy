import api from './api';
import { db, addToSyncQueue } from './db';

const customerService = {
  getCustomers: async (config = {}) => {
    try {
      const response = await api.get('customers/', config);
      const customers = response.data.results || response.data;
      if (Array.isArray(customers)) {
        await db.customers.bulkPut(customers);
      }
      return { data: customers };
    } catch (error) {
      console.error("Network failed, fetching customers from local DB", error);
      try {
        const localCustomers = await db.customers.toArray();
        return { data: localCustomers };
      } catch (dbError) {
        throw dbError;
      }
    }
  },

  getCustomer: async (id) => {
    try {
      return await api.get(`customers/${id}/`);
    } catch (error) {
      console.error("Network failed", error);
      const customer = await db.customers.get(id);
      return { data: customer };
    }
  },

  createCustomer: async (customerData) => {
    try {
      const response = await api.post('customers/', customerData);
      await db.customers.add(response.data);
      return response;
    } catch (error) {
      console.error("Online customer creation failed, fallback to offline", error);
      const id = await db.customers.add(customerData);
      const offlineCustomer = { ...customerData, id };
      await addToSyncQueue('CREATE', 'customers', offlineCustomer);
      return { data: offlineCustomer, status: 201 };
    }
  },

  updateCustomer: async (id, customerData) => {
    try {
      const response = await api.patch(`customers/${id}/`, customerData);
      await db.customers.put({ ...customerData, id });
      return response;
    } catch (error) {
      console.error("Online customer update failed", error);
      await db.customers.put({ ...customerData, id });
      await addToSyncQueue('UPDATE', 'customers', { ...customerData, id });
      return { data: { ...customerData, id }, status: 200 };
    }
  },

  deleteCustomer: async (id) => {
    try {
      await api.delete(`customers/${id}/`);
      await db.customers.delete(id);
    } catch (error) {
      console.error("Offline customer delete", error);
      await addToSyncQueue('DELETE', 'customers', { id });
      await db.customers.delete(id);
    }
    return { status: 204 };
  },
};

export default customerService;
