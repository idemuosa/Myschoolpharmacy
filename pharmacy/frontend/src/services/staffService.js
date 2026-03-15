import api from './api';

const staffService = {
  getStaff: () => api.get('staff/'),
};

export default staffService;
