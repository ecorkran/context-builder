/**
 * Represents a system prompt extracted from the prompt file
 */
export interface SystemPrompt {
  /**
   * Display name of the prompt (from section header)
   */
  name: string;
  
  /**
   * Unique key identifier for the prompt
   */
  key: string;
  
  /**
   * The actual prompt content/text
   */
  content: string;
  
  /**
   * Parameters or variables referenced in the prompt
   */
  parameters: string[];
}

/**
 * Mapping of instruction types to system prompt names
 */
export interface InstructionMapping {
  [instruction: string]: string;
}

/**
 * Configuration for instruction type mappings
 */
export const INSTRUCTION_MAPPING: InstructionMapping = {
  'planning': 'Slice Planning (Phase 3)',
  'implementation': 'Slice | Feature Implementation (Phase 7)',
  'debugging': 'Analysis Task Implementation',
  'spec-creation': 'Spec Creation (Phase 2)',
  'slice-design': 'Slice Design (Phase 4)',
  'task-breakdown': 'Slice | Feature Task Breakdown (Phase 5)',
  'task-expansion': 'Slice Task Expansion (Phase 6)'
};

/**
 * Result of parsing the system prompt file
 */
export interface ParsedPromptFile {
  /**
   * All prompts found in the file
   */
  prompts: SystemPrompt[];
  
  /**
   * File metadata (version, last updated, etc)
   */
  metadata?: {
    version?: string;
    lastUpdated?: string;
  };
  
  /**
   * Any parsing errors encountered
   */
  errors: string[];
}

/**
 * Cache entry for parsed system prompts
 */
export interface PromptCacheEntry {
  /**
   * Parsed prompts
   */
  prompts: SystemPrompt[];
  
  /**
   * File modification time when cached
   */
  mtime: number;
  
  /**
   * Cache timestamp
   */
  cachedAt: number;
}

/**
 * Special prompt keys for commonly used prompts
 */
export enum SpecialPromptKeys {
  CONTEXT_INITIALIZATION = 'context-initialization',
  TOOL_USE = 'use-3rd-party-tool',
  PROJECT_KICKOFF = 'project-kickoff',
  FEATURE_DESIGN = 'feature-design'
}