import { ProjectData } from '../storage/types/ProjectData';
import { ContextData } from './types/ContextData';
import { TemplateProcessor } from './TemplateProcessor';

/**
 * Default template for context generation
 * Uses markdown format with template variable substitution
 */
const DEFAULT_TEMPLATE = `# Project: {{projectName}}
Template: {{template}}
Slice: {{slice}}
Instruction: {{instruction}}
{{#if isMonorepo}}Monorepo: Yes{{else}}Monorepo: No{{/if}}

## Recent Events
{{recentEvents}}

## Additional Context
{{additionalNotes}}

## Current Status
Ready for {{instruction}} work on {{slice}} slice.`;

/**
 * Service for integrating project data with context generation
 * Transforms ProjectData into formatted context strings
 */
export class ContextIntegrator {
  private templateProcessor: TemplateProcessor;

  constructor() {
    this.templateProcessor = new TemplateProcessor();
  }

  /**
   * Generates a complete context string from project data
   * Main integration point - takes project data and returns formatted context
   * @param project Project data from storage
   * @returns Formatted context string ready for display/copying
   */
  generateContextFromProject(project: ProjectData): string {
    try {
      // Map project data to context data structure
      const contextData = this.mapProjectToContext(project);
      
      // Process template with context data
      const processedContext = this.templateProcessor.processTemplate(DEFAULT_TEMPLATE, contextData);
      
      // Apply final formatting
      return this.formatOutput(processedContext);
    } catch (error) {
      console.error('Error generating context from project:', error);
      return this.getErrorContext(project, error);
    }
  }

  /**
   * Maps ProjectData structure to ContextData structure
   * Handles null/undefined values with appropriate defaults
   * @param project Project data from storage
   * @returns Context data ready for template processing
   */
  private mapProjectToContext(project: ProjectData): ContextData {
    return {
      projectName: project.name || 'Unknown Project',
      template: project.template || 'Unknown Template',
      slice: project.slice || 'Unknown Slice',
      instruction: project.instruction || 'implementation',
      isMonorepo: project.isMonorepo || false,
      recentEvents: project.customData?.recentEvents || '',
      additionalNotes: project.customData?.additionalNotes || ''
    };
  }

  /**
   * Applies final formatting to processed context
   * Currently just cleans up whitespace, but can be extended
   * @param content Processed template content
   * @returns Formatted context string
   */
  private formatOutput(content: string): string {
    // Clean up multiple blank lines
    let formatted = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // Trim leading/trailing whitespace
    formatted = formatted.trim();
    
    // Ensure consistent line endings
    formatted = formatted.replace(/\r\n/g, '\n');
    
    return formatted;
  }

  /**
   * Generates error context when main generation fails
   * @param project Original project data
   * @param error Error that occurred
   * @returns Fallback context string
   */
  private getErrorContext(project: ProjectData, error: any): string {
    return `# Project: ${project.name || 'Unknown'}

⚠️ Error generating context: ${error?.message || 'Unknown error'}

## Project Details
- Template: ${project.template || 'Unknown'}
- Slice: ${project.slice || 'Unknown'}
- Instruction: ${project.instruction || 'Unknown'}
- Monorepo: ${project.isMonorepo ? 'Yes' : 'No'}

Please check the console for detailed error information.`;
  }

  /**
   * Validates project data before processing
   * @param project Project data to validate
   * @returns True if project has minimum required fields
   */
  validateProject(project: ProjectData | null | undefined): boolean {
    if (!project) {
      return false;
    }

    return Boolean(
      project.name && 
      project.template && 
      project.slice
    );
  }

  /**
   * Gets the default template string
   * Useful for testing and template customization
   * @returns Default template string
   */
  getDefaultTemplate(): string {
    return DEFAULT_TEMPLATE;
  }
}