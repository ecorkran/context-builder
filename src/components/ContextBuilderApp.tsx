import React, { useState, useCallback, useMemo } from 'react';
import { SplitPaneLayout } from './layout/SplitPaneLayout';
import { ProjectConfigForm } from './forms/ProjectConfigForm';
import { ContextOutput } from './display/ContextOutput';
import { SimpleProjectStore } from '../services/storage/SimpleProjectStore';
import { CreateProjectData, ProjectData } from '../services/storage/types/ProjectData';
import { useContextGeneration } from '../hooks/useContextGeneration';
import { useDebounce } from '../hooks/useDebounce';

/**
 * Main application component that integrates all functionality
 */
export const ContextBuilderApp: React.FC = () => {
  const [formData, setFormData] = useState<CreateProjectData>({
    name: '',
    template: '',
    slice: '',
    instruction: 'implementation',
    isMonorepo: false,
    customData: {
      recentEvents: '',
      additionalNotes: ''
    }
  });

  // Create service instances
  const projectStore = useMemo(() => new SimpleProjectStore(), []);

  // Create a temporary project object for context generation
  const tempProject: ProjectData | null = useMemo(() => {
    // Start generating context when we have project name and slice
    // Template is only required for monorepo projects
    const hasRequiredFields = formData.name && formData.slice;
    const hasTemplateIfNeeded = !formData.isMonorepo || formData.template;
    
    if (!hasRequiredFields || !hasTemplateIfNeeded) {
      return null;
    }

    return {
      id: 'temp',
      ...formData,
      template: formData.template || 'default', // Provide default template for non-monorepo
      instruction: formData.instruction || 'implementation',
      customData: formData.customData || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }, [formData]);

  // Debounce the project data for smoother real-time updates (300ms delay)
  const debouncedProject = useDebounce(tempProject, 300);

  // Use the context generation hook
  const { contextString, isLoading, error } = useContextGeneration(debouncedProject);

  const handleFormChange = useCallback((data: CreateProjectData) => {
    setFormData(data);
  }, []);

  const handleCreateProject = useCallback(async (data: CreateProjectData) => {
    try {
      await projectStore.create(data);
      console.log('Project created successfully!');
      // TODO: Add user feedback/notification
    } catch (error) {
      console.error('Failed to create project:', error);
      // TODO: Add error handling/notification
    }
  }, [projectStore]);

  const leftPanelContent = (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-12 mb-4">Project Configuration</h2>
        <ProjectConfigForm
          initialData={formData}
          onChange={handleFormChange}
          onSubmit={handleCreateProject}
        />
      </div>
    </div>
  );

  const rightPanelContent = (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md" role="alert" aria-live="assertive">
          <p className="text-sm text-red-700 flex items-center">
            <svg className="mr-2 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Error: {error}
          </p>
        </div>
      )}
      
      {isLoading && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md animate-pulse" role="status" aria-live="polite">
          <p className="text-sm text-blue-700 flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating context...
          </p>
        </div>
      )}
      
      <ContextOutput
        context={contextString}
        title="Generated Context for Claude Code"
      />
    </div>
  );

  return (
    <SplitPaneLayout
      leftContent={leftPanelContent}
      rightContent={rightPanelContent}
    />
  );
};