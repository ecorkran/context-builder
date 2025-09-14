/**
 * ProjectManager Service
 * High-level service for managing multiple projects and coordinating with persistence layer
 */

import { PersistentProjectStore } from '../storage/PersistentProjectStore';
import { ProjectData } from '../storage/types/ProjectData';

export class ProjectManager {
  private persistentStore: PersistentProjectStore;

  constructor(persistentStore?: PersistentProjectStore) {
    // Dependency injection pattern - allows for testing with mock store
    this.persistentStore = persistentStore || new PersistentProjectStore();
  }

  /**
   * Load all projects from storage, sorted by most recent first
   * @returns Array of projects or empty array on error
   */
  async loadAllProjects(): Promise<ProjectData[]> {
    try {
      const projects = await this.persistentStore.loadProjects();
      
      // Sort by updatedAt (most recent first)
      return projects.sort((a, b) => {
        const dateA = new Date(a.updatedAt);
        const dateB = new Date(b.updatedAt);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error('ProjectManager: Error loading projects:', error);
      // Return empty array on error - graceful degradation
      return [];
    }
  }

  /**
   * Get the current active project from app state
   * @returns Current project data or null if not found
   */
  async getCurrentProject(): Promise<ProjectData | null> {
    try {
      // Get current project ID from app state
      const currentProjectId = await this.persistentStore.getLastActiveProject();
      if (!currentProjectId) {
        return null;
      }

      // Load all projects and find the current one
      const projects = await this.loadAllProjects();
      const currentProject = projects.find(p => p.id === currentProjectId);
      
      return currentProject || null;
    } catch (error) {
      console.error('ProjectManager: Error getting current project:', error);
      return null;
    }
  }

  /**
   * Get the total number of projects
   * @returns Number of projects
   */
  async getProjectCount(): Promise<number> {
    try {
      const projects = await this.loadAllProjects();
      return projects.length;
    } catch (error) {
      console.error('ProjectManager: Error getting project count:', error);
      return 0;
    }
  }

  /**
   * Check if there are multiple projects
   * @returns True if more than one project exists
   */
  async hasMultipleProjects(): Promise<boolean> {
    try {
      const count = await this.getProjectCount();
      return count > 1;
    } catch (error) {
      console.error('ProjectManager: Error checking multiple projects:', error);
      return false;
    }
  }

  /**
   * Get array of all project names
   * @returns Array of project names
   */
  async getProjectNames(): Promise<string[]> {
    try {
      const projects = await this.loadAllProjects();
      return projects.map(p => p.name);
    } catch (error) {
      console.error('ProjectManager: Error getting project names:', error);
      return [];
    }
  }
}