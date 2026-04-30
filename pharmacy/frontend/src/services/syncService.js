import api from './api';
import { db } from './db';

const syncService = {
  sync: async () => {
    if (!navigator.onLine) {
      console.log('App is offline, skipping sync.');
      return;
    }

    const queue = await db.syncQueue.toArray();
    if (queue.length === 0) {
      console.log('Sync queue is empty.');
      return;
    }

    console.log(`Starting sync for ${queue.length} items...`);
    
    for (const item of queue) {
      try {
        let response;
        if (item.action === 'CREATE') {
          response = await api.post(`${item.table}/`, item.data);
        } else if (item.action === 'UPDATE') {
          response = await api.put(`${item.table}/${item.data.id}/`, item.data);
        }
        
        if (response && (response.status === 200 || response.status === 201)) {
          await db.syncQueue.delete(item.id);
          console.log(`Successfully synced ${item.table} item.`);
        }
      } catch (error) {
        console.error(`Sync failed for ${item.table} item:`, error.message);
        
        // If it's a 4xx error (except 429), it might be invalid data, 
        // we might want to skip it to avoid blocking the queue.
        if (error.response && error.response.status >= 400 && error.response.status < 500 && error.response.status !== 429) {
           console.warn("Skipping item due to client error (4xx).");
           await db.syncQueue.delete(item.id);
        } else {
          // For server errors or network issues, stop and retry later
          break; 
        }
      }
    }
    console.log('Sync process completed/paused.');
  }
};

export default syncService;
