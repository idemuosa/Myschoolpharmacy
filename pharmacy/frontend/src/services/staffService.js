import api from './api';

const staffService = {
  getStaff: (config = {}) => api.get('staff/', config),
};

export default staffService;
