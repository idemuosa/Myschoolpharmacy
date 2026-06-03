import api from './api';

const activityService = {
  getLogs: (config = {}) => api.get('logs/', config),
};

export default activityService;
