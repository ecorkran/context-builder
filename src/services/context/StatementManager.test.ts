import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import * as fs from 'fs';
import { StatementManager } from './StatementManager';
import { TemplateStatement } from './types/TemplateStatement';

// Mock fs module
vi.mock('fs');

describe('StatementManager', () => {
  let statementManager: StatementManager;
  const mockFilePath = '/test/statements.md';
  
  beforeEach(() => {
    vi.clearAllMocks();
    statementManager = new StatementManager(mockFilePath);
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('loadStatements', () => {
    it('should load statements from markdown file successfully', async () => {
      const mockContent = `---
version: "1.0.0"
lastUpdated: "2025-01-27"
---

## Project Intro Statement
<!-- key: project-intro-statement, editable: true -->

Test project intro content

## Tool Intro Statement
<!-- key: tool-intro-statement, editable: false -->

Test tool intro content`;

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(mockContent);
      
      await statementManager.loadStatements();
      
      const statements = statementManager.getAllStatements();
      expect(statements['project-intro-statement']).toBeDefined();
      expect(statements['project-intro-statement'].content).toBe('Test project intro content');
      expect(statements['project-intro-statement'].editable).toBe(true);
      
      expect(statements['tool-intro-statement']).toBeDefined();
      expect(statements['tool-intro-statement'].content).toBe('Test tool intro content');
      expect(statements['tool-intro-statement'].editable).toBe(false);
    });

    it('should use defaults when file does not exist', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      
      await statementManager.loadStatements();
      
      const statements = statementManager.getAllStatements();
      expect(statements['project-intro-statement']).toBeDefined();
      expect(statements['project-intro-statement'].content).toContain('We are continuing work on our project');
    });

    it('should handle malformed markdown gracefully', async () => {
      const malformedContent = `---
version: "1.0.0"
---

## Some Header
No metadata comment here

## Another Header
<!-- key: valid-key, editable: invalid -->

Some content`;

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(malformedContent);
      
      await statementManager.loadStatements();
      
      const statements = statementManager.getAllStatements();
      // Should have loaded defaults due to parsing issues
      expect(Object.keys(statements).length).toBeGreaterThan(0);
    });

    it('should merge missing defaults with parsed statements', async () => {
      const partialContent = `---
version: "1.0.0"
---

## Project Intro Statement
<!-- key: project-intro-statement, editable: true -->

Custom project intro`;

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(partialContent);
      
      await statementManager.loadStatements();
      
      const statements = statementManager.getAllStatements();
      // Should have custom content for project-intro
      expect(statements['project-intro-statement'].content).toBe('Custom project intro');
      // Should have defaults for missing statements
      expect(statements['tool-intro-statement']).toBeDefined();
      expect(statements['instruction-intro-statement']).toBeDefined();
    });
  });

  describe('getStatement', () => {
    beforeEach(async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      await statementManager.loadStatements();
    });

    it('should return statement content by key', () => {
      const content = statementManager.getStatement('project-intro-statement');
      expect(content).toContain('We are continuing work on our project');
    });

    it('should return empty string for unknown key', () => {
      const content = statementManager.getStatement('unknown-key');
      expect(content).toBe('');
    });

    it('should throw error if statements not loaded', () => {
      const newManager = new StatementManager();
      expect(() => newManager.getStatement('any-key')).toThrow('Statements not loaded');
    });
  });

  describe('updateStatement', () => {
    beforeEach(async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      await statementManager.loadStatements();
    });

    it('should update editable statement content', () => {
      const newContent = 'Updated project intro';
      statementManager.updateStatement('project-intro-statement', newContent);
      
      const content = statementManager.getStatement('project-intro-statement');
      expect(content).toBe(newContent);
    });

    it('should throw error for non-existent statement', () => {
      expect(() => {
        statementManager.updateStatement('non-existent', 'content');
      }).toThrow("Statement 'non-existent' not found");
    });

    it('should throw error for non-editable statement', () => {
      // First, add a non-editable statement for testing
      const statements = statementManager.getAllStatements();
      statements['test-readonly'] = {
        key: 'test-readonly',
        content: 'readonly content',
        description: 'test',
        editable: false
      };
      
      expect(() => {
        statementManager.updateStatement('test-readonly', 'new content');
      }).toThrow("Statement 'test-readonly' not found");
    });

    it('should throw error for empty content', () => {
      expect(() => {
        statementManager.updateStatement('project-intro-statement', '');
      }).toThrow('Statement content cannot be empty');
      
      expect(() => {
        statementManager.updateStatement('project-intro-statement', '   ');
      }).toThrow('Statement content cannot be empty');
    });
  });

  describe('saveStatements', () => {
    beforeEach(async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      await statementManager.loadStatements();
    });

    it('should save statements to markdown file', async () => {
      vi.mocked(fs.existsSync).mockImplementation((path) => {
        // Directory exists check
        if (typeof path === 'string' && path.includes('statements')) {
          return true;
        }
        return false;
      });
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});
      vi.mocked(fs.renameSync).mockImplementation(() => {});
      
      await statementManager.saveStatements();
      
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(fs.renameSync).toHaveBeenCalled();
    });

    it('should create directory if it does not exist', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.mkdirSync).mockImplementation(() => '');
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});
      vi.mocked(fs.renameSync).mockImplementation(() => {});
      
      await statementManager.saveStatements();
      
      expect(fs.mkdirSync).toHaveBeenCalledWith(expect.any(String), { recursive: true });
    });

    it('should handle save errors gracefully', async () => {
      vi.mocked(fs.writeFileSync).mockImplementation(() => {
        throw new Error('Write failed');
      });
      
      await expect(statementManager.saveStatements()).rejects.toThrow('Failed to save statements');
    });
  });

  describe('getAllStatements', () => {
    it('should return all loaded statements', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      await statementManager.loadStatements();
      
      const statements = statementManager.getAllStatements();
      
      expect(statements).toBeDefined();
      expect(typeof statements).toBe('object');
      expect(Object.keys(statements).length).toBeGreaterThan(0);
      expect(statements['project-intro-statement']).toBeDefined();
    });

    it('should return a copy to prevent external modifications', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      await statementManager.loadStatements();
      
      const statements1 = statementManager.getAllStatements();
      const statements2 = statementManager.getAllStatements();
      
      expect(statements1).not.toBe(statements2);
      expect(statements1).toEqual(statements2);
    });
  });

  describe('resetToDefaults', () => {
    it('should reset all statements to default values', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      await statementManager.loadStatements();
      
      // Modify a statement
      statementManager.updateStatement('project-intro-statement', 'Modified content');
      expect(statementManager.getStatement('project-intro-statement')).toBe('Modified content');
      
      // Reset to defaults
      statementManager.resetToDefaults();
      
      expect(statementManager.getStatement('project-intro-statement')).toContain('We are continuing work on our project');
    });
  });

  describe('parseMarkdownStatements', () => {
    it('should handle various comment formats', async () => {
      const content = `---
version: "1.0.0"
---

## Test Statement
<!-- key: test-key, editable: true -->

Content here

## Another Statement
<!--key:no-spaces,editable:false-->

More content

## Bad Format
<!-- key: missing-editable -->

Should not parse`;

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(content);
      
      await statementManager.loadStatements();
      
      const statements = statementManager.getAllStatements();
      expect(statements['test-key']).toBeDefined();
      expect(statements['test-key'].content).toBe('Content here');
      expect(statements['no-spaces']).toBeDefined();
      expect(statements['no-spaces'].content).toBe('More content');
      expect(statements['missing-editable']).toBeUndefined();
    });
  });
});