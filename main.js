const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;

function createWindow() {
    const win = new BrowserWindow({
        width: 1200, height: 800,
        webPreferences: { nodeIntegration: true, contextIsolation: false },
        autoHideMenuBar: true, // Ocultar barra de menú
        icon: path.join(__dirname, isDev ? 'public' : 'dist', 'icon.ico')
    });

    if (isDev) {
        win.loadURL('http://localhost:5173');
    } else {
        win.loadFile(path.join(__dirname, 'dist', 'index.html'));
    }
}

app.whenReady().then(createWindow);
