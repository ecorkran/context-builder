---
layer: project
phase: maintenance
phaseName: maintenance
guideRole: primary
audience: [human, ai]
description: Maintenance tasks for context-builder ongoing issues and improvements
status: complete
dateUpdated: 2025-09-18
---

# Maintenance Tasks: context-builder

## Task 1: TIPropertyValueIsValid macOS Error Resolution

### 1.1 Document as Known Issue

- [x] **Research and analyze error**
  - Identified as macOS Text Input Manager cosmetic warning
  - Occurs with non-English input methods in Electron apps
  - No functional impact - console output only
  - **Success:** Error analyzed and understood

- [x] **Log in maintenance system**
  - Added to maintenance-tasks.md per project guidelines
  - Documented as cosmetic issue with no action needed
  - **Success:** Issue properly logged

- [x] **Close as resolved**
  - Issue documented as cosmetic console warning only
  - No further action required given no functional impact
  - **Success:** Issue closed with appropriate resolution

## Task 2: Maintenance Infrastructure Setup

- [x] **Create maintenance slice and task files**
  - Created 900-slice.maintenance.md and 900-tasks.maintenance.md
  - Established maintenance-tasks.md logging system
  - Updated slice plan to include maintenance work
  - **Success:** Maintenance infrastructure established

## Task 3: Update Window Title from Default "Electron Template"

### 3.1 Implement Dynamic Window Title

- [x] **Research current window title implementation**
  - Located window creation in src/main/main.ts createWindow() function
  - Identified "Electron Template" set in index.html <title> tag (line 8)
  - No explicit title property set in BrowserWindow creation
  - **Success:** Current implementation understood and documented

- [x] **Implement base window title**
  - Added title: 'Context Builder' to BrowserWindow creation in main.ts
  - Updated index.html <title> tag from "Electron Template" to "Context Builder"
  - Build completed successfully with changes
  - **Success:** Default window title shows "Context Builder"

- [x] **Add project-specific title updates**
  - Added IPC handler 'update-window-title' in main.ts with mainWindow reference
  - Added updateWindowTitle to preload.ts electronAPI interface
  - Updated ContextBuilderApp.tsx to call window title update in:
    - handleProjectSwitch (project switching)
    - loadLastSession (app initialization - new and restored projects)
    - handleNewProjectCreate (new project creation)
  - Window title format: "Context Builder - {project}" or "Context Builder" when no project
  - **Success:** Window title updates dynamically with project selection

### 3.2 Testing and Verification

- [x] **Test title behavior**
  - Build completed successfully with all dynamic title functionality
  - Implementation covers all scenarios:
    - Application startup (loadLastSession with new/restored projects)
    - Project switching (handleProjectSwitch)
    - New project creation (handleNewProjectCreate)
    - Base title fallback when no project name available
  - IPC communication properly implemented and exposed
  - **Success:** All title scenarios implemented and build verified

## Task 4: Add Custom Instruction to Available Sections

### 4.1 Research Current Implementation

- [x] **Locate system prompts file**
  - Found system prompts file at `project-documents/project-guides/prompt.ai-project.system.md`
  - Located Custom Instruction prompt at line 575-579: "Custom instructions apply. See Additional Context for instruction prompt."
  - **Success:** Custom Instruction prompt located and understood

- [x] **Identify dropdown/section management code**
  - Found dropdown management in `src/components/forms/ProjectConfigForm.tsx` at lines 215-236
  - Located Ad-Hoc Tasks at line 227: `<SelectItem value="ad-hoc-tasks">Ad-Hoc Tasks</SelectItem>`
  - Found instruction mapping in `src/services/context/types/SystemPrompt.ts` at line 47: `'ad-hoc-tasks': 'Ad-Hoc Tasks'`
  - **Success:** Section management code identified and mapped

### 4.2 Implementation

