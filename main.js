const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('run-script', (event, args) => {
  const { keyword, minYear, numRows } = args;
  const scraperPath = path.join(__dirname, 'scholarScraperWithCSV.js');

  const scraperProcess = require('child_process').fork(scraperPath, [keyword, minYear, numRows]);

  scraperProcess.on('exit', (code, signal) => {
    if (code === 0) {
      // The scholarScraperWithCSV.js script completed successfully
      // You can do something here if needed
    } else {
      console.error(`scholarScraperWithCSV.js exited with code ${code}`);
    }
  });
});