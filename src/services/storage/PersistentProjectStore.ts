/**
 * Persistent Project Store
 * Provides project CRUD operations with file system persistence via Electron IPC
 */

import { ProjectData, CreateProjectData, UpdateProjectData } from './types/ProjectData';
import { AppState, DEFAULT_APP_STATE } from './types/AppState';
import { ElectronStorageService } from './ElectronStorageService';

export class PersistentProjectStore {
  private storageService: ElectronStorageService;
  private appStateFile = 'app-state.json';
  
  constructor() {
    this.storageService = new ElectronStorageService();
  }

  /**
   * Generates a unique ID for new projects
   */
  private generateId(): string {
    return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Creates a default project for new users
   */
  private createDefaultProject(): ProjectData {
    const now = new Date().toISOString();
    return {
      id: this.generateId(),
      name: 'My Project',
      template: '',
      slice: '',
      instruction: 'implementation',
      workType: 'continue',
      isMonorepo: false,
      customData: {},
      createdAt: now,
      updatedAt: now,
    };
  }

  // Project Operations - Will be implemented in subsequent tasks
  async loadProjects(): Promise<ProjectData[]> {
    throw new Error('Not implemented yet - Task 2.2.1');
  }

  async saveProject(project: ProjectData): Promise<void> {
    throw new Error('Not implemented yet - Task 2.2.2');
  }

  async updateProject(id: string, updates: UpdateProjectData): Promise<void> {
    throw new Error('Not implemented yet - Task 2.2.3');
  }

  async deleteProject(id: string): Promise<void> {
    throw new Error('Not implemented yet - Task 2.2.4');
  }

  // App State Operations - Will be implemented in subsequent tasks
  async getAppState(): Promise<AppState> {
    throw new Error('Not implemented yet - Task 2.3.1');
  }

  async updateAppState(updates: Partial<AppState>): Promise<void> {
    throw new Error('Not implemented yet - Task 2.3.2');
  }

  async getLastActiveProject(): Promise<string | null> {
    throw new Error('Not implemented yet - Task 2.3.3');
  }

  async setLastActiveProject(projectId: string): Promise<void> {
    throw new Error('Not implemented yet - Task 2.3.3');
  }
}