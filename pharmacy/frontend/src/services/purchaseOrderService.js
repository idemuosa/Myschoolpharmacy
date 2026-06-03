import api from './api';

const purchaseOrderService = {
    getOrders: async (config = {}) => {
        return await api.get('purchase-orders/', config);
    },
    getOrder: async (id) => {
        return await api.get(`purchase-orders/${id}/`);
    },
    createOrder: async (data) => {
        return await api.post('purchase-orders/', data);
    },
    receiveOrder: async (id) => {
        return await api.post(`purchase-orders/${id}/receive/`);
    }
};

export default purchaseOrderService;
