import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/ui-core/utils/cn';
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
    isMonorepo: initialData?.isMonorepo || false
  });

  // Call onChange when form data changes
  useEffect(() => {
    onChange?.(formData);
  }, [formData, onChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  const handleInputChange = (field: keyof CreateProjectData, value: string | boolean) => {
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
          <select
            id="template"
            value={formData.template}
            onChange={(e) => handleInputChange('template', e.target.value)}
            className="w-full px-3 py-2 border border-neutral-3 rounded-md bg-neutral-1 text-neutral-12 focus:outline-none focus:ring-2 focus:ring-accent-8 focus:border-transparent"
          >
            <option value="">Select template...</option>
            <option value="react-nextjs">React + Next.js</option>
            <option value="react-vite">React + Vite</option>
            <option value="electron-react">Electron + React</option>
            <option value="node-express">Node.js + Express</option>
            <option value="python-django">Python + Django</option>
            <option value="custom">Custom</option>
          </select>
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