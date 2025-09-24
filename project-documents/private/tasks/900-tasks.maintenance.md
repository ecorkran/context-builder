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

- [ ] **Add Custom Instruction to section list**
  - Add Custom Instruction option to the same subsection as Ad-Hoc Tasks
  - Ensure proper categorization and ordering
  - Follow existing naming conventions and structure
  - **Success:** Custom Instruction appears in dropdown with Ad-Hoc Tasks

- [ ] **Wire up Custom Instruction functionality**
  - Connect Custom Instruction selection to appropriate prompt handling
  - Ensure system prompt is properly loaded and applied
  - Test section switching and prompt application
  - **Success:** Custom Instruction section functions correctly

### 4.3 Testing and Verification

- [ ] **Test Custom Instruction selection**
  - Verify Custom Instruction appears in correct subsection
  - Test prompt loading and application
  - Verify no conflicts with existing sections
  - **Success:** Custom Instruction works as expected

## Task 5: Add Monorepo Mode Settings

### 5.1 Settings Infrastructure

- [ ] **Create settings/advanced section**
  - Add advanced settings UI section if not exists
  - Design appropriate layout for advanced options
  - Ensure proper navigation to advanced settings
  - **Success:** Advanced settings section accessible

- [ ] **Add monorepo mode toggle**
  - Add "Enable Monorepo Mode" checkbox option (default: false)
  - Implement setting persistence (localStorage/config file)
  - Add appropriate help text/tooltip explaining the feature
  - **Success:** Monorepo mode setting available and persistent

### 5.2 UI Conditional Display

- [ ] **Hide monorepo controls when disabled**
  - Identify all monorepo-specific UI elements
  - Add conditional rendering based on monorepo mode setting
  - Ensure clean UI when monorepo mode disabled
  - **Success:** Monorepo UI elements only show when enabled

### 5.3 Prompt System Integration

- [ ] **Audit monorepo-specific prompt segments**
  - Identify all prompts that contain monorepo-specific content
  - Map which segments should be conditional
  - Document current monorepo prompt dependencies
  - **Success:** All monorepo prompt segments identified

- [ ] **Implement conditional prompt segments**
  - Modify prompt generation to check monorepo mode setting
  - Remove/include monorepo segments based on setting
  - Ensure prompts remain coherent in both modes
  - **Success:** Prompts adapt correctly to monorepo mode setting

### 5.4 Testing and Verification

- [ ] **Test monorepo mode toggle**
  - Test enabling/disabling monorepo mode
  - Verify UI elements show/hide correctly
  - Test prompt generation in both modes
  - Verify setting persistence across sessions
  - **Success:** Monorepo mode functions correctly in all scenarios

## Notes

**Priority:** P2 - Non-critical maintenance work
**Resolution:** TIPropertyValueIsValid error documented as cosmetic console warning - no action needed