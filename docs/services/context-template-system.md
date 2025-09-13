# Context Template System Documentation

## Overview

The Context Template System replaces the basic markdown template with a sophisticated, multi-section context generation system. It integrates with project system prompts, provides configurable statements, and supports dynamic sections based on project configuration.

## Architecture

```
ContextIntegrator (Entry Point)
├── ContextTemplateEngine (Orchestrator)
    ├── SystemPromptParser (System prompt integration)
    ├── StatementManager (Configurable statements)
    ├── SectionBuilder (Dynamic section assembly)
    └── ServiceFactory (Environment detection)
```

## Core Services

### ContextIntegrator

**Purpose**: Main entry point for context generation, coordinates between legacy and new template systems.

**Usage**:
```typescript
import { ContextIntegrator } from '../services/context/ContextIntegrator';

const integrator = new ContextIntegrator(true); // Enable new engine
const context = await integrator.generateContextFromProject(projectData);
```

**Key Methods**:
- `generateContextFromProject(project: ProjectData): Promise<string>` - Main integration point
- `isNewEngineEnabled(): boolean` - Check current engine status
- `setNewEngineEnabled(enabled: boolean)` - Toggle between engines

### ContextTemplateEngine

**Purpose**: Orchestrates context generation using the new template system.

**Usage**:
```typescript
import { ContextTemplateEngine } from '../services/context/ContextTemplateEngine';
import { createSystemPromptParser, createStatementManager } from '../services/context/ServiceFactory';

const promptParser = createSystemPromptParser();
const statementManager = createStatementManager();
const engine = new ContextTemplateEngine(promptParser, statementManager);

const context = await engine.generateContext(enhancedContextData);
```

**Key Methods**:
- `generateContext(data: EnhancedContextData): Promise<string>` - Main context generation
- `buildTemplate(data: EnhancedContextData): ContextTemplate` - Create template configuration

### StatementManager / StatementManagerIPC

**Purpose**: Manages configurable intro/glue statements from markdown files.

**File Format** (`default-statements.md`):
```markdown
---
version: "1.0.0"
lastUpdated: "2025-01-27"
---

## Project Intro Statement
<!-- key: project-intro-statement, editable: true -->

We are continuing work on our project. Project information, environment context, instructions, and notes follow:

## Tool Intro Statement  
<!-- key: tool-intro-statement, editable: true -->

The following tools and MCP servers are available for this project:
```

**Usage**:
```typescript
import { createStatementManager } from '../services/context/ServiceFactory';

const manager = createStatementManager('my-statements.md');
await manager.loadStatements();
const statement = manager.getStatement('project-intro-statement');
manager.updateStatement('project-intro-statement', 'New content');
await manager.saveStatements();
```

**Key Methods**:
- `loadStatements(): Promise<void>` - Load from markdown file
- `getStatement(key: string): string` - Get specific statement
- `updateStatement(key: string, content: string): void` - Update statement
- `saveStatements(): Promise<void>` - Persist changes
- `getAllStatements(): Record<string, TemplateStatement>` - Get all loaded statements

### SystemPromptParser / SystemPromptParserIPC

**Purpose**: Parses system prompt files and maps instruction types to specific prompts.

**File Format** (`prompt.ai-project.system.md`):
```markdown
##### Model Change or Context Refresh

```markdown
Initialize your context with the following project information.
```

##### Slice | Feature Implementation (Phase 7)

```markdown  
Implement the specified feature according to requirements.
```
```

**Usage**:
```typescript
import { createSystemPromptParser } from '../services/context/ServiceFactory';

const parser = createSystemPromptParser('my-prompts.md');
const contextPrompt = await parser.getContextInitializationPrompt();
const toolPrompt = await parser.getToolUsePrompt();
const implPrompt = await parser.getPromptForInstruction('implementation');
```

**Key Methods**:
- `getContextInitializationPrompt(): Promise<SystemPrompt | null>`
- `getToolUsePrompt(): Promise<SystemPrompt | null>`
- `getPromptForInstruction(instruction: string): Promise<SystemPrompt | null>`

**Instruction Mapping**:
- `'planning'` → "Slice Planning (Phase 3)"
- `'implementation'` → "Slice | Feature Implementation (Phase 7)"
- `'debugging'` → "Analysis Task Implementation"

### ServiceFactory

**Purpose**: Automatically selects between IPC and direct implementations based on environment.

**Usage**:
```typescript
import { createStatementManager, createSystemPromptParser } from '../services/context/ServiceFactory';

// Automatically uses IPC versions in Electron renderer, direct versions elsewhere
const statementManager = createStatementManager();
const promptParser = createSystemPromptParser();
```

**Environment Detection**:
- **Electron Renderer**: Uses StatementManagerIPC, SystemPromptParserIPC
- **Node.js/Other**: Uses StatementManager, SystemPromptParser

