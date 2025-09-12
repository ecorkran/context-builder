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
    // Only create project if we have minimum required data
    if (!formData.name || !formData.template || !formData.slice) {
      return null;
    }

    return {
      id: 'temp',
      ...formData,
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
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">⚠️ Error: {error}</p>
        </div>
      )}
      
      {isLoading && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">🔄 Generating context...</p>
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