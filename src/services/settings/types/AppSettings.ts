/**
 * Global application settings interface
 */
export interface AppSettings {
  /**
   * Enable monorepo mode globally
   * When false, monorepo UI controls are hidden
   * When true, monorepo UI controls are shown
   */
  monorepoModeEnabled: boolean;
}

/**
 * Default application settings
 */
export const defaultAppSettings: AppSettings = {
  monorepoModeEnabled: false
};

/**
 * Type for partial settings updates
 */
export type UpdateAppSettings = Partial<AppSettings>;