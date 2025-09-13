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
import { CreateProjectData } from '../../services/storage/types/ProjectData';

interface ProjectConfigFormProps {
  initialData?: CreateProjectData;
  onSubmit?: (data: CreateProjectData) => void;
  onChange?: (data: CreateProjectData) => void;
  className?: string;
}

/**
 * Form for configuring project parameters
 */
export const ProjectConfigForm: React.FC<ProjectConfigFormProps> = ({
  initialData,
  onSubmit,
  onChange,
  className
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
      monorepoNote: initialData?.customData?.monorepoNote || ''
    }
  });

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

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      <div className="space-y-4">
        <div>
          <label htmlFor="project-name" className="block text-sm font-medium text-neutral-11 mb-2">
            Project Name
          </label>
          <input
            id="project-name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-neutral-3 rounded-md bg-neutral-1 text-neutral-12 focus:outline-none focus:ring-2 focus:ring-accent-8 focus:border-transparent"
            placeholder="my-project"
          />
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
            className="w-full px-3 py-2 border border-neutral-3 rounded-md bg-neutral-1 text-neutral-12 focus:outline-none focus:ring-2 focus:ring-accent-8 focus:border-transparent"
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

        {/* 3. Repository structure */}
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
              className={`w-full px-3 py-2 border border-neutral-3 rounded-md bg-neutral-1 text-neutral-12 focus:outline-none focus:ring-2 focus:ring-accent-8 focus:border-transparent ${!formData.isMonorepo ? 'opacity-60' : ''}`}
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
              className={`w-full px-3 py-2 border border-neutral-3 rounded-md bg-neutral-1 text-neutral-12 focus:outline-none focus:ring-2 focus:ring-accent-8 focus:border-transparent resize-vertical transition-colors ${!formData.isMonorepo ? 'opacity-60' : ''}`}
              placeholder={formData.isMonorepo ? "Package structure, workspace organization..." : "Enable monorepo for structure notes"}
              rows={1}
              maxLength={2000}
            />
          </div>
        </div>

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
            className="w-full px-3 py-2 border border-neutral-3 rounded-md bg-neutral-1 text-neutral-12 focus:outline-none focus:ring-2 focus:ring-accent-8 focus:border-transparent resize-vertical transition-colors"
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

        {/* 4. Instructions (development phase) */}
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
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="implementation">Implementation</SelectItem>
              <SelectItem value="debugging">Debugging</SelectItem>
              <SelectItem value="testing">Testing</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 5. Additional notes */}
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
            className="w-full px-3 py-2 border border-neutral-3 rounded-md bg-neutral-1 text-neutral-12 focus:outline-none focus:ring-2 focus:ring-accent-8 focus:border-transparent resize-vertical transition-colors"
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

      {onSubmit && (
        <button
          type="submit"
          className="w-full bg-accent-9 hover:bg-accent-10 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-accent-8 focus:ring-offset-2"
        >
          Create Project
        </button>
      )}
    </form>
  );
};