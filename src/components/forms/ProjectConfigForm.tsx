import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/ui-core/utils/cn';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '../../lib/ui-core/components/form/select';
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
    isMonorepo: initialData?.isMonorepo || false,
    customData: {
      recentEvents: initialData?.customData?.recentEvents || '',
      additionalNotes: initialData?.customData?.additionalNotes || ''
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
          <label htmlFor="template" className="block text-sm font-medium text-neutral-11 mb-2">
            Template
          </label>
          <Select 
            value={formData.template} 
            onValueChange={(value) => handleInputChange('template', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select template..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="react-nextjs">React + Next.js</SelectItem>
              <SelectItem value="react-vite">React + Vite</SelectItem>
              <SelectItem value="electron-react">Electron + React</SelectItem>
              <SelectItem value="node-express">Node.js + Express</SelectItem>
              <SelectItem value="python-django">Python + Django</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
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

        <div className="flex items-center">
          <input
            id="is-monorepo"
            type="checkbox"
            checked={formData.isMonorepo}
            onChange={(e) => handleInputChange('isMonorepo', e.target.checked)}
            className="h-4 w-4 text-accent-9 focus:ring-accent-8 border-neutral-3 rounded bg-neutral-1"
          />
          <label htmlFor="is-monorepo" className="ml-2 block text-sm text-neutral-11">
            Monorepo project
          </label>
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
            className="w-full px-3 py-2 border border-neutral-3 rounded-md bg-neutral-1 text-neutral-12 focus:outline-none focus:ring-2 focus:ring-accent-8 focus:border-transparent resize-vertical"
            placeholder="• Recent changes, bug fixes, features added..."
            rows={4}
            maxLength={500}
          />
          <div className="flex justify-end mt-1">
            <span className="text-xs text-neutral-9">
              {(formData.customData?.recentEvents || '').length}/500
            </span>
          </div>
        </div>

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
            className="w-full px-3 py-2 border border-neutral-3 rounded-md bg-neutral-1 text-neutral-12 focus:outline-none focus:ring-2 focus:ring-accent-8 focus:border-transparent resize-vertical"
            placeholder="Any additional context or specific focus areas..."
            rows={3}
            maxLength={300}
          />
          <div className="flex justify-end mt-1">
            <span className="text-xs text-neutral-9">
              {(formData.customData?.additionalNotes || '').length}/300
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