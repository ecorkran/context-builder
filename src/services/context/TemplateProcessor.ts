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

      // First handle boolean conditionals: {{#if isMonorepo}}Yes{{else}}No{{/if}}
      processed = this.processBooleanConditionals(processed, data);

      // Then replace simple variables: {{variableName}} and {variableName}
      // First handle double brace format: {{variableName}}
      processed = processed.replace(/\{\{(\w+)\}\}/g, (match, variableName) => {
        const value = (data as any)[variableName];
        if (value !== undefined && value !== null) {
          return String(value);
        }
        
        // Log warning for missing variables but don't fail
        console.warn(`Template variable '${variableName}' not found in data, replacing with empty string`);
        return '';
      });
      
      // Then handle single brace format with more flexible patterns: {variableName}, {slice | feature}, etc.
      processed = processed.replace(/\{([^}]+)\}/g, (match, expression) => {
        // Handle pipe expressions like {slice | feature}
        if (expression.includes(' | ')) {
          const parts = expression.split(' | ').map(part => part.trim());
          // Use the first part as the primary variable name
          const primaryVar = parts[0];
          const value = (data as any)[primaryVar];
          if (value !== undefined && value !== null) {
            return String(value);
          }
          // If primary variable not found, return the expression as-is for now
          return expression;
        }
        
        // Handle simple variable names with common aliases
        let variableName = expression;
        
        // Map common template variables to data field names
        if (expression === 'project') {
          variableName = 'projectName';
        }
        
        const value = (data as any)[variableName];
        if (value !== undefined && value !== null) {
          return String(value);
        }
        
        // For parameters that might not be in our data, don't log warnings
        // These might be template placeholders that should remain as-is
        return expression;
      });

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
        
        return isTrue ? trueContent : falseContent;
      } catch (error) {
        console.warn(`Error evaluating conditional for '${variableName}':`, error);
        // Default to false content on error
        return falseContent;
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