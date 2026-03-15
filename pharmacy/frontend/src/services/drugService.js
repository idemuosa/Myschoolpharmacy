import api from './api';

const drugService = {
  getDrugs: () => api.get('drugs/'),
  addDrug: (drugData) => api.post('drugs/', drugData),
  updateDrug: (id, drugData) => api.put(`drugs/${id}/`, drugData),
  deleteDrug: (id) => api.delete(`drugs/${id}/`),
};

export default drugService;
