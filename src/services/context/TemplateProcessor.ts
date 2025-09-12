import { ContextData } from './types/ContextData';

/**
 * Utility for processing template strings with variable substitution
 * Handles simple {{variable}} replacement and boolean conditionals
 */
export class TemplateProcessor {
  
  /**
   * Processes a template string by replacing variables with data values
   * @param template Template string with {{variable}} placeholders
   * @param data Context data to substitute into template
   * @returns Processed template string
   */
  processTemplate(template: string, data: ContextData): string {
    try {
      // Start with the template
      let processed = template;

      // Replace simple variables: {{variableName}}
      processed = processed.replace(/\{\{(\w+)\}\}/g, (match, variableName) => {
        const value = (data as any)[variableName];
        if (value !== undefined && value !== null) {
          return String(value);
        }
        
        // Log warning for missing variables but don't fail
        console.warn(`Template variable '${variableName}' not found in data, replacing with empty string`);
        return '';
      });

      // Handle boolean conditionals: {{#if isMonorepo}}Yes{{else}}No{{/if}}
      processed = this.processBooleanConditionals(processed, data);

      return processed;
    } catch (error) {
      console.error('Error processing template:', error);
      // Return original template with error message rather than failing
      return `${template}\n\n[Error processing template: ${error}]`;
    }
  }

  /**
   * Processes boolean conditional statements in template
   * Supports: {{#if variableName}}true content{{else}}false content{{/if}}
   * @param template Template string with conditional statements
   * @param data Context data for boolean evaluation
   * @returns Template with conditionals resolved
   */
  private processBooleanConditionals(template: string, data: ContextData): string {
    // Pattern: {{#if variableName}}true content{{else}}false content{{/if}}
    const conditionalPattern = /\{\{#if\s+(\w+)\}\}(.*?)\{\{else\}\}(.*?)\{\{\/if\}\}/gs;
    
    return template.replace(conditionalPattern, (match, variableName, trueContent, falseContent) => {
      try {
        const value = (data as any)[variableName];
        
        // Evaluate as boolean
        const isTrue = Boolean(value);
        
        return isTrue ? trueContent.trim() : falseContent.trim();
      } catch (error) {
        console.warn(`Error evaluating conditional for '${variableName}':`, error);
        // Default to false content on error
        return falseContent.trim();
      }
    });
  }

  /**
   * Validates that a template string is properly formatted
   * @param template Template string to validate
   * @returns True if template has valid syntax
   */
  validateTemplate(template: string): boolean {
    try {
      // Check for unmatched brackets
      const openBrackets = (template.match(/\{\{/g) || []).length;
      const closeBrackets = (template.match(/\}\}/g) || []).length;
      
      if (openBrackets !== closeBrackets) {
        return false;
      }

      // Check for proper conditional syntax
      const conditionalPattern = /\{\{#if\s+\w+\}\}.*?\{\{else\}\}.*?\{\{\/if\}\}/gs;
      const conditionals = template.match(conditionalPattern) || [];
      
      // If there are #if statements, they should all be properly closed
      const ifStatements = (template.match(/\{\{#if\s+\w+\}\}/g) || []).length;
      const endIfStatements = (template.match(/\{\{\/if\}\}/g) || []).length;
      
      return ifStatements === endIfStatements;
    } catch (error) {
      console.error('Template validation error:', error);
      return false;
    }
  }
}