import api from './api';
import { db, addToSyncQueue } from './db';

const prescriptionService = {
  getPrescriptions: async (config = {}) => {
    try {
      const response = await api.get('prescriptions/', config);
      const prescriptions = response.data.results || response.data;
      if (Array.isArray(prescriptions)) {
        await db.prescriptions.bulkPut(prescriptions);
      }
      return { data: prescriptions };
    } catch (error) {
      console.error("Network failed, fetching prescriptions from local DB", error);
      try {
        const localPrescriptions = await db.prescriptions.toArray();
        return { data: localPrescriptions };
      } catch (dbError) {
        throw dbError;
      }
    }
  },

  getPrescription: async (id) => {
    try {
      return await api.get(`prescriptions/${id}/`);
    } catch (error) {
      console.error("Network failed", error);
      const prescription = await db.prescriptions.get(id);
      return { data: prescription };
    }
  },

  createPrescription: async (prescriptionData) => {
    try {
      const response = await api.post('prescriptions/', prescriptionData);
      await db.prescriptions.add(response.data);
      return response;
    } catch (error) {
      console.error("Online prescription creation failed, fallback to offline", error);
      const id = await db.prescriptions.add(prescriptionData);
      const offlinePrescription = { ...prescriptionData, id, created_at: new Date().toISOString() };
      await addToSyncQueue('CREATE', 'prescriptions', offlinePrescription);
      return { data: offlinePrescription, status: 201 };
    }
  },

  updatePrescription: async (id, prescriptionData) => {
    try {
      const response = await api.patch(`prescriptions/${id}/`, prescriptionData);
      await db.prescriptions.put({ ...prescriptionData, id });
      return response;
    } catch (error) {
      console.error("Online prescription update failed", error);
      await db.prescriptions.put({ ...prescriptionData, id });
      await addToSyncQueue('UPDATE', 'prescriptions', { ...prescriptionData, id });
      return { data: { ...prescriptionData, id }, status: 200 };
    }
  },

  deletePrescription: async (id) => {
    try {
      await api.delete(`prescriptions/${id}/`);
      await db.prescriptions.delete(id);
    } catch (error) {
      console.error("Offline delete", error);
      await addToSyncQueue('DELETE', 'prescriptions', { id });
      await db.prescriptions.delete(id);
    }
    return { status: 204 };
  },
};

export default prescriptionService;
