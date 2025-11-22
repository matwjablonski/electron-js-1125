// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, Menu, Tray, globalShortcut, nativeImage, dialog, Notification } = require('electron')
const path = require('node:path')
const fs = require('node:fs');

let mainWindow = null;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 300,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

const isMac = process.platform === 'darwin';

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  const isMac = process.platform === 'darwin';
  globalShortcut.register(isMac ? 'CommandOrControl+Option+I' : 'CommandOrControl+Shift+I', () => {
    mainWindow.webContents.toggleDevTools();
  });
  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        { role: 'forceReload' },
        { role: 'quit' }
      ]
    }
  ]);

  Menu.setApplicationMenu(menu);

  const tray = new Tray(path.join(__dirname, 'tip.png'));

  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Quit', role: 'quit' }
  ]));

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('send-message', (event, message) => {
  console.log('Received message from renderer 2:', message);
});

ipcMain.handle('get-app-info', async () => {
  return {
    name: app.getName(),
    version: app.getVersion(),
    chromeVersion: process.versions.chrome,
    nodeVersion: process.versions.node,
    electronVersion: process.versions.electron,
  }
});

ipcMain.handle('open-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Pliki tekstowe', extensions: ['txt', 'md'] },
    ],
  })

  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return fileContent;
  }

  return null;
})

ipcMain.handle('save-file', async (event, content) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Save your file',
    defaultPath: 'untitled.txt',
  });

  if (!result.canceled && result.filePath) {
    fs.writeFileSync(result.filePath, content, 'utf-8');

    new Notification({
      title: 'File Saved',
      body: `Your file has been saved to ${result.filePath}`,
    }).show();

    return true;
  }

  return false;
});