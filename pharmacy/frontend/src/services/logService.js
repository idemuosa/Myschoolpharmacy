import api from './api';

const logService = {
    getLogs: async (config = {}) => {
        return await api.get('logs/', config);
    }
};

export default logService;
