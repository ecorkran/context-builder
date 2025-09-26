import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import * as fs from 'fs';
import { SystemPromptParser } from './SystemPromptParser';
import { SystemPrompt, INSTRUCTION_MAPPING } from './types/SystemPrompt';

// Mock fs module
vi.mock('fs');

describe('SystemPromptParser', () => {
  let parser: SystemPromptParser;
  const mockFilePath = '/test/prompt.ai-project.system.md';
  
  beforeEach(() => {
    vi.clearAllMocks();
    parser = new SystemPromptParser(mockFilePath);
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
    parser.clearCache();
  });

  const createMockPromptFile = () => `---
layer: snippet
docType: template
purpose: reusable-llm-prompts
---

## Prompts

##### Project Kickoff
\`\`\`markdown
We're starting work on a new project {project}. We will use our curated AI Project Creation methods in guide.ai-project.00-process to assist us in designing and performing the work. Your role as described in the Project Guide is Technical Fellow.
\`\`\`

##### Slice Planning (Phase 3)
\`\`\`markdown
We're working in our guide.ai-project.00-process, Phase 3: High-Level Design & Slice Planning. Use guide.ai-project.03-slice-planning with the project concept and specification documents to break {project} into manageable vertical slices.

Your role is Technical Fellow as described in the Process Guide.
\`\`\`

##### Model Change or Context Refresh
\`\`\`markdown
The following provides context on our current work in slice-based project {project}. Input may contain: { project, slice, task, issue, tool, note }.

We are using the slice-based methodology from guide.ai-project.00-process. Current work context:
- Project: {project}
- Current slice: {slice} (if applicable)
- Tasks File: {taskFile}
- Phase: [specify current phase]
\`\`\`

##### Use 3rd Party Tool
\`\`\`markdown
You will need to consult specific knowledge for {tool}, which should be available to you in the tool-guides/{tool} directory for our curated knowledge.

Follow these steps when working with {tool}:
1. Consult Overview
2. Locate Docs
3. Search Docs
\`\`\``;

  describe('parsePromptFile', () => {
    it('should parse prompt file successfully', async () => {
      const mockContent = createMockPromptFile();
      
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(mockContent);
      vi.mocked(fs.statSync).mockReturnValue({
        mtime: new Date('2025-01-27'),
      } as any);
      
      const result = await parser.parsePromptFile();
      
      expect(result.errors).toHaveLength(0);
      expect(result.prompts).toHaveLength(4);
      
      const kickoffPrompt = result.prompts.find(p => p.name === 'Project Kickoff');
      expect(kickoffPrompt).toBeDefined();
      expect(kickoffPrompt?.key).toBe('project-kickoff');
      expect(kickoffPrompt?.content).toContain('We\'re starting work on a new project {project}');
      expect(kickoffPrompt?.parameters).toContain('project');
    });

    it('should handle missing file gracefully', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      
      const result = await parser.parsePromptFile();
      
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('File not found');
      expect(result.prompts).toHaveLength(2); // Fallback prompts
    });

    it('should parse section headers correctly', async () => {
      const mockContent = `---
test: true
---

##### Simple Header
\`\`\`markdown
Simple content
\`\`\`

##### Complex Header (Phase 3)
\`\`\`markdown
Complex content with {variables}
\`\`\`

##### Header With Special Characters!
\`\`\`markdown
Special content
\`\`\``;

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(mockContent);
      vi.mocked(fs.statSync).mockReturnValue({ mtime: new Date() } as any);
      
      const result = await parser.parsePromptFile();
      
      expect(result.prompts).toHaveLength(3);
      expect(result.prompts[0].key).toBe('simple-header');
      expect(result.prompts[1].key).toBe('complex-header-phase-3');
      expect(result.prompts[2].key).toBe('header-with-special-characters');
    });

    it('should extract parameters from content', async () => {
      const mockContent = `---
test: true
---

##### Test Prompt
\`\`\`markdown
This is a prompt with {project} and {slice} and {tool} parameters.
Also has {customParam} in it.
\`\`\``;

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(mockContent);
      vi.mocked(fs.statSync).mockReturnValue({ mtime: new Date() } as any);
      
      const result = await parser.parsePromptFile();
      
      expect(result.prompts).toHaveLength(1);
      expect(result.prompts[0].parameters).toEqual(
        expect.arrayContaining(['project', 'slice', 'tool', 'customParam'])
      );
    });

    it('should handle malformed markdown gracefully', async () => {
      const malformedContent = `---
test: true
---

##### Good Header
\`\`\`markdown
Good content
\`\`\`

##### Bad Header
No code block here

##### Another Good Header
\`\`\`markdown
More good content
\`\`\``;

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(malformedContent);
      vi.mocked(fs.statSync).mockReturnValue({ mtime: new Date() } as any);
      
      const result = await parser.parsePromptFile();
      
      // Should parse the good ones and handle the bad one
      expect(result.prompts.length).toBeGreaterThanOrEqual(2);
      expect(result.errors).toHaveLength(0); // Malformed sections are ignored, not errors
    });
  });

  describe('getContextInitializationPrompt', () => {
    it('should find context initialization prompt', async () => {
      const mockContent = createMockPromptFile();
      
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(mockContent);
      vi.mocked(fs.statSync).mockReturnValue({ mtime: new Date() } as any);
      
      const prompt = await parser.getContextInitializationPrompt();
      
      expect(prompt).toBeDefined();
      expect(prompt?.name).toBe('Model Change or Context Refresh');
      expect(prompt?.content).toContain('slice-based project {project}');
    });

    it('should return null when prompt not found', async () => {
      const mockContent = `---
test: true
---

##### Some Other Prompt
\`\`\`markdown
Not the context prompt
\`\`\``;

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(mockContent);
      vi.mocked(fs.statSync).mockReturnValue({ mtime: new Date() } as any);
      
      const prompt = await parser.getContextInitializationPrompt();
      
      expect(prompt).toBeNull();
    });
  });

  describe('getToolUsePrompt', () => {
    it('should find tool use prompt', async () => {
      const mockContent = createMockPromptFile();
      
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(mockContent);
      vi.mocked(fs.statSync).mockReturnValue({ mtime: new Date() } as any);
      
      const prompt = await parser.getToolUsePrompt();
      
      expect(prompt).toBeDefined();
      expect(prompt?.name).toBe('Use 3rd Party Tool');
      expect(prompt?.content).toContain('tool-guides/{tool}');
    });
  });

  describe('getPromptForInstruction', () => {
    beforeEach(() => {
      const mockContent = createMockPromptFile();
      
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(mockContent);
      vi.mocked(fs.statSync).mockReturnValue({ mtime: new Date() } as any);
    });

    it('should find prompt by exact instruction mapping', async () => {
      const prompt = await parser.getPromptForInstruction('planning');
      
      expect(prompt).toBeDefined();
      expect(prompt?.name).toBe('Slice Planning (Phase 3)');
    });

    it('should handle fuzzy matching for instruction types', async () => {
      const prompt = await parser.getPromptForInstruction('slice-planning');
      
      expect(prompt).toBeDefined();
      expect(prompt?.name).toBe('Slice Planning (Phase 3)');
    });

    it('should return null for unknown instruction types', async () => {
      const prompt = await parser.getPromptForInstruction('unknown-instruction');
      
      expect(prompt).toBeNull();
    });

    it('should handle case insensitive matching', async () => {
      const prompt = await parser.getPromptForInstruction('PLANNING');
      
      expect(prompt).toBeDefined();
      expect(prompt?.name).toBe('Slice Planning (Phase 3)');
    });
  });

  describe('caching', () => {
    it('should cache parsed prompts', async () => {
      const mockContent = createMockPromptFile();
      const mockStats = { mtime: new Date('2025-01-27') };
      
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(mockContent);
      vi.mocked(fs.statSync).mockReturnValue(mockStats as any);
      
      // First call should read file
      await parser.parsePromptFile();
      expect(fs.readFileSync).toHaveBeenCalledTimes(1);
      
      // Second call should use cache
      await parser.parsePromptFile();
      expect(fs.readFileSync).toHaveBeenCalledTimes(1); // Still 1, used cache
    });

    it('should invalidate cache when file is modified', async () => {
      const mockContent = createMockPromptFile();
      
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(mockContent);
      
      // First call with old mtime
      vi.mocked(fs.statSync).mockReturnValue({
        mtime: new Date('2025-01-27')
      } as any);
      await parser.parsePromptFile();
      
      // Second call with new mtime (file modified)
      vi.mocked(fs.statSync).mockReturnValue({
        mtime: new Date('2025-01-28')
      } as any);
      await parser.parsePromptFile();
      
      expect(fs.readFileSync).toHaveBeenCalledTimes(2); // Cache invalidated
    });

    it('should clear cache manually', async () => {
      const mockContent = createMockPromptFile();
      
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(mockContent);
      vi.mocked(fs.statSync).mockReturnValue({
        mtime: new Date('2025-01-27')
      } as any);
      
      // First call
      await parser.parsePromptFile();
      
      // Clear cache
      parser.clearCache();
      
      // Second call should read file again
      await parser.parsePromptFile();
      
      expect(fs.readFileSync).toHaveBeenCalledTimes(2);
    });
  });

  describe('validatePromptFile', () => {
    it('should validate correct prompt file', async () => {
      const mockContent = createMockPromptFile();
      
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(mockContent);
      vi.mocked(fs.statSync).mockReturnValue({ mtime: new Date() } as any);
      
      const result = await parser.validatePromptFile();
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing file', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      
      const result = await parser.validatePromptFile();
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Prompt file does not exist');
    });

    it('should detect missing YAML frontmatter', async () => {
      const mockContent = `##### Some Prompt
\`\`\`markdown
Content without frontmatter
\`\`\``;

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(mockContent);
      vi.mocked(fs.statSync).mockReturnValue({ mtime: new Date() } as any);
      
      const result = await parser.validatePromptFile();
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing YAML frontmatter');
    });

    it('should detect missing prompt sections', async () => {
      const mockContent = `---
layer: snippet
---

## No Prompts Here
Just some regular content.`;

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(mockContent);
      vi.mocked(fs.statSync).mockReturnValue({ mtime: new Date() } as any);
      
      const result = await parser.validatePromptFile();
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('No prompt sections found (##### headers)');
    });
  });

  describe('fallback prompts', () => {
    it('should provide fallback prompts when file unavailable', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      
      const result = await parser.parsePromptFile();
      
      expect(result.prompts).toHaveLength(2);
      expect(result.prompts[0].name).toBe('Model Change or Context Refresh');
      expect(result.prompts[1].name).toBe('Use 3rd Party Tool');
    });

    it('should include parameters in fallback prompts', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      
      const result = await parser.parsePromptFile();
      
      const contextPrompt = result.prompts.find(p => 
        p.name === 'Model Change or Context Refresh'
      );
      expect(contextPrompt?.parameters).toContain('project');
      expect(contextPrompt?.parameters).toContain('slice');
      
      const toolPrompt = result.prompts.find(p => 
        p.name === 'Use 3rd Party Tool'
      );
      expect(toolPrompt?.parameters).toContain('tool');
    });
  });

  describe('instruction mapping', () => {
    it('should have correct instruction mappings', () => {
      expect(INSTRUCTION_MAPPING['slice-planning']).toBe('Slice Planning (Phase 3)');
      expect(INSTRUCTION_MAPPING['implementation']).toBe('Slice | Feature Implementation (Phase 7)');
      expect(INSTRUCTION_MAPPING['analyze-implementation']).toBe('Analysis Task Implementation');
      expect(INSTRUCTION_MAPPING['custom-instruction']).toBe('Custom Instruction');
    });
  });
});