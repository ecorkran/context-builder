---
item: persistence
project: context-builder
type: slice-tasks
lldReference: private/slices/050-slice.persistence.md
dependencies: [foundation, context-templates]
projectState: Ready for implementation - storage infrastructure exists
lastUpdated: 2025-01-27
---

# Task Breakdown: Persistence & Multi-Project Foundation

## Context Summary

This slice implements data persistence so users' work survives app restarts. We're building with an implicit project model that works for single-project use immediately but supports multi-project workflows without requiring UI changes. The implementation uses existing ElectronStorageService infrastructure with IPC communication for secure file system access.

Phase 1 focuses on automatic persistence without any UI changes. Phase 2 (future) will add project management UI on top of the same foundation.

## Task List

### Task 1: Create App State Types and Interfaces
**Effort: 1/5**

- [x] **Task 1.1: Create AppState Type Definition**
  - Create `src/services/storage/types/AppState.ts`
  - Define AppState interface with lastActiveProjectId, windowBounds, panelSizes, appVersion, lastOpened
  - Export all types for use in storage services
  - **Success:** TypeScript types compile without errors

- [x] **Task 1.2: Extend ProjectData Type**
  - Update `src/services/storage/types/ProjectData.ts` if needed
  - Ensure all form fields are captured in ProjectData interface
  - Add any missing fields (availableTools, recentEvents, etc.)
  - **Success:** ProjectData type captures all form state

### Task 2: Create PersistentProjectStore Service
**Effort: 3/5**

- [x] **Task 2.1: Create PersistentProjectStore Class Structure**
  - Create `src/services/storage/PersistentProjectStore.ts`
  - Import ElectronStorageService and StorageClient
  - Create class with private storage service instance
  - Add constructor with initialization logic
  - **Success:** Basic class structure exists and compiles

- [x] **Task 2.2: Implement Project Operations**
  - [x] **2.2.1: Implement loadProjects() method**
    - Call ElectronStorageService.readProjects()
    - Handle empty state (return empty array)
    - Add error handling with console logging
    - **Success:** Can load existing projects or return empty array
  
  - [x] **2.2.2: Implement saveProject() method**
    - Validate project data before saving
    - Call ElectronStorageService.writeProjects() with updated array
    - Handle write errors gracefully
    - **Success:** New projects persist to disk
  
  - [x] **2.2.3: Implement updateProject() method**
    - Find project by ID in loaded projects
    - Merge updates with existing data
    - Update the updatedAt timestamp
    - Save entire projects array back to disk
    - **Success:** Project updates persist correctly
  
  - [x] **2.2.4: Implement deleteProject() method**
    - Filter out project by ID
    - Save updated projects array
    - Handle case where project doesn't exist
    - **Success:** Projects can be removed from storage

- [x] **Task 2.3: Implement App State Operations**
  - [x] **2.3.1: Implement getAppState() method**
    - Read from 'app-state.json' file
    - Return default state if file doesn't exist
    - Parse JSON and validate structure
    - **Success:** App state loads or returns defaults
  
  - [x] **2.3.2: Implement updateAppState() method**
    - Merge partial updates with existing state
    - Update lastOpened timestamp
    - Write to 'app-state.json' atomically
    - **Success:** App state changes persist
  
  - [x] **2.3.3: Implement lastActiveProject helpers**
    - Add getLastActiveProject() method
    - Add setLastActiveProject() method
    - These should use app state internally
    - **Success:** Can track which project was last used

- [x] **Task 2.4: Add Utility Methods**
  - [x] **2.4.1: Implement generateId() helper**
    - Create unique project IDs using timestamp + random
    - Format: `project_${Date.now()}_${randomString}`
    - **Success:** Generated IDs are unique
  
  - [x] **2.4.2: Implement createDefaultProject() method**
    - Create project with sensible defaults
    - Set name to "My Project"
    - Initialize all required fields
    - **Success:** Default project has all required fields

### Task 3: Integrate Persistence with ContextBuilderApp
**Effort: 3/5**

- [ ] **Task 3.1: Add Persistence State Management**
  - [ ] **3.1.1: Add storage service instance**
    - Import PersistentProjectStore in ContextBuilderApp
    - Create instance as component-level constant or context
    - Handle initialization errors
    - **Success:** Storage service available in component
  
  - [ ] **3.1.2: Add currentProjectId state**
    - Add useState for tracking current project ID
    - Initialize as null until loaded
    - Update when project changes
    - **Success:** Component tracks active project

- [ ] **Task 3.2: Implement Load on Mount**
  - [ ] **3.2.1: Create loadLastSession effect**
    - Add useEffect with empty dependency array
    - Load all projects from storage
    - Get last active project ID from app state
    - **Success:** Effect runs once on mount
  
  - [ ] **3.2.2: Handle initial project creation**
    - Check if any projects exist
    - If none, create and save default project
    - Set default project as active
    - **Success:** First-time users get a default project
  
  - [ ] **3.2.3: Restore last active project**
    - Find project by last active ID
    - Fall back to first project if not found
    - Populate form with project data
    - **Success:** Form shows last session's data

