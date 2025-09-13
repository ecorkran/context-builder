import { EnhancedContextData } from './types/ContextData';
import { ContextSection, ContextTemplate } from './types/ContextSection';
import { SystemPromptParser } from './SystemPromptParser';
import { StatementManager } from './StatementManager';
import { SectionBuilder } from './SectionBuilder';

// Fallback template for error scenarios
const DEFAULT_TEMPLATE = `# Project: {{projectName}}
Template: {{template}}
Slice: {{slice}}
Instruction: {{instruction}}
Monorepo: {{isMonorepo}}`;

/**
 * Main orchestrator for context template generation
 * Coordinates between statement manager, prompt parser, and section builder
 */
export class ContextTemplateEngine {
  private promptParser: SystemPromptParser;
  private statementManager: StatementManager;
  private sectionBuilder: SectionBuilder;
  private enableNewEngine: boolean = true;

  constructor(
    promptParser?: SystemPromptParser,
    statementManager?: StatementManager,
    sectionBuilder?: SectionBuilder
  ) {
    this.promptParser = promptParser || new SystemPromptParser();
    this.statementManager = statementManager || new StatementManager();
    this.sectionBuilder = sectionBuilder || new SectionBuilder();
  }

  /**
   * Generate context from enhanced project data
   */
  async generateContext(data: EnhancedContextData): Promise<string> {
    try {
      // Validate input data
      this.validateInputData(data);

      // Build template configuration
      const template = await this.buildTemplate(data);

      // Assemble sections into final context
      const sections = await this.assembleSections(template, data);

      // Format and return final output
      return this.formatOutput(sections);
    } catch (error) {
      console.error('Error generating context with template engine:', error);
      // Fallback to basic template
      return this.getErrorContext(data);
    }
  }

  /**
   * Build template configuration based on project data
   */
  async buildTemplate(data: EnhancedContextData): Promise<ContextTemplate> {
    const sections: ContextSection[] = [];

    // 1. Project intro section (always included)
    sections.push({
      key: 'project-intro',
      title: '',
      content: await this.statementManager.getStatement('project-intro-statement'),
      conditional: false,
      order: 1
    });

    // 2. Context initialization prompt (always included)
    const contextInitPrompt = await this.promptParser.getContextInitializationPrompt();
    sections.push({
      key: 'context-init',
      title: '',
      content: contextInitPrompt?.content || 'Project context and environment details follow.',
      conditional: false,
      order: 2
    });

    // 3. Tools and MCP section (conditional)
    const hasToolsOrMCP = (data.availableTools && data.availableTools.length > 0) ||
                          (data.mcpServers && data.mcpServers.length > 0);
    
    if (hasToolsOrMCP) {
      sections.push({
        key: 'tools-section',
        title: '### 3rd-Party Tools & MCP',
        content: await this.sectionBuilder.buildToolsSection(data),
        conditional: true,
        condition: () => hasToolsOrMCP,
        order: 3
      });
    }

    // 4. Monorepo section (conditional)
    if (data.isMonorepo) {
      sections.push({
        key: 'monorepo-section',
        title: '### Monorepo Note',
        content: await this.sectionBuilder.buildMonorepoSection(data),
        conditional: true,
        condition: () => data.isMonorepo,
        order: 4
      });
    }

    // 5. Current events section (always included if present)
    if (data.recentEvents && data.recentEvents.trim()) {
      sections.push({
        key: 'current-events',
        title: '### Current Events',
        content: data.recentEvents,
        conditional: false,
        order: 5
      });
    }

    // 6. Instruction section (always included)
    sections.push({
      key: 'instruction',
      title: '### Instruction Prompt',
      content: await this.sectionBuilder.buildInstructionSection(data),
      conditional: false,
      order: 6
    });

    // 7. Additional notes section (conditional)
    if (data.additionalNotes && data.additionalNotes.trim()) {
      sections.push({
        key: 'additional-notes',
        title: '### Additional Notes',
        content: data.additionalNotes,
        conditional: false,
        order: 7
      });
    }

    return {
      sections,
      version: data.templateVersion || '1.0.0'
    };
  }

  /**
   * Assemble sections into final context string
   */
  async assembleSections(template: ContextTemplate, data: EnhancedContextData): Promise<string> {
    const processedSections: string[] = [];

    // Sort sections by order
    const sortedSections = template.sections.sort((a, b) => a.order - b.order);

    for (const section of sortedSections) {
      // Check conditional sections
      if (section.conditional && section.condition && !section.condition()) {
        continue;
      }

      // Process section content
      const processedContent = await this.processSection(section, data);
      
      if (processedContent.trim()) {
        processedSections.push(processedContent);
      }
    }

    // Combine sections with proper spacing
    return processedSections.join('\n\n');
  }

  /**
   * Process individual section with template variables
   */
  private async processSection(section: ContextSection, data: EnhancedContextData): Promise<string> {
    let content = section.content;

    // Replace template variables
    content = this.replaceTemplateVariables(content, data);

    // Add section title if present
    if (section.title) {
      content = `${section.title}\n${content}`;
    }

    return content;
  }

  /**
   * Replace template variables in content
   */
  private replaceTemplateVariables(content: string, data: EnhancedContextData): string {
    let result = content;

    // Replace basic variables
    result = result.replace(/{{projectName}}/g, data.projectName || '');
    result = result.replace(/{{template}}/g, data.template || '');
    result = result.replace(/{{slice}}/g, data.slice || '');
    result = result.replace(/{{instruction}}/g, data.instruction || '');
    result = result.replace(/{{isMonorepo}}/g, data.isMonorepo ? 'Yes' : 'No');

    // Replace array variables
    if (data.availableTools) {
      result = result.replace(/{{availableTools}}/g, data.availableTools.join(', '));
    }
    if (data.mcpServers) {
      result = result.replace(/{{mcpServers}}/g, data.mcpServers.join(', '));
    }

    return result;
  }

  /**
   * Format final output with cleanup
   */
  private formatOutput(content: string): string {
    // Remove excessive whitespace
    let formatted = content.replace(/\n{3,}/g, '\n\n');
    
    // Normalize line endings
    formatted = formatted.replace(/\r\n/g, '\n');
    
    // Trim leading/trailing whitespace
    formatted = formatted.trim();

    return formatted;
  }

  /**
   * Validate input data has required fields
   */
  private validateInputData(data: EnhancedContextData): void {
    const required = ['projectName', 'template', 'slice', 'instruction'];
    const missing = required.filter(field => !data[field as keyof EnhancedContextData]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
  }

  /**
   * Generate fallback context on error
   */
  private getErrorContext(data: EnhancedContextData): string {
    let fallback = DEFAULT_TEMPLATE;
    
    // Replace template variables
    fallback = fallback.replace('{{projectName}}', data.projectName || 'Unknown');
    fallback = fallback.replace('{{template}}', data.template || 'Unknown');
    fallback = fallback.replace('{{slice}}', data.slice || 'Unknown');
    fallback = fallback.replace('{{instruction}}', data.instruction || 'Unknown');
    fallback = fallback.replace('{{isMonorepo}}', data.isMonorepo ? 'Yes' : 'No');

    return fallback;
  }

  /**
   * Check if new template engine is enabled
   */
  isEnabled(): boolean {
    return this.enableNewEngine;
  }

  /**
   * Toggle template engine on/off for testing
   */
  setEnabled(enabled: boolean): void {
    this.enableNewEngine = enabled;
  }
}