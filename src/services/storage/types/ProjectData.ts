/**
 * Core data structure for project information
 */
export interface ProjectData {
  id: string;
  name: string;
  template: string;
  slice: string;
  isMonorepo: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Type for creating a new project (without auto-generated fields)
 */
export type CreateProjectData = Omit<ProjectData, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Type for updating an existing project (partial updates allowed)
 */
export type UpdateProjectData = Partial<Pick<ProjectData, 'name' | 'template' | 'slice' | 'isMonorepo'>>;