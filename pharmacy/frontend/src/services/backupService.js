import { db } from './db';
import toast from 'react-hot-toast';

const backupService = {
  /**
   * Exports the entire local IndexedDB to a JSON format
   */
  getBackupPayload: async () => {
    const backup = {
      version: 1,
      timestamp: new Date().toISOString(),
      tables: {}
    };

    const tableNames = db.tables.map(t => t.name);
    for (const name of tableNames) {
      backup.tables[name] = await db.table(name).toArray();
    }
    return JSON.stringify(backup, null, 2);
  },

  /**
   * Manual Local Backup (Triggered by button)
   */
  exportLocalData: async () => {
    try {
      const content = await backupService.getBackupPayload();
      const fileName = `Josiah_POS_ManualBackup_${new Date().toISOString().split('T')[0]}.json`;

      if (window.electronAPI) {
        const result = await window.electronAPI.saveBackup({ fileName, content });
        if (result.success) return true;
        throw new Error(result.error);
      } else {
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return true;
      }
    } catch (error) {
      console.error("Manual backup failed", error);
      return false;
    }
  },

  /**
   * Restores data from a backup JSON file
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
            if (db.table(name)) {
                await db.table(name).clear();
                await db.table(name).bulkAdd(backup.tables[name]);
            }
          }
          resolve(true);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  },

  /**
   * Periodic background backup
   */
  performAutomaticBackup: async () => {
    try {
      const content = await backupService.getBackupPayload();
      const fileName = `Josiah_POS_AutoBackup_${new Date().toISOString().split('T')[0]}.json`;

      if (window.electronAPI) {
        await window.electronAPI.saveBackup({ fileName, content });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Automatic backup failed", error);
      return false;
    }
  },

  /**
   * Schedules a backup for a specific time (e.g., "17:00")
   */
  scheduleDailyBackup: (timeStr = "17:00") => {
    const checkAndRun = () => {
      const now = new Date();
      const currentStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      const lastBackupDate = localStorage.getItem('last_auto_backup_date');
      const today = now.toISOString().split('T')[0];

      if (currentStr === timeStr && lastBackupDate !== today) {
        backupService.performAutomaticBackup().then(success => {
          if (success) {
            localStorage.setItem('last_auto_backup_date', today);
            toast.success("Daily Automatic Backup Completed (Saved to Desktop)");
          }
        });
      }
    };

    setInterval(checkAndRun, 60000);
    checkAndRun();
  }
};

export default backupService;
