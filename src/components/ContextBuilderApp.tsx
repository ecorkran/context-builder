import React, { useState, useCallback, useMemo } from 'react';
import { SplitPaneLayout } from './layout/SplitPaneLayout';
import { ProjectConfigForm } from './forms/ProjectConfigForm';
import { ContextOutput } from './display/ContextOutput';
import { SimpleProjectStore } from '../services/storage/SimpleProjectStore';
import { ContextGenerator } from '../services/context/ContextGenerator';
import { CreateProjectData, ProjectData } from '../services/storage/types/ProjectData';

/**
 * Main application component that integrates all functionality
 */
export const ContextBuilderApp: React.FC = () => {
  const [formData, setFormData] = useState<CreateProjectData>({
    name: '',
    template: '',
    slice: '',
    isMonorepo: false
  });
  
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Create service instances
  const projectStore = useMemo(() => new SimpleProjectStore(), []);
  const contextGenerator = useMemo(() => new ContextGenerator(), []);

  // Generate context when form data changes
  const generatedContext = useMemo(() => {
    // Only generate if we have minimum required data
    if (!formData.name || !formData.template || !formData.slice) {
      return '';
    }

    // Create a temporary project object for context generation
    const tempProject: ProjectData = {
      id: 'temp',
      ...formData,
      instruction: formData.instruction || 'implementation',
      customData: formData.customData || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return contextGenerator.generateContext(tempProject, additionalNotes);
  }, [formData, additionalNotes, contextGenerator]);

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

      <div>
        <label htmlFor="additional-notes" className="block text-sm font-medium text-neutral-11 mb-2">
          Additional Notes
        </label>
        <textarea
          id="additional-notes"
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-neutral-3 rounded-md bg-neutral-1 text-neutral-12 focus:outline-none focus:ring-2 focus:ring-accent-8 focus:border-transparent resize-none"
          placeholder="Add any additional context, recent events, or specific instructions..."
        />
      </div>
    </div>
  );

  const rightPanelContent = (
    <ContextOutput
      context={generatedContext}
      title="Generated Context for Claude Code"
    />
  );

  return (
    <SplitPaneLayout
      leftContent={leftPanelContent}
      rightContent={rightPanelContent}
    />
  );
};