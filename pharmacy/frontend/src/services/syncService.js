import api from './api';
import { db } from './db';

const syncService = {
  getPendingSyncCount: async () => {
    try {
      return await db.syncQueue.count();
    } catch {
      return 0;
    }
  },

  sync: async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      console.log('App is offline, skipping sync.');
      return { success: false, reason: 'offline' };
    }

    const queue = await db.syncQueue.toArray();
    if (queue.length === 0) {
      console.log('Sync queue is empty.');
      return { success: true, syncedCount: 0 };
    }

    console.log(`Starting sync for ${queue.length} items...`);
    let syncedCount = 0;
    
    for (const item of queue) {
      try {
        let response;
        const endpoint = item.table.endsWith('/') ? item.table : `${item.table}/`;

        if (item.action === 'CREATE') {
          response = await api.post(endpoint, item.data);
        } else if (item.action === 'UPDATE') {
          const itemId = item.data?.id || item.id;
          response = await api.put(`${endpoint}${itemId}/`, item.data);
        } else if (item.action === 'PATCH') {
          const itemId = item.data?.id || item.id;
          response = await api.patch(`${endpoint}${itemId}/`, item.data);
        } else if (item.action === 'DELETE') {
          const itemId = item.data?.id || item.id;
          response = await api.delete(`${endpoint}${itemId}/`);
        }
        
        if (response && (response.status >= 200 && response.status < 300)) {
          await db.syncQueue.delete(item.id);
          syncedCount++;
          console.log(`Successfully synced ${item.table} item.`);
        }
      } catch (error) {
        console.error(`Sync failed for ${item.table} item:`, error.message);
        
        // If it's a 4xx error (except 429), skip it to avoid blocking the queue
        if (error.response && error.response.status >= 400 && error.response.status < 500 && error.response.status !== 429) {
           console.warn("Skipping item due to client error (4xx).");
           await db.syncQueue.delete(item.id);
        } else {
          // For server errors or network issues, stop and retry later
          break; 
        }
      }
    }
    console.log(`Sync process completed/paused. Synced: ${syncedCount}`);
    return { success: true, syncedCount };
  }
};

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Network status online: initiating background sync...');
    syncService.sync();
  });
}

export default syncService;
