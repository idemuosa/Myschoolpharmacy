import api from './api';

const settingsService = {
  getSettings: () => api.get('settings/'),
  updateSettings: (id, data) => api.put(`settings/${id}/`, data),
  updateProfile: (data) => api.post('update-profile/', data),
  getUsers: () => api.get('users/'),
  addUser: (data) => api.post('users/', data),
  updateUser: (id, data) => api.put(`users/${id}/`, data),
  deleteUser: (id) => api.delete(`users/${id}/`),
};

export default settingsService;
