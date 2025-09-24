import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/ui-core/utils/cn';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../lib/ui-core/components/form/select';
import { Checkbox } from '../../lib/ui-core/components/form/checkbox';
import { CreateProjectData, ProjectData } from '../../services/storage/types/ProjectData';
import { ProjectSelector } from '../project/ProjectSelector';
import { useAppSettings } from '../../hooks/useAppSettings';

interface ProjectConfigFormProps {
  initialData?: CreateProjectData;
  onSubmit?: (data: CreateProjectData) => void;
  onChange?: (data: CreateProjectData) => void;
  className?: string;
  // Project management props
  projects: ProjectData[];
  currentProjectId: string | null;
  loading?: boolean;
  multiProjectError?: string | null;
  onProjectSwitch: (projectId: string) => void;
  onProjectCreate: () => void;
  onProjectDelete: (projectId: string) => void;
  onProjectNameUpdate: () => void;
}

/**
 * Form for configuring project parameters
 */
export const ProjectConfigForm: React.FC<ProjectConfigFormProps> = ({
  initialData,
  onSubmit,
  onChange,
  className,
  projects,
  currentProjectId,
  loading = false,
  multiProjectError = null,
  onProjectSwitch,
  onProjectCreate,
  onProjectDelete,
  onProjectNameUpdate
}) => {
  const [formData, setFormData] = useState<CreateProjectData>({
    name: initialData?.name || '',
    template: initialData?.template || '',
    slice: initialData?.slice || '',
    instruction: initialData?.instruction || 'implementation',
    workType: initialData?.workType || 'continue',
    isMonorepo: initialData?.isMonorepo || false,
    customData: {
      recentEvents: initialData?.customData?.recentEvents || '',
      additionalNotes: initialData?.customData?.additionalNotes || '',
      monorepoNote: initialData?.customData?.monorepoNote || '',
      availableTools: initialData?.customData?.availableTools || ''
    }
  });

  // Get global settings to control monorepo UI visibility
  const { isMonorepoModeEnabled } = useAppSettings();

  useEffect(() => {
    if (initialData) {
      setFormData(prev => {
        // Only update if the data actually changed
        if (prev.name !== initialData.name || 
            prev.isMonorepo !== initialData.isMonorepo ||
            prev.template !== initialData.template) {
          return {
            name: initialData.name || '',
            template: initialData.template || '',
            slice: initialData.slice || '',
            instruction: initialData.instruction || 'implementation',
            workType: initialData.workType || 'continue',
            isMonorepo: initialData.isMonorepo || false,
            customData: {
              recentEvents: initialData.customData?.recentEvents || '',
              additionalNotes: initialData.customData?.additionalNotes || '',
              monorepoNote: initialData.customData?.monorepoNote || '',
              availableTools: initialData.customData?.availableTools || ''
            }
          };
        }
        return prev;
      });
    }
  }, [initialData]);

  // Call onChange when form data changes  
  useEffect(() => {
    onChange?.(formData);
  }, [formData, onChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  const handleInputChange = (field: keyof CreateProjectData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCustomDataChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      customData: {
        ...prev.customData,
        [field]: value
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      <div className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-neutral-11 mb-2">
              Project
            </label>
            <ProjectSelector
              projects={projects}
              currentProjectId={currentProjectId}
              loading={loading}
              error={multiProjectError}
              disabled={loading}
              onProjectSwitch={onProjectSwitch}
              onProjectCreate={onProjectCreate}
              onProjectDelete={onProjectDelete}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-11 mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              onBlur={onProjectNameUpdate}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onProjectNameUpdate();
                }
              }}
              className="w-full px-3 py-2 border border-accent-7 rounded-md bg-neutral-1 text-neutral-12 focus:outline-none focus:ring-2 focus:ring-accent-8 focus:border-transparent"
              placeholder="Enter project name..."
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="slice" className="block text-sm font-medium text-neutral-11 mb-2">
            Current Slice
          </label>
          <input
            id="slice"
            type="text"
            value={formData.slice}
            onChange={(e) => handleInputChange('slice', e.target.value)}
            className="w-full px-3 py-2 border border-accent-7 rounded-md bg-neutral-1 text-neutral-12 focus:outline-none focus:ring-2 focus:ring-accent-8 focus:border-transparent"
            placeholder="foundation, auth, ui-components..."
          />
        </div>

        <div>
          <label htmlFor="work-type" className="block text-sm font-medium text-neutral-11 mb-2">
            Work Type
          </label>
          <Select
            value={formData.workType || 'continue'}
            onValueChange={(value) => handleInputChange('workType', value as 'start' | 'continue')}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select work type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="start">Start - Beginning new work</SelectItem>
              <SelectItem value="continue">Continue - Resuming existing work</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 3. Available Tools */}
        <div className="space-y-2">
          <label htmlFor="available-tools" className="block text-sm font-medium text-neutral-12">
            Available Tools
          </label>
          <textarea
            id="available-tools"
            value={formData.customData?.availableTools || ''}
            onChange={(e) => handleCustomDataChange('availableTools', e.target.value)}
            placeholder="List available tools (e.g., context7, Radix)"
            className="w-full px-3 py-2 text-sm border border-accent-7 rounded-md bg-neutral-1 text-neutral-12 placeholder-neutral-9 focus:outline-none focus:ring-2 focus:ring-accent-8 focus:border-transparent resize-y min-h-[2.5rem]"
            rows={1}
          />
        </div>

        {/* 4. Development Phase */}
        <div>
          <label htmlFor="instruction" className="block text-sm font-medium text-neutral-11 mb-2">
            Development Phase
          </label>
          <Select 
            value={formData.instruction || 'implementation'} 
            onValueChange={(value) => handleInputChange('instruction', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select development phase..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="concept">Phase 1: Concept</SelectItem>
              <SelectItem value="spec-creation">Phase 2: Spec Creation</SelectItem>
              <SelectItem value="slice-planning">Phase 3: Slice Planning</SelectItem>
              <SelectItem value="slice-design">Phase 4: Slice Design</SelectItem>
              <SelectItem value="task-breakdown">Phase 5: Task Breakdown</SelectItem>
              <SelectItem value="task-breakdown-x">Phase 5: Task Breakdown - Explicit Follow</SelectItem>
              <SelectItem value="task-expansion">Phase 6: Task Expansion</SelectItem>
              <SelectItem value="implementation">Phase 7: Implementation</SelectItem>
              <div className="border-t border-neutral-6 my-1 mx-2" />

              <SelectItem value="feature-design">Feature Design</SelectItem>
              <SelectItem value="ad-hoc-tasks">Ad-Hoc Tasks</SelectItem>
              <SelectItem value="custom-instruction">Custom Instruction</SelectItem>
              <div className="border-t border-neutral-6 my-1 mx-2" />

              <SelectItem value="analyze-codebase">Analyze Codebase</SelectItem>
              <SelectItem value="analyze-processing">Analyze Processing</SelectItem>
              <SelectItem value="analyze-lld">Analyze LLD</SelectItem>
              <SelectItem value="analyze-tasks">Analyze Tasks</SelectItem>
              <SelectItem value="analyze-implementation">Analyze Implementation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 5. Repository structure - Only show when monorepo mode is enabled globally */}
        {isMonorepoModeEnabled && (
          <div className="space-y-3 pt-2" >
            <Checkbox
              id="is-monorepo"
              checked={formData.isMonorepo}
              onCheckedChange={(checked) => handleInputChange('isMonorepo', checked)}
              label="Monorepo project"
              uiVariant="accent"
              className='ml-[calc(var(--radius)*0.25)]'
            />

            <div className='pt-2'>
              <label htmlFor="template" className={`block text-sm font-medium mb-2 ${formData.isMonorepo ? 'text-neutral-11' : 'text-neutral-8'}`}>
                Template
              </label>
              <input
                id="template"
                type="text"
                value={formData.template}
                onChange={(e) => handleInputChange('template', e.target.value)}
                disabled={!formData.isMonorepo}
                className={`w-full px-3 py-2 border border-accent-7 rounded-md bg-neutral-1 text-neutral-12 focus:outline-none focus:ring-2 focus:ring-accent-8 focus:border-transparent ${!formData.isMonorepo ? 'opacity-60' : ''}`}
                placeholder={formData.isMonorepo ? "templates/react" : "Enable monorepo to set template"}
              />
            </div>

            <div>
              <label htmlFor="monorepo-note" className={`block text-sm font-medium mb-2 ${formData.isMonorepo ? 'text-neutral-11' : 'text-neutral-8'}`}>
                Monorepo Structure (optional)
              </label>
              <textarea
                id="monorepo-note"
                value={formData.customData?.monorepoNote || ''}
                onChange={(e) => handleInputChange('customData', {
                  ...formData.customData,
                  monorepoNote: e.target.value
                })}
                disabled={!formData.isMonorepo}
                className={`w-full px-3 py-2 border border-accent-7 rounded-md bg-neutral-1 text-neutral-12 focus:outline-none focus:ring-2 focus:ring-accent-8 focus:border-transparent resize-vertical transition-colors ${!formData.isMonorepo ? 'opacity-60' : ''}`}
                placeholder={formData.isMonorepo ? "Package structure, workspace organization..." : "Enable monorepo for structure notes"}
                rows={1}
                maxLength={8000}
              />
              <div className="flex justify-end mt-1">
                <span className="text-xs text-neutral-9">
                  {(formData.customData?.monorepoNote || '').length}/8000 characters
                </span>
              </div>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="recent-events" className="block text-sm font-medium text-neutral-11 mb-2">
            Recent Events (optional)
          </label>
          <textarea
            id="recent-events"
            value={formData.customData?.recentEvents || ''}
            onChange={(e) => handleInputChange('customData', {
              ...formData.customData,
              recentEvents: e.target.value
            })}
            className="w-full px-3 py-2 border border-accent-7 rounded-md bg-neutral-1 text-neutral-12 focus:outline-none focus:ring-2 focus:ring-accent-8 focus:border-transparent resize-vertical transition-colors"
            placeholder="• Recent changes, bug fixes, features added..."
            rows={6}
            maxLength={8000}
            aria-describedby="recent-events-help"
          />
          <div className="flex justify-end mt-1">
            <span id="recent-events-help" className="text-xs text-neutral-9">
              {(formData.customData?.recentEvents || '').length}/8000 characters
            </span>
          </div>
        </div>

        {/* 6. Additional notes */}
        <div>
          <label htmlFor="additional-notes" className="block text-sm font-medium text-neutral-11 mb-2">
            Additional Context (optional)
          </label>
          <textarea
            id="additional-notes"
            value={formData.customData?.additionalNotes || ''}
            onChange={(e) => handleInputChange('customData', {
              ...formData.customData,
              additionalNotes: e.target.value
            })}
            className="w-full px-3 py-2 border border-accent-3 rounded-md bg-neutral-1 text-neutral-12 focus:outline-none focus:ring-2 focus:ring-accent-8 focus:border-transparent resize-vertical transition-colors"
            placeholder="Any additional context or specific focus areas..."
            rows={5}
            maxLength={8000}
            aria-describedby="additional-notes-help"
          />
          <div className="flex justify-end mt-1">
            <span id="additional-notes-help" className="text-xs text-neutral-9">
              {(formData.customData?.additionalNotes || '').length}/8000 characters
            </span>
          </div>
        </div>
      </div>

    </form>
  );
};