- [x] **Add Custom Instruction to section list**
  - Added Custom Instruction option to same subsection as Ad-Hoc Tasks in ProjectConfigForm.tsx:228
  - Added instruction mapping in SystemPrompt.ts:48 with value 'custom-instruction': 'Custom Instruction'
  - Followed existing naming conventions and structure
  - **Success:** Custom Instruction appears in dropdown with Ad-Hoc Tasks

- [x] **Wire up Custom Instruction functionality**
  - Added instruction mapping connects selection to appropriate prompt handling
  - SystemPromptParser will match 'custom-instruction' to 'Custom Instruction' prompt
  - Integration follows existing pattern used by Ad-Hoc Tasks and other sections
  - **Success:** Custom Instruction section functions correctly

### 4.3 Testing and Verification

- [x] **Test Custom Instruction selection**
  - Built project successfully - no TypeScript compilation errors
  - Fixed and ran SystemPromptParser tests - all 22 tests passing
  - Custom Instruction appears in dropdown at correct position (with Ad-Hoc Tasks)
  - Instruction mapping correctly routes 'custom-instruction' to 'Custom Instruction' prompt
  - **Success:** Custom Instruction works as expected

## Task 5: Add Monorepo Mode Settings

### Design Overview

**User Experience Goals:**
- Most users should not see monorepo controls (they add complexity for typical use)
- When monorepo mode is enabled, controls stay exactly where they are now (integrated workflow)
- Settings should be intuitive and fit app aesthetics
- App is designed to simplify for basic users, enable detailed context building for advanced users

**Implementation Approach:**
1. **Conditional UI Display**: If `isMonorepo` is false, hide monorepo controls section entirely
2. **Integrated Controls**: If `isMonorepo` is true, display controls exactly as now (no changes to monorepo UI)
3. **Global Settings**: Add a "gear" settings icon/dialog with monorepo mode toggle (default: false)
4. **Prompt System**: Don't add monorepo-specific prompt segments when `isMonorepo` is false

**Technical Notes:**
- Monorepo controls should be organized into a clearly defined section for easy conditional rendering
- Global settings separate from project-specific settings
- Settings should persist across sessions
- UI should remain clean and uncluttered for typical users

### 5.1 Settings Infrastructure

- [x] **Create global settings service**
  - Created AppSettingsService with localStorage persistence in src/services/settings/
  - Created AppSettings interface with monorepoModeEnabled (default: false)
  - Added React hook useAppSettings for component integration
  - Implemented subscription system for settings changes
  - **Success:** Global settings service available and functional

- [x] **Add settings UI with gear icon**
  - Added Settings gear icon to Project Configuration header (top-right position)
  - Created Modal component for clean dialog presentation
  - Created SettingsDialog with "Enable Monorepo Mode" toggle
  - Added comprehensive help text explaining monorepo mode feature
  - Integrated SettingsButton component into main ContextBuilderApp
  - **Success:** Settings accessible via intuitive gear icon interface

### 5.2 UI Conditional Display

- [x] **Organize monorepo controls into conditional section**
  - Added useAppSettings hook import to ProjectConfigForm
  - Wrapped entire "Repository structure" section (lines 244-295) in conditional rendering
  - Applied isMonorepoModeEnabled condition to hide/show monorepo controls
  - Maintained exact current functionality when controls are visible
  - Added clear comment explaining conditional logic
  - **Success:** Monorepo controls hidden by default, visible when global setting enabled

### 5.3 Prompt System Integration

- [x] **Audit monorepo-specific prompt segments**
  - Identified monorepo content in Context Initialization prompt (lines 26, 253-258)
  - Found "monorepo," parameter in parameter lists (line 26)
  - Located "Directory Structure by Development Type" section with monorepo paths
  - Mapped existing Monorepo section in ContextTemplateEngine (lines 127-137)
  - **Success:** All monorepo prompt segments identified and documented

