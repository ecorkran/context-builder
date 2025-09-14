import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { SplitPaneLayout } from './layout/SplitPaneLayout';
import { ProjectConfigForm } from './forms/ProjectConfigForm';
import { ContextOutput } from './display/ContextOutput';
import { PersistentProjectStore } from '../services/storage/PersistentProjectStore';
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
    workType: 'continue',
    isMonorepo: false,
    customData: {
      recentEvents: '',
      additionalNotes: ''
    }
  });

  // Add persistence state management
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  // Create persistent storage service instance
  const persistentStore = useMemo(() => {
    try {
      return new PersistentProjectStore();
    } catch (error) {
      console.error('Failed to initialize persistent storage:', error);
      return null;
    }
  }, []);

  // Create a temporary project object for context generation
  const tempProject: ProjectData | null = useMemo(() => {
    // Start generating context when we have project name and slice
    // Template is optional - use default if not provided
    const hasRequiredFields = formData.name && formData.slice;
    
    if (!hasRequiredFields) {
      return null;
    }

    return {
      id: 'temp',
      ...formData,
      template: formData.template || 'default', // Provide default template for non-monorepo
      instruction: formData.instruction || 'implementation',
      workType: formData.workType || 'continue',
      customData: formData.customData || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }, [formData]);

  // Debounce the project data for smoother real-time updates (300ms delay)
  const debouncedProject = useDebounce(tempProject, 300);

  // Use the context generation hook
  const { contextString, isLoading: isGenerating, error } = useContextGeneration(debouncedProject);

  // Load last session on mount (simple, fast)
  useEffect(() => {
    const loadLastSession = async () => {
      if (!persistentStore) return;

      try {
        const projects = await persistentStore.loadProjects();
        
        if (projects.length === 0) {
          // Create default project for first-time users
          const defaultProject = {
            id: `project_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            name: 'My Project',
            template: '',
            slice: '',
            instruction: 'implementation' as const,
            workType: 'continue' as const,
            isMonorepo: false,
            customData: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          await persistentStore.saveProject(defaultProject);
          setCurrentProjectId(defaultProject.id);
          setFormData({
            name: defaultProject.name,
            template: defaultProject.template,
            slice: defaultProject.slice,
            instruction: defaultProject.instruction,
            workType: defaultProject.workType,
            isMonorepo: defaultProject.isMonorepo,
            customData: {
              recentEvents: '',
              additionalNotes: '',
              monorepoNote: '',
              availableTools: ''
            },
          });
        } else {
          // Restore last active project
          const lastActiveId = await persistentStore.getLastActiveProject();
          const activeProject = projects.find(p => p.id === lastActiveId) || projects[0];
          
          setCurrentProjectId(activeProject.id);
          const restoredFormData = {
            name: activeProject.name,
            template: activeProject.template,
            slice: activeProject.slice,
            instruction: activeProject.instruction,
            workType: activeProject.workType,
            isMonorepo: activeProject.isMonorepo,
            customData: {
              recentEvents: activeProject.customData?.recentEvents || '',
              additionalNotes: activeProject.customData?.additionalNotes || '',
              monorepoNote: activeProject.customData?.monorepoNote || '',
              availableTools: activeProject.customData?.availableTools || ''
            },
          };
          console.log('ContextBuilderApp: Restoring project data:', restoredFormData);
          setFormData(restoredFormData);
        }
      } catch (error) {
        console.error('Failed to load project:', error);
      }
    };

    loadLastSession();
  }, [persistentStore]);

  // Simple auto-save on form changes
  useEffect(() => {
    if (!persistentStore || !currentProjectId) return;

    const timeoutId = setTimeout(async () => {
      try {
        await persistentStore.updateProject(currentProjectId, {
          name: formData.name,
          template: formData.template,
          slice: formData.slice,
          instruction: formData.instruction,
          workType: formData.workType,
          isMonorepo: formData.isMonorepo,
          customData: formData.customData,
        });
        await persistentStore.setLastActiveProject(currentProjectId);
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData, currentProjectId, persistentStore]);

  const handleFormChange = useCallback((data: CreateProjectData) => {
    setFormData(data);
  }, []);

  const handleCreateProject = useCallback(async () => {
    // This is now handled by auto-save - keeping for form compatibility
    console.log('Project auto-saved via persistence layer');
  }, []);

  const leftPanelContent = (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-12 mb-4 ml-[calc(var(--radius)*0.25)]">Project Configuration</h2>
        <ProjectConfigForm
          initialData={formData}
          onChange={handleFormChange}
          onSubmit={handleCreateProject}
        />
      </div>
    </div>
  );

  const rightPanelContent = (
    <div className="flex flex-col h-full space-y-4">
      {error && (
        <div className="flex-shrink-0 p-3 bg-red-50 border border-red-200 rounded-md" role="alert" aria-live="assertive">
          <p className="text-sm text-red-700 flex items-center">
            <svg className="mr-2 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Error: {error}
          </p>
        </div>
      )}
      
      <div className="flex-grow relative min-h-0">
        <ContextOutput
          context={contextString}
          title="Generated Context for Claude Code"
          className="h-full"
        />
        {isGenerating && (
          <div className="absolute top-2 right-2 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs flex items-center">
            <svg className="animate-spin -ml-1 mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Updating...
          </div>
        )}
      </div>
    </div>
  );

  return (
    <SplitPaneLayout
      leftContent={leftPanelContent}
      rightContent={rightPanelContent}
    />
  );
};