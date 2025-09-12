import { app, BrowserWindow, ipcMain, shell, Menu } from 'electron'
import { fileURLToPath } from 'node:url'
import { URL } from 'node:url'
import { join } from 'node:path'
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'

function isAllowedUrl(target: string): boolean {
  try {
    const u = new URL(target)
    return u.protocol === 'https:' && (
      u.hostname === 'github.com' || 
      u.hostname === 'docs.anthropic.com' ||
      u.hostname.endsWith('.github.io')
    )
  } catch {
    return false
  }
}

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: fileURLToPath(new URL('../preload/preload.mjs', import.meta.url)),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: !process.env.ELECTRON_RENDERER_URL
    }
  })

  win.on('ready-to-show', () => win.show())

  // Secure navigation policy
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isAllowedUrl(url)) {
      setImmediate(() => shell.openExternal(url))
    }
    return { action: 'deny' }
  })

  win.webContents.on('will-navigate', (e, url) => {
    if (!isAllowedUrl(url)) e.preventDefault()
  })

  // Basic IPC example
  ipcMain.handle('ping', () => {
    return 'pong'
  })

  ipcMain.handle('get-app-version', () => {
    return app.getVersion()
  })

  // Storage IPC handlers
  const getStoragePath = () => {
    const userDataPath = app.getPath('userData')
    return join(userDataPath, 'context-builder')
  }

  ipcMain.handle('storage:read', async (_, filename: string) => {
    try {
      // Validate filename to prevent directory traversal
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        throw new Error('Invalid filename')
      }
      
      const storagePath = getStoragePath()
      const filePath = join(storagePath, filename)
      
      // Ensure file is within allowed directory
      if (!filePath.startsWith(storagePath)) {
        throw new Error('Access denied')
      }
      
      const data = await readFile(filePath, 'utf-8')
      return { success: true, data }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  })

  ipcMain.handle('storage:write', async (_, filename: string, data: string) => {
    try {
      // Validate filename to prevent directory traversal
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        throw new Error('Invalid filename')
      }
      
      const storagePath = getStoragePath()
      
      // Create directory if it doesn't exist
      if (!existsSync(storagePath)) {
        await mkdir(storagePath, { recursive: true })
      }
      
      const filePath = join(storagePath, filename)
      
      // Ensure file is within allowed directory
      if (!filePath.startsWith(storagePath)) {
        throw new Error('Access denied')
      }
      
      await writeFile(filePath, data, 'utf-8')
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  })

  ipcMain.handle('storage:backup', async (_, filename: string) => {
    try {
      // Validate filename to prevent directory traversal
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        throw new Error('Invalid filename')
      }
      
      const storagePath = getStoragePath()
      const filePath = join(storagePath, filename)
      const backupPath = join(storagePath, `${filename}.backup`)
      
      // Ensure paths are within allowed directory
      if (!filePath.startsWith(storagePath) || !backupPath.startsWith(storagePath)) {
        throw new Error('Access denied')
      }
      
      if (existsSync(filePath)) {
        await copyFile(filePath, backupPath)
      }
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    win.loadFile(fileURLToPath(new URL('../../index.html', import.meta.url)))
  }
}

app.whenReady().then(() => {
  process.env.ELECTRON_ENABLE_SECURITY_WARNINGS = 'true'
  
  // Create minimal menu example (hidden by default with autoHideMenuBar: true)
  // Delete this entire menu section if you don't want a native menu
  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        { label: 'New', accelerator: 'CmdOrCtrl+N', click: () => console.log('New file') },
        { label: 'Open', accelerator: 'CmdOrCtrl+O', click: () => console.log('Open file') },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'CmdOrCtrl+Q', role: 'quit' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Toggle Developer Tools', accelerator: 'F12', role: 'toggleDevTools' },
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { type: 'separator' },
        { label: 'Toggle Menu Bar', accelerator: 'Alt', click: (_, win) => win?.setMenuBarVisibility(!win.isMenuBarVisible()) }
      ]
    }
  ])
  
  Menu.setApplicationMenu(menu)
  // End of menu section - delete everything above this line to remove the menu
  createWindow()
  
  // Basic CSP in production
  if (!process.env.ELECTRON_RENDERER_URL) {
    const { session } = require('electron') as typeof import('electron')
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      const csp = "default-src 'self' 'unsafe-inline'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self';"
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [csp]
        }
      })
    })
  }
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})