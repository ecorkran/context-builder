/**
 * Data structure for context generation
 * Maps directly to template variables
 */
export interface ContextData {
  projectName: string;
  template: string;
  slice: string;
  instruction: string;
  isMonorepo: boolean;
  recentEvents: string;
  additionalNotes: string;
}

/**
 * Type for context generation functions
 */
export interface ContextGenerator {
  generateContext(data: ContextData): Promise<string>;
  processTemplate(template: string, data: ContextData): string;
  formatOutput(content: string): string;
}