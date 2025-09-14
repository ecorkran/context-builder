import { app, BrowserWindow, ipcMain, shell, Menu } from 'electron'
import { fileURLToPath } from 'node:url'
import { URL } from 'node:url'
import { join } from 'node:path'
import { readFile, writeFile, mkdir, copyFile, rename, unlink } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { setupContextServiceHandlers } from './ipc/contextServices'

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
      const backupPath = join(storagePath, `${filename}.backup`)
      
      // Ensure file is within allowed directory
      if (!filePath.startsWith(storagePath)) {
        throw new Error('Access denied')
      }
      
      try {
        // Try to read main file first
        const data = await readFile(filePath, 'utf-8')
        
        // Validate JSON structure
        try {
          JSON.parse(data)
          return { success: true, data }
        } catch (parseError) {
          // Main file is corrupted, try backup
          console.warn(`Main file corrupted: ${filename}, attempting backup recovery`)
          throw new Error('Main file corrupted')
        }
      } catch (mainFileError) {
        // Main file doesn't exist or is corrupted, try backup
        try {
          const backupData = await readFile(backupPath, 'utf-8')
          
          // Validate backup JSON structure
          JSON.parse(backupData)
          
          console.log(`Recovered data from backup: ${filename}`)
          
          // Try to restore main file from backup
          try {
            await copyFile(backupPath, filePath)
            console.log(`Restored main file from backup: ${filename}`)
          } catch (restoreError) {
            console.warn(`Could not restore main file, but backup is available: ${restoreError}`)
          }
          
          return { 
            success: true, 
            data: backupData,
            recovered: true,
            message: 'Data recovered from backup file'
          }
        } catch (backupError) {
          // Neither main nor backup file is available/valid
          if (mainFileError instanceof Error && mainFileError.message.includes('ENOENT')) {
            return { 
              success: false, 
              error: 'File not found',
              notFound: true 
            }
          }
          
          return { 
            success: false, 
            error: 'File corrupted and no valid backup available' 
          }
        }
      }
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
      const tempPath = join(storagePath, `${filename}.tmp`)
      const backupPath = join(storagePath, `${filename}.backup`)
      
      // Ensure paths are within allowed directory
      if (!filePath.startsWith(storagePath) || !tempPath.startsWith(storagePath)) {
        throw new Error('Access denied')
      }
      
      // Atomic write process:
      // 1. Create backup of existing file
      if (existsSync(filePath)) {
        await copyFile(filePath, backupPath)
      }
      
      // 2. Write to temporary file first
      await writeFile(tempPath, data, 'utf-8')
      
      // 3. Validate JSON structure
      try {
        JSON.parse(data)
      } catch (parseError) {
        // Clean up temp file and restore backup
        if (existsSync(tempPath)) {
          await unlink(tempPath)
        }
        throw new Error('Invalid JSON data')
      }
      
      // 4. Atomically rename temp file to main file
      await rename(tempPath, filePath)
      
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

  // Setup context service IPC handlers
  setupContextServiceHandlers()

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
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectAll' }
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