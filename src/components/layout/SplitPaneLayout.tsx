import React, { ReactNode } from 'react';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from 'react-resizable-panels';
import { cn } from '../../lib/ui-core/utils/cn';
import { LeftPanel } from './LeftPanel';
import { RightPanel } from './RightPanel';

interface SplitPaneLayoutProps {
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  defaultLayout?: [number, number];
  minSize?: number;
  maxSize?: number;
  className?: string;
}

/**
 * Split-pane layout component with resizable panels.
 * Default split is 40/60 (left/right).
 * Automatically saves and restores layout to localStorage.
 */
export const SplitPaneLayout: React.FC<SplitPaneLayoutProps> = ({
  leftContent,
  rightContent,
  defaultLayout = [40, 60],
  minSize = 25,
  maxSize = 75,
  className,
}) => {
  return (
    <PanelGroup
      direction="horizontal"
      autoSaveId="context-builder-layout"
      className={cn('h-full w-full', className)}
    >
      <Panel
        defaultSize={defaultLayout[0]}
        minSize={minSize}
        maxSize={maxSize}
        className="h-full"
      >
        <LeftPanel>
          {leftContent}
        </LeftPanel>
      </Panel>
      
      <PanelResizeHandle className="w-1 bg-neutral-3 hover:bg-neutral-4 transition-colors cursor-col-resize" />
      
      <Panel
        defaultSize={defaultLayout[1]}
        minSize={100 - maxSize}
        className="h-full"
      >
        <RightPanel>
          {rightContent}
        </RightPanel>
      </Panel>
    </PanelGroup>
  );
};