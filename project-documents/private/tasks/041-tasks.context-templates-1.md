---
item: context-templates
project: context-builder
type: slice-tasks
lldReference: private/slices/041-slice.context-templates.md
dependencies: [foundation]
projectState: Feature Slice 1 (Basic Context Generation) complete - ready to implement context templates system
lastUpdated: 2025-01-27
---

# Task Breakdown: Context Templates System

## Context Summary

This slice replaces the current basic markdown template system with a sophisticated, multi-section context generation system. The current system produces simple output like "# Project: test2sdfsds" but we need structured context with configurable intro statements, system prompt integration, and dynamic sections based on project configuration.

The new system will generate context in this format:
- Project intro statement
- Context initialization prompt (from system file)  
- Conditional sections (Tools/MCP, Monorepo, Current Events)
- Instruction-specific prompts
- Additional notes

Key technical components: SystemPromptParser, StatementManager, SectionBuilder, ContextTemplateEngine, and integration with existing ContextIntegrator.

## Task List

### Task 1: Statement Storage System
**Effort: 2/5**

- [x] **Task 1.1: Create Default Statements File**
  - Create `project-documents/content/statements/default-statements.md`
  - Add YAML frontmatter with version and lastUpdated
  - Include all required statements with HTML comment metadata:
    - project-intro-statement
    - tool-intro-statement  
    - instruction-intro-statement
  - Use markdown format with `<!-- key: statement-key, editable: true -->` comments
  - **Success:** Default statements file exists with proper format and all required statements

- [x] **Task 1.2: Create Statement Data Types**
  - Create `src/services/context/types/TemplateStatement.ts`
  - Define TemplateStatement interface with key, content, description, editable fields
  - Define StatementConfig interface for storage
  - Export all types for use in other services
  - **Success:** TypeScript types defined and compilable

- [x] **Task 1.3: Create StatementManager Service**
  - [x] **1.3.1: Create StatementManager class structure**
    - Create `src/services/context/StatementManager.ts`
    - Create class with private statements cache property
    - Add constructor with optional file path parameter
    - Import required types from TemplateStatement.ts
    - **Success:** Basic class structure exists and compiles
    
  - [x] **1.3.2: Implement markdown parsing logic**
    - Add parseMarkdownStatements() private method
    - Parse YAML frontmatter using existing project patterns
    - Extract statements from HTML comments using regex pattern:
      ```typescript
      /<!--\s*key:\s*([^,]+),\s*editable:\s*(true|false)\s*-->/g
      ```
    - Map comment keys to statement content from following markdown sections
    - Handle malformed comments gracefully with warnings
    - **Success:** Parser extracts statements from properly formatted markdown files
    
  - [x] **1.3.3: Implement CRUD operations**
    - Add getStatement(key: string): string method with fallback to defaults
    - Add updateStatement(key: string, content: string): void method
    - Add getAllStatements(): Record<string, TemplateStatement> method
    - Include validation for statement keys and content
    - **Success:** All CRUD methods work with cached statement data
    
  - [x] **1.3.4: Add persistence layer**
    - Add loadStatements() method to read from markdown file
    - Add saveStatements() method to write updates back to file
    - Handle file system errors with meaningful error messages
    - Implement atomic file writes to prevent corruption
    - **Success:** Statements persist correctly between application restarts
    
  - [x] **1.3.5: Add fallback system**
    - Create hardcoded DEFAULT_STATEMENTS object with all required statements
    - Implement fallback logic when files are missing or corrupt
    - Log warnings when falling back to defaults
    - Ensure system continues working even without statement files
    - **Success:** StatementManager works reliably even with missing files

- [x] **Task 1.4: Create StatementManager Unit Tests**
  - Create `src/services/context/StatementManager.test.ts`
  - Test markdown file parsing with various comment formats
  - Test CRUD operations and fallback behavior
  - Test error handling for malformed files
  - Test persistence operations
  - **Success:** All StatementManager functionality tested with >90% coverage

### Task 2: System Prompt Integration
**Effort: 3/5**

