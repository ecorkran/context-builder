---
slice: foundation
project: context-builder
lld: private/slices/040-slice.foundation.md
dependencies: [electron-setup, manta-templates-integration]
projectState: Phase 6 task expansion for foundation slice
lastUpdated: 2025-09-10
---

## Context Summary
- Working on foundation slice
- Establishes core layout structure and local storage for the application
- Dependencies: Electron application setup and manta-templates integration already complete
- This slice delivers: Split-pane layout system and JSON-based project data persistence
- Next planned slice: Basic Context Generation

## Foundation Tasks

### Task 1: Create Core Layout Components
**Owner**: Junior AI
**Effort**: 3
**Objective**: Implement the split-pane layout system with draggable splitter

**Layout Components**:
- [x] **Create AppShell.tsx**:
  - File: `src/components/layout/AppShell.tsx`
  - Container component with full-height layout
  - Integrates SplitPaneLayout as main content area
  - Uses manta-templates design tokens for consistent styling

- [x] **Create SplitPaneLayout.tsx**: (Using react-resizable-panels)
  - [x] Create base component file `src/components/layout/SplitPaneLayout.tsx`
  - [x] Implement layout structure using react-resizable-panels
    1. Uses PanelGroup and Panel components for flexible sizing
    2. Default configuration: 40/60 split (left panel, right panel)
    3. Full height container with proper overflow handling
  - [x] Create draggable resize handle
    1. PanelResizeHandle with `cursor-col-resize` styling
    2. Drag operations handled automatically by library
    3. Smooth resizing with built-in constraints
  - [x] Add split ratio persistence
    1. autoSaveId="context-builder-layout" saves to localStorage
    2. Automatically loads saved ratio on component mount
    3. Constrained between 25%-75% via minSize/maxSize props
  - [ ] Implement responsive stacking
    1. Use CSS media queries for screens < 768px width
    2. Stack panels vertically with `grid-template-rows`
    3. Hide resize handle on narrow screens

- [x] **Create LeftPanel.tsx**:
  - File: `src/components/layout/LeftPanel.tsx`
  - Container for form controls and input elements
  - Minimum width constraint (min-w-80)
  - Proper padding and spacing using Tailwind classes

- [x] **Create RightPanel.tsx**:
  - File: `src/components/layout/RightPanel.tsx`
  - Container for output display area
  - Flexible width (flex-1)
  - Vertical scroll capability for long content

**Success Criteria**:
- [x] Split-pane layout renders correctly at 1024x768 minimum resolution
- [x] Drag handle allows resizing between 25%-75% split ratios
- [x] Layout maintains proportions during window resize
- [x] Components use manta-templates styling consistently

### Task 2: Implement Local Storage System
**Owner**: Junior AI
**Effort**: 4
**Objective**: Create JSON-based project data persistence with error handling

**Storage Service Components**:
- [x] **Create ProjectData types**:
  - [x] Create types file `src/services/storage/types/ProjectData.ts`
  - [x] Define ProjectData interface:
    ```typescript
    interface ProjectData {
      id: string;
      name: string;
      template: string;
      slice: string;
      isMonorepo: boolean;
      createdAt: string;
      updatedAt: string;
    }
    ```
  - [x] Export interface and create type utilities
    1. Export `ProjectData` interface
    2. Create `CreateProjectData` type: `Omit<ProjectData, 'id' | 'createdAt' | 'updatedAt'>`
    3. Create `UpdateProjectData` type: `Partial<Pick<ProjectData, 'name' | 'template' | 'slice' | 'isMonorepo'>>`

- [x] **Create StorageService.ts**:
  - [x] Create service file `src/services/storage/StorageService.ts`
  - [x] Implement file path resolution
    1. Use Electron's `app.getPath('userData')` for base directory
    2. Create `context-builder` subdirectory if not exists
    3. Set main file path: `{userData}/context-builder/projects.json`
    4. Set backup file path: `{userData}/context-builder/projects.backup.json`
  - [x] Implement atomic write operations
    1. Create backup of existing file before write
    2. Write new data to temporary file first
    3. Rename temporary file to main file (atomic operation)
    4. Only remove backup after successful write
  - [x] Add JSON validation
    1. Parse JSON and validate structure on read
    2. Check for required fields in ProjectData array
    3. Return empty array for corrupted/missing files
    4. Log validation errors for debugging

