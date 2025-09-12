/**
 * Storage client for IPC communication with main process
 * Provides secure file system access through Electron IPC
 */

interface StorageResponse {
  success: boolean;
  data?: string;
  error?: string;
}

declare global {
  interface Window {
    electronAPI: {
      ping: () => Promise<string>;
      getAppVersion: () => Promise<string>;
      storage: {
        read: (filename: string) => Promise<StorageResponse>;
        write: (filename: string, data: string) => Promise<StorageResponse>;
        backup: (filename: string) => Promise<StorageResponse>;
      };
    };
  }
}

export class StorageClient {
  private isElectron: boolean;

  constructor() {
    this.isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined;
  }

  /**
   * Check if running in Electron environment
   */
  isAvailable(): boolean {
    return this.isElectron;
  }

  /**
   * Read file from app data directory
   */
  async readFile(filename: string): Promise<string> {
    if (!this.isElectron) {
      throw new Error('Storage client is only available in Electron environment');
    }

    try {
      const response = await window.electronAPI.storage.read(filename);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to read file');
      }
      
      return response.data || '';
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error reading file';
      throw new Error(`Failed to read file: ${message}`);
    }
  }

  /**
   * Write file to app data directory
   */
  async writeFile(filename: string, data: string): Promise<void> {
    if (!this.isElectron) {
      throw new Error('Storage client is only available in Electron environment');
    }

    try {
      const response = await window.electronAPI.storage.write(filename, data);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to write file');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error writing file';
      throw new Error(`Failed to write file: ${message}`);
    }
  }

  /**
   * Create backup of file
   */
  async createBackup(filename: string): Promise<void> {
    if (!this.isElectron) {
      throw new Error('Storage client is only available in Electron environment');
    }

    try {
      const response = await window.electronAPI.storage.backup(filename);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to create backup');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error creating backup';
      throw new Error(`Failed to create backup: ${message}`);
    }
  }
}

// Export singleton instance
export const storageClient = new StorageClient();