- [ ] **Task 2.1: Create System Prompt Data Types**
  - Create `src/services/context/types/SystemPrompt.ts`
  - Define SystemPrompt interface with name, key, content, parameters
  - Define instruction mapping types
  - Export types for parser service
  - **Success:** SystemPrompt types defined and compilable

- [ ] **Task 2.2: Create SystemPromptParser Service**
  - [ ] **2.2.1: Create SystemPromptParser class structure**
    - Create `src/services/context/SystemPromptParser.ts`
    - Create class with private prompts cache and filePath properties
    - Import SystemPrompt types and add constructor
    - Set up basic error handling and logging infrastructure
    - **Success:** Basic class structure exists and compiles
    
  - [ ] **2.2.2: Implement markdown section parsing**
    - Add parsePromptFile() method to read and process markdown file
    - Use regex to extract sections by ##### headers:
      ```typescript
      /^##### (.+)$/gm
      ```
    - Extract content between headers, handling nested sections properly
    - Parse code blocks within sections using ```markdown delimiters
    - Store prompts with keys derived from section titles
    - **Success:** Parser extracts all sections from system prompt file
    
  - [ ] **2.2.3: Implement specific prompt extraction methods**
    - Add getContextInitializationPrompt() method
      - Look for "Model Change or Context Refresh" section
      - Extract markdown code block content
      - Return SystemPrompt object with processed content
    - Add getToolUsePrompt() method  
      - Look for "Use 3rd Party Tool" section
      - Extract and return tool usage instructions
    - Handle missing sections with meaningful error messages
    - **Success:** Specific prompt extraction methods work reliably
    
  - [ ] **2.2.4: Add instruction mapping logic**
    - Create INSTRUCTION_MAPPING constant with known mappings:
      ```typescript
      {
        'planning': 'Slice Planning (Phase 3)',
        'implementation': 'Slice | Feature Implementation (Phase 7)',
        'debugging': 'Analysis Task Implementation'  // fallback
      }
      ```
    - Implement getPromptForInstruction() method using mapping
    - Add fuzzy matching for instruction types (case insensitive, partial matches)
    - Return null for unknown instructions to allow custom handling
    - **Success:** All instruction types map correctly to system prompts
    
  - [ ] **2.2.5: Add caching and file monitoring**
    - Implement prompt caching to avoid repeated file parsing
    - Add cache invalidation when file modification time changes
    - Include memory management to prevent cache bloat
    - Add optional file watching for development environments
    - **Success:** Parser performs efficiently with proper caching

- [ ] **Task 2.3: Implement Instruction Type Mapping**
  - Add instruction mapping logic in SystemPromptParser
  - Map 'planning' to "Slice Planning (Phase 3)" prompt
  - Map 'implementation' to "Slice | Feature Implementation (Phase 7)" prompt
  - Map 'debugging' to appropriate prompt or fallback
  - Handle 'custom' instruction type with user text
  - **Success:** All instruction types map to correct prompts or fallbacks

- [ ] **Task 2.4: Create SystemPromptParser Unit Tests**
  - Create `src/services/context/SystemPromptParser.test.ts`
  - Test markdown parsing with sample system prompt files
  - Test instruction mapping for all supported types
  - Test error handling for missing files and malformed content
  - Test caching behavior and cache invalidation
  - **Success:** Parser functionality fully tested with >90% coverage

- [ ] **Task 2.5: Create PromptFileManager Service**
  - Create `src/services/context/PromptFileManager.ts`
  - Implement loadPromptFile() with file system access
  - Add validatePromptFile() for structure validation
  - Include basic file watching setup (without live updates initially)
  - Add error handling for missing files
  - **Success:** File manager loads and validates system prompt files

### Task 3: Section Building System
**Effort: 3/5**

- [ ] **Task 3.1: Create Section Data Types**
  - Create `src/services/context/types/ContextSection.ts`
  - Define ContextSection interface with key, title, content, conditional, order
  - Define ContextTemplate interface for complete template structure
  - Include conditional function types for dynamic sections
  - **Success:** Section types support all required section configurations

- [ ] **Task 3.2: Create SectionBuilder Service**
  - Create `src/services/context/SectionBuilder.ts`
  - Implement buildToolsSection() for tools and MCP content
  - Implement buildMonorepoSection() for monorepo-specific information
  - Implement buildInstructionSection() with prompt mapping
  - Add conditional logic helpers for section inclusion
  - **Success:** SectionBuilder creates all required section types

- [ ] **Task 3.3: Implement MCP and Tools Detection**
  - Add detectMCPAvailability() method to SectionBuilder
  - Add detectAvailableTools() method for tool detection
  - Create placeholder implementations that return sensible defaults
  - Document interfaces for future integration with actual detection
  - **Success:** Detection methods return appropriate placeholder content

- [ ] **Task 3.4: Create SectionBuilder Unit Tests**
  - Create `src/services/context/SectionBuilder.test.ts`
  - Test each section building method with various inputs
  - Test conditional section logic
  - Test template variable processing within sections
  - Test error handling and fallback behavior
  - **Success:** All SectionBuilder methods tested with >90% coverage

### Task 4: Template Engine Core
**Effort: 4/5**

- [ ] **Task 4.1: Create ContextTemplateEngine Service**
  - [ ] **4.1.1: Create ContextTemplateEngine class structure**
    - Create `src/services/context/ContextTemplateEngine.ts`
    - Create class with private service dependencies (promptParser, statementManager, sectionBuilder)
    - Add constructor with dependency injection pattern
    - Import all required types and establish service contracts
    - **Success:** Template engine class structure exists with proper dependencies
    
  - [ ] **4.1.2: Implement generateContext() main method**
    - Add generateContext(data: EnhancedContextData): string method
    - Call buildTemplate() to create template configuration
    - Call assembleSections() to process template into sections
    - Call formatOutput() for final context string
    - Add comprehensive error handling with fallback to DEFAULT_TEMPLATE
    - **Success:** Main context generation method orchestrates all steps
    
  - [ ] **4.1.3: Implement buildTemplate() configuration method**
    - Create template configuration based on input data
    - Define all required sections with their properties:
      ```typescript
      sections: [
        { key: 'project-intro', order: 1, conditional: false },
        { key: 'context-init', order: 2, conditional: false },
        { key: 'tools-section', order: 3, conditional: true, condition: hasToolsOrMCP },
        { key: 'monorepo-section', order: 4, conditional: true, condition: data.isMonorepo },
        // ... etc
      ]
      ```
    - Include conditional logic helpers for dynamic section inclusion
    - Return complete ContextTemplate object
    - **Success:** Template configuration correctly defines all sections
    
  - [ ] **4.1.4: Add utility methods**
    - Add formatOutput() method for final cleanup (remove extra whitespace, normalize line endings)
    - Add validateInputData() method to check required fields
    - Add getErrorContext() fallback method for error scenarios
    - Include logging and debugging utilities
    - **Success:** Template engine has all required utility methods

- [ ] **Task 4.2: Implement Section Assembly Logic**
  - [ ] **4.2.1: Create assembleSections() core method**
    - Add assembleSections(template: ContextTemplate, data: EnhancedContextData): string method
    - Filter sections based on conditional logic evaluation
    - Sort sections by order field for proper sequence
    - Process each section through content generation pipeline
    - Combine all sections into final context string
    - **Success:** Section assembly produces properly ordered context
    
  - [ ] **4.2.2: Implement section filtering logic**
    - Add evaluateCondition() helper method for conditional sections
    - Implement hasToolsOrMCP() condition checker
    - Add section inclusion logic based on data properties
    - Handle edge cases where conditions are undefined
    - **Success:** Conditional sections appear/disappear correctly based on data
    
  - [ ] **4.2.3: Add section content processing**
    - Implement processSection() method for individual section handling
    - Add template variable substitution within section content
    - Include section title formatting (### Title format for markdown)
    - Handle empty sections gracefully (skip or show placeholder)
    - **Success:** Individual sections are properly formatted with content
    
  - [ ] **4.2.4: Add section combining logic**
    - Combine processed sections with proper spacing
    - Add section separators (double newlines between sections)
    - Handle edge cases like all sections being conditional and hidden
    - Ensure final output has proper markdown structure
    - **Success:** Final context has proper section formatting and spacing

- [ ] **Task 4.3: Add Error Handling and Fallbacks**
  - Implement getErrorContext() fallback to current DEFAULT_TEMPLATE
  - Add handleMissingPromptFile() with fallback prompts
  - Include error logging without breaking context generation
  - Add validation for required services and data
  - **Success:** Engine handles all error conditions gracefully

- [ ] **Task 4.4: Create Enhanced Context Data Types**
  - Create EnhancedContextData interface extending ContextData
  - Add fields for availableTools, mcpServers, templateVersion
  - Include customSections field for future extensibility
  - Update related types and interfaces
  - **Success:** Enhanced data types support all template engine features

- [ ] **Task 4.5: Create ContextTemplateEngine Unit Tests**
  - Create `src/services/context/ContextTemplateEngine.test.ts`
  - Test complete context generation with various project configurations
  - Test section assembly and ordering logic
  - Test error handling and fallback scenarios
  - Test integration with all component services
  - **Success:** Template engine fully tested with >90% coverage

### Task 5: Integration with Existing System
**Effort: 3/5**

- [ ] **Task 5.1: Update Context Data Types**
  - Modify `src/services/context/types/ContextData.ts`
  - Add optional fields for enhanced functionality
  - Ensure backward compatibility with existing code
  - Update exports and related type definitions
  - **Success:** ContextData types support both old and new systems

- [ ] **Task 5.2: Update ContextIntegrator Service**
  - [ ] **5.2.1: Add new template engine integration**
    - Modify `src/services/context/ContextIntegrator.ts` to import ContextTemplateEngine
    - Add private templateEngine property to class
    - Create feature flag ENABLE_NEW_TEMPLATE_ENGINE in constructor
    - Maintain existing templateProcessor for fallback compatibility
    - **Success:** ContextIntegrator can switch between old and new systems
    
  - [ ] **5.2.2: Update generateContextFromProject() method**
    - Modify main context generation method to use feature flag
    - Add conditional logic:
      ```typescript
      if (this.enableNewEngine) {
        return this.generateWithTemplateEngine(project);
      } else {
        return this.generateWithLegacySystem(project);
      }
      ```
    - Implement generateWithTemplateEngine() using new system
    - Maintain existing logic in generateWithLegacySystem()
    - Add error handling to fallback between systems
    - **Success:** Context generation works with both old and new systems
    
  - [ ] **5.2.3: Enhance project data mapping**
    - Update mapProjectToContext() to return EnhancedContextData
    - Add detectAvailableTools() method for tool detection
    - Add detectMCPServers() method for MCP detection
    - Include templateVersion field for tracking
    - Maintain backward compatibility with existing ContextData usage
    - **Success:** Enhanced data mapping supports new template features
    
  - [ ] **5.2.4: Add tool and MCP detection logic**
    - Implement detectAvailableTools() with placeholder logic
    - Implement detectMCPServers() with placeholder logic
    - Document interfaces for future integration with actual detection
    - Return sensible defaults for development
    - **Success:** Detection methods provide appropriate placeholder data

- [ ] **Task 5.3: Update Project Data Mapping**
  - Enhance mapProjectToContext() in ContextIntegrator
  - Add availableTools detection and mapping
  - Add mcpServers detection and mapping
  - Include templateVersion for tracking
  - **Success:** Project data maps correctly to enhanced context data

- [ ] **Task 5.4: Add Integration Configuration**
  - Create configuration flag to enable/disable new template system
  - Add feature flag support for gradual rollout
  - Include performance monitoring hooks
  - Add debugging/logging configuration
  - **Success:** System can switch between old and new template engines

- [ ] **Task 5.5: Update Integration Tests**
  - Modify existing integration tests to work with both systems
  - Add tests for enhanced context data mapping
  - Test real-time preview integration with new templates
  - Test copy functionality with new context format
  - **Success:** All existing functionality works with new template system

### Task 6: Performance and Caching
**Effort: 2/5**

- [ ] **Task 6.1: Implement Basic Caching**
  - Add prompt file caching in SystemPromptParser
  - Add statement caching in StatementManager
  - Implement cache invalidation on file changes
  - Add memory usage monitoring and limits
  - **Success:** Caching improves performance without excessive memory usage

- [ ] **Task 6.2: Add Performance Monitoring**
  - Add timing measurements for context generation
  - Include memory usage tracking for cached data
  - Add logging for performance metrics
  - Create performance test suite with benchmarks
  - **Success:** Performance monitoring identifies bottlenecks and tracks improvements

- [ ] **Task 6.3: Optimize Critical Paths**
  - Profile context generation with various project sizes
  - Optimize section building and template processing
  - Minimize file system access through intelligent caching
  - Ensure <200ms generation time for typical projects
  - **Success:** Context generation meets performance targets

### Task 7: Testing and Validation
**Effort: 2/5**

- [ ] **Task 7.1: Create End-to-End Tests**
  - Create comprehensive test suite for complete workflows
  - Test context generation with various project configurations
  - Test monorepo vs single-repo scenarios
  - Test different instruction types and custom instructions
  - **Success:** E2E tests verify complete system functionality

- [ ] **Task 7.2: Create Error Scenario Tests**
  - Test missing prompt.ai-project.system.md file
  - Test malformed markdown files
  - Test network/file system errors
  - Test invalid project configurations
  - **Success:** All error scenarios handled gracefully with meaningful messages

- [ ] **Task 7.3: Validate Against Requirements**
  - Test structured context format matches specification
  - Verify all conditional sections work correctly
  - Test system prompt integration with real prompt file
  - Validate user statement customization workflow
  - **Success:** All functional requirements met and tested

- [ ] **Task 7.4: Performance Validation**
  - Benchmark context generation times with various project sizes
  - Test memory usage with extended operation
  - Validate real-time preview responsiveness
  - Test concurrent generation scenarios
  - **Success:** All performance targets met and documented

### Task 8: Documentation and Integration
**Effort: 1/5**

- [ ] **Task 8.1: Create Service Documentation**
  - Document all public APIs for new services
  - Create usage examples for StatementManager
  - Document SystemPromptParser integration points
  - Include troubleshooting guide for common issues
  - **Success:** Complete API documentation exists for all services

- [ ] **Task 8.2: Update Existing Documentation**
  - Update any references to old template system
  - Document new context format and sections
  - Include migration guide for existing projects
  - Update development setup instructions
  - **Success:** All documentation reflects new template system

## Task Dependencies

### Sequential Dependencies
- Task 1 (Statement Storage) must complete before Task 4 (Template Engine)
- Task 2 (System Prompt Integration) must complete before Task 4 (Template Engine)  
- Task 3 (Section Building) must complete before Task 4 (Template Engine)
- Task 4 (Template Engine) must complete before Task 5 (Integration)
- Task 5 (Integration) must complete before Task 7 (Testing)

### Parallel Work Opportunities
- Tasks 1, 2, and 3 can be developed in parallel
- Task 6 (Performance) can be developed alongside Task 4 (Template Engine)
- Task 8 (Documentation) can be developed alongside testing phases

## Risk Mitigation

### Technical Risks
- **File parsing complexity**: Start with simple parsing, iterate based on actual prompt file structure
- **Performance impact**: Implement caching early, monitor throughout development
- **Integration complexity**: Maintain feature flag to allow rollback during development

### Quality Assurance
- Each task includes comprehensive unit tests
- Integration tests validate cross-service interactions  
- End-to-end tests ensure user-facing functionality works
- Performance tests validate against specified targets

## Success Criteria Summary

Upon completion of all tasks:
- [ ] Context generation produces structured, professional output
- [ ] System integrates with prompt.ai-project.system.md file
- [ ] Users can configure intro/glue statements via markdown files
- [ ] Conditional sections appear based on project configuration
- [ ] Performance meets targets (<200ms generation, responsive preview)
- [ ] All existing functionality preserved and enhanced
- [ ] Comprehensive test coverage ensures reliability
- [ ] Clear documentation supports future maintenance and extension