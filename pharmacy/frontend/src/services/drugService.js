import api from './api';
import { db, addToSyncQueue } from './db';

const drugService = {
  getDrugs: async (config = {}) => {
    try {
      const response = await api.get('drugs/', config);
      const drugs = response.data.results || response.data;

      if (Array.isArray(drugs)) {
        // Only update local cache if we got actual data
        // Use bulkPut to avoid errors on duplicate IDs
        await db.drugs.bulkPut(drugs);
      }
      return { data: drugs };
    } catch (error) {
      console.error("Network request failed, falling back to local DB:", error);
      try {
        const localDrugs = await db.drugs.toArray();
        return { data: localDrugs };
      } catch (dbError) {
        console.error("Local DB fetch failed:", dbError);
        throw dbError; // Bubble up to show UI error
      }
    }
  },

  getDrug: async (id) => {
    try {
      return await api.get(`drugs/${id}/`);
    } catch (error) {
      console.error("Network failed, checking local DB", error);
      const drug = await db.drugs.get(id);
      return { data: drug };
    }
  },

  addDrug: async (drugData) => {
    try {
      const response = await api.post('drugs/', drugData);
      await db.drugs.add(response.data);
      return response;
    } catch (error) {
      console.error("Online drug addition failed, saving locally", error);
      const id = await db.drugs.add(drugData);
      await addToSyncQueue('CREATE', 'drugs', { ...drugData, id });
      return { data: { ...drugData, id }, status: 201 };
    }
  },

  updateDrug: async (id, drugData) => {
    try {
      const response = await api.put(`drugs/${id}/`, drugData);
      await db.drugs.put({ ...drugData, id });
      return response;
    } catch (error) {
      console.error("Online drug update failed, saving locally", error);
      await db.drugs.put({ ...drugData, id });
      await addToSyncQueue('UPDATE', 'drugs', { ...drugData, id });
      return { data: { ...drugData, id }, status: 200 };
    }
  },

  deleteDrug: async (id) => {
    try {
      await api.delete(`drugs/${id}/`);
      await db.drugs.delete(id);
    } catch (error) {
      console.error("Online delete failed, queueing", error);
      await addToSyncQueue('DELETE', 'drugs', { id });
      await db.drugs.delete(id);
    }
    return { status: 204 };
  },
};

export default drugService;
