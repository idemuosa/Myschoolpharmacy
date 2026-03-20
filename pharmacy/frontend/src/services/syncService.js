import api from './api';
import { db } from './db';

const syncService = {
  sync: async () => {
    if (!navigator.onLine) return;

    const queue = await db.syncQueue.toArray();
    for (const item of queue) {
      try {
        if (item.action === 'CREATE') {
          await api.post(`${item.table}/`, item.data);
        } else if (item.action === 'UPDATE') {
          await api.put(`${item.table}/${item.data.id}/`, item.data);
        }
        await db.syncQueue.delete(item.id);
      } catch (error) {
        console.error('Sync failed for item:', item, error);
        // If it's a 4xx error, maybe remove it from queue or mark as failed
        if (error.response && error.response.status < 500) {
           // await db.syncQueue.delete(item.id);
        }
        break; // Stop syncing if we hit a server error
      }
    }
  }
};

export default syncService;
