import api from './api';
import { db } from './db';

const staffService = {
  getStaff: async (config = {}) => {
    try {
      if (navigator.onLine) {
        const response = await api.get('staff/', config);
        const staffList = response.data?.results || response.data;
        if (Array.isArray(staffList) && staffList.length > 0) {
          await db.staff.bulkPut(staffList);
        }
        return { data: staffList };
      }
    } catch (error) {
      console.error("Network failed, fetching staff from local DB", error);
    }
    const localStaff = await db.staff.toArray();
    return { data: localStaff };
  },
};

export default staffService;
