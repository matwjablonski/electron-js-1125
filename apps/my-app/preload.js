const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (message) => {
    return ipcRenderer.send('send-message', message)
  },
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  openFile: () => ipcRenderer.invoke('open-file'),
})
