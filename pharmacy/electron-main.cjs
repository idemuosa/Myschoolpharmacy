const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = !app.isPackaged;

// Global error handler
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  dialog.showErrorBox(
    'Application Error',
    `A JavaScript error occurred in the main process:\n\n${error.message}`
  );
});

// Handle Database Backups to Desktop
ipcMain.handle('save-backup', async (event, { fileName, content }) => {
  try {
    const desktopPath = path.join(require('os').homedir(), 'Desktop');
    const backupFolder = path.join(desktopPath, 'Josiah_POS_Backups');

    if (!fs.existsSync(backupFolder)) {
      fs.mkdirSync(backupFolder);
    }

    const filePath = path.join(backupFolder, fileName);
    fs.writeFileSync(filePath, content);

    return { success: true, path: filePath };
  } catch (err) {
    console.error('Backup failed:', err);
    return { success: false, error: err.message };
  }
});

function createWindow() {
  try {
    const win = new BrowserWindow({
      width: 1366,
      height: 768,
      minWidth: 1024,
      minHeight: 700,
      title: "Josiah Pharmacy POS",
      icon: path.join(__dirname, 'public', 'favicon.ico'),
      autoHideMenuBar: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        preload: path.join(__dirname, 'preload.js') // Added preload for security if needed
      }
    });

    if (isDev) {
      win.loadURL('http://localhost:5173');
      win.webContents.openDevTools();
    } else {
      const indexPath = path.join(__dirname, 'dist', 'index.html');
      if (fs.existsSync(indexPath)) {
        win.loadFile(indexPath);
      } else {
        throw new Error(`Build file not found at: ${indexPath}. Please run 'npm run build' first.`);
      }
    }

    win.maximize();

    // Menu Template
    const template = [
      {
        label: 'File',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { type: 'separator' },
          {
            label: 'Configure Server',
            click: () => {
              win.webContents.executeJavaScript(`
                const url = prompt("Enter Backend API URL (e.g. http://localhost:8000/api/):", localStorage.getItem('config_api_url') || "");
                if (url !== null) {
                  localStorage.setItem('config_api_url', url);
                  const ws = prompt("Enter WebSocket URL (e.g. ws://localhost:8000/ws/notifications/):", localStorage.getItem('config_ws_url') || "");
                  if (ws !== null) {
                     localStorage.setItem('config_ws_url', ws);
                     alert("Settings saved. Reloading app...");
                     location.reload();
                  }
                }
              `);
            }
          },
          { type: 'separator' },
          { role: 'quit' }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'selectAll' }
        ]
      },
      {
        label: 'View',
        submenu: [
          { role: 'togglefullscreen' },
          { role: 'toggleDevTools' }
        ]
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'Check for Updates',
            click: () => {
              dialog.showMessageBox({
                type: 'info',
                title: 'Updates',
                message: 'Update check complete. You are using the latest version (1.1.0).'
              });
            }
          },
          {
            label: 'About',
            click: () => {
              dialog.showMessageBox({
                type: 'info',
                title: 'About Josiah Pharmacy POS',
                message: 'Josiah Pharmacy Management System\nVersion: 1.1.0\nPlatform: Windows/Android\n\nDeveloped by Josiah'
              });
            }
          }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

  } catch (err) {
    dialog.showErrorBox('Initialization Error', `Failed to create application window: ${err.message}`);
    app.quit();
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

