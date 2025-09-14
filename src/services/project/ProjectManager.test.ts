import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProjectManager } from './ProjectManager'
import { PersistentProjectStore } from '../storage/PersistentProjectStore'
import { ProjectData } from '../storage/types/ProjectData'

// Mock PersistentProjectStore
vi.mock('../storage/PersistentProjectStore')

describe('ProjectManager', () => {
  let projectManager: ProjectManager
  let mockPersistentStore: ReturnType<typeof vi.mocked<PersistentProjectStore>>
  let mockProjects: ProjectData[]

  beforeEach(() => {
    // Create mock projects with different update times
    mockProjects = [
      {
        id: 'project-1',
        name: 'Test Project 1',
        template: 'react',
        slice: 'foundation',
        instruction: 'implementation',
        workType: 'continue',
        isMonorepo: false,
        customData: {},
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z' // older
      },
      {
        id: 'project-2', 
        name: 'Test Project 2',
        template: 'nextjs',
        slice: 'feature',
        instruction: 'implementation',
        workType: 'continue',
        isMonorepo: true,
        customData: {},
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T10:00:00Z' // newer
      }
    ]

    // Create mock store instance
    mockPersistentStore = vi.mocked(new PersistentProjectStore())
    
    // Mock store methods
    mockPersistentStore.loadProjects = vi.fn().mockResolvedValue(mockProjects)
    mockPersistentStore.getLastActiveProject = vi.fn().mockResolvedValue('project-2')
    
    // Create ProjectManager with mocked store
    projectManager = new ProjectManager(mockPersistentStore)
  })

  describe('loadAllProjects', () => {
    it('should load and sort projects by updated date (newest first)', async () => {
      const result = await projectManager.loadAllProjects()
      
      expect(mockPersistentStore.loadProjects).toHaveBeenCalled()
      expect(result).toHaveLength(2)
      // Should be sorted by updatedAt, newest first
      expect(result[0].id).toBe('project-2') // newer project first
      expect(result[1].id).toBe('project-1') // older project second
    })

    it('should return empty array on error', async () => {
      mockPersistentStore.loadProjects = vi.fn().mockRejectedValue(new Error('Storage error'))
      
      const result = await projectManager.loadAllProjects()
      
      expect(result).toEqual([])
    })
  })

  describe('getCurrentProject', () => {
    it('should return current project when found', async () => {
      const result = await projectManager.getCurrentProject()
      
      expect(mockPersistentStore.getLastActiveProject).toHaveBeenCalled()
      expect(mockPersistentStore.loadProjects).toHaveBeenCalled()
      expect(result).not.toBeNull()
      expect(result?.id).toBe('project-2')
      expect(result?.name).toBe('Test Project 2')
    })

    it('should return null when no active project ID', async () => {
      mockPersistentStore.getLastActiveProject = vi.fn().mockResolvedValue(null)
      
      const result = await projectManager.getCurrentProject()
      
      expect(result).toBeNull()
    })

    it('should return null when active project not found in projects list', async () => {
      mockPersistentStore.getLastActiveProject = vi.fn().mockResolvedValue('non-existent-project')
      
      const result = await projectManager.getCurrentProject()
      
      expect(result).toBeNull()
    })

    it('should return null on error', async () => {
      mockPersistentStore.getLastActiveProject = vi.fn().mockRejectedValue(new Error('Storage error'))
      
      const result = await projectManager.getCurrentProject()
      
      expect(result).toBeNull()
    })
  })

  describe('getProjectCount', () => {
    it('should return correct project count', async () => {
      const result = await projectManager.getProjectCount()
      
      expect(result).toBe(2)
    })

    it('should return 0 on error', async () => {
      mockPersistentStore.loadProjects = vi.fn().mockRejectedValue(new Error('Storage error'))
      
      const result = await projectManager.getProjectCount()
      
      expect(result).toBe(0)
    })
  })

  describe('hasMultipleProjects', () => {
    it('should return true when multiple projects exist', async () => {
      const result = await projectManager.hasMultipleProjects()
      
      expect(result).toBe(true)
    })

    it('should return false when only one project exists', async () => {
      mockPersistentStore.loadProjects = vi.fn().mockResolvedValue([mockProjects[0]])
      
      const result = await projectManager.hasMultipleProjects()
      
      expect(result).toBe(false)
    })

    it('should return false when no projects exist', async () => {
      mockPersistentStore.loadProjects = vi.fn().mockResolvedValue([])
      
      const result = await projectManager.hasMultipleProjects()
      
      expect(result).toBe(false)
    })

    it('should return false on error', async () => {
      mockPersistentStore.loadProjects = vi.fn().mockRejectedValue(new Error('Storage error'))
      
      const result = await projectManager.hasMultipleProjects()
      
      expect(result).toBe(false)
    })
  })

  describe('getProjectNames', () => {
    it('should return array of project names', async () => {
      const result = await projectManager.getProjectNames()
      
      expect(result).toEqual(['Test Project 2', 'Test Project 1']) // sorted by update date
    })

    it('should return empty array on error', async () => {
      mockPersistentStore.loadProjects = vi.fn().mockRejectedValue(new Error('Storage error'))
      
      const result = await projectManager.getProjectNames()
      
      expect(result).toEqual([])
    })
  })
})