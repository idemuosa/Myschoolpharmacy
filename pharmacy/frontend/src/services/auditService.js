import api from './api';

const auditService = {
    getAudits: async (config = {}) => {
        return await api.get('inventory-audits/', config);
    },
    getAudit: async (id) => {
        return await api.get(`inventory-audits/${id}/`);
    },
    createAudit: async (data) => {
        return await api.post('inventory-audits/', data);
    },
    reconcile: async (id) => {
        return await api.post(`inventory-audits/${id}/reconcile/`);
    }
};

export default auditService;
