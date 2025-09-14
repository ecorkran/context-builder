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
}