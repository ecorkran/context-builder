import { useState, useEffect, useCallback } from 'react';
import { appSettingsService } from '../services/settings/AppSettingsService';
import { AppSettings, UpdateAppSettings } from '../services/settings/types/AppSettings';

/**
 * React hook for managing global app settings
 */
export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(
    appSettingsService.getSettings()
  );

  useEffect(() => {
    // Subscribe to settings changes
    const unsubscribe = appSettingsService.subscribe(setSettings);

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const updateSettings = useCallback((updates: UpdateAppSettings) => {
    appSettingsService.updateSettings(updates);
  }, []);

  const resetSettings = useCallback(() => {
    appSettingsService.resetSettings();
  }, []);

  const getSetting = useCallback(<K extends keyof AppSettings>(key: K) => {
    return appSettingsService.getSetting(key);
  }, []);

  const setSetting = useCallback(<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    appSettingsService.setSetting(key, value);
  }, []);

  return {
    settings,
    updateSettings,
    resetSettings,
    getSetting,
    setSetting,
    isMonorepoModeEnabled: settings.monorepoModeEnabled
  };
}