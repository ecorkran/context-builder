import { StatementManager } from './StatementManager';
import { SystemPromptParser } from './SystemPromptParser';
import { StatementManagerIPC } from './StatementManagerIPC';
import { SystemPromptParserIPC } from './SystemPromptParserIPC';

/**
 * Factory functions for creating context services based on environment
 */

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