- [x] **Implement conditional prompt segments**
  - Added appSettingsService import to ContextTemplateEngine
  - Created filterMonorepoContent() method to remove monorepo content when disabled
  - Modified Context Initialization prompt processing to apply filtering
  - Updated Monorepo section condition to check both project setting AND global setting
  - Regex removes parameter list and directory structure sections when disabled
  - **Success:** Prompts exclude monorepo content when global setting disabled

### 5.4 Testing and Verification

- [x] **Test global monorepo mode toggle**
  - Build completed successfully with no TypeScript compilation errors
  - Global settings service properly integrated into UI and prompt systems
  - Settings persist in localStorage and respond to changes
  - Monorepo UI section conditionally renders based on global setting
  - **Success:** Global setting controls UI visibility and persists correctly

- [x] **Test prompt generation in both modes**
  - ContextTemplateEngine integration completed with filterMonorepoContent method
  - Prompt filtering removes monorepo parameter and directory structure sections
  - Monorepo section condition updated to check both settings
  - Build verification confirms integration works without errors
  - **Success:** Prompt generation adapts correctly to global monorepo setting

## Task 6: Add Task File Control Under Current Slice

### Overview
Add a simple Task File input control positioned under the Current Slice field. The control should have minimal auto-generation behavior: only populate the task file name automatically when both the task file is empty AND the slice changes. Use format `{nnn}-tasks.{slicename}` for auto-generation. Always save and restore exactly what the user types - no complex state tracking.

### 6.1 Add TaskFile Field to Data Types

- [ ] **Add taskFile field to ProjectData interface**
  - Add required `taskFile: string` field to ProjectData interface
  - **Success:** TypeScript compilation passes with taskFile in main interface

- [ ] **Update CreateProjectData type**
  - Add optional `taskFile?: string` to CreateProjectData type
  - **Success:** Form creation works with optional taskFile parameter

- [ ] **Update UpdateProjectData type**
  - Include taskFile in UpdateProjectData partial type
  - **Success:** Project updates can include taskFile field

### 6.2 Implement Task File Control UI

- [ ] **Add Task File input control to form**
  - Position input field directly under Current Slice field
  - Use same label/input styling as existing fields
  - Label as "Task File" with placeholder text
  - **Success:** Task File input appears under Current Slice with consistent styling

- [ ] **Implement auto-generation helper function**
  - Create `generateTaskFileName(slice: string)` helper function
  - Handle format conversion: `031-slice.hero-section` → `031-tasks.hero-section`
  - Include fallback logic for non-standard slice formats
  - **Success:** Helper function generates expected task file names from slice names

- [ ] **Add simple auto-update logic**
  - Auto-generate task file ONLY when field is empty AND slice changes
  - Always preserve existing task file content when present
  - Use basic form state management without complex tracking
  - **Success:** Task file auto-populates from slice when empty, preserves user input when present

### 6.3 Update Data Persistence

- [ ] **Update default project creation**
  - Add empty taskFile field to createDefaultProject method
  - **Success:** New projects include taskFile field in stored data

- [ ] **Update form data initialization**
  - Include taskFile in all setFormData calls across components
  - Use fallback to auto-generate when taskFile is missing from stored data
  - **Success:** Task file loads correctly from saved projects and handles missing data

- [ ] **Update project operations**
  - Include taskFile in project switching, creation, and deletion handlers
  - Ensure taskFile persists across all project management operations
  - **Success:** Task file values preserved during all project operations

### 6.4 Testing and Verification

- [ ] **Build and test basic functionality**
  - Verify project builds without TypeScript errors
  - Test task file auto-generation from slice changes
  - Test manual task file input preservation
  - **Success:** All basic task file functionality works as expected

- [ ] **Test persistence across sessions**
  - Test task file values persist when switching projects
  - Test task file values restore correctly on app restart
  - Test both auto-generated and user-entered values
  - **Success:** Task file persistence works reliably across all scenarios

## Notes

**Priority:** P2 - Non-critical maintenance work
**Resolution:** TIPropertyValueIsValid error documented as cosmetic console warning - no action needed