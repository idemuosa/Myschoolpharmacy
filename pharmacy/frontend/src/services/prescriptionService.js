import api from './api';
import { db, addToSyncQueue } from './db';

const prescriptionService = {
  getPrescriptions: async (config = {}) => {
    try {
      if (navigator.onLine) {
        const response = await api.get('prescriptions/', config);
        // Update local cache: Use bulkPut to merge instead of clear() + bulkAdd()
        const prescriptions = response.data.results || response.data;
        if (Array.isArray(prescriptions)) {
          await db.prescriptions.bulkPut(prescriptions);
        }
        return response;
      }
    } catch (error) {
      console.error("Network failed, fetching prescriptions from local DB", error);
    }
    const localPrescriptions = await db.prescriptions.toArray();
    return { data: localPrescriptions };
  },

  getPrescription: async (id) => {
    try {
      if (navigator.onLine) {
        return await api.get(`prescriptions/${id}/`);
      }
    } catch (error) {
      console.error("Network failed", error);
    }
    const prescription = await db.prescriptions.get(id);
    return { data: prescription };
  },

  createPrescription: async (prescriptionData) => {
    if (navigator.onLine) {
      const response = await api.post('prescriptions/', prescriptionData);
      await db.prescriptions.add(response.data);
      return response;
    } else {
      const id = await db.prescriptions.add(prescriptionData);
      const offlinePrescription = { ...prescriptionData, id };
      await addToSyncQueue('CREATE', 'prescriptions', offlinePrescription);
      return { data: offlinePrescription, status: 201 };
    }
  },

  updatePrescription: async (id, prescriptionData) => {
    if (navigator.onLine) {
      const response = await api.patch(`prescriptions/${id}/`, prescriptionData);
      await db.prescriptions.put({ ...prescriptionData, id });
      return response;
    } else {
      await db.prescriptions.put({ ...prescriptionData, id });
      await addToSyncQueue('UPDATE', 'prescriptions', { ...prescriptionData, id });
      return { data: { ...prescriptionData, id }, status: 200 };
    }
  },

  deletePrescription: async (id) => {
    if (navigator.onLine) {
      await api.delete(`prescriptions/${id}/`);
    } else {
      await addToSyncQueue('DELETE', 'prescriptions', { id });
    }
    await db.prescriptions.delete(id);
    return { status: 204 };
  },
};

export default prescriptionService;

