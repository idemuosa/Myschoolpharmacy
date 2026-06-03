import { db } from './db';

const backupService = {
  /**
   * Exports the entire local IndexedDB to a JSON file
   */
  exportLocalData: async () => {
    try {
      const backup = {
        version: 1,
        timestamp: new Date().toISOString(),
        tables: {}
      };

      const tableNames = db.tables.map(t => t.name);

      for (const name of tableNames) {
        backup.tables[name] = await db.table(name).toArray();
      }

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `PHARMACY_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return true;
    } catch (error) {
      console.error("Backup failed", error);
      return false;
    }
  },

  /**
   * Restores data from a backup JSON file
   * @param {File} file
   */
  importLocalData: async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const backup = JSON.parse(e.target.result);
          if (!backup.tables) throw new Error("Invalid backup format");

          // Warning: This clears existing local data
          for (const name in backup.tables) {
            await db.table(name).clear();
            await db.table(name).bulkAdd(backup.tables[name]);
          }
          resolve(true);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  }
};

export default backupService;
