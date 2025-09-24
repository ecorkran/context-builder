import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { SettingsDialog } from './SettingsDialog';

interface SettingsButtonProps {
  className?: string;
}

/**
 * Settings button with gear icon that opens the settings dialog
 */
export const SettingsButton: React.FC<SettingsButtonProps> = ({ className }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <button
        onClick={handleOpenDialog}
        className={`
          p-2 text-neutral-10 hover:text-neutral-12 hover:bg-neutral-3
          rounded-md transition-colors
          ${className || ''}
        `.trim()}
        title="Open settings"
        aria-label="Open settings"
      >
        <Settings size={20} />
      </button>

      <SettingsDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
      />
    </>
  );
};