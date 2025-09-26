import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { SectionBuilder } from './SectionBuilder';
import { StatementManager } from './StatementManager';
import { SystemPromptParser } from './SystemPromptParser';
import { EnhancedContextData } from './types/ContextSection';

// Mock dependencies
vi.mock('./StatementManager');
vi.mock('./SystemPromptParser');

describe('SectionBuilder', () => {
  let sectionBuilder: SectionBuilder;
  let mockStatementManager: StatementManager;
  let mockPromptParser: SystemPromptParser;
  
  const createMockData = (): EnhancedContextData => ({
    name: 'test-project',
    projectName: 'test-project',
    template: 'react',
    slice: 'test-slice',
    instruction: 'implementation',
    isMonorepo: false,
    recentEvents: 'Fixed bug in auth',
    additionalNotes: 'Focus on performance',
    availableTools: ['git', 'npm'],
    mcpServers: ['context7'],
    templateVersion: '1.0.0'
  });

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockStatementManager = new StatementManager();
    mockPromptParser = new SystemPromptParser();
    
    // Setup default mock returns
    vi.mocked(mockStatementManager.getStatement).mockImplementation((key) => {
      const statements: Record<string, string> = {
        'tool-intro-statement': 'The following tools and MCP servers are available:',
        'no-tools-statement': 'No additional tools detected.',
        'monorepo-statement': 'Monorepo project: {{template}}, Slice: {{slice}}',
        'instruction-intro-statement': 'Current development phase:',
        'custom-instruction-statement': 'Custom: {{instruction}}',
        'current-events-header': '### Current Events',
        'additional-notes-header': '### Additional Notes'
      };
      return statements[key] || '';
    });
    
    vi.mocked(mockPromptParser.getToolUsePrompt).mockResolvedValue({
      name: 'Use 3rd Party Tool',
      key: 'tool-use',
      content: 'Tools available for {project}',
      parameters: ['project']
    });
    
    vi.mocked(mockPromptParser.getPromptForInstruction).mockResolvedValue({
      name: 'Implementation',
      key: 'implementation',
      content: 'Implementing {slice} in {project}',
      parameters: ['slice', 'project']
    });
    
    sectionBuilder = new SectionBuilder(mockStatementManager, mockPromptParser);
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('buildToolsSection', () => {
    it('should build tools section with available tools', async () => {
      const data = createMockData();
      
      const result = await sectionBuilder.buildToolsSection(data);
      
      expect(result).toContain('The following tools and MCP servers are available');
      // Template should process {project} as projectName
      expect(result).toContain('Tools available for test-project');
      expect(result).toContain('Available MCP servers: context7');
    });

    it('should return no-tools statement when no tools available', async () => {
      const data = createMockData();
      data.availableTools = [];
      data.mcpServers = [];
      
      const result = await sectionBuilder.buildToolsSection(data);
      
      expect(result).toBe('No additional tools detected.');
    });

    it('should handle missing tool prompt gracefully', async () => {
      vi.mocked(mockPromptParser.getToolUsePrompt).mockResolvedValue(null);
      const data = createMockData();
      
      const result = await sectionBuilder.buildToolsSection(data);
      
      expect(result).toContain('The following tools and MCP servers are available');
      expect(result).toContain('Available MCP servers: context7');
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(mockPromptParser.getToolUsePrompt).mockRejectedValue(new Error('Parse error'));
      const data = createMockData();
      
      const result = await sectionBuilder.buildToolsSection(data);
      
      expect(result).toBe('');
    });
  });

  describe('buildMonorepoSection', () => {
    it('should build monorepo section with template processing', () => {
      const data = createMockData();
      data.isMonorepo = true;
      
      const result = sectionBuilder.buildMonorepoSection(data);
      
      expect(result).toContain('Monorepo project: react, Slice: test-slice');
    });

    it('should use fallback when statement not found', () => {
      vi.mocked(mockStatementManager.getStatement).mockReturnValue('');
      const data = createMockData();
      
      const result = sectionBuilder.buildMonorepoSection(data);
      
      expect(result).toBe('Project is configured as a monorepo. Working in package: react, Slice: test-slice');
    });

    it('should append custom monorepo note when provided', () => {
      const data = createMockData();
      data.isMonorepo = true;
      data.customData = {
        ...data.customData,
        monorepoNote: 'Custom monorepo structure notes here\nWith multiple lines'
      };
      
      const result = sectionBuilder.buildMonorepoSection(data);
      
      expect(result).toContain('Monorepo project: react, Slice: test-slice');
      expect(result).toContain('Custom monorepo structure notes here');
      expect(result).toContain('With multiple lines');
    });

    it('should not append empty custom monorepo note', () => {
      const data = createMockData();
      data.isMonorepo = true;
      data.customData = {
        ...data.customData,
        monorepoNote: '   '  // Only whitespace
      };
      
      const result = sectionBuilder.buildMonorepoSection(data);
      
      expect(result).toBe('Monorepo project: react, Slice: test-slice');
    });

    it('should handle errors gracefully', () => {
      vi.mocked(mockStatementManager.getStatement).mockImplementation(() => {
        throw new Error('Statement error');
      });
      const data = createMockData();
      
      const result = sectionBuilder.buildMonorepoSection(data);
      
      expect(result).toBe('');
    });
  });

  describe('buildInstructionSection', () => {
    it('should build instruction section with matched prompt', async () => {
      const data = createMockData();
      
      const result = await sectionBuilder.buildInstructionSection(data);
      
      expect(result).toContain('Current development phase:');
      // Template should be processed with actual values
      expect(result).toContain('Implementing test-slice in test-project');
    });

    it('should use custom instruction for unknown types', async () => {
      vi.mocked(mockPromptParser.getPromptForInstruction).mockResolvedValue(null);
      const data = createMockData();
      data.instruction = 'custom-task';
      
      const result = await sectionBuilder.buildInstructionSection(data);
      
      expect(result).toContain('Custom: custom-task');
    });

    it('should handle missing statements with fallback', async () => {
      vi.mocked(mockPromptParser.getPromptForInstruction).mockResolvedValue(null);
      vi.mocked(mockStatementManager.getStatement).mockReturnValue('');
      const data = createMockData();
      
      const result = await sectionBuilder.buildInstructionSection(data);
      
      expect(result).toBe('Custom instruction: implementation');
    });

    it('should handle errors with fallback', async () => {
      vi.mocked(mockPromptParser.getPromptForInstruction).mockRejectedValue(new Error('Parse error'));
      const data = createMockData();
      
      const result = await sectionBuilder.buildInstructionSection(data);
      
      expect(result).toBe('Instruction: implementation');
    });
  });

  describe('buildCurrentEventsSection', () => {
    it('should build current events section with header', () => {
      const data = createMockData();
      
      const result = sectionBuilder.buildCurrentEventsSection(data);
      
      expect(result).toContain('### Current Events');
      expect(result).toContain('Fixed bug in auth');
    });

    it('should return empty for no events', () => {
      const data = createMockData();
      data.recentEvents = '';
      
      const result = sectionBuilder.buildCurrentEventsSection(data);
      
      expect(result).toBe('');
    });

    it('should handle missing header', () => {
      vi.mocked(mockStatementManager.getStatement).mockImplementation((key) => 
        key === 'current-events-header' ? '' : 'default'
      );
      const data = createMockData();
      
      const result = sectionBuilder.buildCurrentEventsSection(data);
      
      expect(result).toBe('Fixed bug in auth');
    });
  });

  describe('buildAdditionalNotesSection', () => {
    it('should build additional notes section with header', () => {
      const data = createMockData();
      
      const result = sectionBuilder.buildAdditionalNotesSection(data);
      
      expect(result).toContain('### Additional Notes');
      expect(result).toContain('Focus on performance');
    });

    it('should return empty for no notes', () => {
      const data = createMockData();
      data.additionalNotes = '';
      
      const result = sectionBuilder.buildAdditionalNotesSection(data);
      
      expect(result).toBe('');
    });
  });

  describe('buildSection', () => {
    it('should build generic section with title', () => {
      const section = {
        key: 'test',
        title: '### Test Section',
        content: 'Test content for {{projectName}}',
        order: 1
      };
      const data = createMockData();
      
      const result = sectionBuilder.buildSection(section, data);
      
      expect(result).toContain('### Test Section');
      expect(result).toContain('Test content for test-project');
    });

    it('should handle conditional sections', () => {
      const section = {
        key: 'conditional',
        content: 'Conditional content',
        order: 1,
        conditional: true,
        condition: (data: EnhancedContextData) => data.isMonorepo
      };
      
      const data = createMockData();
      data.isMonorepo = false;
      
      const result = sectionBuilder.buildSection(section, data);
      
      expect(result).toBe('');
      
      data.isMonorepo = true;
      const result2 = sectionBuilder.buildSection(section, data);
      
      expect(result2).toBe('Conditional content');
    });

    it('should skip empty sections when configured', () => {
      const builder = new SectionBuilder(mockStatementManager, mockPromptParser, {
        includeEmptySections: false
      });
      
      const section = {
        key: 'empty',
        content: '   ',
        order: 1
      };
      const data = createMockData();
      
      const result = builder.buildSection(section, data);
      
      expect(result).toBe('');
    });
  });

  describe('hasToolsOrMCP', () => {
    it('should return true when tools available', () => {
      const data = createMockData();
      
      expect(sectionBuilder.hasToolsOrMCP(data)).toBe(true);
    });

    it('should return true when only MCP available', () => {
      const data = createMockData();
      data.availableTools = [];
      
      expect(sectionBuilder.hasToolsOrMCP(data)).toBe(true);
    });

    it('should return false when no tools or MCP', () => {
      const data = createMockData();
      data.availableTools = [];
      data.mcpServers = [];
      
      expect(sectionBuilder.hasToolsOrMCP(data)).toBe(false);
    });
  });

  describe('validateSection', () => {
    it('should validate correct section', () => {
      const section = {
        key: 'test',
        content: 'content',
        order: 1
      };
      
      const result = sectionBuilder.validateSection(section);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing key', () => {
      const section = {
        key: '',
        content: 'content',
        order: 1
      };
      
      const result = sectionBuilder.validateSection(section);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Section must have a key');
    });

    it('should detect missing order', () => {
      const section = {
        key: 'test',
        content: 'content',
        order: undefined as any
      };
      
      const result = sectionBuilder.validateSection(section);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Section must have a numeric order');
    });

    it('should detect conditional without condition', () => {
      const section = {
        key: 'test',
        content: 'content',
        order: 1,
        conditional: true
      };
      
      const result = sectionBuilder.validateSection(section);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Conditional section must have a condition function');
    });
  });

  describe('createSection', () => {
    it('should create basic section', () => {
      const section = sectionBuilder.createSection('test', 'content', 1);
      
      expect(section).toEqual({
        key: 'test',
        content: 'content',
        order: 1
      });
    });

    it('should create section with options', () => {
      const section = sectionBuilder.createSection('test', 'content', 1, {
        title: '### Test',
        conditional: true,
        condition: (data) => true
      });
      
      expect(section.title).toBe('### Test');
      expect(section.conditional).toBe(true);
      expect(section.condition).toBeDefined();
    });
  });

  describe('detectAvailableTools', () => {
    it('should return provided tools', () => {
      const data = createMockData();
      
      const tools = sectionBuilder.detectAvailableTools(data);
      
      expect(tools).toEqual(['git', 'npm']);
    });

    it('should return empty array when no tools', () => {
      const data = createMockData();
      data.availableTools = undefined;
      
      const tools = sectionBuilder.detectAvailableTools(data);
      
      expect(tools).toEqual([]);
    });
  });

  describe('buildProjectInfoSection', () => {
    it('should build project info object with all fields', async () => {
      const data = createMockData();
      data.template = 'react-vite';
      data.isMonorepo = true;
      
      const result = await sectionBuilder.buildProjectInfoSection(data);
      
      expect(result).toBe(`{\n  project: test-project,\n  template: react-vite,\n  slice: test-slice,\n  taskFile: null,\n  monorepo: true\n}`);
    });

    it('should exclude template when default or empty', async () => {
      const data = createMockData();
      data.template = 'default';
      data.isMonorepo = false;
      
      const result = await sectionBuilder.buildProjectInfoSection(data);
      
      expect(result).toBe(`{\n  project: test-project,\n  slice: test-slice,\n  taskFile: null,\n  monorepo: false\n}`);
    });

    it('should exclude template when isMonorepo is false even if template has value', async () => {
      const data = createMockData();
      data.template = 'react-vite';  // Has template value
      data.isMonorepo = false;       // But monorepo is false
      
      const result = await sectionBuilder.buildProjectInfoSection(data);
      
      expect(result).toBe(`{\n  project: test-project,\n  slice: test-slice,\n  taskFile: null,\n  monorepo: false\n}`);
    });

    it('should show slice as null when empty', async () => {
      const data = createMockData();
      data.slice = '';
      data.template = 'default'; // Make sure template gets excluded
      
      const result = await sectionBuilder.buildProjectInfoSection(data);
      
      expect(result).toBe(`{\n  project: test-project,\n  slice: null,\n  taskFile: null,\n  monorepo: false\n}`);
    });

    it('should handle errors with fallback', async () => {
      const data = createMockData();
      data.projectName = undefined as any;
      
      const result = await sectionBuilder.buildProjectInfoSection(data);
      
      expect(result).toBe(`{\n  project: undefined,\n  slice: test-slice,\n  taskFile: null,\n  monorepo: false\n}`);
    });
  });
});