- [ ] **Task 3.3: Implement Auto-Save on Change**
  - [ ] **3.3.1: Create auto-save effect**
    - Add useEffect watching formData changes
    - Skip if no current project ID
    - Add 500ms debounce timer
    - **Success:** Effect triggers on form changes
  
  - [ ] **3.3.2: Implement save logic**
    - Clear previous timer on new changes
    - After debounce, call updateProject()
    - Handle save errors (log, don't crash)
    - **Success:** Changes persist after 500ms pause
  
  - [ ] **3.3.3: Update last active project**
    - Call setLastActiveProject on saves
    - Update app state with current timestamp
    - **Success:** App remembers last edited project

- [ ] **Task 3.4: Add Loading States**
  - [ ] **3.4.1: Add isLoading state**
    - Track initial load status
    - Show loading indicator during startup
    - Prevent form interaction while loading
    - **Success:** User sees loading feedback
  
  - [ ] **3.4.2: Add save indicator**
    - Track save status (saving/saved/error)
    - Show subtle indicator (e.g., dot or text)
    - Clear after successful save
    - **Success:** User knows when data is saved

### Task 4: Handle Edge Cases and Errors
**Effort: 2/5**

- [ ] **Task 4.1: Handle Storage Errors**
  - Add try-catch blocks around all storage operations
  - Log errors to console with meaningful messages
  - Show user-friendly error messages if critical
  - Fall back to in-memory operation if storage fails
  - **Success:** App doesn't crash on storage errors

- [ ] **Task 4.2: Handle Corrupt Data**
  - Validate loaded project data structure
  - Skip invalid projects with warning
  - Create new default if all projects invalid
  - Back up corrupt file before overwriting
  - **Success:** App recovers from corrupt storage

- [ ] **Task 4.3: Handle Race Conditions**
  - Ensure only one save operation at a time
  - Cancel pending saves when component unmounts
  - Handle rapid project switches correctly
  - **Success:** No data loss from concurrent operations

### Task 5: Add IPC Handlers for App State
**Effort: 2/5**

- [ ] **Task 5.1: Create Main Process Handlers**
  - Add app-state read handler in main process
  - Add app-state write handler in main process
  - Register handlers in contextServices.ts
  - Handle file operations with proper error handling
  - **Success:** Main process can read/write app-state.json

- [ ] **Task 5.2: Update Preload Script**
  - Add app-state methods to electronAPI interface
  - Expose getAppState and updateAppState via IPC
  - Update TypeScript definitions
  - **Success:** Renderer can access app state via IPC

- [ ] **Task 5.3: Update StorageClient**
  - Add app state methods to StorageClient class
  - Implement proper error handling and fallbacks
  - Test IPC communication works correctly
  - **Success:** StorageClient provides app state access

### Task 6: Testing and Validation
**Effort: 2/5**

- [ ] **Task 6.1: Test Normal Flow**
  - Enter data in form
  - Wait for auto-save (500ms)
  - Restart app
  - Verify data restored correctly
  - **Success:** Basic persistence works

- [ ] **Task 6.2: Test Error Scenarios**
  - Test with corrupted projects.json
  - Test with missing app-state.json
  - Test with storage permission errors
  - Test rapid form changes
  - **Success:** App handles errors gracefully

- [ ] **Task 6.3: Test First-Time User Experience**
  - Delete all storage files
  - Start app fresh
  - Verify default project created
  - Verify can enter and save data
  - **Success:** New users have smooth experience

- [ ] **Task 6.4: Performance Testing**
  - Measure save time for typical project
  - Verify < 50ms for normal saves
  - Check no UI lag during auto-save
  - Monitor memory usage over time
  - **Success:** Performance meets requirements

## Task Dependencies

### Sequential Dependencies
- Task 1 (Types) must complete before Task 2 (Store Service)
- Task 2 (Store Service) must complete before Task 3 (Integration)
- Task 5 (IPC Handlers) should complete before Task 3 (Integration)
- Tasks 1-3 must complete before Task 4 (Edge Cases)
- All implementation tasks before Task 6 (Testing)

### Parallel Work Opportunities
- Task 1 (Types) and Task 5 (IPC) can be done in parallel
- Task 4 (Edge Cases) can be developed alongside Task 3 (Integration)

## Success Criteria Summary

Upon completion of all tasks:
- [ ] User data persists between app sessions
- [ ] No explicit save/load actions required
- [ ] App remembers last edited project
- [ ] Graceful handling of storage errors
- [ ] Performance within specified limits (< 50ms saves)
- [ ] Clean foundation for multi-project support

## Implementation Notes

### Key Decisions
- Use debounced auto-save (500ms) to balance responsiveness and performance
- Single implicit project for Phase 1, expandable to multi-project
- Atomic writes to prevent corruption
- Silent error recovery where possible

### Future Considerations (Phase 2)
- Project selector dropdown UI
- Project management operations (new, delete, rename)
- Import/export functionality
- Project templates and presets