import api from './api';

const activityService = {
  getLogs: (params = {}) => api.get('activity-logs/', { params }),
};

export default activityService;
