const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const isDev = !app.isPackaged;

// Global error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  if (!isDev) {
    dialog.showErrorBox('Application Error', `A critical error occurred: ${error.message}`);
  }
});

let backendProcess = null;
let nodeBackendProcess = null;

function startBackends() {
  try {
    // When packaged, __dirname is the resources/app folder
    // The backends should be relative to the executable path in production
    const projectRoot = isDev
      ? path.join(__dirname, '..')
      : path.join(process.resourcesPath, '..', '..'); // Adjust based on electron-builder output

    console.log('Project Root for backends:', projectRoot);

    // Django Backend Config
    const backendDir = path.join(projectRoot, 'backend');
    const pythonPath = path.join(backendDir, 'venv', 'Scripts', 'python.exe');
    const managePath = path.join(backendDir, 'manage.py');

    if (fs.existsSync(pythonPath) && fs.existsSync(managePath)) {
      console.log('Starting Django Backend...');
      backendProcess = spawn(pythonPath, [managePath, 'runserver', '8000', '--noreload'], {
        cwd: backendDir,
        env: { ...process.env, PYTHONUNBUFFERED: '1' },
        shell: true
      });

      backendProcess.stdout.on('data', (data) => console.log(`Django: ${data}`));
      backendProcess.stderr.on('data', (data) => console.error(`Django Error: ${data}`));
    } else {
      console.warn('Django backend files not found at:', backendDir);
    }

    // Node Backend Config
    const nodeBackendDir = path.join(projectRoot, 'node_backend');
    const nodeServerPath = path.join(nodeBackendDir, 'server.js');

    if (fs.existsSync(nodeServerPath)) {
      console.log('Starting Node WebSocket Server...');
      nodeBackendProcess = spawn('node', [nodeServerPath], {
        cwd: nodeBackendDir,
        shell: true
      });

      nodeBackendProcess.stdout.on('data', (data) => console.log(`Node: ${data}`));
      nodeBackendProcess.stderr.on('data', (data) => console.error(`Node Error: ${data}`));
    } else {
      console.warn('Node backend not found at:', nodeBackendDir);
    }
  } catch (err) {
    console.error('Error in startBackends:', err);
  }
}

function stopBackends() {
  if (process.platform === 'win32') {
    if (backendProcess && backendProcess.pid) {
      exec(`taskkill /pid ${backendProcess.pid} /f /t`);
    }
    if (nodeBackendProcess && nodeBackendProcess.pid) {
      exec(`taskkill /pid ${nodeBackendProcess.pid} /f /t`);
    }
    // Safety: kill any orphaned processes on the ports
    exec('taskkill /f /im python.exe /t');
    exec('taskkill /f /im node.exe /t');
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1366,
    height: 768,
    minWidth: 1024,
    minHeight: 700,
    title: "Josiah Pharmacy POS",
    icon: path.join(__dirname, 'public', 'favicon.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  if (isDev) {
    // In dev, we might need to wait for Vite to start
    win.loadURL('http://localhost:5173'); // Default Vite port
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  win.maximize();
}

app.whenReady().then(() => {
  startBackends();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  stopBackends();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('quit', () => {
  stopBackends();
});
