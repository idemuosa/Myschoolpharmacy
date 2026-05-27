import api from './api';
import { db } from './db';

const staffService = {
  getStaff: async (config = {}) => {
    try {
      const response = await api.get('staff/', config);
      const staff = response.data.results || response.data;
      if (Array.isArray(staff)) {
        await db.staff.bulkPut(staff);
      }
      return { data: staff };
    } catch (error) {
      console.error("Network failed, fetching staff from local DB", error);
      try {
        const localStaff = await db.staff.toArray();
        return { data: localStaff };
      } catch (dbError) {
        console.error("Local staff fetch failed:", dbError);
        throw dbError;
      }
    }
  },

  getStaffById: async (id) => {
    try {
      return await api.get(`staff/${id}/`);
    } catch (error) {
      console.error("Network failed, checking local DB", error);
      const staff = await db.staff.get(id);
      return { data: staff };
    }
  },

  updateStaff: async (id, staffData) => {
    try {
      const response = await api.put(`staff/${id}/`, staffData);
      await db.staff.put({ ...staffData, id });
      return response;
    } catch (error) {
      console.error("Online staff update failed", error);
      throw error;
    }
  },

  deleteStaff: async (id) => {
    try {
      await api.delete(`staff/${id}/`);
      await db.staff.delete(id);
    } catch (error) {
      console.error("Online delete failed", error);
      throw error;
    }
    return { status: 204 };
  },
};

export default staffService;
