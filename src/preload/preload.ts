import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  ping: () => ipcRenderer.invoke('ping'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  storage: {
    read: (filename: string) => ipcRenderer.invoke('storage:read', filename),
    write: (filename: string, data: string) => ipcRenderer.invoke('storage:write', filename, data),
    backup: (filename: string) => ipcRenderer.invoke('storage:backup', filename)
  }
})