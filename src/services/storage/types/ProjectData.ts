/**
 * Core data structure for project information
 */
export interface ProjectData {
  id: string;
  name: string;
  template: string;
  slice: string;
  instruction: string;
  workType?: 'start' | 'continue'; // For selecting appropriate opening statement
  isMonorepo: boolean;
  customData?: {
    recentEvents?: string;
    additionalNotes?: string;
    monorepoNote?: string;
    availableTools?: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Type for creating a new project (without auto-generated fields)
 * instruction, workType and customData are optional during creation and will get defaults
 */
export type CreateProjectData = Omit<ProjectData, 'id' | 'createdAt' | 'updatedAt' | 'instruction' | 'workType' | 'customData'> & {
  instruction?: string;
  workType?: 'start' | 'continue';
  customData?: {
    recentEvents?: string;
    additionalNotes?: string;
    monorepoNote?: string;
    availableTools?: string;
  };
};

/**
 * Type for updating an existing project (partial updates allowed)
 */
export type UpdateProjectData = Partial<Pick<ProjectData, 'name' | 'template' | 'slice' | 'instruction' | 'workType' | 'isMonorepo' | 'customData'>>;