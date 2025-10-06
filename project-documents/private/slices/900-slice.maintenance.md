---
layer: project
phase: maintenance
phaseName: maintenance
guideRole: primary
audience: [human, ai]
description: Maintenance slice for context-builder ongoing issues and improvements
status: in-progress
dateUpdated: 2025-09-16
---

# Maintenance Slice: context-builder

## Overview

This slice addresses ongoing maintenance tasks, bug fixes, and improvements for the context-builder Electron application. This includes resolving system-level issues, improving developer experience, and maintaining code quality.

## Current Issues

### 1. TIPropertyValueIsValid macOS Error

**Priority:** P2 (Non-critical system warning)
**Status:** Postponed Indefinitely

**Description:** 
Application shows macOS-specific warnings in the console:
```
_TIPropertyValueIsValid called with 16 on nil context!
imkxpc_getApplicationProperty:reply: called with incorrect property value 16, bailing.
Text input context does not respond to _valueForTIProperty:
```

**Analysis:**
- This is a macOS system warning related to text input handling in Electron applications
- Occurs when non-English input methods (particularly Chinese input) are active
- Does not affect application functionality or user experience
- Common issue across Electron applications on macOS

**Root Cause:**
- macOS Text Input Manager (TIM) property conflicts with Electron's text input handling
- Triggered by input method switching or certain keyboard layouts
- Related to property value 16 (or variants like 4) being passed to nil context

**Impact:**
- Cosmetic: Console warning messages during development
- No functional impact on the application
- No user-facing issues

**Solutions Available:**
1. **Input Method Switch** (User-level workaround)
   - Switch to English input method to eliminate warnings
   - Temporary solution, may reoccur with input method changes

2. **Electron Configuration** (Development-level mitigation)
   - Investigate Electron webPreferences settings for input handling
   - Research nodeIntegration and contextIsolation configurations

3. **Suppress Warnings** (Development-level)
   - Filter console output during development
   - Add logging configuration to suppress specific warnings

### 2. Monorepo Controls Visibility Bug (GitHub Issue #11)

**Priority:** P1 (User-facing functionality issue)
**Status:** Ready for implementation (no formal tasks created)
**Effort Level:** 2/5 (Low-Medium), ~45-60 minutes
**GitHub Issue:** https://github.com/ecorkran/context-builder/issues/11

**Description:**
Monorepo form controls visibility is incorrectly tied to the form's "Monorepo project" checkbox (`isMonorepo`) instead of a separate settings flag. This creates a catch-22 where unchecking the form checkbox makes all monorepo controls disappear, including the checkbox itself.

**Problem:**
- Settings dialog checkbox controls `isMonorepo` (same as form checkbox)
- Form controls visibility: `{formData.isMonorepo && (`
- When user unchecks "Monorepo project", all controls vanish
- User cannot re-enable without reopening settings dialog

**Solution:**
Add new `isMonorepoEnabled` field to separate feature visibility from project mode:
- Settings checkbox controls `isMonorepoEnabled` (feature flag)
- Form controls visible when `isMonorepoEnabled === true`
- Form checkbox controls `isMonorepo` (actual project mode)
- All other functionality remains unchanged

**Files to Modify (6 total):**

1. **ProjectData.ts** - Add `isMonorepoEnabled?: boolean` field (5 lines)
2. **SettingsDialog.tsx** - Change from `isMonorepo` to `isMonorepoEnabled` (2 lines)
3. **ProjectConfigForm.tsx** - Change visibility condition (1 line)
4. **ContextBuilderApp.tsx** - Add to auto-save, project switch, new project (3 locations, ~3 lines)
5. **Initial project creation** - Ensure default value
6. **Build & test** - Verify changes work

**Quick Task Outline (7 steps):**

1. Add `isMonorepoEnabled` to ProjectData type definitions
2. Update SettingsDialog to use `isMonorepoEnabled`
3. Update ProjectConfigForm visibility condition
4. Add `isMonorepoEnabled` to auto-save in ContextBuilderApp
5. Add `isMonorepoEnabled` to project switch handler
6. Add `isMonorepoEnabled` to new project creation
7. Test visibility and functionality

**Note:** Formal tasks NOT being created due to low complexity and similarity to recently completed work (projectDate, developmentPhase). This documentation preserves implementation details in case of context loss or corruption.

**Success Criteria:**

- [ ] Settings checkbox controls `isMonorepoEnabled` (feature flag)
- [ ] Form controls visible when `isMonorepoEnabled === true`
- [ ] Form controls hidden when `isMonorepoEnabled === false`
- [ ] Form checkbox controls `isMonorepo` (project mode)
- [ ] Unchecking form checkbox does NOT hide controls
- [ ] All existing monorepo functionality unchanged
- [ ] Output preview respects `isMonorepo` flag (not `isMonorepoEnabled`)
- [ ] Default value: `isMonorepoEnabled: false` for new projects
- [ ] Backward compatibility: Existing projects default to `false`

## Success Criteria

- [ ] TIPropertyValueIsValid error analysis documented
- [ ] Potential solutions researched and documented
- [ ] Recommendation provided for handling approach
- [ ] Decision made on whether to fix or document as known issue

## Implementation Notes

**Recommended Approach:**
Given that this is a cosmetic issue with no functional impact and affects only development console output, the recommended approach is to:

1. Document the issue as a known limitation
2. Provide user guidance for eliminating warnings if desired
3. Monitor for Electron framework updates that might resolve the issue
4. Consider implementing console filtering for development environment

**Alternative Approaches:**
- Deep Electron configuration changes (high risk, low reward)
- Custom input handling implementation (unnecessary complexity)
- Upstream bug reports to Electron team (appropriate for framework-level issue)

## Dependencies

- No direct dependencies on other slices
- May reference development tooling and build configuration

## Risks

- **Low Risk:** This is a cosmetic issue with no functional impact
- **Investigation Risk:** Minimal - primarily research and documentation
- **Implementation Risk:** If pursuing technical fixes, risk of introducing actual functional issues

## Testing Strategy

- No specific testing required for documentation-only approach
- If implementing technical solutions, test across multiple macOS versions and input methods
- Verify no regression in text input functionality

## Documentation Requirements

- Update development documentation with known issue information
- Provide user guidance for eliminating warnings
- Document any implemented solutions or workarounds