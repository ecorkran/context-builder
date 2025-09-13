import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContextTemplateEngine } from './ContextTemplateEngine';
import { SystemPromptParser } from './SystemPromptParser';
import { StatementManager } from './StatementManager';
import { SectionBuilder } from './SectionBuilder';
import { EnhancedContextData } from './types/ContextData';

// Mock the dependencies
vi.mock('./SystemPromptParser');
vi.mock('./StatementManager');
vi.mock('./SectionBuilder');

describe('ContextTemplateEngine', () => {
  let engine: ContextTemplateEngine;
  let mockPromptParser: any;
  let mockStatementManager: any;
  let mockSectionBuilder: any;

  const mockData: EnhancedContextData = {
    projectName: 'TestProject',
    template: 'react-vite',
    slice: 'feature-slice',
    instruction: 'implementation',
    isMonorepo: false,
    recentEvents: 'Recent test events',
    additionalNotes: 'Test notes',
    availableTools: ['tool1', 'tool2'],
    mcpServers: ['mcp1'],
    templateVersion: '1.0.0'
  };

  beforeEach(() => {
    // Create mock instances
    mockPromptParser = {
      getContextInitializationPrompt: vi.fn().mockResolvedValue({
        content: 'Test context initialization prompt'
      }),
      getPromptForInstruction: vi.fn().mockResolvedValue({
        content: 'Test instruction prompt'
      })
    };

    mockStatementManager = {
      getStatement: vi.fn().mockImplementation((key: string) => {
        const statements: Record<string, string> = {
          'project-intro-statement': 'We are continuing work on our project.',
          'tool-intro-statement': 'The following tools are available:',
          'instruction-intro-statement': 'Please follow these instructions:'
        };
        return Promise.resolve(statements[key] || 'Default statement');
      })
    };

    mockSectionBuilder = {
      buildToolsSection: vi.fn().mockResolvedValue('Tools section content'),
      buildMonorepoSection: vi.fn().mockResolvedValue('Monorepo section content'),
      buildInstructionSection: vi.fn().mockResolvedValue('Instruction section content')
    };

    // Create engine with mocked dependencies
    engine = new ContextTemplateEngine(
      mockPromptParser as any,
      mockStatementManager as any,
      mockSectionBuilder as any
    );
  });

  describe('generateContext', () => {
    it('should generate complete context with all sections', async () => {
      const result = await engine.generateContext(mockData);

      expect(result).toContain('We are continuing work on our project');
      expect(result).toContain('Test context initialization prompt');
      expect(result).toContain('### 3rd-Party Tools & MCP');
      expect(result).toContain('Tools section content');
      expect(result).toContain('### Current Events');
      expect(result).toContain('Recent test events');
      expect(result).toContain('### Instruction Prompt');
      expect(result).toContain('Instruction section content');
      expect(result).toContain('### Additional Notes');
      expect(result).toContain('Test notes');
    });

    it('should exclude tools section when no tools or MCP servers', async () => {
      const dataWithoutTools = {
        ...mockData,
        availableTools: undefined,
        mcpServers: undefined
      };

      const result = await engine.generateContext(dataWithoutTools);

      expect(result).not.toContain('### 3rd-Party Tools & MCP');
      expect(result).not.toContain('Tools section content');
    });

    it('should include monorepo section when isMonorepo is true', async () => {
      const monorepoData = {
        ...mockData,
        isMonorepo: true
      };

      const result = await engine.generateContext(monorepoData);

      expect(result).toContain('### Monorepo Note');
      expect(result).toContain('Monorepo section content');
    });

    it('should exclude monorepo section when isMonorepo is false', async () => {
      const result = await engine.generateContext(mockData);

      expect(result).not.toContain('### Monorepo Note');
      expect(result).not.toContain('Monorepo section content');
    });

    it('should handle missing optional fields gracefully', async () => {
      const minimalData: EnhancedContextData = {
        projectName: 'MinimalProject',
        template: 'basic',
        slice: 'minimal',
        instruction: 'test',
        isMonorepo: false,
        recentEvents: '',
        additionalNotes: ''
      };

      const result = await engine.generateContext(minimalData);

      expect(result).toBeTruthy();
      expect(result).toContain('We are continuing work on our project');
      expect(result).toContain('Test context initialization prompt');
      expect(result).not.toContain('### Current Events');
      expect(result).not.toContain('### Additional Notes');
    });

    it('should use fallback template on error', async () => {
      // Force an error by not providing required fields
      const invalidData = {} as EnhancedContextData;

      const result = await engine.generateContext(invalidData);

      expect(result).toContain('# Project: Unknown');
      expect(result).toContain('Template: Unknown');
      expect(result).toContain('Slice: Unknown');
      expect(result).toContain('Instruction: Unknown');
      expect(result).toContain('Monorepo: No');
    });

    it('should validate required fields', async () => {
      const incompleteData = {
        projectName: 'Test',
        // Missing other required fields
      } as EnhancedContextData;

      const result = await engine.generateContext(incompleteData);

      // Should fallback to error template
      expect(result).toContain('# Project:');
      expect(result).toContain('Template: Unknown');
    });
  });

  describe('buildTemplate', () => {
    it('should create correct template structure', async () => {
      const template = await engine.buildTemplate(mockData);

      expect(template.sections).toBeDefined();
      expect(template.version).toBe('1.0.0');
      
      // Check section keys
      const sectionKeys = template.sections.map(s => s.key);
      expect(sectionKeys).toContain('project-intro');
      expect(sectionKeys).toContain('context-init');
      expect(sectionKeys).toContain('tools-section');
      expect(sectionKeys).toContain('current-events');
      expect(sectionKeys).toContain('instruction');
      expect(sectionKeys).toContain('additional-notes');
    });

    it('should set correct section orders', async () => {
      const template = await engine.buildTemplate(mockData);

      const projectIntro = template.sections.find(s => s.key === 'project-intro');
      const contextInit = template.sections.find(s => s.key === 'context-init');
      const instruction = template.sections.find(s => s.key === 'instruction');

      expect(projectIntro?.order).toBe(1);
      expect(contextInit?.order).toBe(2);
      expect(instruction?.order).toBe(6);
    });

    it('should mark conditional sections correctly', async () => {
      const template = await engine.buildTemplate(mockData);

      const toolsSection = template.sections.find(s => s.key === 'tools-section');
      const projectIntro = template.sections.find(s => s.key === 'project-intro');

      expect(toolsSection?.conditional).toBe(true);
      expect(projectIntro?.conditional).toBe(false);
    });

    it('should include tools section only when tools or MCP present', async () => {
      // With tools
      const templateWithTools = await engine.buildTemplate(mockData);
      const toolsSectionWithTools = templateWithTools.sections.find(s => s.key === 'tools-section');
      expect(toolsSectionWithTools).toBeDefined();

      // Without tools
      const dataWithoutTools = {
        ...mockData,
        availableTools: undefined,
        mcpServers: undefined
      };
      const templateWithoutTools = await engine.buildTemplate(dataWithoutTools);
      const toolsSectionWithoutTools = templateWithoutTools.sections.find(s => s.key === 'tools-section');
      expect(toolsSectionWithoutTools).toBeUndefined();
    });
  });

  describe('assembleSections', () => {
    it('should assemble sections in correct order', async () => {
      const template = await engine.buildTemplate(mockData);
      const result = await engine.assembleSections(template, mockData);

      // Check that sections appear in order
      const projectIntroIndex = result.indexOf('We are continuing work on our project');
      const contextInitIndex = result.indexOf('Test context initialization prompt');
      const instructionIndex = result.indexOf('### Instruction Prompt');

      expect(projectIntroIndex).toBeLessThan(contextInitIndex);
      expect(contextInitIndex).toBeLessThan(instructionIndex);
    });

    it('should skip conditional sections when condition is false', async () => {
      const dataNoMonorepo = {
        ...mockData,
        isMonorepo: false
      };

      const template = await engine.buildTemplate(dataNoMonorepo);
      const result = await engine.assembleSections(template, dataNoMonorepo);

      expect(result).not.toContain('### Monorepo Note');
    });

    it('should process template variables', async () => {
      const template = {
        sections: [{
          key: 'test',
          title: 'Test Section',
          content: 'Project: {{projectName}}, Template: {{template}}',
          conditional: false,
          order: 1
        }],
        version: '1.0.0'
      };

      const result = await engine.assembleSections(template, mockData);

      expect(result).toContain('Project: TestProject');
      expect(result).toContain('Template: react-vite');
    });

    it('should combine sections with proper spacing', async () => {
      const template = await engine.buildTemplate(mockData);
      const result = await engine.assembleSections(template, mockData);

      // Check for double newlines between sections
      const sections = result.split('\n\n');
      expect(sections.length).toBeGreaterThan(1);
    });
  });

  describe('formatOutput', () => {
    it('should remove excessive whitespace', async () => {
      const dataWithExtraSpacing = {
        ...mockData,
        recentEvents: 'Event1\n\n\n\nEvent2',
        additionalNotes: 'Note1\n\n\n\n\nNote2'
      };

      const result = await engine.generateContext(dataWithExtraSpacing);

      // Should not have more than 2 consecutive newlines
      expect(result).not.toMatch(/\n{3,}/);
    });

    it('should normalize line endings', async () => {
      const result = await engine.generateContext(mockData);

      // Should not contain Windows line endings
      expect(result).not.toContain('\r\n');
    });

    it('should trim leading and trailing whitespace', async () => {
      const result = await engine.generateContext(mockData);

      expect(result).toBe(result.trim());
    });
  });

  describe('template variable replacement', () => {
    it('should replace all template variables', async () => {
      const template = {
        sections: [{
          key: 'test',
          title: '',
          content: '{{projectName}} {{template}} {{slice}} {{instruction}} {{isMonorepo}}',
          conditional: false,
          order: 1
        }],
        version: '1.0.0'
      };

      const result = await engine.assembleSections(template, mockData);

      expect(result).toContain('TestProject');
      expect(result).toContain('react-vite');
      expect(result).toContain('feature-slice');
      expect(result).toContain('implementation');
      expect(result).toContain('No');
    });

    it('should handle array variables', async () => {
      const template = {
        sections: [{
          key: 'test',
          title: '',
          content: 'Tools: {{availableTools}}, MCP: {{mcpServers}}',
          conditional: false,
          order: 1
        }],
        version: '1.0.0'
      };

      const result = await engine.assembleSections(template, mockData);

      expect(result).toContain('Tools: tool1, tool2');
      expect(result).toContain('MCP: mcp1');
    });

    it('should handle missing variables gracefully', async () => {
      const template = {
        sections: [{
          key: 'test',
          title: '',
          content: 'Project: {{projectName}} Unknown: {{unknownVar}}',
          conditional: false,
          order: 1
        }],
        version: '1.0.0'
      };

      const result = await engine.assembleSections(template, mockData);

      expect(result).toContain('Project: TestProject');
      expect(result).toContain('{{unknownVar}}'); // Should leave unknown variables as-is
    });
  });

  describe('error handling', () => {
    it('should catch and log errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Force an error by making a mock throw
      mockStatementManager.getStatement = vi.fn().mockRejectedValue(new Error('Test error'));

      const result = await engine.generateContext(mockData);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error generating context with template engine:',
        expect.any(Error)
      );
      expect(result).toContain('# Project: TestProject'); // Fallback template

      consoleSpy.mockRestore();
    });

    it('should provide meaningful error for missing required fields', async () => {
      const invalidData = {
        projectName: 'Test',
        // Missing other required fields
      } as EnhancedContextData;

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      await engine.generateContext(invalidData);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error generating context with template engine:',
        expect.objectContaining({
          message: expect.stringContaining('Missing required fields')
        })
      );

      consoleSpy.mockRestore();
    });
  });

  describe('engine toggle', () => {
    it('should report enabled status correctly', () => {
      expect(engine.isEnabled()).toBe(true);
    });

    it('should allow toggling engine on/off', () => {
      engine.setEnabled(false);
      expect(engine.isEnabled()).toBe(false);

      engine.setEnabled(true);
      expect(engine.isEnabled()).toBe(true);
    });
  });

  describe('integration scenarios', () => {
    it('should generate complete context for monorepo project', async () => {
      const monorepoData: EnhancedContextData = {
        projectName: 'MonorepoProject',
        template: 'turborepo',
        slice: 'shared-components',
        instruction: 'planning',
        isMonorepo: true,
        recentEvents: 'Monorepo setup complete',
        additionalNotes: 'Focus on shared component library',
        availableTools: ['turbo', 'pnpm'],
        mcpServers: ['workspace-tools'],
        templateVersion: '2.0.0'
      };

      const result = await engine.generateContext(monorepoData);

      expect(result).toContain('We are continuing work on our project');
      expect(result).toContain('### Monorepo Note');
      expect(result).toContain('### 3rd-Party Tools & MCP');
      expect(result).toContain('Monorepo setup complete');
      expect(result).toContain('Focus on shared component library');
    });

    it('should generate minimal context for simple project', async () => {
      const simpleData: EnhancedContextData = {
        projectName: 'SimpleProject',
        template: 'basic',
        slice: 'main',
        instruction: 'implementation',
        isMonorepo: false,
        recentEvents: '',
        additionalNotes: ''
      };

      const result = await engine.generateContext(simpleData);

      expect(result).toContain('We are continuing work on our project');
      expect(result).toContain('Test context initialization prompt');
      expect(result).toContain('### Instruction Prompt');
      expect(result).not.toContain('### Current Events');
      expect(result).not.toContain('### Additional Notes');
      expect(result).not.toContain('### Monorepo Note');
    });
  });
});