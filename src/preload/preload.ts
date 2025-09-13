import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  ping: () => ipcRenderer.invoke('ping'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  storage: {
    read: (filename: string) => ipcRenderer.invoke('storage:read', filename),
    write: (filename: string, data: string) => ipcRenderer.invoke('storage:write', filename, data),
    backup: (filename: string) => ipcRenderer.invoke('storage:backup', filename)
  },
  statements: {
    load: (filename?: string) => ipcRenderer.invoke('statements:load', filename),
    save: (filename: string, statements: Record<string, any>) => ipcRenderer.invoke('statements:save', filename, statements),
    getStatement: (filename: string, key: string) => ipcRenderer.invoke('statements:get', filename, key),
    updateStatement: (filename: string, key: string, content: string) => ipcRenderer.invoke('statements:update', filename, key, content)
  },
  systemPrompts: {
    parse: (filename?: string) => ipcRenderer.invoke('systemPrompts:parse', filename),
    getContextInit: (filename?: string) => ipcRenderer.invoke('systemPrompts:getContextInit', filename),
    getToolUse: (filename?: string) => ipcRenderer.invoke('systemPrompts:getToolUse', filename),
    getForInstruction: (filename: string, instruction: string) => ipcRenderer.invoke('systemPrompts:getForInstruction', filename, instruction)
  }
})