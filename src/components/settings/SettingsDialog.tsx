import React from 'react';
import { Modal } from '../../lib/ui-core/components/overlays/Modal';
import { Checkbox } from '../../lib/ui-core/components/form/checkbox';
import { useAppSettings } from '../../hooks/useAppSettings';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Settings dialog for global application settings
 */
export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  onClose
}) => {
  const { settings, setSetting } = useAppSettings();

  const handleMonorepoModeChange = (checked: boolean) => {
    setSetting('monorepoModeEnabled', checked);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
      className="max-w-lg"
    >
      <div className="space-y-6">
        {/* Advanced Features Section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-neutral-12 mb-3">
              Advanced Features
            </h3>

            <div className="space-y-3">
              <Checkbox
                id="monorepo-mode"
                checked={settings.monorepoModeEnabled}
                onCheckedChange={handleMonorepoModeChange}
                label="Enable Monorepo Mode"
                uiVariant="accent"
              />

              <div className="ml-6 text-sm text-neutral-10">
                <p>
                  Enables monorepo-specific settings and prompt sections for
                  template development and complex repository structures.
                </p>
                <p className="mt-2 text-neutral-9">
                  Most users should keep this disabled unless working with
                  monorepo templates or multi-package repositories.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-neutral-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-11 hover:text-neutral-12 hover:bg-neutral-3 rounded-md transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};