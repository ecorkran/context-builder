import { AppSettings, defaultAppSettings, UpdateAppSettings } from './types/AppSettings';

/**
 * Service for managing global application settings
 * Uses localStorage for persistence across sessions
 */
export class AppSettingsService {
  private static readonly STORAGE_KEY = 'context-builder-app-settings';
  private settings: AppSettings;
  private listeners: Array<(settings: AppSettings) => void> = [];

  constructor() {
    this.settings = this.loadSettings();
  }

  /**
   * Load settings from localStorage or return defaults
   */
  private loadSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(AppSettingsService.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AppSettings>;
        // Merge with defaults to ensure all required fields are present
        return {
          ...defaultAppSettings,
          ...parsed
        };
      }
    } catch (error) {
      console.warn('Failed to load app settings from localStorage:', error);
    }
    return { ...defaultAppSettings };
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    try {
      localStorage.setItem(
        AppSettingsService.STORAGE_KEY,
        JSON.stringify(this.settings)
      );
    } catch (error) {
      console.error('Failed to save app settings to localStorage:', error);
    }
  }

  /**
   * Get current settings
   */
  getSettings(): AppSettings {
    return { ...this.settings };
  }

  /**
   * Update settings (partial update supported)
   */
  updateSettings(updates: UpdateAppSettings): void {
    const previousSettings = { ...this.settings };
    this.settings = {
      ...this.settings,
      ...updates
    };

    this.saveSettings();

    // Notify listeners of changes
    this.notifyListeners();
  }

  /**
   * Get specific setting value
   */
  getSetting<K extends keyof AppSettings>(key: K): AppSettings[K] {
    return this.settings[key];
  }

  /**
   * Set specific setting value
   */
  setSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
    this.updateSettings({ [key]: value } as UpdateAppSettings);
  }

  /**
   * Reset all settings to defaults
   */
  resetSettings(): void {
    this.settings = { ...defaultAppSettings };
    this.saveSettings();
    this.notifyListeners();
  }

  /**
   * Subscribe to settings changes
   */
  subscribe(listener: (settings: AppSettings) => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of settings changes
   */
  private notifyListeners(): void {
    const settingsCopy = { ...this.settings };
    this.listeners.forEach(listener => {
      try {
        listener(settingsCopy);
      } catch (error) {
        console.error('Error in settings listener:', error);
      }
    });
  }

  /**
   * Check if monorepo mode is enabled
   */
  isMonorepoModeEnabled(): boolean {
    return this.settings.monorepoModeEnabled;
  }
}

// Export singleton instance
export const appSettingsService = new AppSettingsService();