import React, { useState } from 'react';
import { cn } from '../../lib/ui-core/utils/cn';

interface ContextOutputProps {
  context: string;
  title?: string;
  className?: string;
}

/**
 * Component for displaying generated context with copy functionality
 */
export const ContextOutput: React.FC<ContextOutputProps> = ({
  context,
  title = "Generated Context",
  className
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(context);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-12">{title}</h3>
        <button
          onClick={handleCopy}
          disabled={!context}
          className={cn(
            'px-3 py-1 text-sm rounded-md font-medium transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-accent-8 focus:ring-offset-2',
            copied 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-accent-9 hover:bg-accent-10 text-white disabled:bg-neutral-4 disabled:text-neutral-8'
          )}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div className="relative">
        <pre className={cn(
          'w-full h-96 p-4 text-sm font-mono',
          'bg-neutral-2 border border-neutral-3 rounded-md',
          'text-neutral-11 leading-relaxed',
          'overflow-auto resize-none',
          'whitespace-pre-wrap'
        )}>
          {context || (
            <span className="text-neutral-9 italic">
              Configure your project details to generate context...
            </span>
          )}
        </pre>
      </div>

      {context && (
        <div className="flex items-center justify-between text-sm text-neutral-10">
          <span>{context.length} characters</span>
          <span>{context.split('\n').length} lines</span>
        </div>
      )}
    </div>
  );
};