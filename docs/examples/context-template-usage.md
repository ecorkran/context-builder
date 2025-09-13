# Context Template System Usage Examples

## Basic Usage

### Simple Context Generation

```typescript
import { ContextIntegrator } from '../services/context/ContextIntegrator';

// Create integrator with new template engine enabled
const integrator = new ContextIntegrator(true);

// Sample project data
const projectData = {
  id: 'my-project',
  name: 'My Awesome Project',
  template: 'react-vite',
  slice: 'authentication',
  instruction: 'implementation',
  isMonorepo: false,
  customData: {
    recentEvents: 'Added OAuth integration',
    additionalNotes: 'Focus on security best practices'
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Generate context
const context = await integrator.generateContextFromProject(projectData);
console.log(context);
```

### Real-time Preview Integration

```typescript
import { useContextGeneration } from '../hooks/useContextGeneration';
import { useDebounce } from '../hooks/useDebounce';

function ContextPreview({ projectData }) {
  // Debounce project data for smoother updates
  const debouncedProject = useDebounce(projectData, 300);
  
  // Generate context with real-time updates
  const { contextString, isLoading, error } = useContextGeneration(debouncedProject);
  
  if (isLoading) return <div>Generating context...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <pre>{contextString}</pre>;
}
```

## Advanced Usage

### Custom Statement Management

```typescript
import { createStatementManager } from '../services/context/ServiceFactory';

async function customizeStatements() {
  const manager = createStatementManager('custom-statements.md');
  
  // Load existing statements
  await manager.loadStatements();
  
  // Update specific statements
  manager.updateStatement(
    'project-intro-statement',
    'Welcome to our advanced development workflow. Here are the current project details:'
  );
  
  manager.updateStatement(
    'tool-intro-statement', 
    'Our development environment includes the following tools and services:'
  );
  
  // Save changes
  await manager.saveStatements();
  
  console.log('Custom statements saved!');
}
```

### Custom System Prompt Integration

```typescript
import { createSystemPromptParser } from '../services/context/ServiceFactory';

async function setupCustomPrompts() {
  const parser = createSystemPromptParser('my-prompts.md');
  
  // Get specific prompts
  const contextInit = await parser.getContextInitializationPrompt();
  const toolUse = await parser.getToolUsePrompt();
  const implPrompt = await parser.getPromptForInstruction('implementation');
  
  console.log('Context Init:', contextInit?.content);
  console.log('Tool Use:', toolUse?.content);
  console.log('Implementation:', implPrompt?.content);
}
```

### Environment-Specific Usage

```typescript
import { 
  createStatementManager, 
  createSystemPromptParser 
} from '../services/context/ServiceFactory';

// Works in both Electron and Node.js environments
async function environmentAgnosticUsage() {
  // ServiceFactory automatically chooses correct implementation
  const statementManager = createStatementManager();
  const promptParser = createSystemPromptParser();
  
  // Same API regardless of environment
  await statementManager.loadStatements();
  const statement = statementManager.getStatement('project-intro-statement');
  
  const prompt = await promptParser.getContextInitializationPrompt();
  
  return { statement, prompt };
}
```

## Monorepo Project Example

```typescript
const monorepoProject = {
  id: 'monorepo-feature',
  name: 'Enterprise App Suite',
  template: 'nx-workspace', // Template is required for monorepo
  slice: 'user-management',
  instruction: 'planning',
  isMonorepo: true,
  customData: {
    recentEvents: 'Migrated to microservices architecture',
    additionalNotes: 'Working in apps/admin-dashboard package'
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const context = await integrator.generateContextFromProject(monorepoProject);
// Will include monorepo-specific sections and template information
```

## Error Handling Examples

### Graceful Degradation

```typescript
async function robustContextGeneration(projectData) {
  const integrator = new ContextIntegrator(true);
  
  try {
    const context = await integrator.generateContextFromProject(projectData);
    return context;
  } catch (error) {
    console.warn('New template engine failed, falling back to legacy:', error);
    
    // Disable new engine and retry
    integrator.setNewEngineEnabled(false);
    return await integrator.generateContextFromProject(projectData);
  }
}
```

### IPC Error Handling

```typescript
import { StatementManagerIPC } from '../services/context/StatementManagerIPC';

async function handleIPCErrors() {
  const manager = new StatementManagerIPC();
  
  try {
    await manager.loadStatements();
    return manager.getStatement('project-intro-statement');
  } catch (error) {
    if (error.message.includes('IPC')) {
      console.error('IPC communication failed:', error);
      // Fall back to default behavior
      return 'We are continuing work on our project.';
    }
    throw error;
  }
}
```

## Testing Examples

### Unit Testing with Mocks

