import { TemplateProcessor } from './TemplateProcessor';
import { ContextData } from './types/ContextData';

describe('TemplateProcessor', () => {
  let processor: TemplateProcessor;
  
  beforeEach(() => {
    processor = new TemplateProcessor();
  });

  describe('processTemplate', () => {
    const mockContextData: ContextData = {
      projectName: 'Test Project',
      template: 'react-nextjs',
      slice: 'foundation',
      instruction: 'implementation',
      isMonorepo: false,
      recentEvents: 'Added user authentication',
      additionalNotes: 'Focus on security'
    };

    it('should replace simple variables correctly', () => {
      const template = 'Project: {{projectName}}, Template: {{template}}';
      const result = processor.processTemplate(template, mockContextData);
      expect(result).toBe('Project: Test Project, Template: react-nextjs');
    });

    it('should handle boolean conditionals correctly - false case', () => {
      const template = '{{#if isMonorepo}}Monorepo: Yes{{else}}Monorepo: No{{/if}}';
      const result = processor.processTemplate(template, mockContextData);
      expect(result).toBe('Monorepo: No');
    });

    it('should handle boolean conditionals correctly - true case', () => {
      const template = '{{#if isMonorepo}}Monorepo: Yes{{else}}Monorepo: No{{/if}}';
      const monorepoData = { ...mockContextData, isMonorepo: true };
      const result = processor.processTemplate(template, monorepoData);
      expect(result).toBe('Monorepo: Yes');
    });

    it('should handle missing variables gracefully', () => {
      const template = '{{projectName}} - {{nonExistentField}} - {{template}}';
      const result = processor.processTemplate(template, mockContextData);
      expect(result).toBe('Test Project -  - react-nextjs');
    });

    it('should handle complex template with multiple variables and conditionals', () => {
      const template = `# {{projectName}}
Template: {{template}}
Slice: {{slice}}
{{#if isMonorepo}}This is a monorepo{{else}}This is not a monorepo{{/if}}
Recent: {{recentEvents}}`;

      const result = processor.processTemplate(template, mockContextData);
      
      expect(result).toContain('# Test Project');
      expect(result).toContain('Template: react-nextjs');
      expect(result).toContain('Slice: foundation');
      expect(result).toContain('This is not a monorepo');
      expect(result).toContain('Recent: Added user authentication');
    });

    it('should handle empty values', () => {
      const emptyData: ContextData = {
        projectName: '',
        template: '',
        slice: '',
        instruction: '',
        isMonorepo: false,
        recentEvents: '',
        additionalNotes: ''
      };

      const template = 'Name: {{projectName}}, Events: {{recentEvents}}';
      const result = processor.processTemplate(template, emptyData);
      expect(result).toBe('Name: , Events: ');
    });

    it('should handle invalid template syntax gracefully', () => {
      const invalidTemplate = 'Project: {{projectName';
      const result = processor.processTemplate(invalidTemplate, mockContextData);
      // Invalid syntax should be left unchanged (not processed)
      expect(result).toBe('Project: {{projectName');
    });
  });

  describe('validateTemplate', () => {
    it('should validate correct template syntax', () => {
      const validTemplate = '{{projectName}} - {{#if isMonorepo}}Yes{{else}}No{{/if}}';
      expect(processor.validateTemplate(validTemplate)).toBe(true);
    });

    it('should invalidate unmatched brackets', () => {
      const invalidTemplate = '{{projectName}} - {{template';
      expect(processor.validateTemplate(invalidTemplate)).toBe(false);
    });

    it('should invalidate unmatched conditional statements', () => {
      const invalidTemplate = '{{#if isMonorepo}}Yes{{else}}No';
      expect(processor.validateTemplate(invalidTemplate)).toBe(false);
    });

    it('should validate template with no variables', () => {
      const plainTemplate = 'This is just plain text';
      expect(processor.validateTemplate(plainTemplate)).toBe(true);
    });
  });
});