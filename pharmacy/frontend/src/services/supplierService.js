import api from './api';

const supplierService = {
    getSuppliers: async (config = {}) => {
        return await api.get('suppliers/', config);
    },
    getSupplier: async (id) => {
        return await api.get(`suppliers/${id}/`);
    },
    addSupplier: async (data) => {
        return await api.post('suppliers/', data);
    },
    updateSupplier: async (id, data) => {
        return await api.put(`suppliers/${id}/`, data);
    },
    deleteSupplier: async (id) => {
        return await api.delete(`suppliers/${id}/`);
    }
};

export default supplierService;