```typescript
import { describe, it, expect, vi } from 'vitest';
import { ContextTemplateEngine } from '../ContextTemplateEngine';

describe('ContextTemplateEngine', () => {
  it('generates context with mocked services', async () => {
    // Mock dependencies
    const mockStatementManager = {
      getStatement: vi.fn().mockReturnValue('Mocked statement'),
      loadStatements: vi.fn().mockResolvedValue(undefined)
    };
    
    const mockPromptParser = {
      getContextInitializationPrompt: vi.fn().mockResolvedValue({
        content: 'Mocked prompt'
      })
    };
    
    const engine = new ContextTemplateEngine(
      mockPromptParser,
      mockStatementManager
    );
    
    const mockData = {
      projectName: 'Test Project',
      slice: 'test-slice',
      instruction: 'implementation',
      template: 'test-template',
      isMonorepo: false,
      recentEvents: 'Test events',
      additionalNotes: 'Test notes'
    };
    
    const result = await engine.generateContext(mockData);
    
    expect(result).toContain('Test Project');
    expect(result).toContain('Mocked statement');
    expect(mockStatementManager.getStatement).toHaveBeenCalled();
  });
});
```

### Integration Testing

```typescript
import { ContextIntegrator } from '../ContextIntegrator';

describe('Integration Tests', () => {
  it('works end-to-end with real files', async () => {
    const integrator = new ContextIntegrator(true);
    
    const testProject = {
      id: 'integration-test',
      name: 'Integration Test Project',
      template: 'test-template',
      slice: 'test-slice',
      instruction: 'implementation',
      isMonorepo: false,
      customData: {
        recentEvents: 'Integration testing',
        additionalNotes: 'End-to-end test'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const context = await integrator.generateContextFromProject(testProject);
    
    expect(context).toContain('Integration Test Project');
    expect(context).toContain('test-slice');
    expect(context).toContain('Integration testing');
  });
});
```

## Performance Optimization Examples

### Caching Context Results

```typescript
class CachedContextGenerator {
  private cache = new Map<string, string>();
  private integrator = new ContextIntegrator(true);
  
  private getCacheKey(projectData: ProjectData): string {
    return JSON.stringify({
      name: projectData.name,
      slice: projectData.slice,
      instruction: projectData.instruction,
      template: projectData.template,
      isMonorepo: projectData.isMonorepo,
      customData: projectData.customData
    });
  }
  
  async generateContext(projectData: ProjectData): Promise<string> {
    const cacheKey = this.getCacheKey(projectData);
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    const context = await this.integrator.generateContextFromProject(projectData);
    this.cache.set(cacheKey, context);
    
    return context;
  }
  
  clearCache(): void {
    this.cache.clear();
  }
}
```

### Debounced Real-time Updates

```typescript
import { useMemo, useCallback } from 'react';
import { debounce } from 'lodash';

function useDebounceContextGeneration(projectData: ProjectData) {
  const integrator = useMemo(() => new ContextIntegrator(true), []);
  
  const debouncedGenerate = useCallback(
    debounce(async (data: ProjectData) => {
      try {
        return await integrator.generateContextFromProject(data);
      } catch (error) {
        console.error('Context generation failed:', error);
        return null;
      }
    }, 300),
    [integrator]
  );
  
  return debouncedGenerate;
}
```

## File Format Examples

### Custom Statements File

```markdown
---
version: "1.0.0"
lastUpdated: "2025-01-27"
organization: "My Company"
---

## Project Intro Statement
<!-- key: project-intro-statement, editable: true -->

Welcome to our enterprise development environment. The following project context provides comprehensive information for AI-assisted development:

## Tool Intro Statement
<!-- key: tool-intro-statement, editable: true -->

Our integrated development stack includes the following tools, services, and MCP servers:

## Custom Instruction Statement
<!-- key: custom-instruction-statement, editable: true -->

Custom development instruction: {{instruction}}

## Completion Statement
<!-- key: completion-statement, editable: true -->

Please proceed with the specified task while adhering to our coding standards and security guidelines.
```

### Custom System Prompts File

```markdown
# Custom AI Project System Prompts

## Development Context

This document contains custom system prompts for our enterprise development workflow.

##### Model Change or Context Refresh

```markdown
Initialize your development context with the provided project information. Focus on enterprise-grade solutions and security-first approaches.
```

##### Enterprise Implementation

```markdown
Implement the specified feature following enterprise patterns:
- Security-first design
- Comprehensive error handling  
- Full test coverage
- Documentation requirements
- Performance considerations
```

##### Code Review Analysis

```markdown
Conduct a thorough code review focusing on:
- Security vulnerabilities
- Performance bottlenecks
- Maintainability concerns
- Test coverage gaps
- Documentation quality
```
```