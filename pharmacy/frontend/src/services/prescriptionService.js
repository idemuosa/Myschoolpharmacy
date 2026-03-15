import api from './api';

const prescriptionService = {
  getPrescriptions: () => api.get('prescriptions/'),
  getPrescription: (id) => api.get(`prescriptions/${id}/`),
  createPrescription: (prescriptionData) => api.post('prescriptions/', prescriptionData),
  updatePrescription: (id, prescriptionData) => api.patch(`prescriptions/${id}/`, prescriptionData),
  deletePrescription: (id) => api.delete(`prescriptions/${id}/`),
};

export default prescriptionService;
