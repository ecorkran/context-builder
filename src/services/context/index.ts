// Main services
export { ContextIntegrator } from './ContextIntegrator';
export { TemplateProcessor } from './TemplateProcessor';
export { ContextTemplateEngine } from './ContextTemplateEngine';
export { SectionBuilder } from './SectionBuilder';

// Direct implementations (for testing, main process)
export { StatementManager } from './StatementManager';
export { SystemPromptParser } from './SystemPromptParser';

// IPC implementations (for renderer process)
export { StatementManagerIPC } from './StatementManagerIPC';
export { SystemPromptParserIPC } from './SystemPromptParserIPC';

// Factory functions for environment detection
export function createStatementManager(filename?: string) {
  // Use IPC implementation in renderer process
  if (typeof window !== 'undefined' && window.electronAPI) {
    return new StatementManagerIPC(filename);
  }
  // Use direct implementation in main process or non-Electron environments
  return new StatementManager(filename);
}

export function createSystemPromptParser(filename?: string) {
  // Use IPC implementation in renderer process
  if (typeof window !== 'undefined' && window.electronAPI) {
    return new SystemPromptParserIPC(filename);
  }
  // Use direct implementation in main process or non-Electron environments
  return new SystemPromptParser(filename);
}

// Types
export type { ContextData, ContextGenerator, EnhancedContextData } from './types/ContextData';
export type { TemplateStatement } from './types/TemplateStatement';
export type { SystemPrompt } from './types/SystemPrompt';
export type { ContextSection } from './types/ContextSection';