## Generated Context Format

The new system generates structured context:

```
{project-intro-statement}
{context-initialization-prompt}

### 3rd-Party Tools & MCP
{tool-intro-statement}
{tool-use-prompt}
{additional MCP availability info if applicable}

### Monorepo Note (if applicable)
{project-specific monorepo-and-package-information}

### Current Events
{current-events}

### Instruction Prompt
{instruction-intro-statement}
{instruction-prompt}

### Additional Notes
{additional-notes-if-applicable}
```

## Error Handling and Fallbacks

### Graceful Degradation
1. **Missing Prompt File**: Uses fallback prompts for essential sections
2. **Parsing Errors**: Falls back to DEFAULT_TEMPLATE system
3. **Missing Statements**: Uses hardcoded defaults
4. **IPC Failures**: Falls back to legacy system

### Error Scenarios
```typescript
try {
  const context = await integrator.generateContextFromProject(project);
} catch (error) {
  // System automatically falls back to legacy template
  console.error('Context generation failed:', error);
}
```

## Electron IPC Architecture

### Main Process Services
- Located in `src/main/services/context/`
- Full filesystem access for reading/writing files
- Registered IPC handlers in `src/main/ipc/contextServices.ts`

### Renderer Process Adapters
- Located in `src/services/context/*IPC.ts`
- Delegate to main process via `window.electronAPI`
- Maintain same interface as direct implementations
- Include performance caching

### IPC Methods Available

**Statements**:
- `window.electronAPI.statements.load(filename)`
- `window.electronAPI.statements.save(filename, statements)`
- `window.electronAPI.statements.getStatement(filename, key)`
- `window.electronAPI.statements.updateStatement(filename, key, content)`

**System Prompts**:
- `window.electronAPI.systemPrompts.getContextInit(filename)`
- `window.electronAPI.systemPrompts.getToolUse(filename)`
- `window.electronAPI.systemPrompts.getForInstruction(filename, instruction)`

## Configuration

### Default File Locations
- **Statements**: `default-statements.md` (root directory)
- **System Prompts**: `prompt.ai-project.system.md` (root directory)

### Customizing Statements
1. Edit `default-statements.md` directly
2. Or create custom statement files and pass filename to StatementManager
3. Use HTML comments to define statement keys: `<!-- key: statement-key, editable: true -->`

### Customizing System Prompts
1. Edit `prompt.ai-project.system.md` directly  
2. Use ##### headers to define prompt sections
3. Wrap prompt content in ```markdown code blocks

## Testing

### Unit Tests
- `StatementManager.test.ts` - Statement file parsing and CRUD operations
- `SystemPromptParser.test.ts` - Prompt parsing and instruction mapping
- `ContextTemplateEngine.test.ts` - Template generation and section assembly
- `IPCIntegration.test.ts` - IPC communication and data integrity

### Running Tests
```bash
pnpm test StatementManager.test.ts
pnpm test SystemPromptParser.test.ts  
pnpm test ContextTemplateEngine.test.ts
pnpm test IPCIntegration.test.ts
```

## Troubleshooting

### Common Issues

**Issue**: Context generation returns error context
**Solution**: Check that system prompt file exists and is properly formatted

**Issue**: Statements not loading
**Solution**: Verify `default-statements.md` exists and HTML comments are correctly formatted

**Issue**: IPC communication fails in Electron
**Solution**: Check that context service handlers are registered in main process

**Issue**: Template variables not substituted
**Solution**: Ensure project data contains all required fields (name, slice, instruction)

### Debug Mode
Enable debug logging by setting environment variable:
```bash
DEBUG=context-template:* pnpm dev
```

### File Validation
Use validation methods to check file integrity:
```typescript
const isValid = await parser.validatePromptFile();
const statements = await manager.validateStatements();
```

## Migration from Legacy System

### Backward Compatibility
The system maintains full backward compatibility:
- Legacy DEFAULT_TEMPLATE still available as fallback
- Can toggle between systems using `ContextIntegrator.setNewEngineEnabled()`
- All existing ProjectData interfaces unchanged

### Migration Steps
1. **Automatic**: System automatically uses new engine by default
2. **Manual**: Create custom statement and prompt files if needed
3. **Testing**: Verify context output meets requirements
4. **Rollback**: Set `enableNewEngine: false` if issues occur

## Performance Considerations

### Optimization Features
- **Caching**: Parsed prompts and statements cached in memory
- **Debouncing**: Real-time preview uses 300ms debounce
- **Lazy Loading**: Files only loaded when needed
- **IPC Batching**: Multiple operations batched where possible

### Performance Targets
- Context generation: < 200ms for typical projects
- File parsing: < 100ms on file changes  
- Memory usage: Minimal impact vs legacy system
- UI responsiveness: No blocking operations