- [x] **Create ProjectStore.ts**:
  - File: `src/services/storage/ProjectStore.ts`
  - CRUD operations: load, save, create, update, delete
  - Uses StorageService for file operations
  - Implements ProjectData interface consistently
  - Auto-generates UUIDs for new projects

**Storage Operations**:
- [ ] **Implement atomic file writes**:
  - Create backup before writing
  - Write to temporary file first, then rename
  - Validate JSON structure after write

- [ ] **Implement corruption recovery**:
  - JSON parse error handling
  - Restore from backup if main file corrupted
  - User notification for data recovery actions

**Success Criteria**:
- [ ] Projects persist between application sessions
- [ ] Multiple projects can be stored and retrieved
- [ ] File corruption handled gracefully with backup restoration
- [ ] All CRUD operations complete without data loss
- [ ] Storage location uses correct app data directory

### Task 3: Create Electron Main Process Integration
**Owner**: Junior AI
**Effort**: 2
**Objective**: Set up IPC communication for file system access

**IPC Setup**:
- [ ] **Configure main process handlers**:
  - [ ] Add IPC handlers in main Electron process
    1. Register handler for `storage:read` channel
    2. Register handler for `storage:write` channel
    3. Register handler for `storage:backup` channel
  - [ ] Implement file system security
    1. Restrict file access to app data directory only
    2. Validate file paths to prevent directory traversal
    3. Handle permission errors gracefully

- [ ] **Create renderer process storage client**:
  - [ ] Create client file `src/services/storage/StorageClient.ts`
  - [ ] Implement IPC communication methods
    1. Create `readFile()` method using `window.electronAPI.invoke('storage:read')`
    2. Create `writeFile()` method using `window.electronAPI.invoke('storage:write')`
    3. Create `createBackup()` method using `window.electronAPI.invoke('storage:backup')`
  - [ ] Add error handling
    1. Wrap IPC calls in try/catch blocks
    2. Transform Electron errors to application errors
    3. Provide meaningful error messages to UI components

**Success Criteria**:
- [ ] Renderer process can access file system through main process
- [ ] Storage operations work correctly in Electron environment
- [ ] Security context properly isolates file access

### Task 4: Layout Integration and Testing
**Owner**: Junior AI
**Effort**: 2
**Objective**: Integrate layout components and verify responsive behavior

**Integration Tasks**:
- [x] **Connect components in main app**:
  - Update main App component to use AppShell
  - Verify component tree renders correctly
  - Test layout at various window sizes

- [x] **Implement splitter functionality**: (Handled by react-resizable-panels)
  - Mouse down/move/up event handlers
  - Column width calculation and CSS Grid updates
  - Persistence of user's preferred split ratio

- [ ] **Responsive testing**:
  - Verify layout works at 1024x768 minimum
  - Test stacking behavior for narrow windows
  - Confirm all interactive elements remain accessible

**Success Criteria**:
- [ ] Layout renders correctly across target screen sizes
- [ ] Splitter drag functionality works smoothly
- [ ] User's split preference persists between sessions
- [ ] No layout breaks or overlapping elements

### Task 5: Storage Integration Testing
**Owner**: Junior AI
**Effort**: 1
**Objective**: Verify storage system works end-to-end

**Testing Tasks**:
- [ ] **Test CRUD operations**:
  - Create new project data
  - Read existing projects
  - Update project properties
  - Delete projects

- [ ] **Test error scenarios**:
  - Corrupted JSON file recovery
  - Permission denied handling
  - Disk full scenarios (graceful degradation)

- [ ] **Test data persistence**:
  - Application restart with data intact
  - Multiple project management
  - Concurrent access handling

**Success Criteria**:
- [ ] All storage operations complete successfully
- [ ] Error scenarios handled gracefully with user feedback
- [ ] Data integrity maintained across application sessions
- [ ] Storage system ready for feature slice integration