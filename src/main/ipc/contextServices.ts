import { ipcMain } from 'electron';
import { StatementManager, SystemPromptParser } from '../services/context';
import { TemplateStatement } from '../services/context/types/TemplateStatement';

// Create service instances
const statementManager = new StatementManager();
const systemPromptParser = new SystemPromptParser();

/**
 * Initialize all IPC handlers for context services
 */
export function setupContextServiceHandlers() {
  // Statement management handlers
  ipcMain.handle('statements:load', async (event, filename?: string) => {
    try {
      const manager = filename ? new StatementManager(filename) : statementManager;
      await manager.loadStatements();
      return manager.getAllStatements();
    } catch (error) {
      console.error('Error loading statements:', error);
      throw error;
    }
  });

  ipcMain.handle('statements:save', async (event, filename: string, statements: Record<string, TemplateStatement>) => {
    try {
      const manager = new StatementManager(filename);
      // Load current statements first
      await manager.loadStatements();
      
      // Update statements
      for (const [key, statement] of Object.entries(statements)) {
        manager.updateStatement(key, statement.content);
      }
      
      // Save back to file
      await manager.saveStatements();
    } catch (error) {
      console.error('Error saving statements:', error);
      throw error;
    }
  });

  ipcMain.handle('statements:get', async (event, filename: string, key: string) => {
    try {
      const manager = new StatementManager(filename);
      await manager.loadStatements();
      return manager.getStatement(key);
    } catch (error) {
      console.error('Error getting statement:', error);
      throw error;
    }
  });

  ipcMain.handle('statements:update', async (event, filename: string, key: string, content: string) => {
    try {
      const manager = new StatementManager(filename);
      await manager.loadStatements();
      manager.updateStatement(key, content);
      await manager.saveStatements();
    } catch (error) {
      console.error('Error updating statement:', error);
      throw error;
    }
  });

  // System prompt handlers
  ipcMain.handle('systemPrompts:parse', async (event, filename?: string) => {
    try {
      const parser = filename ? new SystemPromptParser(filename) : systemPromptParser;
      const prompts = await parser.getAllPrompts();
      return prompts;
    } catch (error) {
      console.error('Error parsing system prompts:', error);
      throw error;
    }
  });

  ipcMain.handle('systemPrompts:getContextInit', async (event, filename?: string) => {
    try {
      const parser = filename ? new SystemPromptParser(filename) : systemPromptParser;
      return await parser.getContextInitializationPrompt();
    } catch (error) {
      console.error('Error getting context init prompt:', error);
      throw error;
    }
  });

  ipcMain.handle('systemPrompts:getToolUse', async (event, filename?: string) => {
    try {
      const parser = filename ? new SystemPromptParser(filename) : systemPromptParser;
      return await parser.getToolUsePrompt();
    } catch (error) {
      console.error('Error getting tool use prompt:', error);
      throw error;
    }
  });

  ipcMain.handle('systemPrompts:getForInstruction', async (event, filename: string, instruction: string) => {
    try {
      const parser = new SystemPromptParser(filename);
      return await parser.getPromptForInstruction(instruction);
    } catch (error) {
      console.error('Error getting prompt for instruction:', error);
      throw error;
    }
  });

  console.log('Context service IPC handlers registered');
}

/**
 * Remove all context service IPC handlers
 */
export function removeContextServiceHandlers() {
  const handlers = [
    'statements:load',
    'statements:save', 
    'statements:get',
    'statements:update',
    'systemPrompts:parse',
    'systemPrompts:getContextInit',
    'systemPrompts:getToolUse',
    'systemPrompts:getForInstruction'
  ];

  handlers.forEach(handler => {
    ipcMain.removeHandler(handler);
  });

  console.log('Context service IPC handlers removed');
}